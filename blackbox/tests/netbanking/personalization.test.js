const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  verifyPersonalizationText,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
  selectPersonalizationPaymentMethod,
} = require('../../actions/common');

describe('Basic Netbanking with Personalization', () => {
  test('Perform Netbanking with Personalization transaction', async () => {
    const options = {
      key: 'rzp_test_VwsqHDsQPoVQi6',
      amount: 60000,
      personalization: true,
    };
    const preferences = makePreferences();
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
    await verifyPersonalizationText(context, 'netbanking');
    await selectPersonalizationPaymentMethod(context, '1');
    await submit(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
