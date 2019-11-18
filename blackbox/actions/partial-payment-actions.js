const { delay } = require('../util');

async function verifyPartialAmount(context, amount) {
  const orignalAmount = await context.page.waitForSelector('.original-amount');
  const otpAmount = await context.page.evaluate(
    orignalAmount => orignalAmount.textContent,
    orignalAmount
  );
  expect(otpAmount).toEqual(amount);
}

async function handlePartialPayment(context, amount) {
  await delay(300);
  const makePartialCheckBox = await context.page.waitForSelector(
    '#partial-radio'
  );
  await makePartialCheckBox.click();
  // await delay(800);
  // await makePartialCheckBox.click();
  // await makePartialCheckBox.click();
  // await delay(800);
  // await makePartialCheckBox.click();
  // await makePartialCheckBox.click();
  const amountValue = await context.page.waitForSelector('#amount-value');
  await amountValue.type(amount);
  await delay(300);
  const nextButton = await context.page.waitForSelector('#next-button');
  await nextButton.click();
  await delay(200);
}

module.exports = {
  verifyPartialAmount,
  handlePartialPayment,
};
