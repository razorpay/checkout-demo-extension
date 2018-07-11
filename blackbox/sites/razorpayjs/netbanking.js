const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser => Netbanking.test(browser),
};

class Netbanking extends RazorpayJsTest {
  async render() {
    let page = this.page;

    await this.instantiateRazorpay({
      contact: '9999999999',
      email: 'void@razorpay.com',
      key: 'm1key',
      amount: 100,
    });

    await this.createPayment({
      method: 'netbanking',
      wallet: 'HDFC',
    });

    await delay(250);
    await page.evaluate(`document.body.click()`);

    await super.completePayment();
  }
}
