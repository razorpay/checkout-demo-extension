const { delay, assertObject } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

module.exports = {
  timeout: 15,
  test: browser =>
    PayLater.test(browser, {
      options: {
        key: 'm1key',
        prefill: {
          contact: '9999999999',
          email: 'void@razorpay.com',
          method: 'paylater',
        },
      },
    }),
};

class PayLater extends CheckoutFrameTest {
  async render() {
    let attempt = (this.attempt = this.newAttempt());

    await this.selectProvider('epaylater');
    await this.enterOtp('123456');
    await this.handlePaymentAjax();
  }

  async selectProvider(providerCode) {
    const { page, attempt } = this;

    const selector = `#form-paylater .option[data-paylater="${providerCode}"]`;

    await page.waitForSelector(selector, { visible: true });

    await page.click(selector);

    await delay(100);

    await attempt.reply({ saved: true });

    await page.waitForSelector('input#otp', { visible: true });
  }

  async enterOtp(otp) {
    const { page, attempt } = this;

    await page.type('#otp', otp);

    await page.click('.otp-btn');

    await page.waitForSelector('#otp-prompt', { visible: true });
    await delay(100);

    let { body: otpVerifyRequestBody } = attempt.getRequest();

    assertObject(otpVerifyRequestBody, {
      contact: '',
      email: '',
      otp: '',
    });

    await attempt.reply({ contact: '9999', ott: 'sd2783' });
  }

  async handlePaymentAjax() {
    const { page, attempt } = this;

    await page.waitForSelector('#error-message', { visible: true });
    await delay(100);

    let { body: paymentAjaxRequest } = attempt.getRequest();

    assertObject(paymentAjaxRequest, {
      contact: '',
      email: '',
      method: '',
      provider: '',
      ott: '',
      amount: '',
      currency: '',
      key_id: '',
      _: {
        checkout_id: 'CsTpeFvRnElRNc',
      },
    });

    await attempt.succeed();
    attempt.assertSuccess();
  }
}
