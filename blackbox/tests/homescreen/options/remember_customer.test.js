const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');

const {
  fillUserDetails,
  assertUserDetails,
  proceed,
  selectPaymentMethod,
} = require('../actions');

describe.each(
  getTestData('Negative check for remember_customer', {
    keyless: false,
    options: {
      amount: 200,
      remember_customer: false,
    },
    preferences: {},
  })
)('Options test remember_customer', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);

    await selectPaymentMethod(context, 'card');
    const el = await page.$('#should-save-card');

    expect(el).toBe(null);
  });
});

describe.each(
  getTestData('Positive test for remember_customer', {
    keyless: false,
    options: {
      amount: 200,
      remember_customer: true,
    },
    preferences: {},
  })
)('Options test remember_customer', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await fillUserDetails(context);
    await proceed(context);
    await assertUserDetails(context);

    await selectPaymentMethod(context, 'card');
    const el = await page.$('#should-save-card');

    expect(el).toBeTruthy();
  });
});
