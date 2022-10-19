import { HEADLESS, DEVTOOLS } from './utils/constants.mjs';
import { chromium } from 'playwright-chromium';
import ProcessQueue from './utils/ProcessQueue.mjs';
import { init } from './test.mjs';

ProcessQueue.MAX_CONCURRENT_PROCESS = HEADLESS ? 20 : 1;

const browser = await chromium.launch({
  devtools: DEVTOOLS,
  headless: HEADLESS,
});

init(browser);
