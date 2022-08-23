const { delay } = require('../util');

async function verifyPartialAmount(context, amount) {
  const otpAmount = await context.page.$eval(
    context.isRedesignV15Enabled ? '.price-label' : '.original-amount',
    (el) => el.textContent
  );
  expect(otpAmount).toEqual(amount);
}

async function handlePartialPayment(context, amount) {
  await context.page.click('#partial-radio');
  await context.page.type('#amount-value', amount);
  await context.page.click(
    context.isRedesignV15Enabled ? '#redesign-v15-cta' : '#footer'
  );
}

module.exports = {
  verifyPartialAmount,
  handlePartialPayment,
};
