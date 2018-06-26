const chalk = require('chalk');
const { delay } = require('../util');
const TestBase = require('./TestBase');

class RazorpayJsTest extends TestBase {
  static async test(browser) {
    const page = await browser.newPage();

    await page.goto('file://' + __dirname + '/../index.html');

    let p = new this(page);
    await p.loadScripts();

    await page.exposeFunction('__pptr_oncomplete', (data, params) => {
      var data = typeof data === 'object' ? data : JSON.parse(data);

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

    p.render();

    return new Promise((resolve, reject) => p.setCallbacks(resolve, reject));
  }

  async completePayment() {
    /* default render for expected success scenario */
    var data = await this.paymentResult();

    if (data.razorpay_payment_id) {
      this.pass();
    } else {
      this.fail();
    }
  }

  async loadScripts() {
    await this.page.addScriptTag({
      url: 'file://' + __dirname + '/../../app/dist/v1/razorpay.js'
    });
  }

  async createPayment(options, params) {
    await this.page.evaluate(`
      document.body.onclick = function(){
        razorpay
          .createPayment(
            ${JSON.stringify(options)}
            ${params ? ', ' + JSON.stringify(params) : ''}
          )
          .on('payment.success', __pptr_oncomplete)
          .on('payment.cancel', __pptr_oncomplete);
      }`);
  }
}

RazorpayJsTest.TEST_PARENT = 'RazorpayJS';

module.exports = RazorpayJsTest;
