const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const {
  openCheckoutOnMobileWithNewHomeScreen,
} = require('../tests/homescreen/open');
const {
  submit,
  respondToUPIAjax,
  selectUPIOtherApps,
  handleUPIOtherApps,
} = require('../actions/common');

const {
  // Generic
  proceed,
  // Homescreen
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,
} = require('../tests/homescreen/actions');
const { delay } = require('../../mock-api/utils.js');
const { setExperiments } = require('../actions/experiments.js');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'upi-intent',
    testFeatures
  );

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('UPI Intent tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi = true;
      const experiments = { other_intent_apps: 1 };

      const context = await openCheckoutOnMobileWithNewHomeScreen({
        page,
        options,
        preferences,
        method: 'upi',
        experiments,
      });

      await fillUserDetails(context, '8888888881');

      await proceed(context);

      await assertUserDetails(context);
      await assertEditUserDetailsAndBack(context);

      await assertPaymentMethods(context);

      /** DEBUG START
       * Adding for debugging purpose in CI
       */

      let experimentsCurrentlySet = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('rzp_checkout_exp'))
      );
      console.log('===> before:', experimentsCurrentlySet);

      await setExperiments(page, experiments);

      experimentsCurrentlySet = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('rzp_checkout_exp'))
      );
      console.log('===> after:', experimentsCurrentlySet);

      const userAgentString = await page.evaluate(() =>
        navigator.userAgent.toString()
      );
      console.log('===> useragent: ', userAgentString);

      /**
       * DEBUG END
       */

      await selectPaymentMethod(context, 'upi');
      await selectUPIOtherApps(context);

      await submit(context);

      await respondToUPIAjax(context, { method: 'intent_url' });
      await handleUPIOtherApps(context);
    });
  });
};
