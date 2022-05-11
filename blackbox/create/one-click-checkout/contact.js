const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  editContactFromHome,
  resetContactDetails,
  editContactFromOTP,
} = require('../../actions/one-click-checkout/contact.js');
const {
  handleAvailableCouponReq,
} = require('../../actions/one-click-checkout/coupons.js');
const { fillUserDetails } = require('../../actions/home-page-actions.js');
const { delay, randomContact } = require('../../util.js');
const {
  proceedOneCC,
  handleCustomerStatusReq,
  handleResetReq,
  handleCreateOTPReq,
  handleTypeOTP,
  handleVerifyOTPReq,
  goBack,
  scrollToEnd,
  handleLogoutReq,
  mockPaymentSteps,
  handleShippingInfo,
} = require('../../actions/one-click-checkout/common.js');
const {
  fillUserAddress,
} = require('../../actions/one-click-checkout/address.js');
const {
  openAccounTab,
  openContactFromAccountTab,
} = require('../../actions/one-click-checkout/account-tab.js');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const { editFromHome, editFromAccount, editFromOTP, skip } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('One Click Checkout Contact test', ({ preferences, title, options }) => {
    if (skip) {
      test.skip(title, () => {});
      return;
    }
    test(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      await handleAvailableCouponReq(context);

      await fillUserDetails(context, randomContact());
      await delay(200);
      await proceedOneCC(context);
      await handleCustomerStatusReq(context, true);
      await handleCreateOTPReq(context);

      if (editFromHome) {
        await goBack(context);
        await handleAvailableCouponReq(context);
        await editContactFromHome(context);
      } else if (editFromOTP) {
        await editContactFromOTP(context);
      } else if (editFromAccount) {
        await handleTypeOTP(context);
        await delay(200);
        await proceedOneCC(context);
        await handleVerifyOTPReq(context);
        await handleShippingInfo(context);

        await handleAvailableCouponReq(context);
        await scrollToEnd(context, '.screen-comp');
        await delay(800);
        await scrollToEnd(context, '.screen-comp');
        await delay(200);
        await openAccounTab(context);
        await openContactFromAccountTab(context);
      }

      await resetContactDetails(context);
      await fillUserDetails(context, randomContact());
      await proceedOneCC(context);
      await handleResetReq(context);

      if (editFromAccount) {
        await handleLogoutReq(context);
      }

      await handleCustomerStatusReq(context);
      await handleAvailableCouponReq(context);

      await proceedOneCC(context);
      await handleCustomerStatusReq(context);
      await fillUserAddress(context, {
        saveAddress: false,
        zipcode: '560002',
        serviceable: true,
      });
      await proceedOneCC(context);
      await mockPaymentSteps(context, options, features);
    });
  });
};
