const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  verifyAutoSelectBankTPV,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
  handleFeeBearer,
} = require('../../../actions/common');

const { assertBasicDetailsScreen, fillUserDetails } = require('../actions');

describe.each(
  getTestData(
    'Perform Third Party Verification transaction with customer feebearer and contact optional enabled',
    {
      options: {
        amount: 200,
        personalization: false,
      },
      preferences: {
        optional: ['contact'],
        fee_bearer: true,
        order: {
          amount: 20000,
          currency: 'INR',
          account_number: '1234567891234567',
          bank: 'SBIN',
        },
      },
    }
  )
)('Third Party Verification test', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await verifyAutoSelectBankTPV(context, 'State Bank of India');
    await submit(context);
    await handleFeeBearer(context);
    await passRequestNetbanking(context);
    await handleMockSuccessDialog(context);
  });
});
