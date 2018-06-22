const { delay } = require('../util');
const CheckoutFrameTest = require('../plans/CheckoutFrameTest');

module.exports = {
  test: browser =>
    PowerWallet.test(browser, {
      options: {
        key: 'm1key',
        prefill: {
          contact: '9999999999',
          email: 'void@razorpay.com',
          method: 'wallet'
        }
      }
    })
};

class PowerWallet extends CheckoutFrameTest {
  async render() {
    let { page } = this;

    await page.click('label[for=wallet-radio-mobikwik]');
    await delay(250);
    await page.click('.pay-btn');
    await delay(1000);
    await page.type('#otp', '123456');
    await page.click('.otp-btn');

    let data = await this.paymentResult();
    if (data.razorpay_payment_id) {
      this.pass();
    } else {
      this.fail();
    }
  }
}
