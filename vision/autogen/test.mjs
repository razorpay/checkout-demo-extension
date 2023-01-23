import router from './routes.mjs';
import { delay, promisePair } from './utils/index.mjs';
import { HEADLESS, DEVTOOLS, HistoryType } from './utils/constants.mjs';
import makeOptions from './handlers/options.mjs';
import ProcessQueue from './utils/ProcessQueue.mjs';
import { processNext, replay, newPageState } from './utils/process.mjs';
import { capture, report } from './utils/screenshot.mjs';

const pages = new WeakMap();

async function requestHandler(route, request) {
  let page = request.frame().page();
  let pageState = pages.get(page);
  if (!pageState) {
    const opener = await page.opener();
    if (opener) {
      page = opener;
      pageState = pages.get(opener);
    } else {
      console.log(`unhandled request ${request.url()}`);
      return route.abort();
    }
  }

  const [closure, resolver] = promisePair();

  const pendingRequest = {
    request,
    url: request.url(),
    method: request.method(),
    ended: false,
    closure,
    respond: async (response) => {
      pendingRequest.ended = true;
      pageState.pendingRequests.delete(pendingRequest);
      try {
        await route.fulfill(response);
      } catch (e) {
        console.error(e.message);
        await route.fulfill({
          status: 204,
        });
      }
      resolver();
    },
  };

  pageState.pendingRequests.add(pendingRequest);

  // if replay is complete, request will be processed by router
  if (pageState.replayed) {
    processRequest(pendingRequest, pageState);
  } else {
    // try to find matching replay, else ignore for now
    // request will be processed when matching replay is triggered
    for (let pendingReplay of pageState.pendingReplays) {
      if (await matchRequestReplay(pendingRequest, pendingReplay)) {
        break;
      }
    }
  }
}

async function respondEmpty(pendingRequest, state) {
  const response = { status: 204 };
  state.history = appendRequest(state.history, {
    type: HistoryType.REQUEST,
    url: pendingRequest.url,
    method: pendingRequest.method,
    response,
  });
  await pendingRequest.respond(response);
}

async function processRequest(pendingRequest, pageState) {
  const { url, method, request } = pendingRequest;
  const { state } = pageState;
  const handler = router.match(request);

  if (!handler) {
    console.error(`handler missing for ${method} ${url}`);
    await respondEmpty(pendingRequest, state);
  } else {
    const [firstResponse, ...responses] = handler(pageState);

    if (!firstResponse) {
      // handler exists but no action, we return 204
      await respondEmpty(pendingRequest, state);
      return;
    }

    for (let resp of responses) {
      fork({
        ...state,
        history: appendRequest(state.history, resp),
      });
    }

    // do not respond till dom actions get completed
    // except for files
    if (firstResponse.id) {
      await Promise.all(Array.from(pageState.pendingReplays));
    }

    state.history = appendRequest(state.history, firstResponse);

    await pendingRequest.respond(firstResponse.response);
  }
}

async function matchRequestReplay(pendingRequest, pendingReplay) {
  const { ended, url, method } = pendingRequest;
  const { end, pastRequest } = pendingReplay;
  if (!ended && pastRequest.url === url && pastRequest.method === method) {
    await pendingRequest.respond(pastRequest.response);
    end();
    return true;
  }
}

function appendRequest(history, reqObj) {
  return [
    ...history, // make a copy, don't mutate history
    reqObj,
  ];
}

async function runTestInPage(page, state) {
  const [pageClosure, markPageClosed] = promisePair();
  const [elementsLoop, elementsLooped] = promisePair();
  const pageState = newPageState(page, state);
  pages.set(page, pageState);

  await page.exposeFunction('__playwright_getoptions', () => {
    return state.history[0].value;
  });
  await page.exposeFunction('__playwright_oncomplete', async (data) => {
    state.done = true;
    await elementsLoop;
    await page.$eval(
      'body > span',
      (node, data) => {
        node.innerHTML = data;
      },
      data
    );
    // await capture(pageState);
    markPageClosed();
  });

  // do not await page load operation to avoid getting stuck here itself
  page.goto(state.url, {
    waitUntil: 'commit',
    timeout: 30e3,
  });

  await processReplays(pageState);

  // ensures js/css resources to be loaded.
  // these files may take longer to be uploaded to remote server because of size
  await page.waitForLoadState('load', {
    timeout: 30e3,
  });

  await processNext(pageState, fork);
  elementsLooped();
  await pageClosure;
  pages.delete(page);
}

async function processReplays(pageState) {
  const { state, page, pendingRequests } = pageState;

  for (let historyObject of state.history.slice(1)) {
    try {
      if (historyObject.type === HistoryType.REQUEST) {
        await processPastRequest(historyObject, pageState);
      } else {
        await replay(historyObject, pageState);
      }
    } catch (e) {
      console.error(e);
    }
  }

  pageState.replayed = true;

  // finish requests triggered due to replay actions,
  // before replays could be marked as done
  if (pendingRequests.size) {
    await Promise.all(
      Array.from(pendingRequests).map((pendingRequest) => {
        return processRequest(pendingRequest, pageState);
      })
    );
  }
}

async function processPastRequest(pastRequest, pageState) {
  const [promise, resolver] = promisePair();
  const pendingReplay = {
    pastRequest,
    ended: false,
    end: () => {
      pendingReplay.ended = true;
      pageState.pendingReplays.delete(pendingReplay);
      resolver();
    },
  };

  for (let pendingRequest of pageState.pendingRequests) {
    if (await matchRequestReplay(pendingRequest, pendingReplay)) {
      break;
    }
  }

  if (!pendingReplay.ended) {
    pageState.pendingReplays.add(pendingReplay);
    await promise;
  }
}

let browser; // shared browser instance

export function init(_browser) {
  browser = _browser;
  const IDs = new Set();
  for (let options of makeOptions()) {
    if (!options.id) {
      throw new Error('set id for options');
    }
    if (IDs.has(options.id)) {
      console.log(`check duplicate options`);
      continue;
    }
    const state = {
      offset: 0,
      url: 'https://api.razorpay.com/v1/checkout/public',
      history: [
        {
          type: HistoryType.OPTIONS,
          name: 'options',
          value: options.data,
          label: options.label,
          id: options.id,
        },
      ],
    };

    fork(state, browser);
  }
  ProcessQueue.then(async () => {
    const [result] = await Promise.all([report(), browser.close()]);
    process.exit(result);
  });
}

async function fork(state) {
  async function handle() {
    const page = await newPage(browser);
    await runTestInPage(page, state);
    await page.context().close();
  }

  ProcessQueue.push(handle);
}

async function newPage(browser, state) {
  const context = await browser.newContext({
    viewport: {
      width: 600,
      height: 800,
    },
  });
  await context.route(Boolean, requestHandler);

  // if running headed, increase default timeout
  // affects waiting for elements to appear etc
  // Set timeout as 5s for CI
  context.setDefaultTimeout(HEADLESS ? 30_000 : 9e8);

  const page = await context.newPage();

  if (DEVTOOLS) {
    await delay(1000); // let devtools open
  }

  return page;
}
