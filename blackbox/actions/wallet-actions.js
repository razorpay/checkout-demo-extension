const { visible } = require('../util');

async function retryWalletTransaction(context) {
  const retryButton = await context.page.waitForSelector('#otp-action');
  await retryButton.click();
}

async function assertWalletPage(context) {
  expect(
    await context.page.$eval('label[for=wallet-radio-freecharge]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=wallet-radio-olamoney]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=wallet-radio-payzapp]', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('label[for=wallet-radio-mobikwik]', visible)
  ).toEqual(true);
}

async function selectWallet(context, walletName) {
  await context.page.click('label[for=wallet-radio-' + walletName + ']');
}

module.exports = {
  assertWalletPage,
  retryWalletTransaction,
  selectWallet,
};
