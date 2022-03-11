const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  handleAvailableCouponReq,
} = require('../../actions/one-click-checkout/coupons');
const {
  handleCustomerStatusReq,
  handleUpdateOrderReq,
  handleThirdWatchReq,
  handleCreateOTPReq,
  handleTypeOTP,
  handleVerifyOTPReq,
  handleSkipOTP,
  checkInvalidOTP,
} = require('../../actions/one-click-checkout/common');
const {
  handleShippingInfo,
  handleAddAddress,
  fillUserAddress,
  handleCustomerAddressReq,
  handleCheckUnserviceable,
  unCheckBillAddress,
} = require('../../actions/one-click-checkout/address');
const { selectPaymentMethod } = require('../../tests/homescreen/actions');
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions');
const { proceed } = require('../../tests/homescreen/sharedActions');
const { delay } = require('../../util');
const {
  selectBank,
  submit,
  passRequestNetbanking,
  handleMockSuccessDialog,
} = require('../../actions/common');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const {
    isSaveAddress,
    addAddress,
    serviceable,
    diffBillShipAddr,
    sameBillShipAddr,
    skipOTP,
    showSavedAddress,
    isCODEligible,
    inValidOTP,
  } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('One Click Checkout Address test', ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.cod = true;
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });
      await handleAvailableCouponReq(context);
      await proceed(context);

      await fillUserDetails(context);
      await proceed(context);
      await handleCustomerStatusReq(context, isSaveAddress || skipOTP);
      if (!serviceable) {
        await fillUserAddress(context, {
          isSaveAddress,
          isCODEligible,
          showSavedAddress,
          serviceable,
        });
        await delay(200);
        await handleCheckUnserviceable(context);
        return;
      }
      if (serviceable && !isSaveAddress && !skipOTP) {
        await fillUserAddress(context, { isSaveAddress });
      }
      if (diffBillShipAddr) {
        await unCheckBillAddress(context);
        await delay(200);
        await proceed(context);
        await delay(400);
        await fillUserAddress(context, {
          isSaveAddress,
          isCODEligible,
          showSavedAddress,
          serviceable,
          diffBillShipAddr,
        });
      }
      if (isSaveAddress && skipOTP) {
        await handleCreateOTPReq(context);
        await handleSkipOTP(context);
        await fillUserAddress(context, { isSaveAddress });
        await proceed(context);
        await delay(200);
        await handleCreateOTPReq(context);
        await handleTypeOTP(context);
      }
      if (isSaveAddress && !skipOTP) {
        await handleCreateOTPReq(context);
        await handleTypeOTP(context);
        await proceed(context);
        await handleVerifyOTPReq(context, inValidOTP);
        if (inValidOTP) {
          await checkInvalidOTP(context);
          return;
        }
        await handleShippingInfo(context, { isCODEligible });
      }
      if (addAddress) {
        await delay(400);
        await handleAddAddress(context);
        await fillUserAddress(context, {
          isSaveAddress,
          isCODEligible,
          showSavedAddress,
        });
      }
      if (!isSaveAddress && skipOTP) {
        await handleCreateOTPReq(context);
        await handleSkipOTP(context);
        await fillUserAddress(context, { isSaveAddress: true });
        await proceed(context);
        await delay(200);
        await handleCreateOTPReq(context);
        await handleSkipOTP(context);
      } else {
        await proceed(context);
      }
      if (isSaveAddress && skipOTP) {
        await handleVerifyOTPReq(context);
        await handleCustomerAddressReq(context);
      }
      if (addAddress) {
        await handleCustomerAddressReq(context);
      }
      await handleUpdateOrderReq(context, options.order_id);
      await handleThirdWatchReq(context);
      await selectPaymentMethod(context, 'netbanking');
      await delay(400);
      await selectBank(context, 'SBIN');
      await submit(context, false);
      await passRequestNetbanking(context);
      await handleMockSuccessDialog(context);
    });
  });
};
