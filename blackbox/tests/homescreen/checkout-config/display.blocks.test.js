const { openCheckoutWithNewHomeScreen } = require('../open');
const { makePreferences } = require('../../../actions/preferences');

const {
  // Homescreen
  fillUserDetails,
  assertUserDetails,
} = require('../actions');

const {
  isIndividualInstrument,
  isGroupedInstrument,
  assertShownBanks,
} = require('./config-utils');

const CONFIG = {
  display: {
    blocks: {
      grouped: {
        name: 'Grouped Instruments',
        instruments: [
          {
            method: 'netbanking',
            banks: ['ICIC', 'HDFC'],
          },
          // {
          //   method: 'wallet',
          //   wallets: ['freecharge', 'olamoney'],
          // },
          // {
          //   method: 'upi',
          //   flows: ['collect', 'intent'],
          //   apps: ['bhim', 'some.random.app'],
          // },
        ],
      },

      individual: {
        name: 'Individual Instruments',
        instruments: [
          {
            method: 'netbanking',
            banks: ['ICIC'],
          },
          // {
          //   method: 'wallet',
          //   wallets: ['freecharge'],
          // },
          // {
          //   method: 'upi',
          //   flows: ['collect', 'intent'],
          //   apps: ['bhim'],
          // },
        ],
      },
    },

    sequence: ['block.individual', 'block.grouped'],
  },
};

describe('display.blocks', () => {
  test('Individual instruments', async () => {
    const preferences = makePreferences();

    preferences.methods.upi = true;

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600000,
      prefill: {
        contact: '+919988776655',
        email: 'void@razorpay.com',
      },

      config: CONFIG,
    };

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      apps: true,
    });

    // User details
    await fillUserDetails(context, '9988776655');
    await assertUserDetails(context);

    // Get all instruments from block.individual
    const individualInstruments = await context.page.$$(
      `.methods-block[data-block='block.individual'] [role=list] > *`
    );

    // Check the number of instruments rendered
    expect(individualInstruments.length).toBe(
      CONFIG.display.blocks.individual.instruments.length
    );

    // Assert that they are all individual
    await Promise.all(
      Array.from(individualInstruments).map(isIndividualInstrument)
    );
  });
});

describe('display.blocks', () => {
  test('Grouped instruments', async () => {
    const preferences = makePreferences();

    preferences.methods.upi = true;

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600000,
      prefill: {
        contact: '+919988776655',
        email: 'void@razorpay.com',
      },

      config: CONFIG,
    };

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      apps: true,
    });

    // User details
    await fillUserDetails(context, '9988776655');
    await assertUserDetails(context);

    // Get all instruments from block.grouped
    const groupedInstruments = await context.page.$$(
      `.methods-block[data-block='block.grouped'] [role=list] > *`
    );

    // Check the number of instruments rendered
    expect(groupedInstruments.length).toBe(
      CONFIG.display.blocks.grouped.instruments.length
    );

    // Assert that they are all grouped
    await Promise.all(Array.from(groupedInstruments).map(isGroupedInstrument));
  });
});

describe('display.blocks', () => {
  test('Grouped instrument: Netbanking', async () => {
    const preferences = makePreferences();

    preferences.methods.upi = true;

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600000,
      prefill: {
        contact: '+919988776655',
        email: 'void@razorpay.com',
      },

      config: CONFIG,
    };

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      apps: true,
    });

    // User details
    await fillUserDetails(context, '9988776655');
    await assertUserDetails(context);

    // Get the netbanking grouped instrument
    const netbankingInstrument = await context.page.$(
      `.methods-block[data-block='block.grouped'] [role=list] > *:nth-child(1)`
    );

    // Select it
    await netbankingInstrument.click();

    // Assert that all banks are shown
    await assertShownBanks(
      context,
      CONFIG.display.blocks.grouped.instruments[0].banks
    );
  });
});
