import { createBlock } from 'configurability/blocks';
import { blocks } from 'checkoutstore/screens/home';
import Track from 'tracker';
import { MAX_PREFERRED_INSTRUMENTS } from 'common/constants';
import { getBlockConfig } from 'configurability';
import { isInstrumentForEntireMethod } from 'configurability/instruments';
import { getIndividualInstruments } from 'configurability/ungroup';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';

function generateBasePreferredBlock(preferred) {
  const preferredBlock = createBlock('rzp.preferred', {
    name: 'Preferred Payment Methods',
  });

  preferredBlock.instruments = preferred;

  return preferredBlock;
}

/**
 * Tells whether a given instrument is a part of an instrument group.
 * Used to filter out preferred methods instruments.
 * @param {Instrument} preferred
 * @param {Instrument} instrument
 *
 * @returns {boolean}
 */
function isPreferredInstrumentPartOfInstrument(preferred, instrument) {
  if (preferred.method !== instrument.method) {
    return false;
  }

  switch (preferred.method) {
    case 'netbanking': {
      const hasBank = Boolean(instrument.banks);

      // Does the instrument ask for specific wallets to be shown?
      if (hasBank) {
        return _Arr.any(
          instrument._ungrouped,
          ungrouped => ungrouped.bank === preferred.bank
        );
      }

      return false;
    }

    case 'wallet': {
      const hasWallet = Boolean(instrument.wallets);

      // Does the instrument ask for specific wallets to be shown?
      if (hasWallet) {
        return _Arr.any(
          instrument._ungrouped,
          ungrouped => ungrouped.wallet === preferred.wallet
        );
      }

      return false;
    }

    /**
     * Card and EMI instruments will not be ungrouped by getBlockConfig as a
     * special case (to avoid large no. of permutations when iins are used).
     * Hence we are checking for presence in arrays.
     */
    case 'card':
    case 'emi': {
      const hasIssuers = Boolean(instrument.issuers);
      const hasNetworks = Boolean(instrument.networks);
      const hasTypes = Boolean(instrument.types);

      const issuers = instrument.issuers || [];
      const networks = instrument.networks || [];
      const types = instrument.types || [];

      // If there is no issuer present, it means match all issuers.
      const issuerMatches = hasIssuers
        ? _Arr.contains(issuers, preferred.issuer)
        : true;

      const networkMatches = hasNetworks
        ? _Arr.contains(networks, preferred.network)
        : true;

      const typeMatches = hasTypes
        ? _Arr.contains(types, preferred.types)
        : true;

      return issuerMatches && networkMatches && typeMatches;
    }
    // TODO: filter out based on iins as well
    // TODO: filter out / remove plans excluding the durations for emi

    case 'upi': {
      const hasFlow = Boolean(instrument.flows);
      const hasApp = Boolean(instrument.apps);

      const flowMatches = hasFlow ? instrument.flow === preferred.flow : true;
      const appMatches = hasApp ? instrument.app === preferred.app : true;

      return flowMatches && appMatches;
    }

    case 'cardless_emi':
    case 'paylater': {
      const hasProvider = Boolean(instrument.provider);
      const providerMatches = hasProvider
        ? instrument.provider === preferred.provider
        : true;
      return providerMatches;
    }
  }

  return true;
}

export function setBlocks(
  { preferred = [], merchantConfig = {}, configSource },
  customer
) {
  const preferredBlock = generateBasePreferredBlock(preferred);
  const parsedConfig = getBlockConfig(merchantConfig, customer);

  // Remove rzp block instruments and method instruments
  const shownIndividualInstruments =
    parsedConfig.display.blocks
    |> _Arr.filter(block => block.code !== 'rzp.cluster')
    |> _Arr.flatMap(block => {
      return _Arr.filter(
        block.instruments,
        instrument => instrument._ungrouped.length === 1
      );
    })
    |> _Arr.filter(instrument => !isInstrumentForEntireMethod(instrument));

  // Add preferred methods block only if restrictions are not used
  const addPreferredInstrumentsBlock = !parsedConfig._meta
    .hasRestrictedInstruments;

  /**
   * All individual instruments that are already being shown by the merchant
   * need to be removed from preferred instruments.
   */
  const hiddenFromPreferredMethods = _Arr.mergeWith(
    parsedConfig.display.hidden,
    shownIndividualInstruments
  );

  let allBlocks = parsedConfig.display.blocks;

  if (addPreferredInstrumentsBlock) {
    const preferredInstruments = preferredBlock.instruments;
    const filteredPreferredInstruments = _Arr.filter(
      preferredInstruments,
      instrument =>
        _Arr.every(
          hiddenFromPreferredMethods,
          hiddenGroup =>
            !isPreferredInstrumentPartOfInstrument(instrument, hiddenGroup)
        )
    );

    // Take top 3 preferred
    preferredBlock.instruments = filteredPreferredInstruments.slice(
      0,
      MAX_PREFERRED_INSTRUMENTS
    );

    // Convert preferred instruments to ungrouped format
    preferredBlock.instruments = _Arr.map(
      preferredBlock.instruments,
      instrument => getIndividualInstruments(instrument, customer)
    );

    allBlocks = _Arr.mergeWith([preferredBlock], allBlocks);
  }

  // Filter out blocks with no instruments
  allBlocks = _Arr.filter(
    allBlocks,
    block => _Obj.getSafely(block, 'instruments', []).length > 0
  );

  // Add an ID to all instruments
  _Arr.loop(allBlocks, block => {
    _Arr.loop(block.instruments, instrument => {
      if (!instrument.id) {
        instrument.id = Track.makeUid();
      }
    });
  });

  const hasCustomConfig = parsedConfig._meta.hasCustomizations;
  Analytics.setMeta('config.custom', hasCustomConfig);

  Analytics.track('config:blocks', {
    type: AnalyticsTypes.RENDER,
    data: {
      final: allBlocks,
      merchant: merchantConfig,
      source: configSource,
      custom: hasCustomConfig,
    },
  });

  blocks.set(allBlocks);

  return {
    merchant: parsedConfig,
    preferred: preferredBlock,
    all: allBlocks,
  };
}
