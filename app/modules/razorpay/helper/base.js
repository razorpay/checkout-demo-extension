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