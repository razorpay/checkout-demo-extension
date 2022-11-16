import { getCardlessEMIProviders } from 'checkoutstore/methods';
import { createProvider } from 'common/cardlessemi';
import { bankMap, getEligibleBanksBasedOnMinAmount } from 'common/emi';
import { getMerchantMethods } from 'razorpay';
import { getAmount } from 'ui/components/MainModal/helper';
import { getCardlessEmiProviderName, getLongBankName } from 'i18n';
import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';
import RazorpayConfig from 'common/RazorpayConfig';
import { getEMIStartingAt, isNoCostEMI } from './label';
import type {
  Instrument,
  EMIBankList,
  EMIBanksMap,
  CardlessEmiProviders,
  EMIBANKS,
  DebitCardlessProvidersMap,
  EmiOptions,
  CardlessEmiProvidersList,
  EmiPlanObject,
  EmiBankPlans,
} from 'emiV2/types';

import { bankSortOrder, otherEMIOptionsSortOrder } from 'emiV2/constants';
import * as ObjectUtils from 'utils/object';
import { capture, SEVERITY_LEVELS } from 'error-service';
import {
  filterCardlessProvidersAgainstCustomBlock,
  filterEmiBanksAgainstCustomBlock,
  hideRestrictedProviders,
  isEmiMethodHidden,
  filterHiddenEmiProviders,
} from './configurability';
import {
  getDownTimeForEmiBanks,
  isOnlyCardlessProvider,
  isOtherCardEmiProvider,
} from './helper';

const cdnUrl = RazorpayConfig.cdn;

/**
 * Get available emi banks from preferences
 * Returns the list of banks along with their emi plans based on the minimum amount
 * @param amount
 * @returns {EmiBankPlans}
 */
const getEmiBanksAvailable = (amount: number): EmiBankPlans => {
  const emiOptions: EmiOptions = getMerchantMethods().emi_options;
  const banks: EmiBankPlans = getEligibleBanksBasedOnMinAmount(
    amount || Number(getAmount()),
    emiOptions
  ) as EmiBankPlans;

  return banks;
};

/**
 * Returns _all_ Cardless EMI providers
 *
 * @returns {Array<Provider>}
 */

export function getAllProviders(amount: number, instrument: Instrument) {
  try {
    const providers: EMIBankList = [];
    // Since we need to show Starting from label for onecard
    // we need to have emi plans available for onecard to find the minimum interest rate
    const banks: EmiBankPlans = getEmiBanksAvailable(amount);
    ObjectUtils.loop(
      getCardlessEMIProviders(),
      (providerObj: CardlessEmiProviders) => {
        // if it's a bank emi ignore it and is not bajaj
        const providerCode: string = providerObj.code.toUpperCase();
        const emiBanks: EMIBanksMap = bankMap;
        const currentLocale: string = get(locale) as string;
        if (!emiBanks[providerCode] || isOtherCardEmiProvider(providerCode)) {
          const provider: EMIBANKS = {
            ...createProvider(providerObj.code, providerObj),
            code: providerObj.code,
            name: getCardlessEmiProviderName(providerObj.code, currentLocale),
            method: isOtherCardEmiProvider(providerCode)
              ? 'emi'
              : 'cardless_emi',
            isNoCostEMI:
              isBajaj(providerCode) && isNoCostEMI(amount, providerCode),
          };
          // If code is onecard use the logo as onecard.png
          // Need to show the emi starting at value as well
          // Set the credit EMI to true since One Card is CC EMI
          if (provider.code === 'onecard') {
            provider.icon = `${RazorpayConfig.cdn}cardless_emi-sq/onecard.png`;
            provider.creditEmi = true;
            provider.startingFrom = getEMIStartingAt(banks[provider.code]);
          }
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
      filterCardlessProvidersAgainstCustomBlock(sortedProviders, instrument);

    return hideRestrictedProviders(filteredCardlessProviders);
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
export const isDebitEmiProvider = (bank: string) => {
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
  const cardlessProviders: CardlessEmiProvidersList =
    getCardlessEMIProviders() as CardlessEmiProvidersList;

  const bankEMIOptions: EMIBanksMap = {};
  const banks: EmiBankPlans = getEmiBanksAvailable(amount);

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
        // If only it's a bank emi we will append to list
        // Avoiding Bajaj and onecard emi providers
        if (
          emiOptions[bankCode] &&
          !isOtherCardEmiProvider(bankCode) &&
          banks[bankCode]
        ) {
          const plans: EmiPlanObject = banks[bankCode];
          const currentLocale: string = get(locale) as string;
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
            debitCardlessConfig: isDebitEmiProvider(commonBankName),
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
        if (
          isOnlyCardlessProvider(banks, bank, cardlessProviders) &&
          !isEmiMethodHidden('cardless_emi')
        ) {
          const transformedBankCode: string = bank.code.toUpperCase();
          const currentLocale: string = get(locale) as string;
          bankEMIOptionsList.push({
            code: transformedBankCode,
            name: getLongBankName(
              transformedBankCode,
              currentLocale,
              bank.name
            ),
            isCardless: true,
            icon: `${cdnUrl}bank/${transformedBankCode}.gif`,
            debitCardlessConfig: isDebitEmiProvider(transformedBankCode),
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
    let filteredBanks: EMIBankList = filterEmiBanksAgainstCustomBlock({
      emiBankList: sortedBankOptions,
      instrument,
      emiBanksProviders: banks,
      cardlessEmiProviders: cardlessProviders,
    });

    // Filter out emi providers based on the hide config passed
    // if cardless method is hidden -> hide cardless emi tab from the bank
    // if emi method is hidden -> hide credit/debit tabs from the bank
    filteredBanks = filterHiddenEmiProviders(filteredBanks);
    return filteredBanks;
  } catch (e: any) {
    capture(e.message, { severity: SEVERITY_LEVELS.S2, unhandled: true });
    return [];
  }
}

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
