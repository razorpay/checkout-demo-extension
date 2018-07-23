const chalk = require('chalk');
const TestBase = require('./TestBase');

class CheckoutFrameTest extends TestBase {
  static async test(browser, message) {
    const page = await browser.newPage();
    await page.goto('file://' + __dirname + '/../index.html');

    let p = new this(page);

    await page.exposeFunction('__pptr_oncomplete', data => {
      data = JSON.parse(data);
      if (data.razorpay_payment_id) {
        p.log(chalk.dim('payment successful: ' + data.razorpay_payment_id));
      } else {
        let errorMessage = 'payment failed: ' + data.error.description;
        if (data.error.field) {
          errorMessage +=
            '\n' +
            Array(path.basename(__filename, '.js')).join(' ') +
            'field: ' +
            data.error.field;
        }
        p.log(chalk.dim(errorMessage));
      }
      if (p.awaitingPaymentResult) {
        p.awaitingPaymentResult(data);
      }
    });

    await page.exposeFunction('__pptr_onrender', () => {
      p.render().catch(e => {
        p.log(chalk.dim(e));
        p.fail();
      });
    });

    await page.evaluate(`
      CheckoutBridge = {
        oncomplete: __pptr_oncomplete,
        onrender: __pptr_onrender
      }
    `);

    await p.loadScripts(page);

    await page.evaluate(`window.handleMessage(${JSON.stringify(message)})`);
    return new Promise((resolve, reject) => p.setCallbacks(resolve, reject));
  }

  async loadScripts() {
    await this.page.addScriptTag({
      url: 'file://' + __dirname + '/../../app/dist/v1/checkout-frame.js',
    });
    await this.page.addStyleTag({
      url: 'file://' + __dirname + '/../../app/dist/v1/css/checkout.css',
    });
  }
}

CheckoutFrameTest.TEST_PARENT = 'Checkout';

module.exports = CheckoutFrameTest;
