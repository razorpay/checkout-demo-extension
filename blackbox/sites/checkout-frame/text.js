const { delay } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

/**
 * Returns the tests related to payment options.
 * @param {Browser} browser
 *
 * @returns {Array<Promise>}
 */
function getPaymentOptionsTests(browser) {
  const qrEnabled = UpiQrPaymentOptionTest.test(browser, {
    options: {
      personalization: false,
      key: 'm1key',
      remember_customer: false,
      prefill: {
        contact: '9999999999',
        email: 'void@razorpay.com',
      },
    },
  });

  const qrDisabled = UpiQrPaymentOptionTest.test(browser, {
    options: {
      personalization: false,
      key: 'm1key',
      remember_customer: false,
      prefill: {
        contact: '9999999999',
        email: 'void@razorpay.com',
      },
      method: {
        qr: false,
      },
    },
  });

  return [qrEnabled, qrDisabled];
}

module.exports = {
  timeout: 10,
  test: browser => {
    const paymentOptionTests = getPaymentOptionsTests(browser);

    const tests = [].concat(paymentOptionTests);

    return Promise.all(tests);
  },
};

/**
 * Validates the text of UPI payment option.
 *
 * TODO: Only does for Grid presently, do for p13n as well
 */
class UpiQrPaymentOptionTest extends CheckoutFrameTest {
  async render() {
    const { page, message } = this;
    const { options } = message;

    let isQrEnabled = true;

    try {
      isQrEnabled = options.method.qr;
    } catch (err) {}

    const selector = '#methods-list .payment-option[tab=upi]';
    const node = await page.$(selector);
    const text = await page.evaluate(el => el.innerText, node);

    delay(100);

    const expected = isQrEnabled ? 'UPI / QR' : 'UPI';

    if (text === expected) {
      return Promise.resolve(expected);
    } else {
      return Promise.reject(expected);
    }
  }
}
