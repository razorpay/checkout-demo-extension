require('./api');
const glob = require('glob').sync;
const puppeteer = require('puppeteer');
const path = require('path');
const chalk = require('chalk');

// wait this many seconds for each test
const globalTimeout = 10;

// currently running tests;
let running = 0;
let fulfilled = 0;

const concurrency = 10;

let singleTest = process.argv[2];

if (singleTest) {
  tests = [__dirname + '/sites/' + singleTest + '.js'];
} else {
  tests = glob(__dirname + '/sites/**/*.js');
}

puppeteer
  .launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
    args: ['--no-sandbox'],
    headless: !singleTest
    // devtools: true,
  })
  .then(browser => {
    const run = async site => {
      let suite = require(site);
      let testTimeout = suite.timeout || globalTimeout;
      let timeout = setTimeout(() => {
        console.error(
          `${path.basename(site)} not completed in ${testTimeout}s`
        );
        if (!singleTest) {
          process.exit(1);
        }
      }, testTimeout * 1000);

      let test = suite.test(browser);
      return test
        .then(() => {
          fulfilled++;
          clearTimeout(timeout);
        })
        .catch(error => {
          !singleTest && process.exit(1);
        });
    };

    while (running < concurrency && running < tests.length) {
      runNext();
    }

    async function runNext() {
      await run(tests[running++]);
      if (running < tests.length) {
        runNext();
      }
      if (fulfilled === tests.length) {
        process.exit(0);
      }
    }
  });
