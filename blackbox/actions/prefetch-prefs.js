async function handlePrefetchPrefsOpenButtonClick(context) {
  const selector = '#prefetch-pay';

  expect(
    await context.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) {
        return false;
      }
      return true;
    }, selector)
  ).toBe(true);

  const buttonPromise = context.page.click(selector);
  await buttonPromise;

  const { preferences, sendPreferences } = context;
  if (preferences) {
    await sendPreferences(context);
  }
}

module.exports = {
  handlePrefetchPrefsOpenButtonClick,
};
