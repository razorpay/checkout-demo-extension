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

    case 'card':
    case 'emi': {
      const hasIssuers = Boolean(group.issuers);
      const hasNetworks = Boolean(group.networks);
      const hasCardTypes = Boolean(group.card_types);

      const issuers = group.issuers || [];
      const networks = group.networks || [];
      const card_types = group.card_types || [];

      // If there is no issuer present, it means match all issuers.
      const issuerMatches = hasIssuers
        ? _Arr.contains(issuers, instrument.issuer)
        : true;

      const networkMatches = hasNetworks
        ? _Arr.contains(networks, instrument.network)
        : true;

      const cardTypeMatches = hasCardTypes
        ? _Arr.contains(card_types, instrument.card_type)
        : true;

      return issuerMatches && networkMatches && cardTypeMatches;
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
  }

  return true;
}

export function setBlocks({ preferred = [], merchantConfig = {} }, customer) {
  const preferredBlock = generateBasePreferredBlock(preferred);
  const parsedConfig = getBlockConfig(merchantConfig, customer);

  const shownInstruments =
    parsedConfig.blocks
    |> _Arr.map(block => block.instruments)
    |> _Arr.reduce(_Arr.mergeWith, []);

  const excluded = _Arr.mergeWith(parsedConfig.excluded, shownInstruments);

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
