const { openCheckoutForPersonalization } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay } = require('../../util');
const {
  assertHomePage,
  fillUserDetails,
  verifyPaymentMethodText,
  paymentMethodsSelection,
  submit,
  handleValidationRequest,
  verifyTimeout,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbaking transaction with Personalization and timeout enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      timeout: 10,
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
    await handleValidationRequest(context, 'fail');
    await verifyTimeout(context, 'netbanking');
  });
});
