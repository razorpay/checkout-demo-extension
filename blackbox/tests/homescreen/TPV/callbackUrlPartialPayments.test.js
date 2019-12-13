const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const { expectRedirectWithCallback } = require('../../../actions/common');

describe.each(
  getTestData(
    'Perform Third Party Verification transaction with callback url and partial payments enabled',
    {
      options: {
        amount: 200,
        personalization: false,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
      preferences: {
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
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await expectRedirectWithCallback(context, {
      method: 'netbanking',
      bank: 'SBIN',
    });
  });
});
