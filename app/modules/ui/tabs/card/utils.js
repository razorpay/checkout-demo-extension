import { getCustomSubtextForMethod } from 'razorpay';

import { isShowMORTncEnabled } from 'checkoutstore';

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
    isShowMORTncEnabled() &&
    (currency === 'USD' || (!currency && country === 'US'))
  );
};
