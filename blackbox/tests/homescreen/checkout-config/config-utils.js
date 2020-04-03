const { innerText, visible, getAttribute } = require('../../../util');

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
 * Assert that the epxected banks are shown
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

  // Length of shown v/s expected should match
  expect(values.length).toBe(banks.length);

  // Verify that all expected banks are present
  let hasAll = true;
  for (let i = 0; i < banks; i++) {
    if (!values.includes(banks[i])) {
      hasAll = false;
      break;
    }
  }

  expect(hasAll).toBe(true);
}

module.exports = {
  parseBlocksFromHomescreen,
  isIndividualInstrument,
  isGroupedInstrument,
  assertShownBanks,
};
