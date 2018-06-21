const { delay, loadCheckoutFrame } = require('../util');

module.exports = async page =>
  new Promise(async (resolve, reject) => {
    await page.exposeFunction('renderHandler', async () => {
      await page.click('label[for=wallet-radio-mobikwik]');
      await delay(250);
      await page.click('.pay-btn');
      await delay(1000);
      await page.type('#otp', '123456');
      await page.click('.otp-btn');
    });
    await page.exposeFunction('completeHandler', data => {
      if (JSON.parse(data).razorpay_payment_id) {
        console.log('wallet payment passed');
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
      prefill: {
        contact: '9999999999',
        email: 'void@razorpay.com',
        method: 'wallet'
      }
    }
  })`);
  });
