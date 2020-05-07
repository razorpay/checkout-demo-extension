import { createBlock } from 'configurability/blocks';
import { blocks, instruments, sequence } from 'checkoutstore/screens/home';
import { get as storeGetter } from 'svelte/store';
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
 * Tells whether a given preferred instrument is allowed
 * Used to filter out preferred methods instruments.
 * @param {Instrument} preferred
 * @param {Array<Instrument>} instruments
 *
 * @returns {boolean}
 */
function shouldAllowPreferredInstrument(preferred, instruments) {
  return _Arr.every(instruments, instrument => {
    if (preferred.method !== instrument.method) {
      return true;
    }

    // If entire method is asked to be shown, we can show the preferred instrument too
    if (isInstrumentForEntireMethod(instrument)) {
      return true;
    }

    switch (preferred.method) {
      case 'netbanking': {
        const hasBanks = Boolean(instrument.banks);

        // Does the instrument ask for specific banks to be shown?
        if (hasBanks) {
          return _Arr.none(
            instrument._ungrouped,
            ungrouped => ungrouped.bank === preferred.bank
          );
        }

        return true;
      }

      case 'wallet': {
        const hasWallets = Boolean(instrument.wallets);

        // Does the instrument ask for specific wallets to be shown?
        if (hasWallets) {
          return _Arr.none(
            instrument._ungrouped,
            ungrouped => ungrouped.wallet === preferred.wallet
          );
        }

        return true;
      }

      /**
       * Card and EMI instruments will not be ungrouped by getBlockConfig as a
       * special case (to avoid large no. of permutations when iins are used).
       * Hence we are checking for presence in arrays.
       */
      case 'card':
      case 'emi': {
        // Always show card and emi instruments
        return true;
      }
      // TODO: filter out based on iins as well
      // TODO: filter out / remove plans excluding the durations for emi

      case 'upi': {
        const hasFlows = Boolean(instrument.flows);
        const hasApps = Boolean(instrument.apps);

        // If there are any apps, check if the app matches
        if (hasApps) {
          return _Arr.none(
            instrument._ungrouped,
            ungrouped => ungrouped.app === preferred.app
          );
        }

        // If there are any flows, check if the flows match and is invidiual flow
        if (hasFlows) {
          const individualFlows = ['qr', 'intent'];

          return _Arr.none(
            instrument._ungrouped,
            ungrouped =>
              _Arr.contains(individualFlows, ungrouped.flow) &&
              ungrouped.flow === preferred.flow
          );
        }

        return true;
      }

      case 'cardless_emi':
      case 'paylater': {
        const hasProviders = Boolean(instrument.providers);

        // Does the instrument ask for specific providers to be shown?
        if (hasProviders) {
          return _Arr.none(
            instrument._ungrouped,
            ungrouped => ungrouped.provider === preferred.provider
          );
        }

        return true;
      }
    }

    return true;
  });
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

  // show_default_blocks defaults to true
  const show_default_blocks = _Obj.getSafely(
    parsedConfig,
    'display.preferences.show_default_blocks',
    true
  );

  // Add preferred methods block only if restrictions are not used and default blocks should be shown
  const addPreferredInstrumentsBlock =
    !parsedConfig._meta.hasRestrictedInstruments && show_default_blocks;

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
        shouldAllowPreferredInstrument(instrument, shownIndividualInstruments)
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
  sequence.set(parsedConfig.display.sequence);

  return {
    merchant: parsedConfig,
    preferred: preferredBlock,
    all: allBlocks,
  };
}

/**
 * Returns the block that contains the instrument
 * @param {Instrument} instrument
 * @param {Array<Blocks>} blocks
 *
 * @returns {Block|undefined}
 */
function getInstrumentBlock(instrument, blocks) {
  return _Arr.find(blocks, block => {
    return _Arr.any(
      block.instruments,
      blockInstrument => blockInstrument.id === instrument.id
    );
  });
}

/**
 * Returns meta information about the instrument
 * @param {Instrument} instrumnt
 *
 * @returns {Object} meta
 */
export function getInstrumentMeta(instrument) {
  const allBlocks = storeGetter(blocks);
  const block = getInstrumentBlock(instrument, allBlocks);

  let meta = {};

  if (block) {
    // All indices should be one-indexed

    meta.indexOfBlock = _Arr.indexOf(allBlocks, block) + 1;

    meta.indexInBlock =
      _Arr.findIndex(
        block.instruments,
        blockInstrument => blockInstrument.id === instrument.id
      ) + 1;

    meta.indexInInstruments =
      _Arr.findIndex(
        storeGetter(instruments),
        storeInstrument => storeInstrument.id === instrument.id
      ) + 1;

    meta.block = {
      title: block.title,
      code: block.code,
    };
  }

  return meta;
}
