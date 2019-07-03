const { delay } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

module.exports = {
  timeout: 10,
  test: browser => {
    const fromUpiScreenTest = UpiQrFromUpiScreen.test(browser, {
      options: {
        key: 'm1key',
        remember_customer: false,
        prefill: {
          contact: '9999999999',
          email: 'void@razorpay.com',
          method: 'upi',
        },
      },
    });

    return Promise.all([fromUpiScreenTest]);
  },
};

/**
 * Set UPI as the prefilled method.
 * And then click on "Show QR" button.
 */
class UpiQrFromUpiScreen extends CheckoutFrameTest {
  async render() {
    const { page } = this;

    const attempt = this.newAttempt();

    await delay(100);

    await page.click('#form-upi #showQr');

    await delay(100);

    await attempt.succeed();
    attempt.assertSuccess();
  }
}
