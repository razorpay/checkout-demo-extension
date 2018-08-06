const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser => WalletWithResume.test(browser),
};

class WalletWithResume extends RazorpayJsTest {
  async render() {
    let page = this.page;
    await this.instantiateRazorpay({
      contact: '9999999999',
      email: 'void@razorpay.com',
      key: 'm1key',
      amount: 100,
    });

    await this.createPayment(
      {
        method: 'wallet',
        wallet: 'mobikwik',
      },
      {
        paused: true,
        message: 'Confirming order...',
      }
    );

    let attempt = this.newAttempt();
    await page.click('button');
    await page.evaluate(`razorpay.emit('payment.resume')`);
    await attempt.succeed();
    attempt.assertSuccess();
  }
}
