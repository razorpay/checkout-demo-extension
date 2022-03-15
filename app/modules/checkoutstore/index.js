import { get } from 'svelte/store';
import { writable, derived } from 'svelte/store';

import { contact, phone } from 'checkoutstore/screens/home';

import RazorpayStore, {
  getCheckoutConfig,
  getOption,
  isOneClickCheckout,
} from 'razorpay/index';

import { makeAuthUrl as _makeAuthUrl } from 'common/helper';

let razorpayInstance, preferences;

// TODO remove this
export function setRazorpayInstance(_razorpayInstance) {
  razorpayInstance = _razorpayInstance;
  preferences = razorpayInstance.preferences;
}

export const makeAuthUrl = (url) => _makeAuthUrl(RazorpayStore.get(), url);

// @TODO return amount based on partial payment
// @TODO use everywhere instead of session.get('amount')
// @TODO start using entityWithAmount
export const getAmount = () => {
  return getOption('amount');
};
export const getName = () => {
  return getOption('name');
};

export const showFeeLabel = writable(true);

export function hasFeature(feature, fallbackValue) {
  return _Obj.getSafely(preferences, `features.${feature}`, fallbackValue);
}

export function isPayout() {
  return getOption('payout');
}

export function isBlockedDeactivated() {
  if (
    !preferences.hasOwnProperty('blocked') ||
    !preferences.hasOwnProperty('activated')
  ) {
    return false;
  }
  return preferences.blocked || !preferences.activated;
}

export function isAddressEnabled() {
  return hasFeature('customer_address', false);
}

export function isDCCEnabled() {
  return hasFeature('dcc', false);
}

export function isShowMORTncEnabled() {
  return hasFeature('show_mor_tnc', false);
}

export function isSiftJSEnabled() {
  return hasFeature('disable_sift_js', false) !== true;
}

export function isContactOptional() {
  return (preferences.optional || []).includes('contact');
}

export function isEmailOptional() {
  return (preferences.optional || []).includes('email');
}

export function getOptionalObject() {
  return {
    contact: isContactOptional(),
    email: isEmailOptional(),
  };
}

export function isContactEmailOptional() {
  return isContactOptional() && isEmailOptional();
}

export function isContactHidden() {
  return isContactOptional() && getOption('hidden.contact');
}

export function isEmailHidden() {
  return isEmailOptional() && getOption('hidden.email');
}

export function isContactEmailHidden() {
  return isContactHidden() && isEmailHidden();
}

export function isContactReadOnly() {
  return getOption('readonly.contact') && getOption('prefill.contact');
}

export function isEmailReadOnly() {
  return getOption('readonly.email') && getOption('prefill.email');
}

export function isContactEmailReadOnly() {
  return isContactReadOnly() && isEmailReadOnly();
}

export function isNameReadOnly() {
  return getOption('readonly.name') && getOption('prefill.name');
}

export function isPartialPayment() {
  return preferences.order && preferences.order.partial_payment;
}

export function isASubscription(method = null) {
  if (!preferences.subscription) {
    return false;
  }

  // return true if no method is specified. This is a subscription session
  if (!method) {
    return true;
  } else {
    return (
      preferences.subscription[method] &&
      preferences.subscription[method] !== false
    );
  }
}

export function getSubscription() {
  return preferences.subscription;
}

export function shouldRememberCustomer(method = 'card') {
  if (
    !navigator.cookieEnabled ||
    (method === 'card' && !getOption('features.cardsaving')) ||
    (isContactOptional() && !get(phone))
  ) {
    return false;
  }

  // if merchant passed options.remember_customer as true,
  // that take precedence over optional contact
  // it should not be the case
  // @TODO fix savedcard tests and remove below condition
  if (RazorpayStore.getMerchantOption('remember_customer') === true) {
    return true;
  }
  // this will pick default option
  return getOption('remember_customer');
}

export function shouldStoreCustomerInStorage() {
  const globalCustomer = preferences && preferences.global;
  const rememberCustomer = razorpayInstance.get().remember_customer;

  return globalCustomer && rememberCustomer;
}

export function shouldSeparateDebitCard() {
  return getOption('theme.debit_card');
}

export function isInternational() {
  return getOption('currency') !== 'INR';
}

export function getBanks() {
  return preferences.methods.netbanking;
}

function getConfigFromOptions() {
  if (_.isNull(getOption('config'))) {
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

export function getMerchantConfig() {
  const configFromOptions = getConfigFromOptions();
  const configFromPreferences = getCheckoutConfig();

  const displayFromOptions = _Obj.getSafely(configFromOptions, 'display');
  const displayFromPreferences = _Obj.getSafely(
    configFromPreferences,
    'display'
  );

  // Restrictions can only come from preferences
  const restrictions = {
    config: _Obj.getSafely(configFromPreferences, 'restrictions'),
    source: 'preferences',
  };

  let display = {};

  if (_.isNull(displayFromOptions)) {
    // Setting config.display as null allows you to disable the display configuration
    display = {
      config: null,
      source: 'options',
    };
  } else {
    if (
      !_.isUndefined(displayFromOptions) &&
      _.isNonNullObject(displayFromOptions) &&
      !_.isEmptyObject(displayFromOptions)
    ) {
      display = {
        config: displayFromOptions,
        source: 'options',
      };
    } else if (!_.isUndefined(displayFromPreferences)) {
      display = {
        config: displayFromPreferences,
        source: 'preferences',
      };
    }
  }

  return {
    config: {
      display: display.config,
      restrictions: restrictions.config,
    },

    sources: {
      display: display.source,
      restrictions: restrictions.source,
    },

    _raw: {
      options: configFromOptions,
      preferences: configFromPreferences,
    },
  };
}

export const isIndianCustomer = derived([contact], ([$contact]) =>
  $contact.startsWith('+91')
);

// Returns true if one_click_checkout is enabled on BE, passed in option and checkout is initialised using order
export { isOneClickCheckout };

/*
 * Return true if `raas` feature flag and `dynamic_wallet_flow` flag is enabled in preferences.
 *
 * @param {object} pref
 * @returns {boolean}
 */
export function isDynamicWalletFlow() {
  return hasFeature('raas') || preferences?.dynamic_wallet_flow;
}

export function getConvenienceFeeConfig() {
  return preferences?.order?.convenience_fee_config || null;
}

export function isDynamicFeeBearer() {
  return Boolean(getConvenienceFeeConfig());
}

export function getDynamicFeeBearerMerchantMessage() {
  return getConvenienceFeeConfig()?.checkout_message || '';
}
