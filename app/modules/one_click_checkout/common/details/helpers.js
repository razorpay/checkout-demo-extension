import { get } from 'svelte/store';
import {
  contact,
  email,
  country,
  phone,
  prevContact,
} from 'checkoutstore/screens/home';
import { views } from 'one_click_checkout/routing/constants';
import { history } from 'one_click_checkout/routing/store';
import { navigator } from 'one_click_checkout/routing/helpers/routing';
import { isLoginMandatory, shouldShowCoupons } from 'one_click_checkout/store';
import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
import { askForOTP } from 'one_click_checkout/common/otp';
import { CONTACT_REGEX, EMAIL_REGEX } from 'common/constants';
import { isEditContactFlow, isLogoutFlow } from 'one_click_checkout/store';
import {
  getCustomerByContact,
  getCustomerDetails,
} from 'one_click_checkout/common/helpers/customer';
import { redirectToPaymentMethods } from 'one_click_checkout/sessionInterface';
import { determineLandingView } from 'one_click_checkout/helper';
import { resetOrder } from 'one_click_checkout/charges/helpers';
import { otpReasons } from 'one_click_checkout/otp/constants';
import { toggleHeader } from 'one_click_checkout/header/helper';

/**
 * Method to handle submission of new details by a logged in user
 * @param {number} prevContact the contact number of the user
 * @returns Boolean
 */
const handleContactFlow = (prevContact) => {
  const prevCustomer = getCustomerByContact(prevContact);
  if (get(contact) === prevContact) {
    isEditContactFlow.set(false);
    const isCurrentTabHome = navigator.isRedirectionFromMethods();
    if (isCurrentTabHome) {
      redirectToPaymentMethods({
        shouldUpdateOrder: false,
        showSnackbar: false,
      });
    }
    // If navigating from methods->details (edit contact)
    // history stack is: [1cc screens, methods, details] since we dont need details on back poping it up
    navigator.navigateBack();
    return false;
  }
  resetOrder(true);
  navigator.navigateTo({ path: views.DETAILS, initialize: true });
  if (prevCustomer?.logged) {
    prevCustomer.logout(false);
  }
  return true;
};

export const handleDetailsNext = (prevContact) => {
  let continueNext = true;
  if (get(isEditContactFlow)) {
    continueNext = handleContactFlow(prevContact);
  } else if (get(isLogoutFlow)) {
    isLogoutFlow.set(false);
    navigator.navigateTo({ path: determineLandingView(), initialize: true });
    return;
  }
  if (continueNext) {
    // validations
    if (!CONTACT_REGEX.test(get(contact)) || !EMAIL_REGEX.test(get(email)))
      return;
    let view = views.SAVED_ADDRESSES;
    if (isLoginMandatory()) {
      if (!isUserLoggedIn()) {
        askForOTP(otpReasons.mandatory_login);
        return;
      }
      if (shouldShowCoupons()) {
        view = views.COUPONS;
      }
    } else if (get(isEditContactFlow) && shouldShowCoupons()) {
      const customer = getCustomerDetails();
      const params = { skip_otp: true };
      customer.checkStatus(
        function () {
          if (customer.saved_address && !customer.logged) {
            toggleHeader(true);
            askForOTP(otpReasons.coupons_edit_contact);
          } else {
            isEditContactFlow.set(false);
            navigator.navigateTo({ path: views.COUPONS });
          }
        },
        params,
        customer.contact
      );
      return;
    }

    isEditContactFlow.set(false);
    navigator.navigateTo({ path: view });
  }
};

export const isBackEnabledOnDetails = () => {
  if (get(history).length <= 1) {
    return false;
  }
  return true;
};

/**
 * Method to handle the otp for mandatory login
 * @returns Object - OTP props
 */
export const handleDetailsOTP = () => {
  // add validations
  return {
    successHandler: function () {
      if (shouldShowCoupons()) {
        navigator.replace(views.COUPONS);
      } else {
        navigator.navigateTo({ path: views.ADDRESS });
      }
    },
    skipOTPHandle: function () {
      navigator.navigateTo({ path: views.ADD_ADDRESS });
    },
  };
};

export const handleBack = () => {
  // Need to reset the previous Phone number & Email, if the user clicked back on Details screen
  const {
    country: prevContactCountry,
    phone: prevContactPhone,
    email: prevContactEmail,
  } = get(prevContact) || {};
  country.set(prevContactCountry);
  phone.set(prevContactPhone);
  email.set(prevContactEmail);
};
