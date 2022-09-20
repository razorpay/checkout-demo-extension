import type {
  EMIBankList,
  EMIBANKS,
  Instrument,
  InstrumentConfig,
  Tokens,
} from 'emiV2/types';
import { isOnlyCardlessProvider } from './helper';

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
