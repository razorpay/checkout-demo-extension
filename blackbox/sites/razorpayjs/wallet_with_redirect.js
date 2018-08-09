const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser => WalletWithRedirect.test(browser),
};

class WalletWithRedirect extends RazorpayJsTest {
  async render() {
    let page = this.page;
    await this.instantiateRazorpay({
      contact: '9999999999',
      email: 'void@razorpay.com',
      key: 'm1key',
      amount: 100,
      redirect: true,
      callback_url: `/${this.id}/callback_url`,
    });

    await this.createPayment({
      method: 'wallet',
      wallet: 'mobikwik',
    });

    let attempt = this.newAttempt();
    page.click('button');
    await delay(500);
    await attempt.succeed();
    attempt.assertSuccess();
  }
}
