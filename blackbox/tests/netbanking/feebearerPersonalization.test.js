const { openCheckoutForPersonalization } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPersonalizationPage,
  assertPaymentMethodsPersonalization,
  selectBank,
  assertNetbankingPage,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
  handleFeeBearer,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform netbanking transaction with Personalization and fee bearer', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 60000,
    };

    const preferences = makePreferences({ fee_bearer: true });
    const context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Netbanking',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true, '8888888882');
    await assertPersonalizationPage(context, 'Netbanking');
    await assertPaymentMethodsPersonalization(context);
    await submit(context);

    await handleFeeBearer(context, page);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
