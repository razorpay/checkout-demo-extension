const { makePreferences } = require('../../../actions/preferences');
const { submit, enterCardDetails } = require('../../../actions/common');

// New imports
const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../actions');

// Opener
const { openSdkCheckoutWithNewHomeScreen } = require('../open');

const querystring = require('querystring');

describe('Card tests', () => {
  test('perform card transaction', async () => {
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 200,
      personalization: false,
      redirect: true,
    };
    const preferences = makePreferences();

    const context = await openSdkCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    // Basic options with no prefill, we'll land on the details screen
    await assertBasicDetailsScreen(context);

    await fillUserDetails(context);
    await proceed(context);

    await assertUserDetails(context);
    await assertEditUserDetailsAndBack(context);

    await assertPaymentMethods(context);
    await selectPaymentMethod(context, 'card');

    // -------- OLD FLOW --------

    await enterCardDetails(context);
    await submit(context);

    // TODO make this versatile
    const req = await context.expectRequest();
    expect(req.raw.isNavigationRequest()).toBe(true);
    expect(req.method).toBe('POST');
    expect(querystring.parse(req.body)).toMatchObject({ method: 'card' });
  });
});
