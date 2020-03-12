const { delay } = require('../util');

async function verifyPartialAmount(context, amount) {
  const otpAmount = await context.page.$eval(
    '.original-amount',
    el => el.textContent
  );
  expect(otpAmount).toEqual(amount);
}

async function handlePartialPayment(context, amount) {
  await context.page.click('#partial-radio');
  await context.page.type('#amount-value', amount);
  await context.page.click('#footer');
}

module.exports = {
  verifyPartialAmount,
  handlePartialPayment,
};
