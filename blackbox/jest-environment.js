const NodeEnvironment = require('jest-environment-node');
const puppeteer = require('puppeteer-core');
const DIR = require('./tmpdir');
const { readFileSync } = require('fs');
const { delay } = require('./util');

class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    const browserWSEndpoint = readFileSync(DIR + '/wsEndpoint', 'utf8');
    const browser = await puppeteer.connect({ browserWSEndpoint, slowMo: 300 });
    this.global.page = await browser.newPage();
    this.global.delay = delay;
  }

  async teardown() {
    await this.global.page.close();
  }
}

module.exports = PuppeteerEnvironment;
