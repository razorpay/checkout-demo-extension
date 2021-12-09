const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  fillUserDetails,
  typeOTPandSubmit,
  handleCustomerCardStatusRequest,
  respondSavedCards,
  selectAddNewCard,
  verifySavedCardCheckbox,
  assertSaveCardCheckbox,
} = require('../../actions/common');
const {
  assertBasicDetailsScreen,
  proceed,
  assertPaymentMethods,
  selectPaymentMethod,
} = require('../../tests/homescreen/actions');
describe('Add New Card Save-Card Checkbox tests', () => {
  test('If the contact is indian contact then set save-card checkbox to true', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      remember_customer: true,
    };
    const preferences = makePreferences();
    const context = await openCheckout({ page, options, preferences });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context, {});
    await selectAddNewCard(context);
    await assertSaveCardCheckbox(context);
    await verifySavedCardCheckbox(context, true);
  });
  test('If the contact is NOT indian contact then set save-card checkbox to false', async () => {
    const options = {
      order_id: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      remember_customer: true,
      prefill: {
        name: 'QARazorpay',
        email: 'qa.testing@razorpay.com',
        contact: '+618888888888',
      },
    };
    const preferences = makePreferences({});
    const context = await openCheckout({ page, options, preferences });

    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');
    await handleCustomerCardStatusRequest(context);
    await typeOTPandSubmit(context);
    await respondSavedCards(context, {});
    await selectAddNewCard(context);
    await assertSaveCardCheckbox(context, false);
  });
});
