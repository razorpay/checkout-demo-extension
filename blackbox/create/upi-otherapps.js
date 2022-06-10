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

const L0AppIds = ['google_pay', 'phonepe', 'paytm', 'others'];

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'upi-intent',
    testFeatures
  );

  const { emulate, L0Flow } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('UPI Intent tests', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.upi = true;
      if (L0Flow) {
        preferences.feature_overrides = {
          features: [
            {
              name: 'enableUPITiles',
              config: {
                apps: [
                  {
                    shortcode: 'google_pay',
                    url_schema: 'gpay://upi/pay',
                  },
                  {
                    shortcode: 'phonepe',
                    url_schema: 'phonepe://pay',
                  },
                  {
                    shortcode: 'paytm',
                    url_schema: {
                      ios: 'paytmmp://upi/pay',
                      android: 'paytmmp://pay',
                    },
                  },
                ],
              },
            },
          ],
        };
      } else {
        preferences.feature_overrides = {};
      }

      const context = await openCheckoutOnMobileWithNewHomeScreen({
        page,
        options,
        preferences,
        method: 'upi',
        emulate,
        experiments: L0Flow
          ? {
              upi_nr_l0_l1_improvements: 1,
            }
          : {},
      });

      await fillUserDetails(context, '8888888881');

      await proceed(context);

      await assertUserDetails(context);
      await assertEditUserDetailsAndBack(context);

      await assertPaymentMethods(context);
      if (!L0Flow) {
        await selectPaymentMethod(context, 'upi');
        await selectUPIOtherApps(context);

        await submit(context);

        await respondToUPIAjax(context, { method: 'intent_url' });
        await handleUPIOtherApps(context, L0Flow);
      } else {
        // verify all icons exists
        const allAppsExist = await context.page.evaluate((AppIds) => {
          let allIdExist = true;
          AppIds.forEach((id) => {
            if (!document.querySelector(`[data-appId="${id}"]`)) {
              allIdExist = id;
            }
          });
          return allIdExist === true ? true : allIdExist;
        }, L0AppIds);
        if (typeof allAppsExist === 'string') {
          throw new Error(`Missing UPI App Tile ${allAppsExist}`);
        }
        // select first app
        const firstApp = await context.page.waitForSelector(
          `[data-appId="${L0AppIds[0]}"]`
        );
        await firstApp.click();
        await submit(context);

        await respondToUPIAjax(context, { method: 'intent_url' });
        await handleUPIOtherApps(context, L0Flow);
      }
    });
  });
};
