const argv = require('fe/argv');
const puppeteer = require('puppeteer-core');
const glob = require('glob').sync;

// number of tests to run in parallel
const concurrency = argv.concurrency || 10;

// if extra CLI arg is passed, run in single test mode. skip other tests
const singleTest = argv._[0];
const tests = glob(singleTest || 'blackbox/tests/**/*.js', { absolute: true });

// number of running tests at any point
let running = 0;

// number of completed tests at any point
let fulfilled = 0;

puppeteer
  .launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
    args: ['--no-sandbox'],
    headless: !singleTest,
    // devtools: argv.devtools,
  })
  .then(browser => {
    /**
     * @param  {String} path to test file
     * @return {Promise} when test is done running
     */
    async function run(path) {
      let page;
      // use default opened page for first test
      // for others, open incognito so as to not affect localStorage and cookies
      if (running === 1) {
        page = (await browser.pages())[0];
      } else {
        const context = await browser.createIncognitoBrowserContext();
        page = await context.newPage();
      }
      require(path)(page, path)
        .then(() => fulfilled++)
        .catch(error => {
          console.error(error);
          !singleTest && process.exit(1);
        });
    }

    // run one test on top of queue, wait for its completion and recurse
    // exit process if queue is empty
    async function runNext() {
      await run(tests[running++]);
      if (running < tests.length) {
        runNext();
      }
      if (fulfilled === tests.length) {
        process.exit(0);
      }
    }

    // start concurrent tests
    while (running < concurrency && running < tests.length) {
      runNext();
    }
  });
