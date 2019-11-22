const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPaymentMethodText,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
  paymentMethodsSelection,
} = require('../../actions/common');

describe('Basic Netbanking with Personalization', () => {
  test('Perform Netbanking with Personalization transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
    };
    const preferences = makePreferences();
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888882');
    await verifyPaymentMethodText(
      context,
      'Netbanking',
      'Netbanking - HDFC Bank'
    );
    await paymentMethodsSelection(context);
    await submit(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
