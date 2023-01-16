// MAKE sure this file doesn't import any other helper methods
/**
 * {module}/index.js contains the API which is exposed to other modules
 */
import RazorpayStore from '../store';
import { get } from 'utils/object';
import { displayAmount } from 'common/currency';
import type {
  Preferences,
  PreferencesObject,
} from 'razorpay/types/Preferences';
import type { Option, OptionObject } from 'razorpay/types/Options';

/**
 * Helper methods
 */
// function overload
export function getPreferences<T extends undefined | null>(
  path?: T
): PreferencesObject;
export function getPreferences<T extends keyof Preferences>(
  path: T,
  defaultValue?: Partial<Preferences[T]> | Preferences[T]
): Preferences[T];
export function getPreferences<T>(path: string, defaultValue: T): any;
export function getPreferences<T extends keyof Preferences>(
  path?: T,
  defaultValue?: Preferences[T]
): Preferences[T] | PreferencesObject {
  if (!path) {
    return RazorpayStore.preferences;
  }
  /**
   * experiments Override by Options
   */
  if (
    path.indexOf('experiments.') === 0 &&
    typeof getOption(path) !== 'undefined'
  ) {
    return getOption(path);
  }
  return get(RazorpayStore.preferences, path, defaultValue);
}

export function getOption<T extends undefined | null>(
  path?: T
): Partial<OptionObject>;
export function getOption<T extends keyof Option>(path: T): Option[T];
export function getOption<T extends string>(path: T): any;
export function getOption<T extends keyof Option>(
  path?: T
): Option[T] | Partial<OptionObject> {
  return !path
    ? RazorpayStore.triggerInstanceMethod('get')
    : RazorpayStore.get(path);
}

export const getOptionCurry = <T extends keyof Option>(
  path: T
): (() => Option[T]) => {
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
export const verifyVPA = (vpa: string) =>
  RazorpayStore.get().verifyVpa(vpa, 10000);

export const getCurrencies = (...args: any) =>
  RazorpayStore.get().getCurrencies(...args);

// formatting
export const getDisplayAmount = (amount: string) =>
  displayAmount(RazorpayStore.get(), amount);

export function isPayout() {
  return getOption('payout');
}

export const getCallbackUrl = getOptionCurry('callback_url');

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
  get(getConfigFromGetOption() as object, 'display.language');

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

export const getMerchantName = () =>
  getOption('name') ||
  getPreferences('merchant_brand_name') ||
  getPreferences('merchant_name') ||
  '';

const demoMerchantKey = ['rzp_test_1DP5mmOlF5G5ag', 'rzp_live_ILgsfZCZoFIKMb'];

export function isDemoMerchant() {
  const merchantKey = getOption('key');
  return demoMerchantKey.includes(merchantKey);
}
