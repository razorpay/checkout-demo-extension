// all the helpers functions for 1cc

import { saveAddresspayload } from 'one_click_checkout/address/store';

import {
  LANDMARK_ERROR_LABEL,
  GENERIC_ERROR_LABEL,
} from 'one_click_checkout/address/i18n/labels';
import { views as ONE_CC_HOME_VIEWS } from 'one_click_checkout/routing/constants';
import { screensHistory } from 'one_click_checkout/routing/History';
import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
import { redirectToPaymentMethods } from 'one_click_checkout/sessionInterface';
import { postCustomerAddress } from 'one_click_checkout/address/service';
/**
 * Checks for the address form if there are any errors and returns the obj
 * @returns Object
 */
export const validateInput = (elementId = 'addressForm') => {
  let error;
  const invalidInputs = document
    .getElementById(elementId)
    .querySelectorAll('.invalid');
  if (invalidInputs.length > 0) {
    // TODO: Validation behaviour after design confirmation
    const elem = invalidInputs[0].children[0];
    elem.focus();
    let errorLabel =
      elem.id === 'landmark' ? LANDMARK_ERROR_LABEL : GENERIC_ERROR_LABEL;
    error = {
      id: elem.id,
      label: {
        text: errorLabel,
        field: errorLabel[elem.id] || elem.id,
      },
    };
    return error;
  }
  return false;
};

/**
 * Method called when OTP verification is successful
 */
export function successHandler(data) {
  if (data.addresses) {
    screensHistory.replace(ONE_CC_HOME_VIEWS.SAVED_ADDRESSES);
  } else {
    screensHistory.replace(ONE_CC_HOME_VIEWS.ADD_ADDRESS);
  }
}

/**
 * Method called when OTP verification is successfull and address has to be saved.
 * @param {object} service address service instance
 */
export function addressSaveOTPSuccessHandler(service) {
  // Save address
  saveNewAddress(service).then(() => {
    redirectToPaymentMethods();
  });
}

/**
 * Method called when user skips OTP on address save screen.
 */
export function addressSaveOTPSkipHandler() {
  screensHistory.pop();
  redirectToPaymentMethods();
}

/**
 * Method called when user skips otp for accessing saved address.
 */
export const skipOTPHandle = () => {
  screensHistory.replace(ONE_CC_HOME_VIEWS.ADD_ADDRESS);
};

/**
 * Method called when an address has to be saved.
 * @returns {Promise} promise which is completed when address save is successful
 */
export const saveNewAddress = () => {
  let payload = saveAddresspayload();
  const loggedIn = isUserLoggedIn();
  if (loggedIn && Object.keys(payload).length > 0) {
    return new Promise((resolve) => {
      postCustomerAddress(payload).then((res) => {
        resolve(res);
      });
    });
  }
  return Promise.resolve(false);
};
