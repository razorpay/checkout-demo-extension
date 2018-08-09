const { delay } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

module.exports = {
  timeout: 15,
  test: browser =>
    PowerWallet.test(browser, {
      options: {
        key: 'm1key',
        prefill: {
          contact: '9999999999',
          email: 'void@razorpay.com',
          method: 'wallet',
        },
      },
    }),
};

class PowerWallet extends CheckoutFrameTest {
  async render() {
    let { page } = this;

    let attempt = this.newAttempt();

    await page.click('label[for=wallet-radio-mobikwik]');
    await delay(250);
    await page.click('.pay-btn');
    await attempt.askOtp();
    await page.type('#otp', '123456');

    await page.click('.pay-btn');
    await attempt.succeed();
    attempt.assertSuccess();
  }
}
