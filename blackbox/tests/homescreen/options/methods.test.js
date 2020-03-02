const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  getMethodButtons,
  getAttribute,
} = require('../actions');

/**
 * Verify that methods are being shown
 */
async function checkPaymentMethods(context, expected) {
  const buttons = await getMethodButtons(context);
  const methods = await Promise.all(
    buttons.map(button => getAttribute(context.page, button, 'method'))
  );
  expect(expected).toEqual(methods);
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
    await checkPaymentMethods(context, ['wallet', 'upi']);
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
