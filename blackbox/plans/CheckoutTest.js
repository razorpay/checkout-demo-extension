const { delay } = require('../util');
const chalk = require('chalk');
const TestBase = require('./TestBase');

class CheckoutTest extends TestBase {
  async loadScripts(message) {
    await this.page.addScriptTag({
      url: '/static/dist/checkout.js',
    });
    await this.page.addStyleTag({
      url: '/static/dist/css/checkout.css',
    });
    await this.page.evaluate(
      `(new Razorpay(${JSON.stringify(message.options)})).open()`
    );

    this.render()
      .then(() => this.pass())
      .catch(e => {
        this.log(chalk.dim(e));
        this.fail();
      });
  }
}

CheckoutTest.TEST_PARENT = 'Checkout';

module.exports = CheckoutTest;
