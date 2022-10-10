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
 * Helper function to validate entered card if it has a cobranding enabled
 * Validate the card co_branding partner with the selected EMI provider
 * @param {CardFeatures} features
 * @param {string} bank
 * @returns {boolean}
 */
export const validateCoBrandingPartner = (
  features: CardFeatures,
  bank: string
) => {
  // If co branding partner exists
  // validate selected bank with co branding
  return features.cobranding_partner && features.cobranding_partner === bank;
};

/**
 * Helper function to check if entered card issuer is valid for emi payment
 * If the entered card has cobranding partner,
 * validate whether the cobranding partner matches the selected EMI provider
 * else validate whether the card type and issuer matches the current tab and emi provider selected
 * @param features
 * @param emiPayload
 * @returns {boolean}
 */
export const isEmiProviderInValid = (
  features: CardFeatures,
  emiPayload: EMIPayload
) => {
  // Validate Co branding partner against selected bank
  // For co-branding validation we don't want to match the issuer
  const { issuer, type, cobranding_partner } = features;
  return cobranding_partner
    ? !validateCoBrandingPartner(features, emiPayload.bank.code)
    : issuer !== emiPayload.bank.code || type !== emiPayload.tab;
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
  if (isEmiProviderInValid(features, emiPayload)) {
    // Validating card type used in the selected tab
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
