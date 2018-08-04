const chalk = require('chalk');
const { delay } = require('../util');
const TestBase = require('./TestBase');

class RazorpayJsTest extends TestBase {
  async loadScripts() {
    await this.page.addScriptTag({
      url: 'file://' + __dirname + '/../../app/dist/v1/razorpay.js',
    });

    this.render()
      .then(() => this.pass())
      .catch(e => {
        this.log(chalk.dim(e));
        this.fail();
      });
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
          .on('payment.error', __pptr_oncomplete)
          .on('payment.cancel', __pptr_oncomplete);
      }`);
  }
}

RazorpayJsTest.TEST_PARENT = 'RazorpayJS';

module.exports = RazorpayJsTest;
