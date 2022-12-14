const initCustomCheckout = require('blackbox/tests/custom/init.js');

const DEFAULT_THEME_META = {
  color: '#005BF2',
  textColor: '#FFFFFF',
  highlightColor: 'rgba(0, 73, 194, 1)',
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
      const rp = window.rp;
      rp.postInit();
      const { themeMeta } = rp;
      return themeMeta;
    });
    expect(verifyThemeMeta(meta)).toBeTruthy();
  });

  test('Custom Theme', async () => {
    const meta = await page.evaluate(async () => {
      const rp = window.rp;
      rp.set('theme.color', '#000000');
      rp.postInit();
      const { themeMeta } = rp;
      return themeMeta;
    });
    expect(
      verifyThemeMeta(meta, {
        color: '#000000',
        highlightColor: '#005BF2',
        textColor: '#FFFFFF',
      })
    ).toBeTruthy();
  });
});
