'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.handleBack =
  exports.handleDetailsOTP =
  exports.isBackEnabledOnDetails =
  exports.handleDetailsNext =
    void 0;

let _store = require('svelte/store');

let _home = require('checkoutstore/screens/home');

let _constants = require('one_click_checkout/routing/constants');

let _store2 = require('one_click_checkout/routing/store');

let _routing = require('one_click_checkout/routing/helpers/routing');

let _constants2 = require('common/constants');

let _store3 = require('one_click_checkout/store');

let _sessionInterface = require('one_click_checkout/sessionInterface');

let _controller = require('one_click_checkout/order/controller');

let _helper = require('one_click_checkout/header/helper');

let _handleContactFlow = require('one_click_checkout/common/details/handleContactFlow');

let handleDetailsNext = function handleDetailsNext(prevContact) {
  let continueNext = true;

  if ((0, _store.get)(_store3.isEditContactFlow)) {
    continueNext = (0, _handleContactFlow.handleContactFlow)(prevContact);
  }

  _store3.isEditContactFlow.set(false);

  (0, _helper.toggleHeader)(true);

  if (continueNext) {
    // validations
    if (
      !_constants2.CONTACT_REGEX.test((0, _store.get)(_home.contact)) ||
      !_constants2.EMAIL_REGEX.test((0, _store.get)(_home.email))
    ) {
      return;
    }

    (0, _controller.updateOrderWithCustomerDetails)();

    _routing.navigator.navigateTo({
      path: _constants.views.COUPONS,
    });

    return;
  } else {
    let isCurrentTabHome = _routing.navigator.isRedirectionFromMethods();

    _routing.navigator.navigateBack();

    if (isCurrentTabHome) {
      (0, _sessionInterface.redirectToMethods)();
    }
  }
};

exports.handleDetailsNext = handleDetailsNext;

let isBackEnabledOnDetails = function isBackEnabledOnDetails() {
  if ((0, _store.get)(_store2.history).length <= 1) {
    return false;
  }

  return true;
};
/**
 * Method to handle the otp for mandatory login
 * @returns Object - OTP props
 */

exports.isBackEnabledOnDetails = isBackEnabledOnDetails;

let handleDetailsOTP = function handleDetailsOTP() {
  // add validations
  return {
    successHandler: function successHandler() {
      _routing.navigator.navigateTo({
        path: _constants.views.COUPONS,
        initialize: true,
      });
    },
    skipOTPHandle: function skipOTPHandle() {
      _routing.navigator.navigateTo({
        path: _constants.views.COUPONS,
      });
    },
  };
};

exports.handleDetailsOTP = handleDetailsOTP;

let handleBack = function handleBack() {
  // Need to reset the previous Phone number & Email, if the user clicked back on Details screen
  let _ref = (0, _store.get)(_home.prevContact) || {},
    prevContactCountry = _ref.country,
    prevContactPhone = _ref.phone,
    prevContactEmail = _ref.email;

  _home.country.set(prevContactCountry);

  _home.phone.set(prevContactPhone);

  _home.email.set(prevContactEmail);
};

exports.handleBack = handleBack;
