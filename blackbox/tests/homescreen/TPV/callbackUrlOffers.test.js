const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const { expectRedirectWithCallback } = require('../../../actions/common');

describe.each(
  getTestData(
    'Perform Third Party Verification transaction with callback url and offers applied',
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
        },
        offers: [
          {
            original_amount: 200000,
            amount: 198000,
            id: 'offer_DeyaOUCgXd49pt',
            name: 'Netbanking_SBI_1',
            payment_method: 'netbanking',
            issuer: 'SBIN',
            display_text: 'Rs. 20 off on SBI Netbanking',
          },
          {
            original_amount: 200000,
            amount: 198000,
            id: 'offer_DeycnL6DJueSQ6',
            name: 'Netbanking_HDFC_1',
            payment_method: 'netbanking',
            issuer: 'HDFC',
            display_text: 'Rs. 20 off on HDF Netbanking',
          },
        ],
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
