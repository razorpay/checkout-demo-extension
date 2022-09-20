import { isOneClickCheckout } from './1cc';
import {
  getOption,
  getPreferences,
  isPayout,
  hasMerchantPolicy,
  getOrgDetails,
} from './base';
import { isDCCEnabled, isInternational } from './currency';
import { isRecurringOrPreferredPayment } from './recurring';

const demoMerchantKey = ['rzp_test_1DP5mmOlF5G5ag', 'rzp_live_ILgsfZCZoFIKMb'];

function isDemoMerchant() {
  const merchantKey = getOption('key') as string;
  return demoMerchantKey.includes(merchantKey);
}

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
    const allowInternational = getPreferences('experiments.cb_redesign_v1_5');
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

    if (
      (isInternational() || isDCCEnabled()) &&
      !allowInternational &&
      !isDemoMerchant()
    ) {
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
