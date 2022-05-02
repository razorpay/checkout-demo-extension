/**
 * {module}/index.js contains the API which is exposed to other modules
 */
import RazorpayStore from './store';
import { entityWithAmount, PAYMENT_ENTITIES } from './constant';
import { displayAmount } from 'common/currency';
import { get } from 'utils/object';

/**
 * Helper methods
 */
export const getPreferences = (path, defaultValue) => {
  if (!path) return RazorpayStore.preferences;
  return get(RazorpayStore.preferences, path, defaultValue);
};

export const getOption = (path) => {
  return !path
    ? RazorpayStore.triggerInstanceMethod('get')
    : RazorpayStore.get(path);
};

const getOptionCurry = (path) => {
  return () => getOption(path);
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
export const getBanks = () => getPreferences('methods.netbanking');

/**
 * Recurring related helper function
 */
export const getRecurringMethods = () => getPreferences('methods.recurring');

export function getSubscription() {
  return getPreferences('subscription');
}
export function isRecurring() {
  if (getOrderMethod() === 'emandate' && getRecurringMethods()) {
    return true;
  }
  return getPreferences('subscription') || getOption('recurring');
}
export function isStrictlyRecurring() {
  return isRecurring() && getOption('recurring') !== 'preferred';
}
export function isSubscription() {
  return isRecurring() && getPreferences('subscription');
}

export function isASubscription(method = null) {
  if (!getPreferences('subscription')) {
    return false;
  }

  // return true if no method is specified. This is a subscription session
  if (!method) {
    return true;
  } else {
    const preferences = getPreferences();
    return (
      preferences.subscription[method] &&
      preferences.subscription[method] !== false
    );
  }
}

/**
 * Customer related
 */

export function shouldStoreCustomerInStorage() {
  const globalCustomer = getPreferences('global');
  const rememberCustomer = getMerchantOption('remember_customer');

  return globalCustomer && rememberCustomer;
}

export function isAddressEnabled() {
  return hasFeature('customer_address', false);
}

/**
 * Offers related helper function
 */
export const getMerchantOffers = () => {
  // Ignore all offers ( including forced offers ) in case of partial payments.
  if (isPartialPayment()) {
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

export function isPayout() {
  return getOption('payout');
}

export const getCallbackUrl = getOptionCurry('callback_url');

/** currency related */
export const getCurrency = () => {
  const entityWithAmountData =
    entityWithAmount.find((entity) => getPreferences(entity)) || {};
  return entityWithAmountData?.currency || getOption('currency');
};

export function isInternational() {
  return getOption('currency') !== 'INR';
}

export function isDCCEnabled() {
  return hasFeature('dcc', false);
}

/** end of currency related fn */

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
 * // set orderid as it is required while creating payments
 * // if invoice then pick order Id from preference else from option
 */
export const getOrderId = () =>
  getPreferences('invoice.order_id') || getOption('order_id');

export const isInvoicePayment = () => !!getPreferences('invoice');

/**
 * Determines the payment entity used in current checkout
 * @returns {PAYMENT_ENTITIES|null}
 */
export const getPaymentEntity = () => {
  if (isInvoicePayment()) {
    return PAYMENT_ENTITIES.INVOICE;
  }
  if (isSubscription()) {
    return PAYMENT_ENTITIES.SUBSCRIPTION;
  }
  if (getMerchantOrder()) {
    return PAYMENT_ENTITIES.ORDER;
  }
  return null;
};

/**
 * prefill related
 */
export const getPrefilledContact = getOptionCurry('prefill.contact');
export const getPrefilledEmail = getOptionCurry('prefill.email');
export const getPrefilledName = getOptionCurry('prefill.name');
export const getPrefilledCardNumber = getOptionCurry('prefill.card[number]');
export const getPrefilledVPA = getOptionCurry('prefill.vpa');

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

// @TODO return amount based on partial payment
// @TODO use everywhere instead of session.get('amount')
// @TODO start using entityWithAmount
export const getAmount = () => {
  return getOption('amount');
};
export const getName = () => {
  return getOption('name');
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

/**
 * 1cc
 */
// Returns true if one_click_checkout is enabled on BE, passed in option and checkout is initialised using order
export const isOneClickCheckout = () =>
  getPreferences('features.one_click_checkout') &&
  getMerchantOrder()?.line_items_total &&
  getOption('one_click_checkout');

export const getPrefilledCouponCode = () => getOption('prefill.coupon_code');

export const isGoogleAnalyticsEnabled = () =>
  getPreferences('features.one_cc_ga_analytics') ||
  getOption('enable_ga_analytics');

export const isFacebookAnalyticsEnabled = () =>
  getPreferences('features.one_cc_fb_analytics') ||
  getOption('enable_fb_analytics');

export const getCustomerCart = () => getOption('customer_cart');

export const getMerchantName = () => getOption('name');

export const isCodEnabled = () =>
  getPreferences('preferences.methods.cod') || false;

/** misc */

export function isBlockedDeactivated() {
  const preferences = getPreferences();
  if (
    !preferences.hasOwnProperty('blocked') ||
    !preferences.hasOwnProperty('activated')
  ) {
    return false;
  }
  return preferences.blocked || !preferences.activated;
}

export function isHDFCVASMerchant() {
  return hasFeature('hdfc_checkout_2', false);
}
