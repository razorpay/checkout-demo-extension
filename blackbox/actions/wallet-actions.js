const { visible, randomContact, delay } = require('../util');

async function retryWalletTransaction(context) {
  const retryButton = await context.page.waitForSelector('#otp-action');
  await retryButton.click();
}

async function assertWalletPage(context) {
  expect(
    await context.page.$eval('div#wallet-radio-freecharge', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('div#wallet-radio-olamoney', visible)
  ).toEqual(true);
  expect(await context.page.$eval('div#wallet-radio-payzapp', visible)).toEqual(
    true
  );
  expect(
    await context.page.$eval('div#wallet-radio-mobikwik', visible)
  ).toEqual(true);
  expect(
    await context.page.$eval('div#wallet-radio-paytm', visible)
  ).toEqual(true);
}

async function selectWallet(context, walletName) {
  await context.page.click('div#wallet-radio-' + walletName);
}

async function handleWalletPopUp(context) {
  let popup = await context.popup();
}

module.exports = {
  assertWalletPage,
  retryWalletTransaction,
  selectWallet,
  handleWalletPopUp,
};
