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
      const hasBanks = Boolean(instrument.banks);

      // Does the instrument ask for specific wallets to be shown?
      if (hasBanks) {
        return _Arr.any(
          instrument._ungrouped,
          ungrouped => ungrouped.bank === preferred.bank
        );
      }

      return false;
    }

    case 'wallet': {
      const hasWallets = Boolean(instrument.wallets);

      // Does the instrument ask for specific wallets to be shown?
      if (hasWallets) {
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
      const hasFlows = Boolean(instrument.flows);
      const hasApps = Boolean(instrument.apps);

      // If there are any apps, check if the app matches
      if (hasApps) {
        return _Arr.any(
          instrument._ungrouped,
          ungrouped => ungrouped.app === preferred.app
        );
      }

      // If there are any flows, check if the flows match and is invidiual flow
      if (hasFlows) {
        const individualFlows = ['qr', 'intent'];

        return _Arr.any(
          instrument._ungrouped,
          ungrouped =>
            _Arr.contains(individualFlows, ungrouped.flow) &&
            ungrouped.flow === preferred.flow
        );
      }

      return false;
    }

    case 'cardless_emi':
    case 'paylater': {
      const hasProviders = Boolean(instrument.providers);

      // Does the instrument ask for specific providers to be shown?
      if (hasProviders) {
        return _Arr.any(
          instrument._ungrouped,
          ungrouped => ungrouped.provider === preferred.provider
        );
      }

      return false;
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

  // Add preferred methods block only if restrictions are not used and default blocks should be shown
  const addPreferredInstrumentsBlock =
    !parsedConfig._meta.hasRestrictedInstruments &&
    parsedConfig.display.preferences.show_default_blocks;

  // Get all hidden method-instruments
  const hiddenMethods = parsedConfig.display.hide.methods;

  let allBlocks = parsedConfig.display.blocks;

  if (addPreferredInstrumentsBlock) {
    const preferredInstruments = preferredBlock.instruments;

    // Filter out all preferred methods whose methods are asked to be hidden
    let filteredPreferredInstruments = _Arr.filter(
      preferredInstruments,
      preferredInstrument => {
        return !_Arr.contains(hiddenMethods, preferredInstrument.method);
      }
    );

    // Filter out all preferred methods that are already being shown by the merchant
    filteredPreferredInstruments = _Arr.filter(
      filteredPreferredInstruments,
      instrument =>
        _Arr.every(
          shownIndividualInstruments,
          individualInstrument =>
            !isPreferredInstrumentPartOfInstrument(
              instrument,
              individualInstrument
            )
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
