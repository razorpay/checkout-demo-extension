const { visible, randomContact, delay } = require('../util');

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

async function handleWalletPopUp(context) {
  await delay(200);
  let popup = await context.popup();
  // console.log(popup);
  let popupPage = await popup.page;
  const ContactField = await popupPage.waitForSelector('[name = contact]');
  const contactNum = randomContact();
  await ContactField.type(
    contactNum.substring(contactNum.lastIndexOf('+91') + 3)
  );
  const submit = await popupPage.$x('//button[text() = "Submit"]');
  await submit[0].click();
  await popupPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await delay(800);
  const passButton = await popupPage.$('.success');
  await passButton.click();
}

module.exports = {
  assertWalletPage,
  retryWalletTransaction,
  selectWallet,
  handleWalletPopUp,
};
