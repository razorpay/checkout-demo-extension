const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const { delay, assertVisible } = require('../../util.js');
const {
  scrollToEnd,
  goBack,
  handleLogoutReq,
  handleResetReq,
  login,
} = require('../../actions/one-click-checkout/common.js');
const {
  openAccounTab,
  logoutFromAccountTab,
} = require('../../actions/one-click-checkout/account-tab');
const {
  handleAvailableCouponReq,
} = require('../../actions/one-click-checkout/coupons.js');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const { logout, logoutAll } = features;

  describe.each(
    getTestData(title, {
      ...features,
      options,
      preferences,
    })
  )(
    'One Click Checkout Account tab test',
    ({ preferences, title, options }) => {
      test(title, async () => {
        const context = await openCheckoutWithNewHomeScreen({
          page,
          options,
          preferences,
        });

        await handleAvailableCouponReq(context);

        const screenEle = await context.page.waitForSelector('.screen-comp');
        await scrollToEnd(context, screenEle);
        await delay(800);
        await scrollToEnd(context, screenEle);
        await delay(200);
        await openAccounTab(context);

        if (logout || logoutAll) {
          await logoutFromAccountTab(context, logoutAll);
          await handleLogoutReq(context, logoutAll);
          await handleResetReq(context, options.order_id);
          await assertVisible('[data-test-id=payment-details-block]');
        }
      });
    }
  );
};
