const { makePreferences } = require('../../../actions/preferences');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  selectWallet,
  assertWalletPage,
  submit,
  verifyErrorMessage,
  handleOtpVerification,
  handleValidationRequest,
  retryWalletTransaction,
  handleWalletPopUp,
} = require('../../../actions/common');

const {
  assertMethodsScreen,
  assertMissingDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

describe.skip('Basic wallet payment', () => {
  test('Perform wallet transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({ optional: ['contact', 'email'] });
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertMethodsScreen(context);
    await assertMissingDetails(context);

    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'wallet');
    await assertWalletPage(context);
    await selectWallet(context, 'freecharge');
    await submit(context);
    await context.popup();
    await verifyErrorMessage(context, 'The email field is required.');
  });
});
