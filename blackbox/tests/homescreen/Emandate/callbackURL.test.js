const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  verifyEmandateBank,
  selectEmandateNetbanking,
  fillEmandateBankDetails,
  expectRedirectWithCallback,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertEmandateUserDetails,
} = require('../actions');

describe.each(
  getTestData('Perform Emandate transaction with callback Url enabled', {
    options: {
      amount: 0,
      personalization: false,
      recurring: true,
      prefill: {
        bank: 'HDFC',
      },
      callback_url: 'http://www.merchanturl.com/callback?test1=abc&test2=xyz',
      redirect: true,
    },
    preferences: {
      order: {
        amount: 0,
        currency: 'INR',
        method: 'emandate',
        bank: 'HDFC',
        payment_capture: true,
      },
    },
  })
)('Emandate tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context);
    await proceed(context);
    await assertEmandateUserDetails(context);
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
