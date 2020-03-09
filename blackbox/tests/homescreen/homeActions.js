const {
  randomContact,
  randomEmail,
  delay,
  setState,
  find,
  getAttribute,
  innerText,
} = require('../../util');

/**
 * Returns all available method buttons
 */
async function getMethodButtons(context) {
  const list = await context.page.waitForSelector('.methods-container', {
    visible: true,
  });
  return Array.from(await list.$$('button.new-method'));
}

/**
 * Returns all available EMI buttons
 */
async function getEmiButtons(context) {
  const list = await context.page.waitForSelector(
    '#emi-options-wrapper .options',
    {
      visible: true,
    }
  );
  return Array.from(await list.$$('#emi-options-wrapper .options .option'));
}

/**
 * Verify that methods are being shown
 */
async function assertPaymentMethods(context) {
  const buttons = await getMethodButtons(context);

  const methods = await Promise.all(
    buttons.map(button => getAttribute(context.page, button, 'method'))
  );
  expect([
    'card',
    'netbanking',
    'wallet',
    'upi',
    'emi',
    'bank_transfer',
    'paylater',
    'cardless_emi',
  ]).toEqual(expect.arrayContaining(methods));
}

/**
 * Select a payment method
 */
async function selectPaymentMethod(context, method) {
  const buttons = await getMethodButtons(context);

  const methodButton = await find(buttons, async button => {
    const buttonMethod = await getAttribute(context.page, button, 'method');

    return method === buttonMethod;
  });

  await methodButton.click();
}

async function assertMethodsScreen(context) {
  const $form = await context.page.waitForSelector('#form-common', {
    visible: true,
  });
  const methods = await $form.$('.methods-container');

  expect(methods).not.toEqual(null);
}

async function selectQRScanner(context) {
  const selectQR = await context.page.waitForSelector('#showQr', {
    visible: true,
  });
  await selectQR.click();
}

module.exports = {
  getMethodButtons,
  assertPaymentMethods,
  selectPaymentMethod,
  assertMethodsScreen,
  selectQRScanner,
  getEmiButtons,
};
