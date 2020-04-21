const { openCheckoutWithNewHomeScreen } = require('../open');
const { makePreferences } = require('../../../actions/preferences');

const {
  // Homescreen
  fillUserDetails,
  assertUserDetails,
} = require('../actions');

const { parseBlocksFromHomescreen } = require('./config-utils');

describe('display.sequence', () => {
  test('Without custom blocks', async () => {
    const preferences = makePreferences();

    preferences.methods.upi = true;

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600000,
      prefill: {
        contact: '+919988776655',
        email: 'void@razorpay.com',
      },

      config: {
        display: {
          sequence: ['upi', 'netbanking'],
        },
      },
    };

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    // User details
    await fillUserDetails(context, '9988776655');
    await assertUserDetails(context);

    const renderedBlocks = await parseBlocksFromHomescreen(context);

    // One block rendered
    expect(renderedBlocks.length).toBe(1);

    const block = renderedBlocks[0];

    // Title is generated properly
    expect(block.title.toLowerCase()).toContain('upi');
    expect(block.title.toLowerCase()).toContain('netbanking');

    // UPI block is the first
    expect(block.items[0].title.toLowerCase()).toContain('upi');

    // Netbanking block is the second
    expect(block.items[1].title.toLowerCase()).toContain('netbanking');

    // No other methods have UPI or Netbanking in them
    const otherItems = block.items.slice(2);
    otherItems.forEach(item => {
      expect(item.title.toLowerCase()).not.toContain('upi');
      expect(item.title.toLowerCase()).not.toContain('netbanking');
    });
  });

  test('With custom blocks', async () => {
    const preferences = makePreferences();

    preferences.methods.upi = true;

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600000,
      prefill: {
        contact: '+919988776655',
        email: 'void@razorpay.com',
      },

      config: {
        display: {
          blocks: {
            icic: {
              name: 'Pay using ICICI Bank',
              instruments: [
                {
                  method: 'netbanking',
                  banks: ['ICIC'],
                },
              ],
            },

            hdfc: {
              name: 'Pay using HDFC',
              instruments: [
                {
                  method: 'netbanking',
                  banks: ['HDFC'],
                },
              ],
            },
          },

          sequence: ['block.hdfc', 'block.icic'],
        },
      },
    };

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    // User details
    await fillUserDetails(context, '9988776655');
    await assertUserDetails(context);

    const renderedBlocks = await parseBlocksFromHomescreen(context);

    // Three blocks rendered
    expect(renderedBlocks.length).toBe(3);

    // Title for first block is generated properly
    expect(renderedBlocks[0].title).toBe('Pay using HDFC');

    // Title for second block is generated properly
    expect(renderedBlocks[1].title).toBe('Pay using ICICI Bank');
  });

  test('With methods between custom blocks', async () => {
    const preferences = makePreferences();

    preferences.methods.upi = true;

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600000,
      prefill: {
        contact: '+919988776655',
        email: 'void@razorpay.com',
      },

      config: {
        display: {
          blocks: {
            icic: {
              name: 'Pay using ICICI Bank',
              instruments: [
                {
                  method: 'netbanking',
                  banks: ['ICIC'],
                },
              ],
            },

            hdfc: {
              name: 'Pay using HDFC',
              instruments: [
                {
                  method: 'netbanking',
                  banks: ['HDFC'],
                },
              ],
            },
          },

          sequence: ['block.hdfc', 'upi', 'netbanking', 'block.icic'],
        },
      },
    };

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    // User details
    await fillUserDetails(context, '9988776655');
    await assertUserDetails(context);

    const renderedBlocks = await parseBlocksFromHomescreen(context);

    // Three blocks rendered
    expect(renderedBlocks.length).toBe(4);

    // Title for first block is generated properly
    expect(renderedBlocks[0].title).toBe('Pay using HDFC');

    // Title for second block is generated properly
    expect(renderedBlocks[1].title.toLowerCase()).toContain('upi');
    expect(renderedBlocks[1].title.toLowerCase()).toContain('netbanking');

    // Title for third block is generated properly
    expect(renderedBlocks[2].title).toBe('Pay using ICICI Bank');

    // On second block, UPI and Netbanking exist
    const block = renderedBlocks[1];

    // UPI block is the first
    expect(block.items[0].title.toLowerCase()).toContain('upi');

    // Netbanking block is the second
    expect(block.items[1].title.toLowerCase()).toContain('netbanking');

    // No other methods have UPI or Netbanking in them
    const otherMethods = renderedBlocks[3].items;
    otherMethods.forEach(method => {
      expect(method.title.toLowerCase()).not.toContain('upi');
      expect(method.title.toLowerCase()).not.toContain('netbanking');
    });
  });
});
