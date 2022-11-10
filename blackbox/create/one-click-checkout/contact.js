const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
  openCheckoutOnMobileWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
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
  assertPrefilledUserDetails,
} = require('../../tests/homescreen/userDetailsActions.js');
const {
  handlePartialOrderUpdate,
} = require('../../actions/one-click-checkout/order.js');

module.exports = function (testFeatures, methods = ['upi', 'card']) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const {
    editFromHome,
    editFromAccount,
    editFromOTP,
    prefillContact,
    emulate,
    skip,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
      methods,
    })
  )('One Click Checkout Contact test', ({ preferences, title, options }) => {
    if (skip) {
      test.skip(title, () => {});
      return;
    }
    test(title, async () => {
      let context;
      preferences.methods.upi = true;
      if (emulate) {
        context = await openCheckoutOnMobileWithNewHomeScreen({
          page,
          options,
          preferences,
          emulate,
        });
      } else {
        context = await openCheckoutWithNewHomeScreen({
          page,
          options,
          preferences,
        });
      }
      if (features.showCoupons) {
        await handleAvailableCouponReq(context);
      }
      if (prefillContact || emulate) {
        await assertPrefilledUserDetails(context);
      } else {
        await fillUserDetails(context, randomContact());
      }
      await delay(500);
      await proceedOneCC(context);
      if (editFromHome || editFromAccount || editFromOTP) {
        await handleCustomerStatusReq(context, true);
        await handleCreateOTPReq(context);

        if (editFromHome) {
          await delay(400);
          await goBack(context);
        } else if (editFromOTP) {
          await editContactFromOTP(context);
          await delay(100);
        } else if (editFromAccount) {
          await handleTypeOTP(context);
          await delay(200);
          await proceedOneCC(context);
          await handleVerifyOTPReq(context);
          await handleShippingInfo(context);
          await scrollToEnd(context, '.container');
          await delay(1000);
          await openAccounTab(context);
          await openContactFromAccountTab(context);
        }
        await resetContactDetails(context);
        await fillUserDetails(context, randomContact());
        await delay(200);
        await proceedOneCC(context);
        await delay(300);

        if (editFromOTP || editFromAccount) {
          handleResetReq(context, options.order_id);
          if (editFromAccount) {
            handleLogoutReq(context);
          }

          await proceedOneCC(context);
        }
      }
      await delay(50);
      if (prefillContact || emulate) {
        await handlePartialOrderUpdate(context);
      }
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
