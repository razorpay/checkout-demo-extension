const { delay, loadCheckoutFrame } = require('../util');

module.exports = async page =>
  new Promise(async (resolve, reject) => {
    await page.exposeFunction('renderHandler', async () => {
      await page.type('#vpa', 'pranav@razorpay');
      await page.click('.pay-btn');
    });
    await page.exposeFunction('completeHandler', data => {
      if (JSON.parse(data).razorpay_payment_id) {
        console.log('upi payment passed');
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
      remember_customer: false,
      prefill: {
        contact: '9999999999',
        email: 'void@razorpay.com',
        method: 'upi'
      }
    }
  })`);
  });
