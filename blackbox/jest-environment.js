// const NodeEnvironment = require('jest-environment-node');
const JsdomEnvironment = require('jest-environment-jsdom');
const puppeteer = require('puppeteer');
const DIR = require('./tmpdir');
const { readFileSync } = require('fs');
const { delay } = require('./util');

class PuppeteerEnvironment extends JsdomEnvironment {
  async setup() {
    const browserWSEndpoint = readFileSync(DIR + '/wsEndpoint', 'utf8');
    const browser = await puppeteer.connect({ browserWSEndpoint });
    this.global.page = await browser.newPage();
    this.global.delay = delay;
  }

  async teardown() {
    await this.global.page.close();
  }
}

module.exports = PuppeteerEnvironment;
