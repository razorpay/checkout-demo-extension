import { checkDowntime, getDowntimes } from 'checkoutframe/downtimes';
import { selectedBank } from 'emiV2/store';
import { providersToAvoid } from 'emiV2/constants';
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