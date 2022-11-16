const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const DIR = require('./tmpdir');
const fs = require('fs');
const isCI = process.env.CI === 'true';
const flags = require('./chrome-flags');

module.exports = async function () {
  const opts = {
    headless: isCI,
    devtools: !isCI,
    args: ['--disable-web-security'],
  };
  if (isCI) {
    opts.args = flags;
  }
  const browser = await puppeteer.launch(opts);
  // store the browser instance so we can teardown it later
  // this global is only available in the teardown but not in TestEnvironments
  global.__BROWSER_GLOBAL__ = browser;

  // use the file system to expose the wsEndpoint for TestEnvironments
  execSync(`mkdir -p ${DIR}`);
  fs.writeFileSync(DIR + '/wsEndpoint', browser.wsEndpoint());
};
