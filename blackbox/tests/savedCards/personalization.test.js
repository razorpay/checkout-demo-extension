const {
  openCheckoutForPersonalization,
} = require('../../actions/checkout-personalization');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  submit,
  handleCardValidation,
  handleMockSuccessDialog,
  handleCustomerCardStatusRequest,
  typeOTPandSubmit,
  respondSavedCards,
  selectSavedCardAndTypeCvv,
  selectPersonalizedCard,
} = require('../../actions/common');

describe('Saved Card tests', () => {
  test('Perform saved card transaction with personalization', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: true,
      remember_customer: true,
    };
    const preferences = makePreferences();
    let context = await openCheckoutForPersonalization({
      page,
      options,
      preferences,
      method: 'Card',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8195959777');
    await selectPersonalizedCard(context);
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context);
    await selectSavedCardAndTypeCvv(context);
    await submit(context);

    await handleCardValidation(context);
    await handleMockSuccessDialog(context);
  });
});
