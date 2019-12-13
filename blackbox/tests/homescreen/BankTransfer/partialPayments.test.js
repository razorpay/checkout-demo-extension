const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  returnVirtualAccounts,
  verifyNeftDetails,
  verifyRoundOffAlertMessage,
  verifyPartialAmount,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
  handlePartialPayment,
} = require('../actions');

describe.each(
  getTestData(
    'Perform Bank Transfer transaction with partial Payments enabled',
    {
      options: {
        order_id: 'order_DhheFqhhT2RMur',
        amount: 200000,
        personalization: false,
      },
      preferences: {
        order: {
          amount: 400000,
          amount_due: 400000,
          amount_paid: 0,
          currency: 'INR',
          first_payment_min_amount: null,
          partial_payment: true,
        },
      },
    }
  )
)('Bank Transfer tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.bank_transfer = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '2000');
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await verifyPartialAmount(context, '₹ 2,000');
    await selectPaymentMethod(context, 'bank_transfer');
    await returnVirtualAccounts(context);
    await verifyNeftDetails(context);
    await verifyRoundOffAlertMessage(context);
  });
});
