const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertSelectorAbsence,
} = require('../actions');

describe.each(
  getTestData('Check hidden options', {
    options: {
      prefill: {
        contact: '+912222222222',
        email: 'a@gmail.com',
      },
      hidden: {
        contact: true,
      },
    },
    keyless: false,
    preferences: {
      optional: ['contact', 'email'],
    },
  })
)('Checkout Options tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    const enterUserDetailsTab = await context.page.waitForSelector(
      '#user-details',
      {
        visible: true,
      }
    );
    await enterUserDetailsTab.click();
    await assertBasicDetailsScreen(context);
    await assertSelectorAbsence(context, '#country-code');
    await assertSelectorAbsence(context, '#contact');
    await fillUserDetails(context);
    await proceed(context);
  });
});

describe.each(
  getTestData('Check hidden options', {
    options: {
      prefill: {
        contact: '+912222222222',
        email: 'a@gmail.com',
      },
      hidden: {
        email: true,
        contact: true,
      },
    },
    keyless: false,
    preferences: {
      optional: ['contact', 'email'],
    },
  })
)('Checkout Options tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    await assertSelectorAbsence(context, '#user-details');
  });
});

describe.each(
  getTestData('Check hidden options', {
    options: {
      prefill: {
        contact: '+912222222222',
        email: 'a@gmail.com',
      },
      hidden: {
        email: true,
        contact: false,
      },
    },
    keyless: false,
    preferences: {
      optional: ['contact', 'email'],
    },
  })
)('Checkout Options tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });
    const enterUserDetailsTab = await context.page.waitForSelector(
      '#user-details',
      {
        visible: true,
      }
    );
    await enterUserDetailsTab.click();
    await assertBasicDetailsScreen(context);
    await assertSelectorAbsence(context, '#email');
    await fillUserDetails(context);
    await proceed(context);
  });
});
