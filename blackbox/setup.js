const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const DIR = require('./tmpdir');
const fs = require('fs');
const isProd = process.env.NODE_ENV === 'production';

module.exports = async function() {
  const browser = await puppeteer.launch({
    // executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
    args: ['--no-sandbox', '--single-process'],
    headless: isProd,
    // devtools: true,
  });
  // store the browser instance so we can teardown it later
  // this global is only available in the teardown but not in TestEnvironments
  global.__BROWSER_GLOBAL__ = browser;

  // use the file system to expose the wsEndpoint for TestEnvironments
  execSync(`mkdir -p ${DIR}`);
  fs.writeFileSync(DIR + '/wsEndpoint', browser.wsEndpoint());
};
