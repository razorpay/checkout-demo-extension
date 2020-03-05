const { visible, delay } = require('../util');

async function assertNetbankingPage(context) {
  await delay(300);

  expect(
    await context.page.$eval('label[for=bank-radio-SBIN]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=bank-radio-HDFC]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=bank-radio-ICIC]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=bank-radio-UTIB]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=bank-radio-KKBK]', visible)
  ).toEqual(true);
}
module.exports = {
  assertNetbankingPage,
};
