const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  returnVirtualAccounts,
  verifyNeftDetails,
  verifyRoundOffAlertMessage,
  verifyPartialAmount,
  handlePartialPayment,
} = require('../../actions/common');

describe('Bank transfer tests', () => {
  test('perform bank transfer transaction with partial Payments and optional contact enabled', async () => {
    const options = {
      order_id: 'order_DhheFqhhT2RMur',
      amount: 400000,
      personalization: false,
    };
    const preferences = makePreferences({
      optional: ['contact'],
      order: {
        amount: 400000,
        amount_due: 400000,
        amount_paid: 0,
        currency: 'INR',
        first_payment_min_amount: null,
        partial_payment: true,
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await handlePartialPayment(context, '2000');
    await assertPaymentMethods(context);
    await verifyPartialAmount(context, '₹ 2,000');
    await selectPaymentMethod(context, 'bank_transfer');
    await returnVirtualAccounts(context);
    await verifyNeftDetails(context);
    await verifyRoundOffAlertMessage(context);
  });
});
