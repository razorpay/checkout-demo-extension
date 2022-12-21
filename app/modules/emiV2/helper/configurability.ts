import { hiddenMethods as HiddenMethodsStore } from 'checkoutstore/screens/home';
import type {
  EMIBankList,
  EMIBANKS,
  EmiMethod,
  Instrument,
  InstrumentConfig,
  Tokens,
} from 'emiV2/types';
import { get } from 'svelte/store';
import { isOnlyCardlessProvider, isOtherCardEmiProvider } from './helper';

/**
 * Filter Cardless emi providers against custom block selected
 * if the user is coming from a custom config block
 * the function filters out the cardless emi providers based on the config supplied
 * bank emi providers will not be shown in case the user is coming from a cardless emi config block
 * @param {EMIBankList} providers
 * @param {Instrument} instrument
 * @returns
 */
export const filterCardlessProvidersAgainstCustomBlock = (
  providers: EMIBankList,
  instrument: Instrument
): EMIBankList => {
  if (!instrument) {
    return providers;
  }

  // If custom block is of emi method we need to
  // show card emi providers like bajaj and onecard
  // in other emi options list
  // Since they are card emi and rest are cardless
  if (instrument.method === 'emi') {
    const issuers = instrument.issuers;
    const cobranded_partners = instrument.cobranded_partners;
    const providerFilteredByIssuer = providers.filter((bank) => {
      // If there are no issuers/cobranding partners present
      // match only card emi providers like onecard,bajaj etc
      // If cobranding/issuer is associated with the instrument match the current provider
      // with co branding partner/issuer respectively
      const issuerMatches =
        issuers || cobranded_partners
          ? issuers?.includes(bank.code) ||
            cobranded_partners?.includes(bank.code)
          : isOtherCardEmiProvider(bank.code);

      return issuerMatches;
    });

    return providerFilteredByIssuer;
  }

  // If it's a cardless emi block we need to filter out
  // card providers like bajaj, onecard etc
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
      return issuerMatches && !isOtherCardEmiProvider(bank.code);
    });
  }

  return providers;
};

/**
 * Filter Bank EMI providers against custom config block
 * if the user is coming from a custom config block
 * the function filters out the bank providers based on the config supplied
 * the function matches the issuers present if any and filters out the list bank emi issuers
 * that were passed in the config
 * @param {InstrumentConfig} config
 * @returns
 */
export const filterEmiBanksAgainstCustomBlock = (
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
      const hasCoBranding = Boolean(instrument.cobranded_partners);
      const issuers = instrument.issuers || [];
      // If there are no issuers present match all the issuers
      let issuerMatches =
        hasIssuers && bank.code ? issuers.includes(bank.code) : true;

      // If co-branding config is there we need to filter out only co-branding emi providers
      // As we will map the card issuer if there are any issuer config there
      if (hasCoBranding && instrument.cobranded_partners?.length) {
        issuerMatches = false;
      }

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
 * Filter saved cards against selected custom config block
 * @param {Tokens} tokens
 * @param {Instrument} instrument
 * @returns
 */
export function filterSavedCardsAgainstCustomBlock(
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
    const coBrandingPartners: string[] = instrument.cobranded_partners || [];
    const hasCoBranding = instrument.cobranded_partners?.length;

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

    // Match against cobranding partner if co branding config is there
    // and the token also has co branding partner
    let coBrandingMatches = hasCoBranding
      ? coBrandingPartners.includes(token.card.cobranding_partner as string)
      : true;

    // If issuer specifc config is there
    // we need to filter out the cards that have co-branding partners but matches the issuer
    // Eg. FDRL bank has co-branding enabled but the user only wants FDRL bank EMI and not onecard emi
    if (!hasCoBranding && token.card.cobranding_partner && hasIssuers) {
      coBrandingMatches = false;
    }

    const networkMatches = hasNetworks
      ? networks.includes(token.card.network)
      : true;

    const typeMatches = hasTypes ? types.includes(token.card.type) : true;

    return issuerMatches && coBrandingMatches && networkMatches && typeMatches;
  });
  return eligibleTokens;
}

/**
 * Helper function to filter out emi providers
 * Based on config restriction
 * if emi method is restricted hide all bank and card emi providers
 * if cardless method is restricted hide all cardless emi providers
 * @param {EMIBankList} providers
 * @returns {EMIBankList}
 */
export const hideRestrictedProviders = (providers: EMIBankList) => {
  let filteredProviders = providers;
  // if custom config has hide restriction for Emi method
  // card emi providers like Onecard/Bajaj should be filtered out
  if (isEmiMethodHidden('emi')) {
    filteredProviders = filteredProviders.filter(
      (provider) => !isOtherCardEmiProvider(provider.code)
    );
  }

  // if cardless emi method is restriceted
  // filter out all cardless emi providers except card emis like bajaj and onecard
  if (isEmiMethodHidden('cardless_emi')) {
    filteredProviders = filteredProviders.filter((provider) =>
      isOtherCardEmiProvider(provider.code)
    );
  }

  return filteredProviders;
};

/**
 * Helper function to validate if emi method is hidden or not
 * @param {EmiMethod} method
 * @returns {boolean}
 */
export const isEmiMethodHidden = (method: EmiMethod) => {
  const hiddenMethod: string[] = get(HiddenMethodsStore);
  return hiddenMethod.includes(method);
};

/**
 * Filter providers based on the hide custom config passed
 * If cardless emi method is hidden set isCardless to false to show only credit/debit tab
 * If emi method is hidden filter out bank that have cardless enabled and show only cardless tab
 * @param {EMIBankList} emiBanks
 * @returns {EMIBankList}
 */
export const filterHiddenEmiProviders = (emiBanks: EMIBankList) => {
  // If emi method is hidden we need to
  // filter out bank that have cardless enabled
  // and set debit/credit emi to false so as to not show credit/debit tab
  if (isEmiMethodHidden('emi')) {
    return emiBanks
      .filter((bank) => bank.isCardless)
      .map((bank) => {
        return {
          ...bank,
          debitEmi: false,
          creditEmi: false,
          startingFrom: null,
        };
      });
  }

  // If cardless method is hidden we need to set isCardless to false
  // so as to only show credit/debit emi tab
  if (isEmiMethodHidden('cardless_emi')) {
    return emiBanks.map((bank) => {
      return {
        ...bank,
        isCardless: false,
      };
    });
  }
  return emiBanks;
};
