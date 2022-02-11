import { createMethodBlock } from './methods';
import { getUniqueValues } from 'utils/array';

/**
 * Transforms the list of blocks into the order defined in the
 * sequence option provided by the merchant
 * @param {Object} params
 *  @prop {Object} translated Translated config
 *    @prop {Object} display
 *      @prop {Array<Block>} blocks
 *      @prop {Object} hide
 *        @prop {Array<Instrument>} instruments Hidden insturments
 *        @prop {Array<string>} methods Hidden methods
 *  @prop {Array<string>} methods Available methods for the merchant
 *
 * @returns {Object}
 *  @prop {Array<Block>} blocks
 *  @prop {Array<string>} sequence Generated sequence
 */
export function getSequencedBlocks(params) {
  const { translated, methods } = params;
  const { display } = translated;
  const { blocks, hide, preferences } = display;

  let { sequence } = display;

  const {
    show_default_blocks = true, // Show default blocks by default
  } = preferences;

  // Get the methods to list
  const methodsToList = methods.filter(
    (method) => !_Arr.contains(hide.methods, method)
  );

  // Create a method block for all listed methods
  const methodBlocks = methodsToList.map(createMethodBlock);

  if (show_default_blocks) {
    // Extend the given sequence with our default sequence
    sequence = sequence.concat(methodsToList);
  }

  // Filter the sequence for duplicates
  sequence = getUniqueValues(sequence);

  // Copy the sequence
  const exhaustiveSequence = _Obj.clone(sequence);

  /**
   * Cardless EMI and EMI are the same payment option in the UI.
   *
   * If only Cardless EMI is available, it becomes method=cardless_emi
   * If only EMI is available, it becomes method=emi
   * If both EMI and Cardless EMI are available, it becomes method=cardless_emi
   *
   * When both of them are present, things get complicated.
   * Let's handle that.
   * Whichever of "emi" or "cardless_emi" is present first in the sequence,
   * lets put "cardless_emi" at that place. And remove "emi" altogether.
   */
  if (
    _Arr.contains(sequence, 'cardless_emi') &&
    _Arr.contains(sequence, 'emi')
  ) {
    let indexOfEmi = sequence.indexOf('emi');
    let indexOfCardlessEmi = sequence.indexOf('cardless_emi');

    if (indexOfEmi < indexOfCardlessEmi) {
      /**
       * If emi is present before cardless_emi
       * Remove old cardless_emi and put it in the place of emi
       */
      sequence = sequence.filter((item) => item !== 'cardless_emi');
      sequence[indexOfEmi] = 'cardless_emi';
    } else {
      /**
       * cardless_emi is already before emi
       * Remove emi
       */
      sequence = sequence.filter((item) => item !== 'emi');
    }
  }

  // "app" method isn't shown on Checkout yet, so remove it
  sequence = sequence.filter((item) => item !== 'app');

  // Get all blocks
  const allBlocks = blocks.concat(methodBlocks);

  // Get blocks mentioned in the sequence
  const sequencedBlocks = sequence
    .map((code) => _Arr.find(allBlocks, (block) => block.code === code))
    .filter(Boolean);

  return {
    blocks: sequencedBlocks,
    sequence: exhaustiveSequence,
  };
}
