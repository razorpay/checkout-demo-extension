const { makePreferences } = require('../../../actions/preferences');

const {
  passRequestWallet,
  handleMockSuccessDialog,
} = require('../../../actions/common');

// New imports
const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

// Opener
const { openCheckoutWithNewHomeScreen } = require('../open');

describe('International Payments', () => {
  test('PayPal', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      currency: 'USD',
    };

    const preferences = makePreferences();

    preferences.methods.wallet = {
      paypal: true,
    };

    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    // Basic options with no prefill, we'll land on the details screen
    await assertBasicDetailsScreen(context);

    await fillUserDetails(context);
    await proceed(context);

    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context, ['card', 'paypal']);

    // Select PayPal
    await selectPaymentMethod(context, 'paypal');

    // Respond to payment creation request
    await passRequestWallet(context);

    // Handle popup
    await handleMockSuccessDialog(context);
  });
});
