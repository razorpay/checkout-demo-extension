const chalk = require('chalk');
const { delay } = require('../util');
const TestBase = require('./TestBase');

class RazorpayJsTest extends TestBase {
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
      url: 'file://' + __dirname + '/../../app/dist/v1/razorpay.js',
    });

    this.render();
  }

  async createPayment(options, params) {
    await this.page.evaluate(`
      var button = document.createElement('button');
      document.body.appendChild(button);
      button.onclick = function(){
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
