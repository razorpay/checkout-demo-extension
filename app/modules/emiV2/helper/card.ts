import { selectedCard } from 'checkoutstore/screens/card';
import type { Tokens, CardFeatures, EMIPayload, Customer } from 'emiV2/types';
import { get } from 'svelte/store';
import {
  isCurrentCardInvalidForEmi,
  isCurrentCardProviderInvalid,
} from 'emiV2/store';
import { getSession } from 'sessionmanager';
import { getSavedCards, transform } from 'common/token';
import { isMethodEnabled } from 'checkoutstore/methods';
import { isRecurring } from 'razorpay';
import { getDowntimes } from 'checkoutframe/downtimes';
import { addDowntimesToSavedCards } from 'common/card';

// Helper function to get the saved card
export const getSelectedSavedCard = (): Tokens | null => {
  const selectedSavedCard: Tokens | null = get(selectedCard);
  if (selectedSavedCard) {
    return selectedSavedCard;
  }
  return null;
};

export const errorTypes = {
  BANK_INVALID: 'bank',
  EMI_NOT_SUPPORTED: 'emi',
};

/**
 * Checks if the instrument is valid for the emi payment
 * @param {Features} features
 * @param {EMIPayload} emiPayload EMI payload
 *
 * @returns {string}
 */
export function isInstrumentValidForEMI(
  features: CardFeatures,
  emiPayload: EMIPayload
) {
  const { flows, issuer, type } = features;
  let errorType = '';
  // Validating card type used in the selected tab
  if (issuer !== emiPayload.bank.code || type !== emiPayload.tab) {
    errorType = errorTypes.BANK_INVALID;
  } else if (!flows.emi) {
    // Validating if emi is enabled on the card
    errorType = errorTypes.EMI_NOT_SUPPORTED;
  }
  // If card is valid but emi is not supported
  // we show different error message and CTA is Pay Via EMI
  if (errorType === 'emi') {
    isCurrentCardInvalidForEmi.set(true);
  } else if (errorType === 'bank') {
    // if selected bank does not match with the card bank
    // we show the CTA as Try another EMI option
    isCurrentCardProviderInvalid.set(true);
  } else {
    // Else both provider and emi is valid for the entered card
    isCurrentCardInvalidForEmi.set(false);
    isCurrentCardProviderInvalid.set(false);
  }
  return errorType;
}

/* Filter EMI enabled cards from saved cards */
function transformTokens(tokens: Tokens[]) {
  const session = getSession();
  return transform(tokens, {
    amount: session.get('amount'),
    emi: isMethodEnabled('emi'),
    recurring: isRecurring(),
  });
}

/* Get Saved Cards for EMI */
export function getSavedCardsForEMI(customer: Customer) {
  if (!customer.tokens) {
    return [];
  }
  let tokenList: Tokens[] = getSavedCards(customer.tokens.items);

  tokenList = tokenList.slice().sort((a, b) => {
    if (a.card && b.card) {
      if (a.card.emi && b.card.emi) {
        return 0;
      }
      if (a.card.emi) {
        return 1;
      }
      if (b.card.emi) {
        return -1;
      }
    }
    return 0;
  });

  const transformed = transformTokens(tokenList);
  const cardDowntimes = getDowntimes().cards;
  return addDowntimesToSavedCards(transformed, cardDowntimes);
}
