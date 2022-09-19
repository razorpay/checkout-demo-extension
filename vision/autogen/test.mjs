import router from './routes.mjs';
import { delay, promisePair, HEADLESS, DEVTOOLS } from './utils/index.mjs';
import makeOptions from './handlers/options.mjs';
import ProcessQueue from './utils/ProcessQueue.mjs';
import { processNext, replay, newPageState } from './utils/process.mjs';
import { report } from './utils/screenshot.mjs';

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
      return route.continue();
    }
  }

  const [ closure, resolver ] = promisePair();

  const pendingRequest = {
    request,
    url: request.url(),
    method: request.method(),
    ended: false,
    closure,
    respond: async response => {
      pendingRequest.ended = true;
      pageState.pendingRequests.delete(pendingRequest);
      await route.fulfill(response);
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
    url: pendingRequest.url,
    method: pendingRequest.method,
    response,
    label: '',
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
    const [ firstResponse, ...responses ] = Array.from(handler(state));

    if (!firstResponse) {
      console.error(`no response from handler for ${method} ${url}`);
      await respondEmpty(pendingRequest, state);
      return;
    }

    for (let resp of responses) {
      fork({
        ...state,
        labels: [...state.labels],
        history: appendRequest(state.history, {
          url,
          method,
          response: resp.data,
          label: resp.label,
        }),
      });
    }

    if (!firstResponse.immediately) {
      await Promise.all(Array.from(pageState.pendingReplays));
    }

    state.history = appendRequest(state.history, {
      url,
      method,
      response: firstResponse.data,
      label: firstResponse.label,
    });
    await pendingRequest.respond(firstResponse.data);
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

function appendRequest(history, pastRequest) {
  history = [...history]; // make a copy, don't mutate history
  let last = history[history.length - 1];
  if (last?.type === 'requests') {
    last = history[history.length - 1] = {
      ...last,
      requests: [...last.requests, pastRequest],
    };
  } else {
    last = {
      type: 'requests',
      requests: [pastRequest],
    };
    history.push(last);
  }

  last.label = last.requests
    .map(item => item.label)
    .filter(Boolean)
    .join();

  return history;
}

async function runTestInPage(page, state) {
  const [ pageClosure, markPageClosed ] = promisePair();
  const pageState = newPageState(page, state);
  pages.set(page, pageState);

  await page.exposeFunction('getState', () => JSON.stringify(state));
  await page.exposeFunction('__CheckoutBridge_oncomplete', async (data) => {
    markPageClosed();
  });

  page.goto(state.url); // do not await else it'll not let replayable requests to finish
  await processReplays(pageState);

  await processNext(pageState, fork);
  await pageClosure;
  pages.delete(page);
}

async function processReplays(pageState) {
  const { state, page, pendingRequests } = pageState;

  for (let historyObject of state.history) {
    try {
      if (historyObject.type === 'requests') {
        await processPastRequests(historyObject, pageState);
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
    await Promise.all(Array.from(pendingRequests).map(pendingRequest => {
      return processRequest(pendingRequest, pageState);
    }));
  }
}

function processPastRequests(historyObject, pageState) {
  return Promise.all(
    historyObject.requests.map(
      pastRequest => processPastRequest(pastRequest, pageState)
    )
  );
}

async function processPastRequest(pastRequest, pageState) {
  const [ promise, resolver ] = promisePair();
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
  for (let options of makeOptions()) {
    const state = {
      offset: 0,
      labels: [ options.label ],
      options: options.data,
      url: 'https://api.razorpay.com/v1/checkout/public',
      history: [],
    };

    fork(state, browser);
  }
  ProcessQueue.then(async () => {
    const [ result ] = await Promise.all([
      report(),
      browser.close(),
    ]);
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
  context.setDefaultTimeout(HEADLESS ? 5e3 : 9e8);

  const page = await context.newPage();

  if (DEVTOOLS) {
    await delay(1000); // let devtools open
  }

  return page;
}
