import { translateExternal } from './translate';
import { getSequencedBlocks } from './sequence';
import { clusterRazorpayBlocks } from './methods';
import { ungroupInstruments, getIndividualInstruments } from './ungroup';
import InstrumentConfig from './instruments-config';

import { AVAILABLE_METHODS } from 'common/constants';
import {
  isMethodEnabled,
  getNetbankingBanks,
  getWallets,
  isUPIFlowEnabled,
  getPayLaterProviders,
  getCardlessEMIProviders,
  getCardNetworks,
} from 'checkoutstore/methods';

import { shouldSeparateDebitCard, getMerchantMethods } from 'checkoutstore';
import wallet from 'ui/icons/payment-methods/wallet';
import { API_NETWORK_CODES_MAP } from 'common/card';

/**
 * Returns the available methods
 *
 * @returns {Array<string>}
 */
function getAvailableDefaultMethods() {
  let available = _Arr.filter(AVAILABLE_METHODS, isMethodEnabled);

  /**
   * Cardless EMI and EMI are the same payment option.
   * When we click EMI, it should take to Cardless EMI if
   * cardless_emi is an available method.
   */
  if (
    _Arr.contains(available, 'cardless_emi') &&
    _Arr.contains(available, 'emi')
  ) {
    available = _Arr.remove(available, 'emi');
  }

  /**
   * We do not want to show QR in the primary list
   * of payment options anymore
   */
  available = _Arr.remove(available, 'qr');

  // TODO: Filter based on amount

  // Separate out debit and credit cards
  if (shouldSeparateDebitCard()) {
    available = _Arr.remove(available, 'card');
    available = ['credit_card', 'debit_card'].concat(available);
  }

  return available;
}

/**
 * Removes all flows/issuers/providers that are not available for
 * an instrument
 * @param {Instrument} instrument
 * @returns {Object|null}
 */
function removeNonApplicableInstrumentFlows(instrument) {
  instrument = _Obj.clone(instrument);

  if (!isMethodEnabled(instrument.method)) {
    return null;
  }

  switch (instrument.method) {
    case 'emi':
    case 'card': {
      // We don't have eligible issuers, so we'll only filter on types and networks.
      const hasNetworks = Boolean(instrument.networks);
      const hasTypes = Boolean(instrument.types);

      // Filter based on networks
      if (hasNetworks) {
        let availableNetworks = [];

        _Obj.loop(getCardNetworks(), (val, key) => {
          if (val) {
            availableNetworks.push(API_NETWORK_CODES_MAP[key]);
          }
        });

        instrument.networks = _Arr.filter(instrument.networks, network =>
          _Arr.contains(availableNetworks, network)
        );
      }

      // Filter based on types
      if (hasTypes) {
        // Check for credit cards
        if (
          _Arr.contains(instrument.types, 'credit') &&
          !getMerchantMethods().credit_card
        ) {
          instrument.types = _Arr.remove(instrument.types, 'credit');
        }

        // Check for debit cards
        if (
          _Arr.contains(instrument.types, 'debit') &&
          !getMerchantMethods().debit_card
        ) {
          instrument.types = _Arr.remove(instrument.types, 'debit');
        }
      }

      return instrument;
    }

    case 'netbanking': {
      const hasBanks = Boolean(instrument.banks);

      if (!hasBanks) {
        const enabledBanks = getNetbankingBanks();
        const shownBanks = _Arr.filter(
          instrument.banks,
          bank => enabledBanks[bank]
        );

        instrument.banks = shownBanks;
      }

      return instrument;
    }

    case 'wallet': {
      const hasWallets = Boolean(instrument.wallets);

      if (hasWallets) {
        const enabledWallets = getWallets();
        const shownWallets = _Arr.filter(instrument.wallets, wallet =>
          _Arr.any(
            enabledWallets,
            enabledWallet => enabledWallet.code === wallet
          )
        );

        instrument.wallets = shownWallets;
      }

      return instrument;
    }

    case 'cardless_emi': {
      const hasProviders = Boolean(instrument.providers);

      if (hasProviders) {
        const enabledProviders = getCardlessEMIProviders();
        const shownProviders = _Arr.filter(
          instrument.providers,
          provider => enabledProviders[provider]
        );
        instrument.providers = shownProviders;
      }

      return instrument;
    }

    case 'paylater': {
      const hasProviders = Boolean(instrument.providers);

      if (hasProviders) {
        const enabledProviders = getPayLaterProviders();
        const shownProviders = _Arr.filter(instrument.providers, provider =>
          _Arr.any(
            enabledProviders,
            enabledProvider => enabledProvider.code === provider
          )
        );
        instrument.providers = shownProviders;
      }

      return instrument;
    }

    case 'upi': {
      const hasFlows = Boolean(instrument.flows);

      if (hasFlows) {
        const shownFlows = _Arr.filter(instrument.flows, isUPIFlowEnabled);
        instrument.flows = shownFlows;
      }

      // TODO: check for app
      return instrument;
    }
  }

  return instrument;
}

/**
 * Removes all disabled instruments from the block.
 * @param block
 * @returns {*}
 */
function removeDisabledInstrumentsFromBlock(block) {
  block = _Obj.clone(block);
  block.instruments =
    block.instruments
    |> _Arr.map(removeNonApplicableInstrumentFlows)
    |> _Arr.filter(Boolean)
    |> _Arr.filter(isInstrumentValid);

  return block;
}

/**
 * Checks if a given instrument is valid.
 * @param {Instrument} instrument
 * @returns {boolean}
 */
function isInstrumentValid(instrument) {
  const { method } = instrument;
  const config = InstrumentConfig[method];
  if (!method || !config) {
    return false;
  }
  return config.isValid(instrument);
}

/**
 * Creates a block config for rendering
 * @param {Object} options Options passed by the merchant
 * @param {Customer} customer
 *
 * @returns {Object}
 */
export function getBlockConfig(options, customer) {
  // Translate external representation to internal representation
  const translated = translateExternal(options);

  // Ungroup instruments and remove disabed instruments for each block
  translated.blocks =
    translated.blocks
    |> _Arr.map(removeDisabledInstrumentsFromBlock)
    |> _Arr.map(block => ungroupInstruments(block, customer));

  // Remove empty blocks
  translated.blocks = _Arr.filter(
    translated.blocks,
    block => block.instruments.length > 0
  );

  // Ungroup hidden instrument as well
  translated.hide.instruments =
    translated.hide.instruments
    |> _Arr.flatMap(
      group => getIndividualInstruments(group, customer)._ungrouped
    );

  // Reorder blocks
  const sequentialied = getSequencedBlocks({
    translated,
    original: options,
    methods: getAvailableDefaultMethods(),
  });

  // Group blocks of Razorpay
  const clustered = clusterRazorpayBlocks(sequentialied);

  return {
    blocks: clustered,
    hidden: translated.hide.instruments,
  };
}
