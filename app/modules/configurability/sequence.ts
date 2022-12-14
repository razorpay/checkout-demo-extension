import { createMethodBlock } from './methods';
import { getUniqueValues } from 'utils/array';
import * as ObjectUtils from 'utils/object';
import { isEmiV2 } from 'razorpay';
import type { Block, SequencedBlockParam } from 'configurability/types';

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
export function getSequencedBlocks(params: SequencedBlockParam) {
  const { translated, methods } = params;
  const { display } = translated;
  const { blocks, hide, preferences } = display;

  let { sequence } = display;

  const {
    show_default_blocks = true, // Show default blocks by default
  } = preferences;

  // Get the methods to list
  const methodsToList = methods.filter(
    (method: string) => !hide.methods.includes(method)
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
  const exhaustiveSequence = ObjectUtils.clone(sequence);

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
  if (sequence.includes('cardless_emi') && sequence.includes('emi')) {
    const indexOfEmi = sequence.indexOf('emi');
    const indexOfCardlessEmi = sequence.indexOf('cardless_emi');
    // For new EMI flow since everything is grouped under EMI
    // Lets Just have a simngle block for 'emi'
    // and remove 'cardless_emi' althogether
    if (isEmiV2()) {
      sequence = sequence.filter((item: string) => item !== 'cardless_emi');
    } else if (indexOfEmi < indexOfCardlessEmi) {
      /**
       * If emi is present before cardless_emi
       * Remove old cardless_emi and put it in the place of emi
       */
      sequence = sequence.filter((item: string) => item !== 'cardless_emi');
      sequence[indexOfEmi] = 'cardless_emi';
    } else {
      /**
       * cardless_emi is already before emi
       * Remove emi
       */
      sequence = sequence.filter((item: string) => item !== 'emi');
    }
  }

  // "app" method isn't shown on Checkout yet, so remove it
  sequence = sequence.filter((item: string) => item !== 'app');

  // Get all blocks
  const allBlocks = blocks.concat(methodBlocks);

  // Get blocks mentioned in the sequence
  const sequencedBlocks = sequence
    .map((code: string) =>
      allBlocks.find((block: Block) => block.code === code)
    )
    .filter(Boolean);

  return {
    blocks: sequencedBlocks,
    sequence: exhaustiveSequence,
  };
}
