/**
 * {module}/index.js contains the API which is exposed to other modules
 */
import RazorpayStore from './store';
import { entityWithAmount } from './constant';
import { displayAmount } from 'common/currency';
import { get } from 'utils/object';

/**
 * Helper methods
 */
export const getPreferences = (path, defaultValue) => {
  if (!path) return RazorpayStore.preferences;
  return get(RazorpayStore.preferences, path, defaultValue);
};

export const getOption = (path, needFunction = false) => {
  if (needFunction) {
    return () => getOption(path, false);
  }
  return !path
    ? RazorpayStore.triggerInstanceMethod('get')
    : RazorpayStore.get(path);
};

export const setOption = RazorpayStore.set;

export const getMerchantOption = RazorpayStore.getMerchantOption;

export const isIRCTC = RazorpayStore.isIRCTC;

export const getCardFeatures = RazorpayStore.getCardFeatures;

export const getCurrencies = (...args) =>
  RazorpayStore.get().getCurrencies(...args);

// Preference related
export const getPayoutContact = () => getPreferences('contact');
export const getMerchantMethods = () => getPreferences('methods', {});
export const getMerchantOrder = () => getPreferences('order');
export const getOrderMethod = () => getPreferences('order.method');
export const getMerchantOrderAmount = () => getPreferences('order.amount');
export const getMerchantOrderDueAmount = () =>
  getPreferences('order.amount_due');
export const getMerchantKey = () => getPreferences('merchant_key');
export const isGlobalVault = () => getPreferences('global');
export const isPartialPayment = () => getPreferences('order.partial_payment');
export const hasFeature = (feature, fallbackValue) =>
  getPreferences(`features.${feature}`, fallbackValue);

/**
 * Recurring related helper function
 */
export const getRecurringMethods = () => getPreferences('methods.recurring');
export function isRecurring() {
  if (getOrderMethod() === 'emandate' && getRecurringMethods()) {
    return true;
  }
  return getPreferences('subscription') || getOption('recurring');
}
export function isStrictlyRecurring() {
  return isRecurring() && getOption('recurring') !== 'preferred';
}
/**
 * Offers related helper function
 */
export const getMerchantOffers = () => {
  // Ignore all offers ( including forced offers ) in case of partial payments.
  // Ignore offers for 1CC. Not supported in 1CC
  if (isPartialPayment() || isOneClickCheckout()) {
    return [];
  }
  // Temporary fix: If customer-feebearer do not show any offers to the user.
  if (getPreferences('fee_bearer') && getPreferences('force_offer')) {
    return getPreferences('offers');
  } else if (getPreferences('fee_bearer')) {
    return [];
  } else {
    return getPreferences('offers');
  }
};
export const isOfferForced = () => getPreferences('force_offer');

export const getCheckoutConfig = () => getPreferences('checkout_config');
export const getOrgDetails = () => getPreferences('org');

/**
 * language code
 */
export const getLanguageCodeFromPrefs = () => getPreferences('language_code');
export const getLanguageCodeFromOptions = () =>
  get(getConfigFromGetOption(), 'display.language');

export const getLanguageCode = () =>
  getLanguageCodeFromOptions() || getLanguageCodeFromPrefs();

/**
 * Options related helpers
 */

export const getCallbackUrl = getOption('callback_url', true);

export const getCurrency = () => {
  const entityWithAmountData =
    entityWithAmount.find((entity) => getPreferences(entity)) || {};
  return entityWithAmountData?.currency || getOption('currency');
};

function getConfigFromGetOption() {
  if (getOption('config') === null) {
    return null;
  }
  /**
   * Only certain keys are allowed to be passed from options
   * For example, restrictions aren't allowed
   */
  const config = {
    display: getOption('config.display'),
  };
  return config;
}

/**
 * readonly
 */
export const isNameReadOnly = () =>
  getOption('readonly.name') && getOption('prefill.name');

export function isContactReadOnly() {
  return getOption('readonly.contact') && getOption('prefill.contact');
}
export function isEmailReadOnly() {
  return getOption('readonly.email') && getOption('prefill.email');
}
export function isContactEmailReadOnly() {
  return isContactReadOnly() && isEmailReadOnly();
}

/**
 * optional
 */
export function isContactOptional() {
  return (getPreferences('optional') || []).indexOf('contact') !== -1;
}

export function isEmailOptional() {
  return (getPreferences('optional') || []).indexOf('email') !== -1;
}
export function isContactEmailOptional() {
  return isContactOptional() && isEmailOptional();
}

export function getOptionalObject() {
  return {
    contact: isContactOptional(),
    email: isEmailOptional(),
  };
}

// Hidden fields
export function isContactHidden() {
  return isContactOptional() && getOption('hidden.contact');
}

export function isEmailHidden() {
  return isEmailOptional() && getOption('hidden.email');
}

export function isContactEmailHidden() {
  return isContactHidden() && isEmailHidden();
}
/**
 * order related
 */
export const getOrderId = getOption('order_id', true);

/**
 * prefill related
 */
export const getPrefilledContact = getOption('prefill.contact', true);
export const getPrefilledEmail = getOption('prefill.email', true);
export const getPrefilledName = getOption('prefill.name', true);
export const getPrefilledCardNumber = getOption('prefill.card[number]', true);
export const getPrefilledVPA = getOption('prefill.vpa', true);

export const getPrefillBillingAddress = (nvs = false) => {
  const prefill = {
    line1: getOption('prefill.billing_address[line1]'),
    line2: getOption('prefill.billing_address[line2]'),
    state: getOption('prefill.billing_address[state]'),
    city: getOption('prefill.billing_address[city]'),
    country: getOption('prefill.billing_address[country]'),
    postal_code: getOption('prefill.billing_address[postal_code]'),
  };

  if (nvs) {
    prefill.first_name = getOption('prefill.billing_address[first_name]');
    prefill.last_name = getOption('prefill.billing_address[last_name]');
  }

  return prefill;
};

// formatting
export const getDisplayAmount = (amount) =>
  displayAmount(RazorpayStore.get(), amount);

/**
 * CRED wants put ads in instrument subtext.
 *
 * @param code
 * @returns {*}
 */
export function getCustomSubtextForMethod(code) {
  if (code === 'cred') {
    return getPreferences('methods.app_meta.cred.offer.description', null);
  }
  const customText = getPreferences('methods.custom_text');
  if (customText && customText[code]) {
    return customText[code];
  }
}

/**
 * Fee bearer
 */
export const isCustomerFeeBearer = () => getPreferences('fee_bearer');

export function getConvenienceFeeConfig() {
  return getPreferences('order.convenience_fee_config', null);
}

export function isDynamicFeeBearer() {
  return Boolean(getConvenienceFeeConfig());
}

export function getDynamicFeeBearerMerchantMessage() {
  return getPreferences('order.convenience_fee_config.checkout_message', '');
}

export function getSubscription() {
  return getPreferences('subscription');
}

/**
 * 1cc
 */
// Returns true if one_click_checkout is enabled on BE, passed in option and checkout is initialised using order
export const isOneClickCheckout = () =>
  getPreferences('features.one_click_checkout') &&
  getMerchantOrder()?.line_items_total &&
  getOption('one_click_checkout');

export const getPrefilledCouponCode = () => getOption('prefill.coupon_code');
