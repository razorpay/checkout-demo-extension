const { delay } = require('../../util');
const RazorpayJsTest = require('../../plans/RazorpayJsTest');

module.exports = {
  test: browser =>
    NetbankingWithResume.test(browser, {
      options: {
        method: 'netbanking',
        wallet: 'HDFC'
      },
      params: {
        paused: true,
        message: 'Confirming order...'
      }
    })
};

class NetbankingWithResume extends RazorpayJsTest {
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
