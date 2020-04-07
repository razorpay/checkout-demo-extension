const { innerText, visible, getAttribute } = require('../../../util');

/**
 * Matches that all strings in a are also in b.
 * Does not account for duplicates.
 * @param {Array<string>} a
 * @param {Array<string>} b
 *
 * @returns {boolean}
 */
function matchAllStringsInList(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (!b.includes(a[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Parses blocks and returns their text
 * @param {Context} context
 *
 * @returns {Array}
 */
async function parseBlocksFromHomescreen(context) {
  const blockElements = await context.page.$$('.home-methods .methods-block');
  let blocks = await Promise.all(
    blockElements.map(
      blockElement =>
        new Promise(async resolve => {
          const title = await innerText(
            await blockElement.$(':scope > .title')
          );
          const subItemElements = await blockElement.$$(
            ':scope > [role=list] > *'
          );
          let items = await Promise.all(
            subItemElements.map(
              subItemElement =>
                new Promise(async resolve => {
                  const itemTitle = await innerText(
                    await subItemElement.$('[slot=title]')
                  );
                  const itemDescription = await innerText(
                    await subItemElement.$('[slot=subtitle]')
                  );

                  resolve({
                    title: itemTitle,
                    description: itemDescription,
                  });
                })
            )
          );

          resolve({
            title,
            items,
          });
        })
    )
  );

  return blocks;
}

/**
 * Asserts that an instrument is an individual instrument
 * @param {ElementHandle} element
 */
async function isIndividualInstrument(element) {
  expect(element).not.toBe(null);
  expect(await element.$('input[type=radio], input[type=tel]')).not.toBe(null);
}

/**
 * Asserts that an instrument is a grouped element
 * @param {ElementHandle} element
 */
async function isGroupedInstrument(element) {
  expect(element).not.toBe(null);
  expect(await element.$('input[type=radio], input[type=tel]')).toBe(null);

  const instrumentText = (await innerText(element)).trim();
  expect(instrumentText.startsWith('Pay using')).toBe(true);
}

/**
 * Assert that the expected banks are shown
 * @param {Context} context
 * @param {Array<string>} banks List of banks that should have been shown
 */
async function assertShownBanks(context, banks) {
  // Netbanking screen is visible
  expect(await context.page.$eval('#form-netbanking', visible)).toEqual(true);

  // Dropdown is visible
  expect(await context.page.$eval('#bank-select', visible)).toEqual(true);

  // Get all <option>s except for the first one, since the first one acts as a label
  const options = await context.page.$$(
    '#bank-select option:not(:first-child)'
  );

  // Get the values of all options
  const values = await Promise.all(
    options.map(option => getAttribute(context.page, option, 'value'))
  );

  // Verify that all expected banks are present
  expect(matchAllStringsInList(banks, values)).toBe(true);
}

/**
 * Assert that the expected wallets are shown
 * @param {Context} context
 * @param {Array<string>} wallets List of wallets that should have been shown
 */
async function assertShownWallets(context, wallets) {
  // Wallet screen is visible
  expect(await context.page.$eval('#form-wallet', visible)).toEqual(true);

  // Get all Wallet elements
  const elements = await context.page.$$(
    '#form-wallet .border-list [role=listitem]'
  );

  // Get the names from all elements
  let values = await Promise.all(elements.map(innerText));
  values = values.map(value => value.trim());

  // Verify that all expected banks are present
  expect(matchAllStringsInList(wallets, values)).toBe(true);
}

/**
 * Assert that the expected UPI intent apps are shown
 * @param {Context} context
 * @param {Array<string>} apps List of app names that should have been shown
 */
async function assertUpiIntent(context, apps) {
  // UPI screen is visible
  expect(await context.page.$eval('#form-upi', visible)).toEqual(true);

  // Apps are visible
  expect(await context.page.$eval('#svelte-upi-apps-list', visible)).toEqual(
    true
  );

  // Get all apps except for the first one, since the first one acts as a label
  const appsElements = await context.page.$$(
    '#svelte-upi-apps-list > *:not(:first-child)'
  );

  // Get the names of all apps
  let appNames = await Promise.all(appsElements.map(innerText));
  appNames = appNames.map(name => name.trim());

  // Verify that all expected apps are present
  expect(matchAllStringsInList(apps, appNames)).toBe(true);
}

/**
 * Assert that the UPI Collect UI is visible
 * @param {Context} context
 */
async function assertUpiCollect(context) {
  // UPI screen is visible
  expect(await context.page.$eval('#form-upi', visible)).toEqual(true);

  // UPI Collect options are visible
  expect(await context.page.$eval('#upi-collect-list', visible)).toEqual(true);
}

module.exports = {
  parseBlocksFromHomescreen,
  isIndividualInstrument,
  isGroupedInstrument,
  assertShownBanks,
  assertUpiIntent,
  assertUpiCollect,
  assertShownWallets,
};
