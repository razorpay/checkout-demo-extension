const { getTestData } = require('../../../actions');
const { openCheckoutWithNewHomeScreen } = require('../open');

const {
  assertBasicDetailsScreen,
  fillUserDetails,
  proceed,
  assertUserDetails,
  assertElementHasAttribute,
  selectPaymentMethod,
} = require('../actions');

const nameToBePrefilled = 'Saransh';

describe.each(
  getTestData('Check readonly options', {
    options: {
      prefill: {
        contact: '+912222222222',
        name: nameToBePrefilled,
        email: 'a@gmail.com',
      },
      readonly: {
        email: true,
        contact: true,
        name: true,
      },
    },
    keyless: false,
    preferences: {},
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
    await assertElementHasAttribute(context, '#email', 'readonly');
    await assertElementHasAttribute(context, '#country-code', 'readonly');
    await assertElementHasAttribute(context, '#contact', 'readonly');
    await fillUserDetails(context);
    await delay(500);
    await proceed(context);
    await assertUserDetails(context);
    await selectPaymentMethod(context, 'card');
    await assertElementHasAttribute(context, '#card_name', 'readonly');
  });
});
