const {
  randomContact,
  randomEmail,
  delay,
  setState,
  find,
  getAttribute,
  innerText,
  assertVisible,
} = require('../../util');

/**
 * Returns all available method buttons
 */
async function getHomescreenMethods(context) {
  await assertVisible('.methods-block[data-block="rzp.cluster"]');
  return context.page.$$eval('button.new-method', buttons => {
    return buttons.map(b => b.getAttribute('method'));
  });
}

/**
 * Returns all available EMI buttons
 */
function getEmiButtonTexts(context) {
  return context.page.$$eval('#form-cardless_emi .options .option', els => {
    return els.map(el => el.textContent.trim());
  });
}

/**
 * Returns all available EMI buttons
 */
function getWalletButtonTexts(context) {
  return context.page.$$eval('#form-wallet button .title', els => {
    return els.map(el => el.textContent.trim().toLowerCase());
  });
}

/**
 * Verify that methods are being shown
 */
async function assertPaymentMethods(context, order) {
  if (!order) {
    order = [
      'card',
      'netbanking',
      'wallet',
      'upi',
      'emi',
      'bank_transfer',
      'paylater',
      'cardless_emi',
      'upi_otm',
      'paypal',
    ];
  }
  const methods = await getHomescreenMethods(context);
  expect(order).toEqual(expect.arrayContaining(methods));
}

/**
 * Select a payment method
 */
async function selectPaymentMethod(context, method) {
  // click through puppeteer may fail if element not in view due to scroll offset
  await context.page.evaluate(method => {
    const el = document.querySelector(`button.new-method[method=${method}]`);
    if (!el || !el.offsetWidth) {
      throw `${method} button is not visible`;
    }
    el.click();
  }, method);
}

async function assertMethodsScreen(context) {
  await assertVisible('.methods-block[data-block="rzp.cluster"]');
}

async function selectQRScanner(context) {
  const selectQR = await context.page.waitForSelector('#showQr', {
    visible: true,
  });
  await selectQR.click();
}

module.exports = {
  getHomescreenMethods,
  assertPaymentMethods,
  selectPaymentMethod,
  assertMethodsScreen,
  selectQRScanner,
  getEmiButtonTexts,
  getWalletButtonTexts,
};
