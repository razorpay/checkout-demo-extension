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

//#region cards-tokenization-incentivisation
function filterTokenizationConsentPendingSavedCards(tokens) {
  return _Arr.filter(tokens, (token) => !token.consent_taken);
}

export function filterSavedCardsForTokenizationIncentiveFlow(
  tokens,
  hideAllSavedCards
) {
  // Hide all saved cards in flash checkout manage cards
  // when user tries to add a new tokenized cards
  // this is to prevent making any payment with a different saved card
  if (hideAllSavedCards) {
    return [];
  }

  // Display only non tokenized cards in flash checkout manage cards
  // when user tries to tokenize the non tokenized cards
  return filterTokenizationConsentPendingSavedCards(tokens);
}
//#endregion
