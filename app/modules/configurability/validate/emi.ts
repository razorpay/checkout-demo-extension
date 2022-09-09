/**
 * Checks if the instrument is valid for the emi payment
 * @param {Features} features
 * @param {Object} emiPayload EMI payload
 *
 * @returns {Promise<string>}
 */

import {
  isCurrentCardInvalidForEmi,
  isCurrentCardProviderInvalid,
} from 'checkoutstore/emi';
import type { CardFeatures, EMIPayload } from 'emiV2/types';

export const errorTypes = {
  BANK_INVALID: 'bank',
  EMI_NOT_SUPPORTED: 'emi',
};

export function isInstrumentValidForEMI(
  features: CardFeatures,
  emiPayload: EMIPayload
) {
  const { flows, issuer, type } = features;
  let errorType = '';
  if (issuer !== emiPayload.bank.code || type !== emiPayload.tab) {
    errorType = errorTypes.BANK_INVALID;
  } else if (!flows.emi) {
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
  return Promise.resolve(errorType);
}
