const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const { delay, assertVisible } = require('../../util.js');
const {
  scrollToEnd,
  handleCreateOTPReq,
  proceedOneCC,
  handleCustomerStatusReq,
  handleTypeOTP,
  handleVerifyOTPReq,
  goBack,
  handleLogoutReq,
  handleResetReq,
} = require('../../actions/one-click-checkout/common.js');
const {
  openAccounTab,
  logoutFromAccountTab,
} = require('../../actions/one-click-checkout/account-tab');
const { fillUserDetails } = require('../../actions/home-page-actions.js');
const {
  handleShippingInfo,
} = require('../../actions/one-click-checkout/address');
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

        if (logout || logoutAll) {
          await fillUserDetails(context, '9952395555');
          await delay(200);
          await proceedOneCC(context);
          await handleCustomerStatusReq(context, true);
          await handleCreateOTPReq(context);
          await handleTypeOTP(context);
          await delay(200);
          await proceedOneCC(context);
          await handleVerifyOTPReq(context);
          await handleShippingInfo(context);
          await goBack(context);
          await handleAvailableCouponReq(context);
        }

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
