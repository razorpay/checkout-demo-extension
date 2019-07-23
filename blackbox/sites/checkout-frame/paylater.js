const { delay, assertObject } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

module.exports = {
  timeout: 15,
  test: browser => {
    // const regularTest = PayLater.test(browser, {
    //   options: {
    //     key: 'm1key',
    //     prefill: {
    //       contact: '9999999999',
    //       email: 'void@razorpay.com',
    //     },
    //     personalization: false,
    //   },
    // });
    //
    // return regularTest;

    // const prefilledTest = PayLaterPrefill.test(browser, {
    //   options: {
    //     key: 'm1key',
    //     prefill: {
    //       contact: '9999999999',
    //       email: 'void@razorpay.com',
    //       method: 'paylater',
    //     },
    //   },
    // });

    // return Promise.all([prefilledTest, regularTest]);
    return Promise.resolve();
  },
};

class PayLaterBase extends CheckoutFrameTest {
  async render() {
    let attempt = (this.attempt = this.newAttempt());

    await this.selectProvider('epaylater');
    await this.enterOtp('123456');
    await this.handlePaymentAjax();
  }

  async selectGridMethod() {
    const { page } = this;

    const selector = '.payment-option[tab=paylater]';

    await page.click(selector);
    await delay(100);
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

    // let { body: otpVerifyRequestBody } = attempt.getRequest();

    // assertObject(otpVerifyRequestBody, {
    //   contact: '',
    //   email: '',
    //   otp: '',
    // });

    await attempt.reply({ contact: '9999', ott: 'sd2783' });
  }

  async handlePaymentAjax() {
    const { page, attempt } = this;

    await page.waitForSelector('#error-message', { visible: true });
    await delay(100);

    // let { body: paymentAjaxRequest } = attempt.getRequest();

    // assertObject(paymentAjaxRequest, {
    //   contact: '',
    //   email: '',
    //   method: '',
    //   provider: '',
    //   ott: '',
    //   amount: '',
    //   currency: '',
    //   key_id: '',
    //   _: {
    //     checkout_id: 'CsTpeFvRnElRNc',
    //   },
    // });

    await attempt.succeed();
    attempt.assertSuccess();
  }
}

class PayLaterPrefill extends PayLaterBase {}

class PayLater extends PayLaterBase {
  async render() {
    const { message } = this;
    const { options } = message;

    const useP13n = options.personalization;

    // TODO: P13n test
    if (!useP13n) {
      await this.selectGridMethod();
    }

    await super.render();
  }
}
