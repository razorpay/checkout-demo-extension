const { delay } = require('../util');
const chalk = require('chalk');
const TestBase = require('./TestBase');

class CheckoutTest extends TestBase {
  static async test(browser, message) {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/index.html');

    let p = new this(page, message.options);

    await p.loadScripts(page);

    await page.evaluate(
      `(new Razorpay(${JSON.stringify(message.options)})).open()`
    );

    await delay(100);

    const donePromise = new Promise((resolve, reject) =>
      p.setCallbacks(resolve, reject)
    );

    p.render(p.page)
      .then(() => {
        p.pass();
      })
      .catch(e => {
        p.fail(e);
      });

    return donePromise;
  }

  async loadScripts() {
    await this.page.addScriptTag({
      url: '/dist/v1/checkout.js',
    });
    await this.page.addStyleTag({
      url: '/dist/v1/css/checkout.css',
    });
  }
}

CheckoutTest.TEST_PARENT = 'Checkout';

module.exports = CheckoutTest;
