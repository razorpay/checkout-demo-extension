const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const {
  openCheckoutWithNewHomeScreen,
  openSdkCheckoutWithNewHomeScreen,
} = require('../tests/homescreen/open');
const {
  handleAppCreatePayment,
  handleAppPaymentStatus,
} = require('../actions/common');
const {
  // Generic
  proceed,

  // Homescreen
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,

  // Partial Payments
  handlePartialPayment,
} = require('../tests/homescreen/actions');

module.exports = function(testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'app',
    testFeatures
  );

  const { app, flow, config, platform, testName } = testFeatures;

  const {
    partialPayment,
    feeBearer,
    timeout,
    callbackUrl,
    offers,
    optionalContact,
    optionalEmail,
    personalization,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )(`App - ${testName}`, ({ preferences, title, options }) => {
    test(title, async () => {
      if (personalization) {
        if (preferences.customer) {
          preferences.customer.contact = '+918888888881';
        }
      }

      const apps = [];

      if (app === 'google_pay_cards') {
        preferences.methods.app = { google_pay_cards: true };
        preferences.methods.google_pay_cards = true;
        apps.push('google_pay_cards');
      } else if (app === 'cred') {
        preferences.methods.app = { cred: true };
        if (flow === 'intent') {
          // This will send cred inside handleMessage under "uri_data"
          // It essentially means that app is installed on the device.
          apps.push('cred');
        }
      }

      if (config) {
        options.config = testFeatures.config;
      }

      let params;

      if (platform === 'android') {
        params = {
          platform: 'android',
          library: 'checkoutjs',
          version: '1.5.17',
        };
      } else if (platform === 'ios') {
        params = {
          platform: 'ios',
          library: 'checkoutjs',
          version: '?',
        };
      }

      const context = await openSdkCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
        method: 'app',
        apps,
        params,
      });

      const missingUserDetails = optionalContact && optionalEmail;

      const isHomeScreenSkipped = missingUserDetails && !partialPayment; // and not TPV

      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (!missingUserDetails) {
        await fillUserDetails(context, '8888888881');
      }

      if (partialPayment) {
        await handlePartialPayment(context, '100');
      } else if (!isHomeScreenSkipped) {
        await proceed(context);
      }

      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      let selector;
      if (config || personalization) {
        // If making payment on the homescreen itself,
        // No need to reach the inner screens.
        selector = `.instrument[data-code=${app}]`;
      } else {
        await assertPaymentMethods(context);
        await selectPaymentMethod(context, 'card');
        selector = `.instrument [value=${app}]`;
      }

      await page.waitForSelector(selector);
      await page.click(selector);

      // await proceed(context);
      // ^ Internally checks for absence of #user-details
      // but it is present in DOM for some reason,
      // so using #footer directly
      await context.page.click('#footer');

      await handleAppCreatePayment(context, { app, flow, platform });

      await handleAppPaymentStatus(context, { app, flow, platform });
    });
  });
};
