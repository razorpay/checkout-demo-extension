const chalk = require('chalk');
const TestBase = require('./TestBase');

class CheckoutFrameTest extends TestBase {
  async loadScripts(message) {
    let page = this.page;

    await page.exposeFunction('__pptr_onrender', () => {
      this.render()
        .then(() => this.pass())
        .catch(e => {
          this.log(chalk.dim(e));
          this.fail();
        });
    });

    await page.evaluate(`
      CheckoutBridge = {
        onpaymenterror: __pptr_oncomplete,
        oncomplete: __pptr_oncomplete,
        onrender: __pptr_onrender
      }
    `);

    await page.addScriptTag({
      url: 'file://' + __dirname + '/../../app/dist/v1/checkout-frame.js',
    });

    await page.addStyleTag({
      url: 'file://' + __dirname + '/../../app/dist/v1/css/checkout.css',
    });

    await page.evaluate(`handleMessage(${JSON.stringify(message)})`);
  }
}

CheckoutFrameTest.TEST_PARENT = 'Checkout';

module.exports = CheckoutFrameTest;
