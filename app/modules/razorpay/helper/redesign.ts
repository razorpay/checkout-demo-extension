import { isOneClickCheckout } from './1cc';
import {
  getOption,
  getPreferences,
  isPayout,
  hasMerchantPolicy,
  getOrgDetails,
} from './base';
import { isDCCEnabled, isInternational } from './currency';
import { isHDFCVASMerchant } from './misc';
import { isRecurringOrPreferredPayment } from './recurring';
import { internetExplorer } from 'common/useragent';

const demoMerchantKey = ['rzp_test_1DP5mmOlF5G5ag', 'rzp_live_ILgsfZCZoFIKMb'];

function isDemoMerchant() {
  const merchantKey = getOption('key');
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
    const allowBankingOrg = getPreferences(
      'experiments.banking_redesign_v15'
    ) as boolean;
    const allowRecurring = getPreferences(
      'experiments.recurring_redesign_v1_5'
    );
    const { isOrgRazorpay } = getOrgDetails() || {};

    let allow = getPreferences('experiments.checkout_redesign_v1_5') as boolean;

    const isFOHEnabled = hasMerchantPolicy();
    if (isFOHEnabled) {
      allow = true;
    }
    if (typeof disableRedesignFromOption === 'boolean') {
      allow = !disableRedesignFromOption;
    }

    if (!isOrgRazorpay && !allowBankingOrg && !isHDFCVASMerchant()) {
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

    if (isRecurringOrPreferredPayment() && !allowRecurring) {
      // recurring or subscription payments
      allow = false;
    }

    if (isPayout()) {
      allow = false;
    }

    if (internetExplorer) {
      allow = false;
    }

    if (getPreferences('merchant_country') === 'MY') {
      allow = true;
    }

    return allow;
  } catch (error) {
    return false;
  }
};
