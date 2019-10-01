const NodeEnvironment = require('jest-environment-node');
const puppeteer = require('puppeteer-core');
const isProd = process.env.NODE_ENV === 'production';

let browser;
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
      args: ['--no-sandbox'],
      headless: isProd,
      // devtools: true,
    });
  }
  return browser;
}

class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    const browser = await getBrowser();
    this.global.page = await browser.newPage();
  }

  async teardown() {
    await this.global.page.close();
  }
}

module.exports = PuppeteerEnvironment;
