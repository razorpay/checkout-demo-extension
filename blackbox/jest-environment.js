const NodeEnvironment = require('jest-environment-node');
const puppeteer = require('puppeteer-core');
const isProd = process.env.NODE_ENV === 'production';
const { delay } = require('./util');

class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
      args: ['--no-sandbox'],
      headless: true, //isProd,
      // devtools: true,
    });
    const pages = await browser.pages();
    this.global.page = pages[0];
    this.global.delay = delay;
  }

  async teardown() {
    await this.global.page.browser().close();
  }
}

module.exports = PuppeteerEnvironment;
