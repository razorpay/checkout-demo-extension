const { delay } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

const message = {
  options: {
    key: 'm1key',
    remember_customer: false,
    prefill: {
      contact: '9999999999',
      email: 'void@razorpay.com',
      method: 'netbanking',
    },
  },
};

module.exports = {
  test: browser =>
    NetbankingButton.test(browser, message).then(_ =>
      NetbankingDropdown.test(browser, message)
    ),
};

class NetbankingButton extends CheckoutFrameTest {
  async render() {
    let { page } = this;

    await page.click('#netb-banks .radio-label');
    await delay(100);

    let attempt = this.newAttempt();
    await page.click('.pay-btn');
    await attempt.succeed();
    attempt.assertSuccess();
  }
}

class NetbankingDropdown extends CheckoutFrameTest {
  async render() {
    let { page } = this;

    await page.select('#bank-select', 'HDFC');
    await delay(100);

    let attempt = this.newAttempt();
    await page.click('.pay-btn');
    await attempt.succeed();
    attempt.assertSuccess();
  }
}
