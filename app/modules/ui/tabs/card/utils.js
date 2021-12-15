import { getCustomSubtextForMethod } from 'razorpay';

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
