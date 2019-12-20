const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const {
  submit,
  verifyEmandateBank,
  selectEmandateNetbanking,
  fillEmandateBankDetails,
  respondToUPIAjax,
  respondToUPIPaymentStatus,
} = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
} = require('../actions');

describe.each(
  getTestData('Perform Emandate transaction with optional contact', {
    options: {
      amount: 0,
      personalization: false,
      recurring: true,
      prefill: {
        bank: 'HDFC',
      },
    },
    preferences: {
      optional: ['contact'],
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
    await verifyEmandateBank(context);
    await selectEmandateNetbanking(context);
    await fillEmandateBankDetails(context);
    await submit(context);
    await respondToUPIAjax(context);
    await respondToUPIPaymentStatus(context);
  });
});
