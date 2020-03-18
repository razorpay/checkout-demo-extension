import { createMethodBlock } from './methods';

/**
 * Transforms the list of blocks into the order defined in the
 * sequence option provided by the merchant
 * @param {Object} params
 *  @prop {Object} translated Translated config
 *    @prop {Array<Block>} blocks
 *    @prop {Object} hide
 *      @prop {Array<Instrument>} instruments Hidden insturments
 *      @prop {Array<string>} methods Hidden methods
 *  @prop {Object} original Original Merchant config
 *  @prop {Array<string>} methods Available methods for the merchant
 *
 * @returns {Array<Block>}
 */
export function getSequencedBlocks(params) {
  const { translated, original, methods } = params;
  const { blocks, hide } = translated;
  const settings = _Obj.getSafely(original, 'settings', {});
  const {
    show_default_blocks = true, // Show default blocks by default
  } = settings;

  let { sequence = [] } = original;

  // Get the methods to list
  const methodsToList = _Arr.filter(
    methods,
    method => !_Arr.contains(hide.methods, method)
  );

  // Create a method block for all listed methods
  const methodBlocks = _Arr.map(methodsToList, createMethodBlock);

  if (show_default_blocks) {
    // Extend the given sequence with our default sequence
    sequence = _Arr.mergeWith(sequence, methodsToList);
  }

  // Filter the sequence for duplicates
  sequence = _Arr.removeDuplicates(sequence);

  // Get all blocks
  const allBlocks = _Arr.merge(methodBlocks, blocks);

  // Get blocks mentioned in the sequence
  const sequencedBlocks =
    sequence
    |> _Arr.map(code => _Arr.find(allBlocks, block => block.code === code))
    |> _Arr.filter(Boolean);

  return sequencedBlocks;
}
