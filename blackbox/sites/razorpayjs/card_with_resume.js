const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser =>
    CardWithResume.test(browser, {
      options: {
        method: 'card',
        'card[number]': '4111111111111111',
        'card[name]': 'test',
        'card[expiry_month]': '12',
        'card[expiry_year]': '32',
        'card[expiry_cvv]': '000'
      },
      params: {
        paused: true,
        message: 'Confirming order...'
      }
    })
};

class CardWithResume extends RazorpayJsTest {
  async render() {
    let page = this.page;

    await page.evaluate(`razorpay.emit('payment.resume')`);

    let data = await this.paymentResult();

    if (data.razorpay_payment_id) {
      this.pass();
    } else {
      this.fail();
    }
  }
}
