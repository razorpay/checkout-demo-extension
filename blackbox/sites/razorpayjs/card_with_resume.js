const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser => CardWithResume.test(browser),
};

class CardWithResume extends RazorpayJsTest {
  async render() {
    let page = this.page;
    await this.instantiateRazorpay({
      contact: '9999999999',
      email: 'void@razorpay.com',
      key: 'm1key',
      amount: 100,
    });

    await this.createPayment(
      {
        method: 'card',
        'card[number]': '4111111111111111',
        'card[name]': 'test',
        'card[expiry_month]': '12',
        'card[expiry_year]': '32',
        'card[expiry_cvv]': '000',
      },
      {
        paused: true,
        message: 'Confirming order...',
      }
    );

    await delay(250);
    await page.evaluate(`document.body.click()`);

    await delay(250);
    await page.evaluate(`razorpay.emit('payment.resume')`);

    await super.completePayment();
  }
}
