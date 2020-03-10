import { createBlock } from 'configurability/blocks';
import { blocks } from 'checkoutstore/screens/home';
import Track from 'tracker';

export function setBlocks({ preferred = [], merchant = [] }) {
  const preferredBlock = createBlock('rzp.preferred', {
    name: 'Preferred Payment Methods',
  });

  preferredBlock.instruments = preferred;

  // TODO: Filter out instruments from preferredBlock.instruments

  // Take top 3 preferred
  preferredBlock.instruments = preferredBlock.instruments.slice(0, 3);

  let allBlocks = [preferredBlock];

  _Arr.mergeWith(allBlocks, merchant);

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
}
