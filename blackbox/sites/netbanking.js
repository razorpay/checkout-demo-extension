const { delay } = require('../util');
const CheckoutFrameTest = require('../plans/CheckoutFrameTest');

const message = {
  options: {
    key: 'm1key',
    remember_customer: false,
    prefill: {
      contact: '9999999999',
      email: 'void@razorpay.com',
      method: 'netbanking'
    }
  }
};

module.exports = {
  test: browser =>
    NetbankingDropdown.test(browser, message).then(result =>
      NetbankingDropdown.test(browser, message)
    )
};

class NetbankingButton extends CheckoutFrameTest {
  async render() {
    let { page } = this;

    await page.click('#netb-banks .radio-label');
    await delay(100);
    await page.click('.pay-btn');

    let data = await this.paymentResult();
    if (data.razorpay_payment_id) {
      this.pass();
    } else {
      this.fail();
    }
  }
}

class NetbankingDropdown extends CheckoutFrameTest {
  async render() {
    let { page } = this;

    await page.select('#bank-select', 'HDFC');
    await delay(100);
    await page.click('.pay-btn');

    let data = await this.paymentResult();
    if (data.razorpay_payment_id) {
      this.pass();
    } else {
      this.fail();
    }
  }
}
