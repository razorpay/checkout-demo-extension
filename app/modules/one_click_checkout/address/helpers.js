// all the helpers functions for 1cc

import { get } from 'svelte/store';

// Store imports
import {
  newUserAddress,
  selectedAddressId,
} from 'one_click_checkout/address/shipping_address/store';
import { getSaveAddressPayload } from 'one_click_checkout/address/derived';
import { savedAddresses } from 'one_click_checkout/address/store';

// Helper imports
import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
import { redirectToPaymentMethods } from 'one_click_checkout/sessionInterface';
import {
  postCustomerAddress,
  putCustomerAddress,
} from 'one_click_checkout/address/service';
import { navigator as viewsNavigator } from 'one_click_checkout/routing/helpers/routing';
import { views } from 'one_click_checkout/routing/constants';
import { allowLangEngOnly } from 'razorpay';

// Constants imports
import {
  LANDMARK_ERROR_LABEL,
  GENERIC_ERROR_LABEL,
  REQUIRED_LABEL,
  ZIPCODE_ERROR_LABEL,
  GENERIC_PATTERN_ERROR_LABEL,
  INDIA_CONTACT_ERROR_LABEL,
  CONTACT_ERROR_LABEL,
  PINCODE_ERROR_LABEL,
  NAME_ERROR_LABEL,
  CITY_STATE_ERROR_LABEL,
  NAME_LANG_ERROR_LABEL,
  ADDRESS_LANG_ERROR,
} from 'one_click_checkout/address/i18n/labels';
import { INDIAN_CONTACT_PATTERN, PHONE_PATTERN } from 'common/constants';
import { INDIA_COUNTRY_CODE, INDIA_COUNTRY_ISO_CODE } from 'common/constants';
import { views as ONE_CC_HOME_VIEWS } from 'one_click_checkout/routing/constants';
import {
  COUNTRY_POSTALS_MAP,
  INDIAN_PINCODE_LENGTH,
} from 'common/countrycodes';
import {
  views as addressViews,
  ENG_LANG_REGEX_PATTERN,
} from 'one_click_checkout/address/constants';
import { updateAddressesInStore } from './sessionInterface';

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

export const validateInputField = (value, formInput, selectedCountryIso) => {
  const input = { ...value };
  const fieldsReqLangCheck = [
    'name',
    'state',
    'city',
    'landmark',
    'line1',
    'line2',
  ];
  if (formInput.id === 'contact') {
    value = value.phoneNum;
  }

  if (formInput.required && !value) {
    return REQUIRED_LABEL;
  }

  if (allowLangEngOnly() && fieldsReqLangCheck.includes(formInput.id)) {
    const exp = new RegExp(ENG_LANG_REGEX_PATTERN);
    const valid = exp.test(value);

    if (value && !valid) {
      if (formInput.id === 'name') {
        return NAME_LANG_ERROR_LABEL;
      }
      return ADDRESS_LANG_ERROR;
    }
  }

  if (['country_name', 'line1', 'line2'].includes(formInput.id)) {
    return;
  }

  let pattern = formInput.pattern;
  if (formInput.id === 'contact') {
    if (input?.countryCode === INDIA_COUNTRY_CODE) {
      pattern = INDIAN_CONTACT_PATTERN;
      value = value?.replace(/^0+/, '');
    } else {
      pattern = PHONE_PATTERN;
    }
  }
  const exp = new RegExp(pattern);
  const valid = exp.test(value);
  if (value && !valid) {
    if (formInput.id === 'contact') {
      return input?.countryCode === INDIA_COUNTRY_CODE
        ? INDIA_CONTACT_ERROR_LABEL
        : CONTACT_ERROR_LABEL;
    } else if (formInput.id === 'name') {
      return NAME_ERROR_LABEL;
    } else if (formInput.id === 'landmark') {
      return LANDMARK_ERROR_LABEL;
    } else if (formInput.id === 'city' || formInput.id === 'state') {
      return CITY_STATE_ERROR_LABEL;
    } else if (formInput.id === 'zipcode') {
      if (!COUNTRY_POSTALS_MAP[selectedCountryIso?.toUpperCase()]?.pattern) {
        return;
      }
      return selectedCountryIso?.toUpperCase() === INDIA_COUNTRY_ISO_CODE &&
        value.length !== INDIAN_PINCODE_LENGTH
        ? PINCODE_ERROR_LABEL
        : ZIPCODE_ERROR_LABEL;
    }
    return GENERIC_PATTERN_ERROR_LABEL;
  }
};

/**
 * Method called when OTP verification is successful
 */
export function successHandler() {
  viewsNavigator.navigateTo({ path: ONE_CC_HOME_VIEWS.SAVED_ADDRESSES });
}

/**
 * Method called when mandatory login OTP verification is successful
 */
export function mandatoryLoginSuccessHandler() {
  const path = get(savedAddresses).length
    ? ONE_CC_HOME_VIEWS.SAVED_ADDRESSES
    : ONE_CC_HOME_VIEWS.ADD_ADDRESS;
  viewsNavigator.replace(path);
}

/**
 * Method called when OTP verification is successful and address has to be saved.
 * @param {object} service address service instance
 */
export function addressSaveOTPSuccessHandler(service) {
  // Save address
  saveAddress(service).then((res) => {
    get(newUserAddress).id = res.shipping_address?.id;
    selectedAddressId.set(res.shipping_address?.id);
    redirectToPaymentMethods();
  });
}

/**
 * Method called when user skips OTP on address save screen.
 */
export function addressSaveOTPSkipHandler() {
  redirectToPaymentMethods();
}

/**
 * Method called when user skips otp for accessing saved address.
 */
export const skipOTPHandle = () => {
  viewsNavigator.replace(ONE_CC_HOME_VIEWS.ADD_ADDRESS);
};

/**
 * Method called when an address has to be saved.
 * @returns {Promise} promise which is completed when address save is successful
 */
export const saveAddress = () => {
  let payload = getSaveAddressPayload();
  const loggedIn = isUserLoggedIn();
  if (loggedIn && Object.keys(payload).length > 0) {
    const { shipping_address, billing_address } = payload;

    /**
     * send a single request if both forms share common type (add/edit)
     * or if only one billing/shipping address needs to be created/updated
     */
    if (
      shipping_address?.formView === billing_address?.formView ||
      !shipping_address ||
      !billing_address
    ) {
      if (
        shipping_address?.formView === addressViews.EDIT_ADDRESS ||
        billing_address?.formView === addressViews.EDIT_ADDRESS
      ) {
        return putCustomerAddress(payload).then((res) => {
          updateAddressesInStore(Object.values(res));
          return res;
        });
      }
      return postCustomerAddress(payload).then((res) => {
        updateAddressesInStore(Object.values(res));
        return res;
      });
    }
    let postPayload = { shipping_address };
    let putPayload = { billing_address };
    if (payload.shipping_address?.formView === addressViews.EDIT_ADDRESS) {
      postPayload = { billing_address };
      putPayload = { shipping_address };
    }
    return Promise.all([
      postCustomerAddress(postPayload),
      putCustomerAddress(putPayload),
    ]).then((response) => {
      response.forEach((res) => updateAddressesInStore(Object.values(res)));
      return response;
    });
  }
  return Promise.resolve(false);
};

/**
 * Finds item with id in a nested array
 * @param {array} array The array, having object with key id
 * @param {string} id The id of the item to match with.
 * @returns
 */
export const findItem = (array, id) => {
  for (const item of array) {
    if (item.id === id) {
      return item;
    }
    if (Array.isArray(item)) {
      const result = findItem(item, id);
      if (result) {
        return result;
      }
    }
  }
};

export const shouldShowCheckbox = (route) => {
  switch (route) {
    case views.ADD_BILLING_ADDRESS:
      return false;
    case views.EDIT_BILLING_ADDRESS:
      return false;
    default:
      return true;
  }
};
