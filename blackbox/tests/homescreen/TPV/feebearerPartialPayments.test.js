//skipped because of issue
const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  verifyAutoSelectBankTPV,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
  handleFeeBearer,
  verifyPartialAmount,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  handlePartialPayment,
} = require('../actions');

describe.each(
  getTestData(
    'Perform Third Party Verification transaction with customer feebearer and Partial Payments enabled',
    {
      loggedIn: false,
      keyless: false,
      options: {
        amount: 20000,
        personalization: false,
      },
      preferences: {
        fee_bearer: true,
        order: {
          amount: 20000,
          currency: 'INR',
          account_number: '1234567891234567',
          bank: 'SBIN',
          amount_due: 20000,
          amount_paid: 0,
          first_payment_min_amount: null,
          partial_payment: true,
        },
      },
    }
  )
)('Third Party Verification test', ({ preferences, title, options }) => {
  test.skip(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await handlePartialPayment(context, '100');
    await verifyAutoSelectBankTPV(context, 'State Bank of India');
    await verifyPartialAmount(context, '₹ 100');
    await submit(context);
    await handleFeeBearer(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
