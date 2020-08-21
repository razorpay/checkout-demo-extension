const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  getHomescreenMethods,
  getAttribute,
  getEmiButtonTexts,
  getWalletButtonTexts,
  selectPaymentMethod,
} = require('../actions');

async function getTextContent(page, element) {
  try {
    return await page.evaluate(element => element.textContent, element);
  } catch (err) {
    return undefined;
  }
}

/**
 * Verify that methods are being shown
 */
async function checkPaymentMethods(context, expected) {
  const methods = await getHomescreenMethods(context);
  expect(expected).toEqual(methods);
}

/**
 * Verify that methods are being shown
 */
async function checkEmiMethods(context, expected) {
  const buttons = await getEmiButtonTexts(context);
  expect(expected).toEqual(buttons);
}

/**
 * Verify that methods are being shown
 */
async function checkWalletMethods(context, expected) {
  const buttons = await getWalletButtonTexts(context);
  expect(expected).toEqual(buttons);
}

describe.each(
  getTestData('Test methods visibility on homescreen', {
    keyless: false,
    options: {
      method: {
        upi: true,
        card: false,
        netbanking: false,
        wallet: true,
        upi_otm: false,
      },
    },
    preferences: {},
  })
)('Wallet, UPI', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    preferences.methods.card = false;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);
    await checkPaymentMethods(context, ['upi', 'wallet']);
  });
});

describe.each(
  getTestData('Test methods visibility on homescreen', {
    keyless: false,
    options: {
      amount: 500000,
      method: {
        upi: false,
        card: true,
        netbanking: true,
        wallet: false,
        cardless_emi: true,
        upi_otm: false,
      },
    },
    preferences: {},
  })
)('Card, Netbanking and Cardless EMI', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    preferences.methods.cardless_emi = {
      earlysalary: true,
      zestmoney: true,
      flexmoney: true,
    };
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);
    await checkPaymentMethods(context, ['card', 'netbanking', 'cardless_emi']);
  });
});
describe.each(
  getTestData('Test methods QR in UPI', {
    keyless: false,
    options: {
      amount: 506,
      method: {
        upi: true,
        card: false,
        netbanking: false,
        wallet: false,
        cardless_emi: false,
        qr: false,
      },
    },
    preferences: {},
  })
)('Disable QR in UPI', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    preferences.methods.cardless_emi = {
      earlysalary: true,
      zestmoney: true,
      flexmoney: true,
    };
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    expect(await context.page.$('#showQr')).toBeNull();
  });
});
describe.each(
  getTestData('Test EMI methods', {
    keyless: false,
    options: {
      amount: 1000000,
      method: {
        cardless_emi: {
          zestmoney: true,
          flexmoney: false,
          earlysalary: false,
        },
      },
    },
    preferences: {},
  })
)(
  'Check if zest money, flex money is visible',
  ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi = true;
      preferences.methods.cardless_emi = {
        zestmoney: true,
        flexmoney: true,
        earlysalary: false,
      };
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      await assertBasicDetailsScreen(context);
      await fillUserDetails(context);
      await proceed(context);
      await selectPaymentMethod(context, 'cardless_emi');
      await checkEmiMethods(context, [
        'EMI on Cards',
        'ZestMoney',
        'Cardless EMI by InstaCred',
      ]);
    });
  }
);

describe.each(
  getTestData('Test Wallet methods', {
    keyless: false,
    options: {
      amount: 1000000,
      method: {
        wallet: {
          payzapp: false,
          olamoney: false,
        },
      },
    },
    preferences: {},
  })
)('Check if disabling wallets works', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    preferences.methods.wallet = {
      payzapp: true,
      olamoney: true,
      phonepe: true,
    };
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await selectPaymentMethod(context, 'wallet');
    await checkWalletMethods(context, ['phonepe']);
  });
});
