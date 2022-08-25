import { isOneClickCheckout } from './1cc';
import {
  getOption,
  getPreferences,
  isPayout,
  hasMerchantPolicy,
  getOrgDetails,
} from './base';
import { isInternational, isDCCEnabled } from './currency';
import { isRecurringOrPreferredPayment } from './recurring';

/**
 * Enable redesign for
 * MileStone #1 Core flow
 * Milestone #2 DFB + Partial Payments + TPV flows
 *
 * Disable for
 * Milestone #3 International Payments
 * Milestone #4 Recurring Payments
 * Milestone $5 Payouts
 */
export const isRedesignV15 = (): boolean => {
  try {
    if (isOneClickCheckout()) {
      return true;
    }
    const disableRedesignFromOption = getOption('disable_redesign_v15');
    const razorpayInternalApp = getOption('_.integration');
    let allow = getPreferences('experiments.checkout_redesign_v1_5');
    const { isOrgRazorpay } = getOrgDetails() || {};

    const isFOHEnabled = hasMerchantPolicy();
    if (isFOHEnabled) {
      allow = true;
    }
    if (typeof disableRedesignFromOption === 'boolean') {
      allow = !disableRedesignFromOption;
    }

    if (!isOrgRazorpay) {
      allow = false;
    }

    // for internal app
    if (
      razorpayInternalApp &&
      (razorpayInternalApp === 'payment_links' ||
        razorpayInternalApp === 'payment_button')
    ) {
      allow = false;
    }
    if (isInternational() || isDCCEnabled()) {
      // MCC flow - international
      allow = false;
    }
    if (isRecurringOrPreferredPayment()) {
      // recurring or subscription payments
      allow = false;
    }
    if (isPayout()) {
      allow = false;
    }

    return allow;
  } catch (error) {
    return false;
  }
};
