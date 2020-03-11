const { getTestData } = require('../../../actions');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
} = require('../actions');

const { openCheckoutWithNewHomeScreen } = require('../open');

describe.each(
  getTestData('Negative test for personalization in options', {
    loggedIn: false,
    options: {
      amount: 200,
      personalization: false,
      remember_customer: true,
    },
    keyless: false,
  })
)('Options tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
      method: 'Card',
    });
    await assertBasicDetailsScreen(context);
    await fillUserDetails(context, '8888888881');
    await proceed(context);
    await expect('#instruments-list').selectorToBeAbsent(context);
  });
});
