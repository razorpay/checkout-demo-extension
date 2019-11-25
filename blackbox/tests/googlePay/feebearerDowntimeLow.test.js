const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  submit,
  selectUPIApplication,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
  handleFeeBearer,
  verifyLowDowntime,
  selectBankNameFromDropDown,
} = require('../../actions/common');

describe('GooglePay Downtime payment', () => {
  test('Verify GooglePay Downtimepayment- Low with customer feebearer enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
    };
    const preferences = makePreferences({
      fee_bearer: true,
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
            severity: 'low',
            created_at: 1567686387,
            updated_at: 1567686387,
          },
        ],
      },
    });
    preferences.methods.upi = true;
    const context = await openCheckout({ page, options, preferences });
    await assertHomePage(context, true, true);
    await fillUserDetails(context);
    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'upi');
    await verifyLowDowntime(context, 'UPI');
    await selectUPIApplication(context, 'Google Pay');
    await enterUPIAccount(context, 'scbaala');
    await selectBankNameFromDropDown('okhdfcbank');
    await submit(context);
    await handleUPIAccountValidation(context, 'scbaala@okhdfcbank');
    await handleFeeBearer(context, page);
    await respondToUPIAjax(context, '');
    await respondToUPIPaymentStatus(context);
  });
});
