import { checkDowntime, getDowntimes } from 'checkoutframe/downtimes';
import { selectedBank } from 'emiV2/store';
import {
  providersToAvoid,
  redirectFlowEmiProviders,
  otherCardEmiProviders,
  coBrandingEmiProviders,
} from 'emiV2/constants';
import type { EmiBankPlans, EMIBANKS, EMIBanksMap } from 'emiV2/types';
import { get } from 'svelte/store';

/**
 * Helper function to check for whether a bank has only cardless emi available
 * The provider should only be a bank provider i.e hdfc, kkbk and not zestmoney
 * Using a list of providersToAvoid to verify that
 * If a bank exists in cardless providers and not in emi banks
 * Returns true
 * @returns {Boolean}
 */
export const isOnlyCardlessProvider = (
  banks: EmiBankPlans,
  provider: EMIBANKS,
  cardlessEmiProviders: EMIBanksMap
) => {
  // Since cardless emi providers are lower case
  // But emi_options contains all code in upper case
  const providerCode = provider?.code?.toUpperCase();
  if (
    provider.code &&
    providerCode &&
    !providersToAvoid.includes(provider.code) &&
    cardlessEmiProviders[provider?.code.toLowerCase()] &&
    !banks[`${providerCode}_DC`] &&
    !banks[providerCode]
  ) {
    return true;
  }
  return false;
};

export function getDownTimeForEmiBanks(bank: string) {
  const response: Downtime.Config = {
    downtimeInstrument: bank,
    severe: '',
  };

  const cardDowntimes = getDowntimes().cards;
  const currentDowntime = checkDowntime(cardDowntimes, 'issuer', bank);
  if (currentDowntime) {
    response.severe = currentDowntime as Downtime.Config['severe'];
  }
  return response;
}

/* Checks whether selected bank provider is Bajaj EMI */
export const isSelectedBankBajaj = () => {
  const code = get(selectedBank)?.code;
  if (code) {
    return code.toUpperCase() === 'BAJAJ';
  }
  return false;
};

/* Checks if the selected emi provider has the redirect flow */
export const isEmiRedirectFlow = (provider: string) => {
  return redirectFlowEmiProviders.includes(provider);
};

/**
 * Checks whether the provided code belongs to other bank providers
 * Providers which should exist in Other Emi Option and are not bank emi providers
 * Takes an optional provider as a arguement
 * Eg: bajaj, onecard etc.
 * @param {string} provider
 * @returns {boolean}
 */
export const isOtherCardEmiProvider = (provider?: string) => {
  // If we receive a provider to validate from the arguements use that
  // Else the functions checks for selected provider from the svelte store
  const code = provider || get(selectedBank)?.code;
  return code && otherCardEmiProviders.includes(code.toLowerCase());
};

/**
 * Helper function to validate whether the selected emi provider
 * is a cobranding partner emi provider like onecard
 * @param {string} provider
 * @returns {boolean}
 */
export const isCoBrandingEmiProvider = (provider: string) => {
  return coBrandingEmiProviders.includes(provider);
};
