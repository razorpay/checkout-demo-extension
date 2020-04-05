const { openCheckoutWithNewHomeScreen } = require('../open');
const { makePreferences } = require('../../../actions/preferences');

const {
  // Homescreen
  fillUserDetails,
  assertUserDetails,
} = require('../actions');

const {
  parseBlocksFromHomescreen,
  isIndividualInstrument,
  isGroupedInstrument,
  assertShownBanks,
  assertUpiIntent,
  assertUpiCollect,
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
          {
            method: 'upi',
            flows: ['collect', 'intent'],
            apps: ['bhim', 'some.random.app'],
          },
          // {
          //   method: 'wallet',
          //   wallets: ['freecharge', 'olamoney'],
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
          {
            method: 'wallet',
            wallets: ['freecharge'],
          },
          {
            method: 'upi',
            flows: ['intent'],
            apps: ['bhim'],
          },
        ],
      },

      method: {
        name: 'Method Instruments',
        instruments: [
          { method: 'card' },
          { method: 'netbanking' },
          { method: 'wallet' },
          { method: 'upi' },
          { method: 'emi' },
          { method: 'cardless_emi' },
          { method: 'paylater' },
          { method: 'bank_transfer' },
        ],
      },
    },

    sequence: ['block.individual', 'block.grouped', 'block.method'],
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
  test('Method instruments', async () => {
    const preferences = makePreferences();

    preferences.methods = {
      ...preferences.methods,
      upi: true,
      cardless_emi: {
        zestmoney: true,
        earlysalary: true,
      },
      paylater: {
        epaylater: true,
        icic: true,
      },
      bank_transfer: true,
    };

    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 600000,
      prefill: {
        contact: '+919988776655',
        email: 'void@razorpay.com',
      },
      order_id: 'order_test1234',

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

    // Get block.method
    const parsedBlocks = await parseBlocksFromHomescreen(context);
    const methodBlock = parsedBlocks.find(
      block => block.title === CONFIG.display.blocks.method.name
    );

    // Check the number of instruments rendered
    expect(methodBlock.items.length).toBe(
      CONFIG.display.blocks.method.instruments.length
    );

    // Assert that they all start with "Pay using" and don't have a description
    const allAreMethodInstruments = methodBlock.items.every(
      item => item.title.startsWith('Pay using') && !item.description
    );

    expect(allAreMethodInstruments).toBe(true);
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

describe('display.blocks', () => {
  test('Grouped instrument: UPI', async () => {
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

    // Get the UPI grouped instrument
    const upiInstrument = await context.page.$(
      `.methods-block[data-block='block.grouped'] [role=list] > *:nth-child(2)`
    );

    // Select it
    await upiInstrument.click();

    // Assert that all apps are shown
    await assertUpiIntent(context, ['BHIM', 'Some Random App']);

    // Assert that UPI collect is shown
    await assertUpiCollect(context);
  });
});
