import { get } from 'svelte/store';
import { writable } from 'svelte/store';
import { phone } from 'checkoutstore/screens/home';
import hdfcVASDisplayConfig from '../constants/hdfcVASDisplayConfig';

import RazorpayStore, {
  getCheckoutConfig,
  getOption,
  isContactOptional,
  isHDFCVASMerchant,
  isRecurringOrPreferredPayment,
} from 'razorpay';
import * as ObjectUtils from 'utils/object';
import * as _ from 'utils/_';
import { activeRoute } from 'one_click_checkout/routing/store';
import CTAHelper from 'cta/store';
import { isMobile } from 'common/useragent';

export const showBottomElement = writable(true);
/** required for CTA */
export const screenStore = writable('');
export const tabStore = writable('');
/**
 * We are hiding account when input is focus in mobile device
 */
export const showAccountTab = writable(true);
export const isMobileStore = writable(isMobile());

function updateActiveScreen(screenStore, tabStore) {
  if (!screenStore) {
    screenStore = 'home';
  }
  if (!tabStore) {
    tabStore = 'tab';
  }
  if (screenStore === 'home-1cc') {
    tabStore = get(activeRoute).name;
  }
  CTAHelper.setActiveCTAScreen(`${screenStore}:${tabStore}`);
}

activeRoute.subscribe((route) => {
  if (get(screenStore) === 'home-1cc') {
    updateActiveScreen(get(screenStore), route);
  }
});

screenStore.subscribe((screen) => {
  updateActiveScreen(screen, get(tabStore));
});
tabStore.subscribe((tab) => {
  updateActiveScreen(get(screenStore), tab);
});

// can't move inside razorpay/helper as it consuming store
export function shouldRememberCustomer(
  method = 'card',
  skipContactOptionalCheck = false
) {
  /**
   * - For recurring due to RBI circular it's mandatory to
   *   collect explicit user consent to save card.
   * - We are already saving card details irrespective of remember
   *   customer flag.
   * - Remember Customer = consent to save card
   * - We are showing remember customer checkbox in every case for recurring
   *   payments as well as recurring=preferred payments.
   */
  if (isRecurringOrPreferredPayment()) {
    return true;
  }
  if (
    !navigator.cookieEnabled ||
    (method === 'card' && !getOption('features.cardsaving'))
  ) {
    return false;
  }

  if (!skipContactOptionalCheck && isContactOptional() && !get(phone)) {
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

export function getConfigFromOptions() {
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

  let displayFromOptions = configFromOptions?.display;

  const displayFromPreferences = ObjectUtils.get(
    configFromPreferences,
    'display'
  );
  if (isHDFCMerchant) {
    // hdfc config have highest priority for hdfc VAS merchant
    displayFromOptions = hdfcVASDisplayConfig;
  }

  // Restrictions can only come from preferences
  const restrictions = {
    config: ObjectUtils.get(configFromPreferences, 'restrictions'),
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
