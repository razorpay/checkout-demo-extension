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
  // After experiment rollout remove the hardcoded check
  const isMerchantKeyPresent = RECURRING_METHOD_RESTRICTION_KEYS.includes(
    getKey()
  );
  const isExperimentEnabled = getPreferences(
    'experiments.recurring_payment_method_configuration'
  );
  return isExperimentEnabled || isMerchantKeyPresent;
};

// Autopay QR/Intent experiment
// This Experiment is splited into two separate experiments,
// Post those rollout recurring_upi_intent_qr will be deprecated
const isRecurringQRIntentExperimentEnabled = () => {
  const allow = getPreferences('experiments.recurring_upi_intent_qr');
  return allow;
};

// Autopay Intent experiment
export const isRecurringIntentExperimentEnabled = () => {
  const isExperimentEnabled = getPreferences(
    'experiments.recurring_upi_intent'
  );
  return isExperimentEnabled || isRecurringQRIntentExperimentEnabled();
};

// Autopay QR experiment
export const isRecurringQRExperimentEnabled = () => {
  const isExperimentEnabled = getPreferences('experiments.recurring_upi_qr');
  return isExperimentEnabled || isRecurringQRIntentExperimentEnabled();
};

// Enables available PSP's on autopay intent if experiment is enabled
export const isEnableAllPSPExperimentEnabled = () => {
  const allow = getPreferences('experiments.recurring_upi_all_psp');
  return allow;
};

// return true for only recurring caw orders. Returns false for subscriptions
export function isCAW() {
  return isRecurring() && getOption('recurring');
}
