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
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  handlePartialPayment,
  verifyDiscountPaybleAmount,
  enterUPIAccount,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  setPreferenceForOffer,
  selectBankNameFromDropDown,
  selectUPIApplication,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
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
          original_amount: 200000,
          amount: 198000,
          id: 'offer_DeyaOUCgXd49pt',
          name: 'UPI_GPay_1',
          payment_method: 'netbanking',
          issuer: 'GooglePay',
          display_text: 'Rs. 20 off on GooglePay',
        },
        {
          original_amount: 200000,
          amount: 198000,
          id: 'offer_DeycnL6DJueSQ6',
          name: 'UPI_PayTM_2',
          payment_method: 'upi',
          issuer: 'PayTM',
          display_text: 'Rs. 20 off on PayTM',
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
    });
    await setPreferenceForOffer(preferences);
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '1');
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIApplication(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromDropDown('okhdfcbank');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
