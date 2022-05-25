async function handleAutomaticCheckoutButtonClick(context) {
  const selector = '.razorpay-payment-button';

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

  const { preferences, sendPreferences, sendRewards } = context;
  if (preferences) {
    await sendPreferences(context);
  }
}

module.exports = {
  handleAutomaticCheckoutButtonClick,
};
