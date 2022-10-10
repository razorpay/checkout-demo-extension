import { Track } from 'analytics/base-analytics';
import { getOption, isOneClickCheckout } from 'razorpay';
import { getSavedAddresses } from 'one_click_checkout/address/store';
import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';

import type { Context } from './interfaces';

let context: Context;

/**
 * Constructs context object
 * @returns {object} the context object
 */
export function createContext(): Context {
  const options = getOption() || {};
  const customer = getCustomerDetails();

  // mask pii information
  const maskedOptions = Object.keys(options).reduce(
    (masked: Record<string, any>, key: string) => {
      const value = options[key as keyof typeof options];
      masked[key] = key.startsWith('prefill')
        ? value?.replace(/[A-Za-z0-9]/g, '*')
        : value;
      return masked;
    },
    {}
  );

  return {
    options: maskedOptions,
    checkout_id: Track.id,
    order_id: options.order_id as string,
    logged_in: !!customer?.logged,
    one_click_checkout: isOneClickCheckout(),
    has_saved_address: !!getSavedAddresses()?.length,
    has_saved_cards: !!customer?.tokens?.items?.length,
  };
}

/**
 * Consumed when we want to send error to sentry over HTTP.
 * @returns {object} the context object
 */
export function getContext(): Context {
  if (!context) {
    context = createContext();
  }

  return context;
}

/**
 * Consumed when we want to set context for sentry instance.
 * Called only once during sentry initialization.
 */
export function setContext() {
  context = createContext();

  window.Sentry.setContext('checkout', context);
}
