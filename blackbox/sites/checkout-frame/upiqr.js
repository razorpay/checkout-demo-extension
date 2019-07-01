const { delay } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

module.exports = {
  timeout: 10,
  test: browser => {
    const prefillTest = UpiQrPrefill.test(browser, {
      options: {
        key: 'm1key',
        remember_customer: false,
        prefill: {
          contact: '9999999999',
          email: 'void@razorpay.com',
          method: 'qr',
        },
      },
    });

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

    return Promise.all([fromUpiScreenTest, prefillTest]);
  },
};

/**
 * Directly set QR as the prefilled method.
 */
class UpiQrPrefill extends CheckoutFrameTest {
  async render() {
    const attempt = this.newAttempt();
    await attempt.succeed();
    attempt.assertSuccess();
  }
}

/**
 * Set UPI as the prefilled method.
 * And then click on "Show QR" button.
 */
class UpiQrFromUpiScreen extends CheckoutFrameTest {
  async render() {
    const { page } = this;

    await delay(100);

    const attempt = this.newAttempt();
    await page.click('#form-upi #showQr');

    await attempt.succeed();
    attempt.assertSuccess();
  }
}
