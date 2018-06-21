const { delay, loadCheckoutFrame } = require('../util');

module.exports = async page =>
  new Promise(async (resolve, reject) => {
    await page.exposeFunction('renderHandler', async () => {
      await page.type('#contact', '9999999999');
      await page.type('#email', 'void@razorpay.com');
      await page.click('.payment-option[tab=card] label');
      await page.type('#card_number', '4111111111111111');
      await page.type('#card_expiry', '1130');
      await page.type('#card_name', 'test');
      await page.type('#card_cvv', '000');
      await page.click('.pay-btn');
    });
    await page.exposeFunction('completeHandler', data => {
      if (JSON.parse(data).razorpay_payment_id) {
        console.log('card payment passed');
        resolve();
      } else {
        reject();
      }
    });
    await page.evaluate(`
      CheckoutBridge = {
        oncomplete: completeHandler,
        onrender: renderHandler
      }
    `);
    await loadCheckoutFrame(page);
    await page.evaluate(`handleMessage({
    options: {
      key: 'm1key',
      remember_customer: false
    }
  })`);
  });
