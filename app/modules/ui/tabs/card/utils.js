import {
  hasFeature,
  getCustomSubtextForMethod,
  isStrictlyRecurringPayment,
} from 'razorpay';
import { shouldRememberCustomer } from 'checkoutstore';

import { getAppProviderSubtext } from 'i18n';

export function getAppInstrumentSubtext(provider, locale) {
  return (
    getCustomSubtextForMethod(provider) ||
    getAppProviderSubtext(provider, locale)
  );
}

export const sortBasedOnTokenization = (cards) =>
  [...cards].sort(
    (firstCard, secondCard) =>
      isCardTokenized(firstCard) - isCardTokenized(secondCard)
  );

export const isCardTokenized = (card) => Boolean(card.consent_taken);

/**
 * Check if Merchant has allow_billdesk_sihub is enabled or not
 * @returns boolean
 */
export const isSIHubEnabledMerchant = () => {
  return hasFeature('allow_billdesk_sihub', false);
};

/**
 * Show TnC based on these conditions if flag is enabled:
 *  1. currency is USD
 *  2. currency is null and country is US
 *
 * @param {string} currency
 * @param {string} country
 * @returns boolean
 */
export const shouldShowTnc = (currency, country) => {
  return (
    hasFeature('show_mor_tnc', false) &&
    (currency === 'USD' || (!currency && country === 'US'))
  );
};

export const shouldRememberCard = (isIndianCustomer) => {
  /**
   * Recurring payments will always ask for user consent
   */
  if (isStrictlyRecurringPayment()) {
    return shouldRememberCustomer();
  }
  return shouldRememberCustomer() && isIndianCustomer;
};
