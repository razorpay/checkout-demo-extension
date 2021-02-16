const initCustomCheckout = require('blackbox/tests/custom/init.custom.js');

describe('isLiveMode - Custom Checkout UT', () => {
  beforeEach(async () => {
    await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('Test Key', async () => {
    const isLiveMode = await page.evaluate(async () => {
      const rp = new Razorpay({
        key: 'rzp_test_1DP5mmOlF5G5ag',
      });
      return rp.isLiveMode();
    });
    expect(isLiveMode).toBeFalsy();
  });

  test('Live Key', async () => {
    const isLiveMode = await page.evaluate(async () => {
      const rp = new Razorpay({
        key: 'rzp_live_1DP5mmOlF5G5ag',
      });
      return rp.isLiveMode();
    });
    expect(isLiveMode).toBeTruthy();
  });
});
