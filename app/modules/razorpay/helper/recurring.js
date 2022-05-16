import { getOption, getPreferences } from './base';
import { getOrderMethod } from './preferences';

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
