const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,
  handleCardValidationWithCallback,
  expectMockSuccessWithCallback,
} = require('../../actions/common');

describe('Saved Card tests', () => {
  test('Perform saved card transaction with callback URL enabled and contact optional', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
      remember_customer: true,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({ optional: ['contact'] });
    let context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, false);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context);
    await selectSavedCardAndTypeCvv(context);
    await submit(context);
    await handleCardValidationWithCallback(context);
    await expectMockSuccessWithCallback(context);
  });
});
