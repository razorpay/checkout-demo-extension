const initCustomCheckout = require('blackbox/tests/custom/init.custom.js');

const DEFAULT_THEME_META = {
  color: '#528FF0',
  textColor: '#FFFFFF',
  highlightColor: 'rgba(57, 100, 168, 1)',
};

const verifyThemeMeta = (themeMeta, themeCompareMeta = DEFAULT_THEME_META) => {
  return (
    themeMeta.color === themeCompareMeta.color &&
    themeMeta.textColor === themeCompareMeta.textColor &&
    themeMeta.highlightColor === themeCompareMeta.highlightColor
  );
};

describe('postInit - Custom Checkout UT', () => {
  beforeEach(async () => {
    await initCustomCheckout({ page });
  });
  afterEach(async () => {
    page.removeAllListeners('request');
  });
  test('Default', async () => {
    const meta = await page.evaluate(async () => {
      const rp = new Razorpay({
        key: 'rzp_test_1DP5mmOlF5G5ag',
      });
      rp.postInit();
      const { themeMeta } = rp;
      return themeMeta;
    });
    expect(verifyThemeMeta(meta)).toBeTruthy();
  });

  test('Custom Theme', async () => {
    const meta = await page.evaluate(async () => {
      const rp = new Razorpay({
        key: 'rzp_test_1DP5mmOlF5G5ag',
      });
      rp.set('theme.color', '#000000');
      rp.postInit();
      const { themeMeta } = rp;
      return themeMeta;
    });
    expect(
      verifyThemeMeta(meta, {
        color: '#000000',
        highlightColor: '#528FF0',
        textColor: '#FFFFFF',
      })
    ).toBeTruthy();
  });
});
