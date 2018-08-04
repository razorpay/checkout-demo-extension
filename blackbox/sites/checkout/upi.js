const { delay } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

module.exports = {
  timeout: 10,
  test: browser =>
    UpiCollect.test(browser, {
      options: {
        key: 'm1key',
        remember_customer: false,
        prefill: {
          contact: '9999999999',
          email: 'void@razorpay.com',
          method: 'upi',
        },
      },
    }),
};

class UpiCollect extends CheckoutFrameTest {
  async render() {
    let { page } = this;
    await page.type('#vpa', 'pranav@razorpay');
    await delay(100);

    let attempt = this.newAttempt();
    await page.click('.pay-btn');
    await delay(1000);
    await attempt.succeed();
    attempt.assertSuccess();
  }
}
