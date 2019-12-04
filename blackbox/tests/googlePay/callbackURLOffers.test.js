const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  viewOffers,
  selectOffer,
  verifyOfferApplied,
  verifyDiscountPaybleAmount,
  verifyDiscountText,
  selectBankNameFromGooglePayDropDown,
  expectRedirectWithCallback,
} = require('../../actions/common');

describe('Basic GooglePay payment', () => {
  test('Perform GooglePay  transaction with callbackURL and offers', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
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
    });
    preferences.methods.upi = true;
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await selectUPIMethod(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromGooglePayDropDown(context, 'okhdfcbank');
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    // await verifyDiscountAmountInBanner(context, '₹ 1,980'); /* Issue reported CE-963*/
    await verifyDiscountText(context, 'You save ₹ 20');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfc');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
