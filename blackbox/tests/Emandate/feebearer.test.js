const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  submit,
  verifyEmandateBank,
  selectEmandateNetbanking,
  fillEmandateBankDetails,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  handleFeeBearer,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform emandate transaction with customer feebearer enabled', async () => {
    const options = {
      order_id: 'order_DfNAO0KJCH5WNY',
      amount: 0,
      personalization: false,
      recurring: true,
      prefill: {
        bank: 'HDFC',
      },
    };
    const preferences = makePreferences({
      fee_bearer: true,
      order: {
        amount: 0,
        currency: 'INR',
        method: 'emandate',
        bank: 'HDFC',
        payment_capture: true,
      },
    });
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context, true);

    await submit(context);
    await verifyEmandateBank(context);
    await selectEmandateNetbanking(context);
    await fillEmandateBankDetails(context);
    await submit(context);
    await handleFeeBearer(context);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
