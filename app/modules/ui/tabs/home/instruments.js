import { createBlock } from 'configurability/blocks';
import { blocks } from 'checkoutstore/screens/home';
import Track from 'tracker';
import { MAX_PREFERRED_INSTRUMENTS } from 'common/constants';
import { getBlockConfig } from 'configurability';

function generateBasePreferredBlock(preferred) {
  const preferredBlock = createBlock('rzp.preferred', {
    name: 'Preferred Payment Methods',
  });

  preferredBlock.instruments = preferred;

  return preferredBlock;
}

function instrumentPresentInGroup(instrument, group) {
  if (instrument.method !== group.method) {
    return false;
  }

  switch (instrument.method) {
    case 'netbanking': {
      const banks = group.banks || [];
      return _Arr.contains(banks, instrument.bank);
    }

    case 'wallet': {
      const wallets = group.wallets || [];
      return _Arr.contains(wallets, instrument.wallet);
    }

    case 'card':
    case 'emi': {
      const issuers = group.issuers || [];
      const networks = group.networks || [];
      const card_types = group.card_types || [];
      return (
        _Arr.contains(issuers, instrument.issuer) ||
        _Arr.contains(networks, instrument.network) ||
        _Arr.contains(card_types, instrument.card_type)
      );
    }
    // TODO: filter out based on iins as well
    // TODO: filter out / remove plans excluding the durations for emi

    case 'upi': {
      const flows = group.flows || [];
      const apps = group.apps || [];
      return (
        _Arr.contains(flows, instrument.flow) ||
        _Arr.contains(apps, instrument.app)
      );
    }
  }

  return true;
}

export function setBlocks({ preferred = [], merchantConfig = {} }, customer) {
  const preferredBlock = generateBasePreferredBlock(preferred);
  const parsedConfig = getBlockConfig(merchantConfig, customer);

  const excluded = parsedConfig.excluded;

  const preferredInstruments = preferredBlock.instruments;
  const filteredPreferredInstruments = _Arr.filter(
    preferredInstruments,
    instrument =>
      _Arr.every(
        excluded,
        excludedGroup => !instrumentPresentInGroup(instrument, excludedGroup)
      )
  );

  // Take top 3 preferred
  preferredBlock.instruments = filteredPreferredInstruments.slice(
    0,
    MAX_PREFERRED_INSTRUMENTS
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

  blocks.set(allBlocks);

  return {
    merchant: parsedConfig,
    preferred: preferredBlock,
    all: allBlocks,
  };
}
