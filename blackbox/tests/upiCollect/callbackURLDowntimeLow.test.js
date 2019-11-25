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
  expectRedirectWithCallback,
  verifyLowDowntime,
} = require('../../actions/common');

describe('Basic upi payment', () => {
  test('Verify UPI downtime - Low with callbackURL enabled', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
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
    await selectUPIMethod(context, 'BHIM');
    await enterUPIAccount(context, 'BHIM');
    await submit(context);
    await handleUPIAccountValidation(context, 'BHIM@upi');
    await expectRedirectWithCallback(context, { method: 'upi' });
  });
});
