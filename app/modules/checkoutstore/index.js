import { get } from 'svelte/store';
import { writable, derived } from 'svelte/store';
import { contact, phone } from 'checkoutstore/screens/home';
import hdfcVASDisplayConfig from 'constants/hdfcVASDisplayConfig';

import RazorpayStore, {
  getCheckoutConfig,
  getOption,
  isContactOptional,
  isHDFCVASMerchant,
  isStrictlyRecurringPayment,
} from 'razorpay/index';
import { makeAuthUrl as _makeAuthUrl } from 'common/helper';

export const makeAuthUrl = (url) => _makeAuthUrl(RazorpayStore.get(), url);

export const showFeeLabel = writable(true);

// can't move inside razorpay/helper as it consuming store
export function shouldRememberCustomer(method = 'card') {
  /**
   * - For recurring due RBI circular it's mandatory to
   *   collect explicit user consent to save card.
   * - We are already saving card details irrespective of remember
   *   customer flag.
   * - Remember Customer = consent to save card
   * - We are showing remember customer checkbox in every case for recurring
   *   payments.
   */
  if (isStrictlyRecurringPayment()) {
    return true;
  }
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
  const isHDFCMerchant = isHDFCVASMerchant();

  let displayFromOptions = _Obj.getSafely(configFromOptions, 'display');

  const displayFromPreferences = _Obj.getSafely(
    configFromPreferences,
    'display'
  );
  if (isHDFCMerchant) {
    // hdfc config have highest priority for hdfc VAS merchant
    displayFromOptions = hdfcVASDisplayConfig;
  }

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
