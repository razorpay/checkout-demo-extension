const initCustomCheckout = require('blackbox/tests/custom/init.js');

describe('isLiveMode - Custom Checkout UT', () => {
  beforeEach(async () => {
    await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('Test Key', async () => {
    const isLiveMode = await page.evaluate(async () => {
      return window.rp.isLiveMode();
    });
    expect(isLiveMode).toBeFalsy();
  });

  test('Live Key', async () => {
    const isLiveMode = await page.evaluate(async () => {
      window.rp = new Razorpay({
        key: 'rzp_live_1DP5mmOlF5G5ag',
      });
      return window.rp.isLiveMode();
    });
    expect(isLiveMode).toBeTruthy();
  });
});
