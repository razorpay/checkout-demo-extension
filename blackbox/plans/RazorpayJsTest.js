const chalk = require('chalk');
const { delay } = require('../util');
const TestBase = require('./TestBase');

class RazorpayJsTest extends TestBase {
  static async test(browser, message) {
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

    await page
      .evaluate(
        `var razorpay = new Razorpay({
          contact: '9999999999',
          email: 'void@razorpay.com',
          key: 'm1key',
          amount: 100
        });
        document.body.onclick = function(){
          razorpay
            .createPayment(${JSON.stringify(message.options)})
            .on('payment.success', __pptr_oncomplete)
            .on('payment.cancel', __pptr_oncomplete);
        }
        document.body.click();`
      )
      .catch(e => {
        p.log(chalk.dim(e));
        p.fail();
      });

    await delay(250);

    p.render();

    return new Promise((resolve, reject) => p.setCallbacks(resolve, reject));
  }

  async render() {
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
}

RazorpayJsTest.TEST_PARENT = 'RazorpayJS';

module.exports = RazorpayJsTest;
