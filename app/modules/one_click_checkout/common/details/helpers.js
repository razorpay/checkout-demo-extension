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
import { redirectToMethods } from 'one_click_checkout/sessionInterface';
import { updateOrderWithCustomerDetails } from 'one_click_checkout/order/controller';
import { toggleHeader } from 'one_click_checkout/header/helper';
import { handleContactFlow } from 'one_click_checkout/common/details/handleContactFlow';
import { isEmailOptional } from 'razorpay';

export const handleDetailsNext = (prevContact) => {
  let continueNext = true;
  if (get(isEditContactFlow)) {
    continueNext = handleContactFlow(prevContact);
  }
  isEditContactFlow.set(false);
  toggleHeader(true);

  if (continueNext) {
    // validations
    if (
      !CONTACT_REGEX.test(get(contact)) ||
      (!isEmailOptional() && !EMAIL_REGEX.test(get(email)))
    ) {
      return;
    }
    updateOrderWithCustomerDetails();

    navigator.navigateTo({
      path: views.COUPONS,
    });
    return;
  }
  const isCurrentTabHome = navigator.isRedirectionFromMethods();
  navigator.navigateBack();
  if (isCurrentTabHome) {
    redirectToMethods();
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
