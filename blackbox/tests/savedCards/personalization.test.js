const { openCheckout } = require('../../actions/checkout');
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
    const context = await openCheckout({
      page,
      options,
      preferences,
      method: 'Card',
    });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, '8888888881');
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
