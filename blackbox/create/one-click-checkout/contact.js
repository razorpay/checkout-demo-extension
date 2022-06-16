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
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions.js');

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
    test.skip(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      if (options.show_coupons) {
        await handleAvailableCouponReq(context);
      }

      await fillUserDetails(context, randomContact());
      await delay(500);
      await proceedOneCC(context);
      await handleCustomerStatusReq(context, true);
      await handleCreateOTPReq(context);

      if (editFromHome) {
        await goBack(context);
        handleAvailableCouponReq(context);
        await editContactFromHome(context);
      } else if (editFromOTP) {
        await editContactFromOTP(context);
      } else if (editFromAccount) {
        await handleTypeOTP(context);
        await proceedOneCC(context);
        await handleVerifyOTPReq(context);
        await handleShippingInfo(context);

        await scrollToEnd(context, '.screen-comp');
        await delay(1000);
        await scrollToEnd(context, '.screen-comp');
        await delay(1000);
        await openAccounTab(context);
        await openContactFromAccountTab(context);
      }

      await resetContactDetails(context);
      await fillUserDetails(context, randomContact());
      await proceedOneCC(context);
      await delay(400);

      handleResetReq(context, options.order_id);
      if (editFromAccount) {
        handleLogoutReq(context);
      }
      handleAvailableCouponReq(context);

      await delay(400);
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
