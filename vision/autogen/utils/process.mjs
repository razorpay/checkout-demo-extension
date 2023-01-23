import { capture } from './screenshot.mjs';
import * as actions from '#vision/autogen/actions/index.mjs';
import { delay, promisePair } from './index.mjs';
import { HEADLESS, HistoryType } from './constants.mjs';

const SELECTOR = '[autogen-name]:not(:disabled):visible';

function getValues(element, pageState) {
  const handler = actions[element.name];
  const handlerArgs = {
    variant: element.variant,
    state: pageState.state,
    selectResponse: pageState.selectResponse,
    options: pageState.options,
  };

  const values = new Set();

  for (let val of handler(handlerArgs)) {
    switch (element.action) {
      case HistoryType.FILL:
        values.add(String(val));
        break;

      case HistoryType.CLICK:
        values.add(Boolean(val));
        break;
    }
  }

  return Array.from(values);
}

export function newPageState(page, state) {
  const pageState = {
    page,
    state,
    pendingRequests: new Set(),
    pendingReplays: new Set(),
    replayed: false,
    selectResponse: (name) => {
      return state.history.find((his) => {
        return his.type === HistoryType.REQUEST && his.name === name;
      })?.value;
    },
    options: state.history[0].value,
  };

  return pageState;
}

function getElements(page) {
  return page.$$eval(
    SELECTOR,
    (nodes, HistoryType) => {
      return nodes
        .map((node) => {
          const css = getComputedStyle(node);
          if (css.pointerEvents === 'none') {
            return;
          }

          const isInput =
            node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA';
          let action = HistoryType.CLICK;
          if (isInput) {
            action = HistoryType.FILL;
          }
          const name = node.getAttribute('autogen-name');
          const variant = node.getAttribute('autogen-variant');
          let selector = `[autogen-name="${name}"]`;
          if (variant) {
            selector += `[autogen-variant="${variant}"]`;
          }

          return {
            selector,
            action,
            name,
            variant,
          };
        })
        .filter(Boolean);
    },
    HistoryType
  );
}

export async function processNext(pageState, fork) {
  const {
    page,
    state: { history },
  } = pageState;
  await page.mainFrame().waitForSelector(SELECTOR);
  await closePendingRequests(pageState);
  await capture(pageState);
  const elements = await getElements(page);

  if (elements.length) {
    const actions = history.filter((e) => e.selector);
    const replayedIndex = [...actions]
      .reverse()
      .findIndex((action) => action.selector === elements[0].selector); // use findLastIndex when it lands in node

    let offset = 0;
    if (replayedIndex !== -1) {
      const restActions = actions.slice(actions.length - 1 - replayedIndex);
      if (restActions.length < elements.length) {
        if (
          restActions.every((action, index) => {
            return action.selector === elements[index].selector;
          })
        ) {
          offset = restActions.length;
        }
      }
    }

    await loopElements({ fork, elements, pageState, offset });
  }
}

async function loopElements({ fork, elements, pageState, offset }) {
  if (!elements.length) {
    return;
  }

  const { state } = pageState;
  const groupedElements = elements.slice(offset).reduce((group, element) => {
    let elementActions = group.get(element.name);
    if (!elementActions) {
      elementActions = [];
      group.set(element.name, elementActions);
    }
    elementActions.push(
      ...getValues(element, pageState).map((value) => ({
        element,
        value,
      }))
    );
    return group;
  }, new Map());

  for (let element of groupedElements) {
    const history = state.history;
    const [firstAction, ...actions] = element[1];

    if (!firstAction) {
      // no action to be recorded, ignore this element but continue with rest
      continue;
    }

    for (let action of actions) {
      fork({
        ...state,
        history: [...history, newHistory(action)],
      });
    }

    const historyObject = newHistory(firstAction);

    state.history = [...history, historyObject];

    const resolver = await replay(historyObject, pageState);
    if (!resolver) {
      continue;
    }

    await capture(pageState);
    resolver();

    // check if new network requests are made because of this action
    if (pageState.pendingRequests.size) {
      await closePendingRequests(pageState);

      // capture screenshot again, after requests are completed
      await capture(pageState);
    }

    // check if new elements have appeared
    const newElements = await getElements(pageState.page);

    // dedupe new elements from top
    let commonElements = 0;
    for (let i = 0; i < elements.length; i++) {
      if (
        newElements[i] &&
        elements[i].name === newElements[i].name &&
        elements[i].variant === newElements[i].variant
      ) {
        commonElements++;
      } else {
        break;
      }
    }

    // if we've same elements as before, continue with actioning on next element
    // else run loop with new elements
    if (commonElements !== newElements.length) {
      await loopElements({
        fork,
        offset: commonElements,
        elements: newElements,
        pageState,
      });
      break;
    }
  }
}

async function closePendingRequests(pageState) {
  if (pageState.pendingRequests.size) {
    await Promise.all(
      Array.from(pageState.pendingRequests).map((p) => p.closure)
    );
    await closePendingRequests(pageState);
  }
}

function newHistory({ element, value }) {
  return {
    name: element.name,
    variant: element.variant,
    value,
    type: element.action,
    selector: element.selector,
  };
}

export async function replay(historyObject, pageState) {
  if (!historyObject.value) {
    return; // no action is performed, so screenshot is unnecessary
  }

  const { page } = pageState;

  // delay responding to network requests triggered due to this action,
  // until resolver is called. This is done for handled requests (non-files, 204s)
  const [closure, resolver] = promisePair();

  if (pageState.replayed) {
    closure.finally(() => {
      pageState.pendingReplays.delete(closure);
    });
    pageState.pendingReplays.add(closure);
  }

  const element = await page.$(historyObject.selector);

  if (!HEADLESS) {
    await delay(500);
  }

  try {
    switch (historyObject.type) {
      case HistoryType.CLICK:
        await element.click({
          timeout: 0,
        });
        break;

      case HistoryType.FILL:
        await element.fill(historyObject.value, {
          timeout: 0,
        });
        break;
    }
  } catch (e) {
    return;
  }

  return resolver;
}
