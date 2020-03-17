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

export function setBlocks({ preferred = [], merchantConfig = {} }) {
  const preferredBlock = generateBasePreferredBlock(preferred);
  const parsedConfig = getBlockConfig(merchantConfig);

  // TODO: Filter out instruments from preferredBlock.instruments using `excluded`
  const excluded = parsedConfig.excluded;

  // Take top 3 preferred
  preferredBlock.instruments = preferredBlock.instruments.slice(
    0,
    MAX_PREFERRED_INSTRUMENTS
  );

  let allBlocks = [preferredBlock];

  allBlocks = _Arr.mergeWith(allBlocks, parsedConfig.blocks);

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
