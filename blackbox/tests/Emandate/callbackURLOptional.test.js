const { openCheckout } = require('../../actions/checkout');
const { makePreferences } = require('../../actions/preferences');
const {
  assertHomePage,
  fillUserDetails,
  submit,
  verifyEmandateBank,
  selectEmandateNetbanking,
  fillEmandateBankDetails,
  expectRedirectWithCallback,
} = require('../../actions/common');

describe('Netbanking tests', () => {
  test('perform emandate transaction with callback Url and contact optional enabled', async () => {
    const options = {
      order_id: 'order_DfNAO0KJCH5WNY',
      amount: 0,
      personalization: false,
      recurring: true,
      prefill: {
        bank: 'HDFC',
      },
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    };
    const preferences = makePreferences({
      optional: ['contact'],
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
    await fillUserDetails(context);
    await submit(context);
    await verifyEmandateBank(context);
    await selectEmandateNetbanking(context);
    await fillEmandateBankDetails(context);
    await submit(context);
    await expectRedirectWithCallback(context, {
      method: 'emandate',
      bank: 'HDFC',
    });
  });
});
