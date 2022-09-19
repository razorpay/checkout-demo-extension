import { capture } from './screenshot.mjs';
import { getValue } from '../handlers/actions.mjs';
import { delay, promisePair, HEADLESS } from './index.mjs';

const SELECTOR = '[autogen-data-test-id]:visible';

export function newPageState(page, state) {
  const pageState = {
    page,
    state,
    pendingRequests: new Set(),
    pendingReplays: new Set(),
    path: null,
    replayed: false,
  };

  return pageState;
}

function getElements(page) {
  return page.$$eval(SELECTOR, nodes => {
    return nodes.map(node => {
      const css = getComputedStyle(node);
      if (css.pointerEvents === 'none') {
        return;
      }

      const id = node.getAttribute('autogen-data-test-id');
      const selector = `[autogen-data-test-id="${id}"]`;
      const action = node.getAttribute('autogen-data-test-action');
      const name = node.getAttribute('autogen-data-test-name');
      const variant = node.getAttribute('autogen-data-test-variant');

      return {
        id,
        selector,
        action,
        name,
        variant,
      };
    }).filter(Boolean);
  });
}

export async function processNext(pageState, fork) {
  const { page } = pageState;
  await page.mainFrame().waitForSelector(SELECTOR);
  await closePendingRequests(pageState);
  await capture(pageState);
  const elements = await getElements(page);
  await loopElements({ fork, elements, pageState, offset: 0 });
}

async function loopElements({ fork, elements, pageState, offset }) {
  if (!elements.length) {
    return;
  }

  const { state } = pageState;
  const elementsStr = JSON.stringify(elements);
  const groupedElements = elements.slice(offset).reduce((group, element) => {
    if (!group.has(element.name)) {
      group.set(element.name, []);
    }
    const elementActions = group.get(element.name);
    elementActions.push(...Array.from(getValue(element)).map(value => ({
      element,
      value,
    })));
    return group;
  }, new Map());

  for (let element of groupedElements) {
    const history = state.history;
    const [ firstAction, ...actions ] = element[1];

    for (let action of actions) {
      fork({
        ...state,
        labels: [...state.labels],
        history: [
          ...history,
          newHistory({ element: action.element, value: action.value, state }),
        ],
      });
    }

    const historyObject = newHistory({
      element: firstAction.element,
      value: firstAction.value,
      state,
    });

    state.history = [
      ...history,
      historyObject,
    ];
    const resolver = await replay(historyObject, pageState);
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
      if (newElements[i] && visitLabel(elements[i]) === visitLabel(newElements[i])) {
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
    await Promise.all(Array.from(pageState.pendingRequests).map(p => p.closure));
    await closePendingRequests(pageState);
  }
}

function visitLabel(element) {
  return element.variant ? `${element.name}=${element.variant}` : element.name;
}

function newHistory({ element, value, state }) {
  let label = visitLabel(element);
  if (value.label) {
    label += `=${value.label}`;
  }
  return {
    label,
    value: value.value,
    type: element.action,
    selector: element.selector,
  };
}

export async function replay(historyObject, pageState) {
  const { page } = pageState;
  const [ closure, resolver ] = promisePair();

  if (pageState.replayed) {
    closure.finally(() => {
      pageState.pendingReplays.delete(closure);
    });
    pageState.pendingReplays.add(closure);
  }

  const targetElement = await page.locator(historyObject.selector);
  if (!targetElement) {
    throw `element not found during REPLAY ${historyObject.selector}`;
  }

  switch (historyObject.type) {
    case 'click':
      await targetElement.click();
      break;

    case 'input':
      await targetElement.fill(historyObject.value);
      break;
  }

  if (!HEADLESS) {
    await delay(500);
  }

  return resolver;
}
