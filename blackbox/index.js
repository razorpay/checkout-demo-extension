require('./api');
const glob = require('glob').sync;
const puppeteer = require('puppeteer');
const path = require('path');

// wait this many seconds for each test
const testTimeout = 20;

// currently running tests;
let running = 0;
let fulfilled = 0;

const concurrency = 10;

let singleTest = process.argv[2];

if (singleTest) {
  tests = [__dirname + '/sites/' + singleTest + '.js'];
} else {
  tests = glob(__dirname + '/sites/*.js');
}

const run = async site => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
    args: ['--no-sandbox'],
    headless: !singleTest
    // devtools: true,
  });
  const page = await browser.newPage();
  await page.goto('file://' + __dirname + '/index.html');

  let timeout = setTimeout(() => {
    console.error(`${path.basename(site)} not completed in ${testTimeout}s`);
    if (!singleTest) {
      process.exit(1);
    }
  }, testTimeout * 1000);
  await require(site)(page);
  clearTimeout(timeout);
  await browser.close();
  fulfilled++;
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
