import { RECURRING_METHOD_RESTRICTION_KEYS } from 'razorpay/constant';
import { getKey, getOption, getPreferences } from './base';
import { getOrderMethod } from './preferences';

/**
 * Recurring related helper function
 */
export const getRecurringMethods = () => getPreferences('methods.recurring');

export function getSubscription() {
  return getPreferences('subscription');
}
export function isRecurring(): boolean {
  if (getOrderMethod() === 'emandate' && getRecurringMethods()) {
    return true;
  }
  return getPreferences('subscription') || getOption('recurring');
}
export function isStrictlyRecurring() {
  return isRecurring() && getOption('recurring') !== 'preferred';
}
export function isSubscription(): boolean {
  return isRecurring() && getPreferences('subscription');
}

export function isRecurringOrPreferredPayment() {
  return isRecurring() || isSubscription();
}

export function isASubscription(method = null): boolean {
  if (!getPreferences('subscription')) {
    return false;
  }

  // return true if no method is specified. This is a subscription session
  if (!method) {
    return true;
  }
  const preferences = getPreferences();
  return (
    preferences.subscription[method] &&
    preferences.subscription[method] !== false
  );
}

export const isMethodRestrictionEnabledForMerchant = () => {
  return RECURRING_METHOD_RESTRICTION_KEYS.includes(getKey());
};
// return true for only recurring caw orders. Returns false for subscriptions
export function isCAW() {
  return isRecurring() && getOption('recurring');
}
