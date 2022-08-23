// MAKE sure this file doesn't import any other helper methods
/**
 * {module}/index.js contains the API which is exposed to other modules
 */
import RazorpayStore from '../store';
import { get } from 'utils/object';
import { displayAmount } from 'common/currency';

/**
 * Helper methods
 */
export const getPreferences = (path, defaultValue) => {
  if (!path) {
    return RazorpayStore.preferences;
  }
  return get(RazorpayStore.preferences, path, defaultValue);
};

export const getOption = (path) => {
  return !path
    ? RazorpayStore.triggerInstanceMethod('get')
    : RazorpayStore.get(path);
};

export const getOptionCurry = (path) => {
  return () => getOption(path);
};

export const setOption = RazorpayStore.set;

export const getMerchantOption = RazorpayStore.getMerchantOption;

export const isIRCTC = RazorpayStore.isIRCTC;

export const getCardFeatures = RazorpayStore.getCardFeatures;

/**
 * set a timeout of 10s, if the API is taking > 10s to resolve;
 * proceed regardless of verification
 */
export const verifyVPA = (vpa) => RazorpayStore.get().verifyVpa(vpa, 10000);

export const getCurrencies = (...args) =>
  RazorpayStore.get().getCurrencies(...args);

// formatting
export const getDisplayAmount = (amount) =>
  displayAmount(RazorpayStore.get(), amount);

export function isPayout() {
  return getOption('payout');
}

export const getCallbackUrl = getOptionCurry('callback_url');

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
 * language code
 */
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

export const getLanguageCodeFromPrefs = () => getPreferences('language_code');
export const getLanguageCodeFromOptions = () =>
  get(getConfigFromGetOption(), 'display.language');

export const getLanguageCode = () =>
  getLanguageCodeFromOptions() || getLanguageCodeFromPrefs();

export const getName = () => {
  return getOption('name');
};

// @TODO return amount based on partial payment
// @TODO use everywhere instead of session.get('amount')
// @TODO start using entityWithAmount
export const getAmount = () => {
  return getOption('amount');
};

/**
 * Get merchant key by looking into
 * 1. getPreferences('merchant_key') for other cases where keyless auth is performed
 * 2. getOption('key') - default scenario where merchant also passes the key
 */
export const getKey = () => getPreferences('merchant_key') || getOption('key');

export function hasMerchantPolicy() {
  try {
    const merchantPolicy = getPreferences('merchant_policy');
    if (
      merchantPolicy &&
      Object.keys(merchantPolicy).length > 0 &&
      merchantPolicy.url &&
      merchantPolicy.display_name
    ) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export const getCheckoutConfig = () => getPreferences('checkout_config');
export const getOrgDetails = () => getPreferences('org');

export const isEmbedded = () => RazorpayStore.isEmbedded;
