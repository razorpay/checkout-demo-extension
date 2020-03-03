import { createMethodBlock } from './methods';

/**
 *
 * @param {Object} params
 *  @prop {Object} translated Translated config
 *    @prop {Array<Block>} blocks
 *    @prop {Object} exclude
 *      @prop {Array<Instruments>} instruments Excluded insturments
 *      @prop {Array<string>} methods Excluded methods
 *  @prop {Object} original Original Merchant config
 *  @prop {Array<string>} methods Available methods for the merchant
 *
 * @returns {Array<Block>}
 */
export function getSequencedBlocks(params) {
  const { translated, original, methods } = params;
  const { blocks, exclude } = translated;

  let { sequence = [] } = original;

  // Get the methods to list
  const methodsToList = _Arr.filter(
    methods,
    method => !_Arr.contains(exclude.methods, method)
  );

  // Create a method block for all listed methods
  const methodBlocks = _Arr.map(methodsToList, createMethodBlock);

  // Extend the given sequence with our default sequence
  sequence = _Arr.mergeWith(sequence, methodsToList);

  // Filter the sequence for duplicates
  let filtered = [];

  _Arr.loop(sequence, code => {
    if (!_Arr.contains(filtered, code)) {
      filtered.push(code);
    }
  });

  sequence = filtered;

  // Get all blocks
  const allBlocks = _Arr.merge(methodBlocks, blocks);

  // Get blocks mentioned in the sequence
  const sequencedBlocks =
    sequence
    |> _Arr.map(code => _Arr.find(allBlocks, block => block.code === code))
    |> _Arr.filter(Boolean);

  return sequencedBlocks;
}
