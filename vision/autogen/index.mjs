import { REMOTE_RUN, HEADLESS, DEVTOOLS } from './utils/constants.mjs';
import { chromium } from 'playwright-chromium';
import ProcessQueue from './utils/ProcessQueue.mjs';
import { init } from './test.mjs';

ProcessQueue.MAX_CONCURRENT_PROCESS = HEADLESS ? 20 : 1;

let browser;

if (REMOTE_RUN) {
  console.log('Running tests remotely...');
  browser = await chromium.connect('wss://playwright-chromium.stage.razorpay.in/ws');
} else {
  browser = await chromium.launch({
    headless: HEADLESS,
    devtools: DEVTOOLS,
  });
}

init(browser);
