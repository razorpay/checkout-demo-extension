const { delay } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

module.exports = {
  test: browser =>
    NewCard.test(browser, {
      options: {
        key: 'm1key',
        remember_customer: false,
      },
    }),
};

class NewCard extends CheckoutFrameTest {
  async render() {
    let { page } = this;
    await page.type('#contact', '9999999999');
    await page.type('#email', 'void@razorpay.com');
    await page.click('.payment-option[tab=card] label');
    await page.type('#card_number', '4111111111111111');
    await page.type('#card_expiry', '1130');
    await page.type('#card_name', 'test');
    await page.type('#card_cvv', '000');
    await delay(100);

    let attempt = await this.newAttempt();
    await page.click('.pay-btn');

    attempt.fail('Invalid card number', 'card[number]');

    await delay(100);

    let classList = Object.values(
      await page.$eval('#elem-card', el => el.classList)
    );

    // this.assert(
    //   'card element has invalid, mature and focused class'
    // ).includeMembers(classList, ['invalid', 'mature', 'focused']);

    // await page.keyboard.press('Backspace');
    // await page.keyboard.type('1');
    // await delay(100);

    // attempt = await this.newAttempt();
    // await page.click('.pay-btn');
    // await attempt.succeed();
  }
}
