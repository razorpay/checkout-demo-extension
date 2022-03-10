const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');
const { verifyVpaFilled } = require('../../../actions/common');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  assertEditUserDetailsAndBack,
  verifyUpiAppPersonalizationText,
  selectPersonalizationPaymentMethod,
} = require('../actions');

describe.each(
  getTestData('Check UPI Intent behave like new VPA collect flow on desktop', {
    options: {
      amount: 200,
      personalization: true,
    },
    preferences: {
      preferred_methods: {
        '+918888888881': {
          instruments: [{ method: 'upi', instrument: '@paytm', score: 0.3 }],
          is_customer_identified: true,
          user_aggregates_available: true,
        },
      },
      customer: {
        email: 'kjhkg@Kl.com',
        contact: '+918888888881',
        tokens: {
          count: 0,
          entity: 'collection',
          items: [],
        },
      },
    },
  })
)('UPI tests', ({ preferences, title, options }) => {
  test(title, async () => {
    preferences.methods.upi = true;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);
    await assertPaymentMethods(context);
    await verifyUpiAppPersonalizationText(context, 'UPI - PayTM', 1);
    await selectPersonalizationPaymentMethod(context, 1);
    await verifyVpaFilled(context, '@paytm');
  });
});
