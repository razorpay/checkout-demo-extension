import {
  getCardlessEMIProviders,
  isMethodEnabled,
} from 'checkoutstore/methods';
import { createProvider } from 'common/cardlessemi';
import { bankMap, getEligibleBanksBasedOnMinAmount } from 'common/emi';
import { getSavedCards, transform } from 'common/token';
import { getMerchantMethods, isRecurring } from 'razorpay';
import { getSession } from 'sessionmanager';
import { getAmount } from 'ui/components/MainModal/helper';
import { checkDowntime, getDowntimes } from 'checkoutframe/downtimes';
import { addDowntimesToSavedCards } from 'common/card';
import { getCardlessEmiProviderName, getLongBankName } from 'i18n';
import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';
import RazorpayConfig from 'common/RazorpayConfig';
import { getEMIStartingAt, isNoCostEMI } from './label';
import type {
  Instrument,
  Tokens,
  EMIBankList,
  EMIBanksMap,
  CardlessEmiProviders,
  EMIBANKS,
  InstrumentConfig,
  DebitCardlessProvidersMap,
  EmiOptions,
  CardlessEmiProvidersList,
  EmiPlanObject,
  Customer,
  EmiBankPlans,
} from 'emiV2/types';

import {
  bankSortOrder,
  otherEMIOptionsSortOrder,
  providersToAvoid,
} from 'emiV2/constants';
import { selectedBank } from 'checkoutstore/screens/emi';
import * as ObjectUtils from 'utils/object';
import { capture, SEVERITY_LEVELS } from 'error-service';

const cdnUrl = RazorpayConfig.cdn;

/**
 * Returns _all_ Cardless EMI providers
 *
 * @returns {Array<Provider>}
 */

export function getAllProviders(amount: number, instrument: Instrument) {
  try {
    const providers: EMIBankList = [];
    ObjectUtils.loop(
      getCardlessEMIProviders(amount),
      (providerObj: CardlessEmiProviders) => {
        // if it's a bank emi ignore it and is not bajaj
        const providerCode: string = providerObj.code.toUpperCase();
        const emiBanks: EMIBanksMap = bankMap;
        const currentLocale: string = get(locale);
        if (!emiBanks[providerCode] || isBajaj(providerCode)) {
          const provider: EMIBANKS = {
            ...createProvider(providerObj.code, providerObj),
            code: providerObj.code,
            name: getCardlessEmiProviderName(providerObj.code, currentLocale),
            method: isBajaj(providerCode) ? 'emi' : 'cardless_emi',
            isNoCostEMI:
              isBajaj(providerCode) && isNoCostEMI(amount, providerCode),
          };
          if (providerObj.pushToFirst) {
            // higher priority then cardemi
            providers.unshift(provider);
          } else {
            providers.push(provider);
          }
        }
      }
    );
    const sortedProviders: EMIBankList = applyCustomSort(
      providers,
      otherEMIOptionsSortOrder
    );

    const filteredCardlessProviders: EMIBankList =
      filterCardlessAgainstInstrument(sortedProviders, instrument);
    return filteredCardlessProviders;
  } catch (e: any) {
    capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
    return [];
  }
}

/* Checks whether passed provider is Bajaj EMI */
export const isBajaj = (providerCode?: string) => {
  const code = providerCode;
  if (code) {
    return code.toUpperCase() === 'BAJAJ';
  }
  return false;
};

/* Checks whether selected bank provider is Bajaj EMI */
export const isSelectedBankBajaj = () => {
  const code = get(selectedBank)?.code;
  if (code) {
    return code.toUpperCase() === 'BAJAJ';
  }
  return false;
};

export const sortBankByName = (banks: EMIBankList) => {
  let sortedBanks = ObjectUtils.clone(banks);
  sortedBanks = sortedBanks.sort((a: EMIBANKS, b: EMIBANKS) => {
    return a.name.localeCompare(b.name);
  });
  return sortedBanks;
};

/*
  Helper function to sort the bank list in custom order
*/
const applyCustomSort = (arrayToSort: EMIBankList, order: string[]) => {
  const orderForIndexVals = order.slice(0).reverse();
  return arrayToSort.sort((a, b) => {
    const aIndex = -orderForIndexVals.indexOf(a?.code || '');
    const bIndex = -orderForIndexVals.indexOf(b?.code || '');
    return aIndex - bIndex;
  });
};

/**
 * Helper function to check for whether a bank has only cardless emi available
 * The provider should only be a bank provider i.e hdfc, kkbk and not zestmoney
 * Using a list of providersToAvoid to verify that
 * If a bank exists in cardless providers and not in emi banks
 * Returns true
 * @returns {Boolean}
 */
const isOnlyCardlessProvider = (
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

/**
 * Helper function to get the list of instacred EMI providers
 * Return Array
 */
export const getDebitCardlessProviders = () => {
  const customEMIProviders = getMerchantMethods().custom_providers;
  if (customEMIProviders) {
    const debitEmiProvides = customEMIProviders.debit_emi_providers;
    return debitEmiProvides;
  }
  return {};
};

/**
 * Helper function to check if selected bank supports Instacred emi
 * Checks the custome_providers key from preferences
 * If bank is present in debit_emi_providers =>
 * return the bank & config
 * Note: This config is used to check whether debit&cardless tab should be shown or not
 */
export const isInstaCredEMIProvider = (bank: string) => {
  const debitCardlessProviders: DebitCardlessProvidersMap =
    getDebitCardlessProviders();
  if (debitCardlessProviders && debitCardlessProviders[bank]) {
    return debitCardlessProviders[bank];
  }
  return null;
};

/**
 * Returns All the bank emi options available
 * Check the emibanks list and uses emi_options from preferences to check whether bank has credit, debit or cardless emi available
 *
 * @returns {Array<bankEMIOPtions>}
 */
export function getBankEmiOptions(amount: number, instrument: Instrument) {
  const emiOptions: EmiOptions = getMerchantMethods().emi_options;
  const cardlessProviders: CardlessEmiProvidersList = getCardlessEMIProviders(
    amount
  ) as CardlessEmiProvidersList;

  const bankEMIOptions: EMIBanksMap = {};
  const banks: EmiBankPlans = getEligibleBanksBasedOnMinAmount(
    amount || Number(getAmount()),
    emiOptions
  ) as EmiBankPlans;

  try {
    // if emi banks are not present and no banks is present in cardless providers
    // we return empty array
    if (!Object.keys(banks).length && !Object.keys(cardlessProviders).length) {
      return [];
    }

    let bankEMIOptionsList: EMIBankList = [];

    if (Object.keys(banks).length) {
      // logic to filter which all banks are available for emi
      ObjectUtils.loop(bankMap, (bankObj: EMIBANKS, bankCode: string) => {
        // bank code restricted to 4 characters to make a single entry for multiple bank options
        // Cases like HDFC_DC and HDFC should be treated as HDFC
        const commonBankName: string = bankCode.slice(0, 4);
        if (emiOptions[bankCode] && !isBajaj(bankCode) && banks[bankCode]) {
          const plans: EmiPlanObject = banks[bankCode];
          const currentLocale: string = get(locale);
          bankEMIOptions[commonBankName] = {
            code: commonBankName,
            name: getLongBankName(commonBankName, currentLocale, bankObj.name),
            debitEmi: Boolean(banks[`${commonBankName}_DC`]),
            creditEmi: Boolean(banks[commonBankName]),
            isCardless: Boolean(
              cardlessProviders[commonBankName.toLowerCase()]
            ),
            isNoCostEMI: isNoCostEMI(amount, commonBankName),
            startingFrom: getEMIStartingAt(plans),
            icon: `${cdnUrl}bank/${commonBankName}.gif`,
            downtimeConfig: getDownTimeForEmiBanks(commonBankName),
            debitCardlessConfig: isInstaCredEMIProvider(commonBankName),
            method: 'emi',
          };
        }
      });
      bankEMIOptionsList = Object.values(bankEMIOptions || {});
    }

    // For banks like Federal bank which are present in cardless emis
    // But not present in emi banks
    // we need to manually add those to bank list and not cardless list
    if (Object.keys(cardlessProviders).length) {
      ObjectUtils.loop(cardlessProviders, (bank: CardlessEmiProviders) => {
        if (isOnlyCardlessProvider(banks, bank, cardlessProviders)) {
          const transformedBankCode: string = bank.code.toUpperCase();
          const currentLocale: string = get(locale);
          bankEMIOptionsList.push({
            code: transformedBankCode,
            name: getLongBankName(
              transformedBankCode,
              currentLocale,
              bank.name
            ),
            isCardless: true,
            icon: `${cdnUrl}bank/${transformedBankCode}.gif`,
            debitCardlessConfig: isInstaCredEMIProvider(transformedBankCode),
            method: 'cardless_emi',
          });
        }
      });
    }

    const sortedBankOptions: EMIBankList = applyCustomSort(
      bankEMIOptionsList,
      bankSortOrder
    );
    // Filter against bank instruments from custom block
    const filteredBanks: EMIBankList = filterBanksAgainstInstrument({
      emiBankList: sortedBankOptions,
      instrument,
      emiBanksProviders: banks,
      cardlessEmiProviders: cardlessProviders,
    });
    return filteredBanks;
  } catch (e: any) {
    capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
    return [];
  }
}

export const filterCardlessAgainstInstrument = (
  providers: EMIBankList,
  instrument: Instrument
): EMIBankList => {
  if (!instrument) {
    return providers;
  }

  // If custom block is of emi method we need to show only bajaj emi
  // Since it's a card emi and rest are cardless
  if (instrument.method === 'emi') {
    return providers.filter((bank) => {
      return bank.code === 'bajaj';
    });
  }

  // If it's a cardless emi block we need to filter out bajaj
  // as well as filter out providers list
  if (instrument.method === 'cardless_emi') {
    return providers.filter((bank) => {
      const hasProviders = Boolean(instrument.providers);
      const cardlessProviders = instrument.providers || [];
      // If there are no providers present match all the providers
      const issuerMatches =
        hasProviders && bank.code
          ? cardlessProviders.includes(bank.code.toLowerCase())
          : true;
      return issuerMatches && bank.code !== 'bajaj';
    });
  }

  return providers;
};

export const filterBanksAgainstInstrument = (
  config: InstrumentConfig
): EMIBankList => {
  const { instrument, emiBankList, emiBanksProviders, cardlessEmiProviders } =
    config;
  if (!config.instrument) {
    return emiBankList;
  }
  /** If the selected instrument is a emi block
   * filter out providers that only have cardless emi option from the bank
   */
  if (instrument.method === 'emi') {
    return emiBankList.filter((bank: EMIBANKS) => {
      const hasIssuers = Boolean(instrument.issuers);
      const issuers = instrument.issuers || [];
      // If there are no issuers present match all the issuers
      const issuerMatches =
        hasIssuers && bank.code ? issuers.includes(bank.code) : true;
      return (
        issuerMatches &&
        !isOnlyCardlessProvider(emiBanksProviders, bank, cardlessEmiProviders)
      );
    });
  }

  /** If the selected instrument is a cardless emi block
   * filter out providers that only have debit or credit emi option from the bank
   */
  if (instrument.method === 'cardless_emi') {
    const filtered: EMIBankList = emiBankList.filter((bank: EMIBANKS) => {
      const hasProviders = Boolean(instrument.providers);
      const cardlessProviders = instrument.providers || [];
      // If there are no providers present match all the providers
      const issuerMatches =
        hasProviders && bank.code
          ? cardlessProviders.includes(bank.code.toLowerCase())
          : true;
      // Filter out the banks that only have credit and debit emi
      const providerOnlySupportCardEMi =
        !bank.isCardless && (bank.creditEmi || bank.debitEmi);
      return !providerOnlySupportCardEMi && issuerMatches;
    });
    return filtered;
  }

  return emiBankList;
};

/**
 * Returns a JSON of bank and other emi options
 * Bank Emi options contains all emi supported banks
 * Other Emi options contains cardless and bajaj emi options
 */
export function getBankAndOtherEMIOptions(
  amount: number,
  instrument: Instrument
) {
  const bankEMIOptions: EMIBankList = getBankEmiOptions(amount, instrument);
  const otherEMIOptions: EMIBankList = getAllProviders(amount, instrument);

  return {
    bank: bankEMIOptions,
    other: otherEMIOptions,
  };
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
      } else if (a.card.emi) {
        return 1;
      } else if (b.card.emi) {
        return -1;
      }
    }
    return 0;
  });

  const transformed = transformTokens(tokenList);
  const cardDowntimes = getDowntimes().cards;
  return addDowntimesToSavedCards(transformed, cardDowntimes);
}

// Function to filter out saved cards if user is coming from custom EMI block
export function filterSavedCardsAgainstInstrument(
  tokens: Tokens[],
  instrument: Instrument
) {
  // Sanity check
  if (!instrument) {
    return tokens;
  }

  // If user is coming from cardless emi block hide the saved cards
  if (instrument.method !== 'emi') {
    return [];
  }

  const eligibleTokens = tokens.filter((token: Tokens) => {
    const hasIssuers = Boolean(instrument.issuers);
    const hasNetworks = Boolean(instrument.networks);

    const hasIins = Boolean(instrument.iins);
    const issuers: string[] = instrument.issuers || [];
    const networks: string[] = instrument.networks || [];

    let hasTypes = Boolean(instrument.types);
    let types = instrument.types || [];
    if (instrument?.method?.includes('_card')) {
      //credit_card, debit_card
      hasTypes = true;
      // adds ['credit'] for credit and ['debit'] for debit
      types = [instrument.method.split('_')[0]];
    }

    // We don't have IIN for a saved card. So if we're requested to support only specific IINs, we can't show saved cards
    if (hasIins) {
      return false;
    }

    // If there is no issuer present, it means match all issuers.
    const issuerMatches = hasIssuers
      ? issuers.includes(token.card.issuer)
      : true;

    const networkMatches = hasNetworks
      ? networks.includes(token.card.network)
      : true;

    const typeMatches = hasTypes ? types.includes(token.card.type) : true;

    return issuerMatches && networkMatches && typeMatches;
  });
  return eligibleTokens;
}

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
