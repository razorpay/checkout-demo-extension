const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser => CardWithRedirect.test(browser),
};

class CardWithRedirect extends RazorpayJsTest {
  async render() {
    let page = this.page;
    await this.instantiateRazorpay({
      contact: '9999999999',
      email: 'void@razorpay.com',
      key: 'm1key',
      amount: 100,
      redirect: true,
      callback_url: '/callback_url',
    });

    await this.createPayment({
      method: 'card',
      'card[number]': '4111111111111111',
      'card[name]': 'test',
      'card[expiry_month]': '12',
      'card[expiry_year]': '32',
      'card[expiry_cvv]': '000',
    });

    await delay(250);
    await page.evaluate(`document.body.click()`);

    await super.completePayment();
  }
}
