const { visible } = require('../util');

async function assertNetbankingPage(context) {
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
  expect(
    await context.page.$eval('label[for=bank-radio-YESB]', visible)
  ).toEqual(true);
}

async function assertNetbankingPageForPersonalization(context) {
  expect(
    await context.page.waitForXPath(
      '//*[contains(text(), "Netbanking") and @class="option-title"]'
    )
  ).not.toBeNull();
}

module.exports = {
  assertNetbankingPage,
  assertNetbankingPageForPersonalization,
};
