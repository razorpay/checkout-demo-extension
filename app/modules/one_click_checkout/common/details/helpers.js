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
import { CONTACT_REGEX, EMAIL_REGEX } from 'common/constants';
import { isEditContactFlow } from 'one_click_checkout/store';
import { getCustomerByContact } from 'one_click_checkout/common/helpers/customer';
import { redirectToPaymentMethods } from 'one_click_checkout/sessionInterface';
import { resetOrder } from 'one_click_checkout/charges/helpers';
import { updateOrderWithCustomerDetails } from 'one_click_checkout/order/controller';
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
  }
  if (continueNext) {
    // validations
    if (!CONTACT_REGEX.test(get(contact)) || !EMAIL_REGEX.test(get(email))) {
      return;
    }
    updateOrderWithCustomerDetails();
    isEditContactFlow.set(false);

    toggleHeader(true);
    navigator.navigateTo({
      path: views.COUPONS,
    });
    return;
  } else {
    toggleHeader(true);
    navigator.navigateBack();
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
      navigator.navigateTo({ path: views.COUPONS, initialize: true });
    },
    skipOTPHandle: function () {
      navigator.navigateTo({ path: views.COUPONS });
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
