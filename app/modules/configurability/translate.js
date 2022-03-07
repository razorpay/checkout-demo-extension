import { createInstrument, isInstrumentForEntireMethod } from './instruments';
import { validateAndCreateBlock } from './blocks';

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
function _translate(options = {}, external) {
  options = _Obj.clone(options);

  const { display = {}, restrictions = [] } = options;
  const {
    blocks = {},
    hide = [],
    preferences = {},
    sequence = [],
  } = display || {};
  const { allow = [] } = restrictions || {};

  /**
   * Create blocks
   */
  let includedBlocks = [];

  _Obj.loop(blocks, (value, code) => {
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
  const allHiddenInstruments = hide.map(createInstrument).filter(Boolean);

  const hiddenInstruments = allHiddenInstruments.filter(
    (instrument) => !isInstrumentForEntireMethod(instrument)
  );

  /**
   * Create disabled methods
   */
  const hiddenMethods = allHiddenInstruments
    .filter(isInstrumentForEntireMethod)
    .map((instrument) => instrument.method);

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
export function translateExternal(options) {
  return _translate(options, true);
}

/**
 * Translate from internal representation
 * @param {Object} options
 *
 * @returns {Object}
 */
function translateInternal(options) {
  return _translate(options, false);
}
