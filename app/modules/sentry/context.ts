import { getSession } from 'sessionmanager';
import { isOneClickCheckout } from 'razorpay';
import { getSavedAddresses } from 'one_click_checkout/address/store';
import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';

import type { Context } from './interfaces';

let context: Context;

/**
 * Constructs context object
 * @returns {object} the context object
 */
export function createContext(): Context {
  const session = getSession();
  const options = session.r.get();
  const customer = getCustomerDetails();

  // strip pii information
  if (options.prefill) {
    delete options.prefill;
  }

  return {
    options,
    checkout_id: session.r?.id,
    order_id: options.order_id,
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
