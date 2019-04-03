const { delay } = require('../../util');
const CheckoutFrameTest = require('../../plans/CheckoutFrameTest');

module.exports = {
  test: browser =>
    NewCard.test(browser, {
      options: {
        key: 'm1key',
        remember_customer: false,
        nativeotp: false,
        personalization: false,
      },
    }),
};

class NewCard extends CheckoutFrameTest {
  async render() {
    let { page } = this;
    await page.type('#contact', '9999999999');
    await page.type('#email', 'void@razorpay.com');
    // await delay(3000); // Wait for methods list to show up
    await page.click(
      '.payment-option[tab=card] label, .othermethods .options .option.next-option[tab=card]'
    ); // Selectors for p13n's method list as well as the basic grid.
    await page.type('#card_number', '4111111111111111');
    await page.type('#card_expiry', '1130');
    await page.type('#card_name', 'test');
    await page.type('#card_cvv', '000');

    let attempt = await this.newAttempt();
    await page.click('.pay-btn');

    await attempt.fail('Invalid card number', 'card[number]');

    await page.waitForSelector('#elem-card.invalid.mature.focused');

    this.logPass('card element has invalid, mature and focused class');

    await page.keyboard.press('Backspace');
    await page.keyboard.type('1');
    await delay(100);

    attempt = this.newAttempt();
    await page.click('.pay-btn');
    await attempt.succeed();
    attempt.assertSuccess();
  }
}
