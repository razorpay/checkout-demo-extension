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
 * Tells if a block is full of loader instruments
 * @param {Block} block
 *
 * @returns {boolean}
 */
function isBlockFullOfSkeletonInstruments(block) {
  return block.items.every(item => item.type === 'skeleton');
}

/**
 * Parses blocks and returns their text
 * @param {Context} context
 *
 * @returns {Array}
 */
async function parseBlocksFromHomescreen(context) {
  await waitForSkeletonInstrumentsToResolve(context);

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
                  const type = await getAttribute(
                    context.page,
                    subItemElement,
                    'data-type'
                  );

                  resolve({
                    type,
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

  // TODO: Also consider preferred methods block
  blocks = blocks.filter(block => !isBlockFullOfSkeletonInstruments(block));

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

  const instrumentText = (await innerText(element))
    .replace(/[^\w\s]/g, '') // Some options have SVG icons which might come under innerText
    .replace(/\n/g, '') // Remove all line breaks
    .trim();

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

  // Get all banks
  await context.page.click('#bank-select');

  const options = await context.page.$$('.search-box .list .list-item');

  // Get the values of all options
  let values = await Promise.all(options.map(innerText));

  values = values.map(value => value.trim());

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
  await context.page.waitForSelector('#form-wallet', {
    visible: true,
    timeout: 500,
  });

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

/**
 * Asserts that all expected paylater providers are shown
 * @param {Context} context
 * @param {Array<string>} providers
 */
async function assertShownPaylaterProviders(context, providers) {
  // Paylater screen is visible
  await context.page.waitForSelector('#form-paylater', {
    visible: true,
    timeout: 500,
  });

  // Get all Paylater elements
  const elements = await context.page.$$('#form-paylater .options > *');

  // Get the names from all elements
  let values = await Promise.all(elements.map(innerText));
  values = values.map(value => value.trim());

  // Verify that all expected providers are present
  expect(matchAllStringsInList(providers, values)).toBe(true);
}

/**
 * Asserts that all expected cardless EMI providers are shown
 * @param {Context} context
 * @param {Array<string>} providers
 */
async function assertShownCardlessEmiProviders(context, providers) {
  // Paylater screen is visible
  await context.page.waitForSelector('#form-cardless_emi', {
    visible: true,
    timeout: 500,
  });

  // Get all Paylater elements
  const elements = await context.page.$$('#form-cardless_emi .options > *');

  // Get the names from all elements
  let values = await Promise.all(elements.map(innerText));
  values = values.map(value => value.trim());

  // Verify that all expected providers are present
  expect(matchAllStringsInList(providers, values)).toBe(true);
}

/**
 * Asserts that all expected cardless EMI providers are shown
 * @param {Context} context
 * @param {string} text Description
 */
async function assertCardScreenAndText(context, text) {
  // Card screen is visible
  await context.page.waitForSelector('#form-card', {
    visible: true,
    timeout: 500,
  });

  let description = await innerText(
    '#form-card .instrument-subtext-description'
  );
  description = description.trim();

  // Description is what is expected
  expect(description).toBe(text);
}

/**
 * Waits for all skeleton instruments to be hidden
 *
 * IMPORTANT:
 * Couldn't use waitForSelector here since it wasn't working properly for all tests (odd).
 * Had to write a custom waitForSelector functionality.
 *
 * @param {Context} context
 *
 * @returns {Promise}
 */
function waitForSkeletonInstrumentsToResolve(context) {
  const TIMEOUT = 2000;
  const POLL_INTERVAL = 100;
  const SKELETON_SELECTOR = '.home-methods .methods-block .skeleton-instrument';

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearInterval(poll);

      reject();
    }, TIMEOUT);

    const poll = setInterval(async () => {
      const skeleton = await context.page.$(SKELETON_SELECTOR);

      if (!skeleton) {
        clearTimeout(timeout);
        clearInterval(poll);

        resolve();
      }
    }, POLL_INTERVAL);
  });
}

module.exports = {
  parseBlocksFromHomescreen,
  isIndividualInstrument,
  isGroupedInstrument,
  assertShownBanks,
  assertUpiIntent,
  assertUpiCollect,
  assertShownWallets,
  assertShownPaylaterProviders,
  assertShownCardlessEmiProviders,
  assertCardScreenAndText,
  waitForSkeletonInstrumentsToResolve,
};
