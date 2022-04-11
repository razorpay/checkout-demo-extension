import { translateExternal } from './translate';
import { getSequencedBlocks } from './sequence';
import { clusterRazorpayBlocks } from './methods';
import { ungroupInstruments, getIndividualInstruments } from './ungroup';
import InstrumentConfig from './instruments-config';
import { isInstrumentForEntireMethod } from './instruments';
import { getUPIIntentApps } from 'checkoutstore/native';

import { AVAILABLE_METHODS } from 'common/constants';
import {
  isMethodEnabled,
  getNetbankingBanks,
  getWallets,
  isUPIFlowEnabled,
  getPayLaterProviders,
  getCardlessEMIProviders,
  getCardNetworks,
  getAppProviders,
} from 'checkoutstore/methods';

import { getMerchantMethods, isRecurring, getOption } from 'razorpay';

import { API_NETWORK_CODES_MAP, networks as CardNetworks } from 'common/card';

/**
 * Returns the available methods
 *
 * @returns {Array<string>}
 */
function getAvailableDefaultMethods() {
  let available = AVAILABLE_METHODS;

  // Only international cards are allowed in recurring as of now,
  // so give it low priority and show it in the end of list
  if (isRecurring() && available.includes('card')) {
    available = available.filter((method) => method !== 'card');
    available = [...available, 'card'];
  }

  // Separate out debit and credit cards
  if (getOption('theme.debit_card')) {
    available = available.filter((method) => method !== 'card');
    available = ['credit_card', 'debit_card'].concat(available);
  }

  available = available.filter(isMethodEnabled);

  /**
   * We do not want to show QR in the primary list
   * of payment options anymore
   */
  available = available.filter((method) => method !== 'qr');

  // TODO: Filter based on amount

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
            availableNetworks.push(CardNetworks[API_NETWORK_CODES_MAP[key]]);
          }
        });

        instrument.networks = instrument.networks.filter((network) =>
          availableNetworks.includes(network)
        );
      }

      // Filter based on types
      if (hasTypes) {
        // Check for credit cards
        if (
          instrument.types.includes('credit') &&
          !getMerchantMethods().credit_card
        ) {
          instrument.types = instrument.types.filter(
            (type) => type !== 'credit'
          );
        }

        // Check for debit cards
        if (
          instrument.types.includes('debit') &&
          !getMerchantMethods().debit_card
        ) {
          instrument.types = instrument.types.filter(
            (type) => type !== 'debit'
          );
        }
      }

      return instrument;
    }

    case 'netbanking': {
      const hasBanks = Boolean(instrument.banks);

      if (hasBanks) {
        const enabledBanks = getNetbankingBanks();
        const shownBanks = instrument.banks.filter(
          (bank) => enabledBanks[bank]
        );

        instrument.banks = shownBanks;
      }

      return instrument;
    }

    case 'wallet': {
      const hasWallets = Boolean(instrument.wallets);

      if (hasWallets) {
        const enabledWallets = getWallets();
        const shownWallets = instrument.wallets.filter((wallet) =>
          enabledWallets.some((enabledWallet) => enabledWallet.code === wallet)
        );

        instrument.wallets = shownWallets;
      }

      return instrument;
    }

    case 'cardless_emi': {
      const hasProviders = Boolean(instrument.providers);

      if (hasProviders) {
        const enabledProviders = getCardlessEMIProviders();
        const shownProviders = instrument.providers.filter(
          (provider) => enabledProviders[provider]
        );
        instrument.providers = shownProviders;
      }

      return instrument;
    }

    case 'paylater': {
      const hasProviders = Boolean(instrument.providers);

      if (hasProviders) {
        const enabledProviders = getPayLaterProviders();
        const shownProviders = instrument.providers.filter((provider) =>
          enabledProviders.some(
            (enabledProvider) => enabledProvider.code === provider
          )
        );
        instrument.providers = shownProviders;
      }

      return instrument;
    }

    case 'app': {
      const hasProviders = Boolean(instrument.providers);

      if (hasProviders) {
        const enabledProviders = getAppProviders();
        const shownProviders = instrument.providers.filter((provider) =>
          enabledProviders.some(
            (enabledProvider) => enabledProvider.code === provider
          )
        );
        instrument.providers = shownProviders;
      } else {
        // If there are no providers, then exclude this method.
        return null;
      }

      return instrument;
    }

    case 'upi': {
      const hasFlows = Boolean(instrument.flows);

      if (hasFlows) {
        const shownFlows = instrument.flows.filter(isUPIFlowEnabled);
        instrument.flows = shownFlows;

        if (instrument.apps && !instrument.flows.includes('intent')) {
          delete instrument.apps;
        }

        if (instrument.apps) {
          const allUpiAppsOnDevice = getUPIIntentApps().all;

          // Keep only those apps which are present on the device
          instrument.apps = instrument.apps.filter((app) =>
            allUpiAppsOnDevice.find(
              (deviceApp) => deviceApp.package_name === app
            )
          );
        }
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
  block.instruments = block.instruments
    .map(removeNonApplicableInstrumentFlows)
    .filter(Boolean)
    .filter(isInstrumentValid);

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

  if (isInstrumentForEntireMethod(instrument)) {
    return true;
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

  const hasAllowedRestrictions =
    translated.restrictions.allow.instruments.length > 0;
  const hasTranslatedBlocks = translated.display.blocks.length > 0;
  const hasConfiguredBlocks =
    hasTranslatedBlocks &&
    translated.display.blocks.some((block) =>
      translated.display.sequence.includes(block.code)
    );

  /**
   * If the merchant wants to use restrictions,
   * but has not provided any blocks,
   * we use the restricted instruments as a block.
   */
  if (hasAllowedRestrictions && !hasConfiguredBlocks) {
    translated.display.sequence = [translated.restrictions.allow.code];
    translated.display.blocks = [translated.restrictions.allow];
    translated.display.preferences.show_default_blocks = false;
  }

  // Ungroup instruments and remove disabed instruments for each block
  translated.display.blocks = translated.display.blocks
    .map(removeDisabledInstrumentsFromBlock)
    .map((block) => ungroupInstruments(block, customer));

  // Remove empty blocks
  translated.display.blocks = translated.display.blocks.filter(
    (block) => block.instruments.length > 0
  );

  // Ungroup hidden instrument as well
  translated.display.hide.instruments =
    translated.display.hide.instruments.flatMap(
      (group) => getIndividualInstruments(group, customer)._ungrouped
    );

  // Reorder blocks
  const { blocks: sequentialized, sequence } = getSequencedBlocks({
    translated,
    methods: getAvailableDefaultMethods(),
  });

  // Group blocks of Razorpay
  const clustered = clusterRazorpayBlocks(sequentialized);

  return {
    display: {
      sequence,

      blocks: clustered,
      hide: translated.display.hide,
      preferences: translated.display.preferences,
    },

    restrictions: translated.restrictions,

    _meta: {
      hasCustomizations: translated.display.sequence.length > 0,
      hasRestrictedInstruments: hasAllowedRestrictions,
    },
  };
}
