const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const { delay, visible } = require('../../util');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  verifyHighDowntime,
  selectOffer,
  verifyOfferApplied,
  setPreferenceForOffer,
  viewOffers,
  verifyDiscountPaybleAmount,
  verifyDiscountAmountInBanner,
  verifyDiscountText,
} = require('../../actions/common');

describe('Basic GooglePay payment', () => {
  test('Verify GooglePay downtime - high with offers applied', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      payment_downtime: {
        entity: 'collection',
        count: 1,
        items: [
          {
            id: 'down_DEW7D9S10PEsl1',
            entity: 'payment.downtime',
            method: 'upi',
            begin: 1567686386,
            end: null,
            status: 'started',
            scheduled: false,
            severity: 'high',
            created_at: 1567686387,
            updated_at: 1567686387,
          },
        ],
      },
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
    await setPreferenceForOffer(preferences);
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await viewOffers(context);
    await selectOffer(context, '1');
    await verifyOfferApplied(context);
    await verifyDiscountPaybleAmount(context, '₹ 1,980');
    await verifyDiscountAmountInBanner(context, '₹ 1,980');
    await verifyDiscountText(context, 'You save ₹ 20');
    await verifyHighDowntime(
      context,
      'UPI is facing temporary issues right now. Please select another method.'
    );
  });
});
