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
 * @param {Object} instrument
 * @param {Object} group
 * @returns {boolean}
 */
function instrumentPresentInGroup(instrument, group) {
  if (instrument.method !== group.method) {
    return false;
  }

  switch (instrument.method) {
    case 'netbanking': {
      const hasBank = Boolean(group.bank);

      const bankMatches = hasBank ? group.bank === instrument.bank : true;

      return bankMatches;
    }

    case 'wallet': {
      const hasWallet = Boolean(group.wallet);

      const walletMatches = hasWallet
        ? group.wallet === instrument.wallet
        : true;

      return walletMatches;
    }

    /**
     * Card and EMI instruments will not be ungrouped by getBlockConfig as a
     * special case (to avoid large no. of permutations when iins are used).
     * Hence we are checking for presence in arrays.
     */
    case 'card':
    case 'emi': {
      const hasIssuers = Boolean(group.issuers);
      const hasNetworks = Boolean(group.networks);
      const hasTypes = Boolean(group.types);

      const issuers = group.issuers || [];
      const networks = group.networks || [];
      const types = group.types || [];

      // If there is no issuer present, it means match all issuers.
      const issuerMatches = hasIssuers
        ? _Arr.contains(issuers, instrument.issuer)
        : true;

      const networkMatches = hasNetworks
        ? _Arr.contains(networks, instrument.network)
        : true;

      const typeMatches = hasTypes
        ? _Arr.contains(types, instrument.types)
        : true;

      return issuerMatches && networkMatches && typeMatches;
    }
    // TODO: filter out based on iins as well
    // TODO: filter out / remove plans excluding the durations for emi

    case 'upi': {
      const hasFlow = Boolean(group.flows);
      const hasApp = Boolean(group.apps);

      const flowMatches = hasFlow ? group.flow === instrument.flow : true;
      const appMatches = hasApp ? group.app === instrument.app : true;

      return flowMatches && appMatches;
    }

    case 'cardless_emi':
    case 'paylater': {
      const hasProvider = Boolean(group.provider);
      const providerMatches = hasProvider
        ? group.provider === instrument.provider
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
    parsedConfig.blocks
    |> _Arr.filter(block => block.code !== 'rzp.cluster')
    |> _Arr.flatMap(block => {
      return _Arr.filter(
        block.instruments,
        instrument => instrument._ungrouped.length === 1
      );
    })
    |> _Arr.filter(instrument => !isInstrumentForEntireMethod(instrument));

  /**
   * All individual instruments that are already being shown by the merchant
   * need to be removed from preferred instruments.
   */
  const hidden = _Arr.mergeWith(
    parsedConfig.hidden,
    shownIndividualInstruments
  );

  const preferredInstruments = preferredBlock.instruments;
  const filteredPreferredInstruments = _Arr.filter(
    preferredInstruments,
    instrument =>
      _Arr.every(
        hidden,
        hiddenGroup => !instrumentPresentInGroup(instrument, hiddenGroup)
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

  let allBlocks = [preferredBlock];
  const merchantBlocks = parsedConfig.blocks;

  allBlocks = _Arr.mergeWith(allBlocks, merchantBlocks);

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

  Analytics.track('config:blocks', {
    type: AnalyticsTypes.RENDER,
    data: allBlocks,
  });

  blocks.set(allBlocks);

  return {
    merchant: parsedConfig,
    preferred: preferredBlock,
    all: allBlocks,
  };
}
