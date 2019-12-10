const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const { expectRedirectWithCallback } = require('../../../actions/common');

describe.each(
  getTestData(
    'Perform Third Party Verification transaction with callback url with feebearer enabled',
    {
      options: {
        amount: 200,
        personalization: false,
        callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
        redirect: true,
      },
      preferences: {
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
    await expectRedirectWithCallback(context, {
      method: 'netbanking',
      bank: 'SBIN',
    });
  });
});
