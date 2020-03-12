const { delay } = require('../util');

async function verifyPartialAmount(context, amount) {
  const orignalAmount = await context.page.$('.original-amount');
  const otpAmount = await context.page.evaluate(
    orignalAmount => orignalAmount.textContent,
    orignalAmount
  );
  expect(otpAmount).toEqual(amount);
}

async function handlePartialPayment(context, amount) {
  const makePartialCheckBox = await context.page.$('#partial-radio');
  await makePartialCheckBox.click();
  const amountValue = await context.page.$('#amount-value');
  await amountValue.type(amount);
  const nextButton = await context.page.$('#footer');
  await nextButton.click();
}

module.exports = {
  verifyPartialAmount,
  handlePartialPayment,
};
