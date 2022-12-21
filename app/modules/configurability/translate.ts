import {
  createInstrument,
  isInstrumentForEntireMethod,
  sendInvalidConfigEvent,
} from './instruments';
import { validateAndCreateBlock } from './blocks';
import * as ObjectUtils from 'utils/object';
import type {
  Options,
  Display,
  Restrictions,
  Block,
  Instruments,
  Hide,
  AllHiddenInstrument,
} from 'configurability/types';
import type { Method } from 'types/types';
import type { ErrorParam } from 'error-service/types';

/**
 * Translates the options
 * @param {Object} options Options passed
 * @param {boolean} external Is this an external representation?
 *
 * @returns {Object} translated
 *  @prop {Object} display
 *    @prop {Array<Block>} blocks
 *    @prop {Object} hide
 *      @prop {Array<Instruments>} instruments Hidden insturments
 *      @prop {Array<string>} methods Hidden methods
 */
function _translate(options = {}, external: boolean) {
  options = ObjectUtils.clone(options);

  const { display = {}, restrictions = [] } = options as Options;
  const {
    blocks = {},
    hide = [],
    preferences = {},
    sequence = [],
  } = (display as Display) || {};
  const { allow = [] } = (restrictions as Restrictions) || {};

  /**
   * Create blocks
   */
  const includedBlocks: Block[] = [];

  ObjectUtils.loop(blocks, (value, code) => {
    if (external) {
      code = `block.${code}`;
    }

    // These are coming from the merchant so we need to validate the keys of the instruments
    const block = validateAndCreateBlock(code, value);

    if (block) {
      includedBlocks.push(block);
    }
  });

  /**
   * Create hidden instruments
   */

  let allHiddenInstruments: AllHiddenInstrument;
  try {
    allHiddenInstruments = (hide as Hide[])
      .map(createInstrument)
      .filter(Boolean);
  } catch (error) {
    allHiddenInstruments = [];
    sendInvalidConfigEvent(error as ErrorParam);
  }

  const hiddenInstruments = allHiddenInstruments.filter(
    (instrument: Instruments | undefined) =>
      !isInstrumentForEntireMethod(instrument as Instruments)
  );

  /**
   * Create disabled methods
   */
  const hiddenMethods = allHiddenInstruments
    .filter(isInstrumentForEntireMethod as any)
    .map((instrument) => (instrument as Instruments).method) as Method[];

  /**
   * RESTRICTIONS
   */
  // These are coming from the merchant so we need to validate the keys of the instruments
  const allowedBlock = validateAndCreateBlock('rzp.restrict_allow', {
    instruments: allow,
  });

  return {
    display: {
      preferences,
      sequence,

      blocks: includedBlocks,
      hide: {
        instruments: hiddenInstruments,
        methods: hiddenMethods,
      },
    },

    restrictions: {
      allow: allowedBlock,
    },
  };
}

/**
 * Translate from external representation
 * @param {Object} options
 *
 * @returns {Object}
 */
export function translateExternal(options: Options) {
  return _translate(options, true);
}
