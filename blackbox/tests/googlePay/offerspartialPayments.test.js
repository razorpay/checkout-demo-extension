//Issue
const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  handleUPIAccountValidation,
  selectFromDropDown,
  selectGooglePay,
  handlePartialPayment,
  verifyPartialAmount,
  enterUPIAccount,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  setPreferenceForOffer,
} = require('../../actions/common');

describe.skip('Offers with Partial GooglePay payment', () => {
  test('Perform GooglePay transaction with offers and partial payments enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      offers: [
        {
          id: 'offer_Dcad1sICBaV2wI',
          name: 'UPI Offer Name',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text',
        },
        {
          id: 'offer_DcaetTeD4Gjcma',
          name: 'UPI Offer Name 2',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text 2',
        },
        {
          id: 'offer_DcafkxTAseGAtT',
          name: 'UPI Offer Name 3',
          payment_method: 'upi',
          display_text: 'UPI Offer Display Text 3',
        },
      ],
      order: {
        amount: 10000,
        amount_due: 10000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    preferences.methods.upi = true;
    const context = await openCheckout({
      page,
      options,
      preferences,
      //apps: [{ package_name: 'com.google.android.apps.nbu.paisa.user', app_name: 'Google Pay (Tez)' }],
    });
    await setPreferenceForOffer(preferences);
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);
    await handlePartialPayment(context, '1');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectGooglePay(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectFromDropDown(context, 'okhdfcbank');
    await verifyPartialAmount(context, '₹ 1');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
