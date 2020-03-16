import { createInstrument, isInstrumentForEntireMethod } from './instruments';
import { createBlock } from './blocks';

/**
 * Translates the options
 * @param {Object} options Options passed
 * @param {boolean} external Is this an external representation?
 *
 * @returns {Object} translated
 *  @prop {Array<Block>} blocks
 *  @prop {Object} exclude
 *    @prop {Array<Instruments>} instruments Excluded insturments
 *    @prop {Array<string>} methods Excluded methods
 */
function _translate(options, external) {
  options = _Obj.clone(options);

  const { blocks = {}, exclude = [] } = options;

  /**
   * Create blocks
   */
  let includedBlocks = [];

  _Obj.loop(blocks, (value, code) => {
    if (external) {
      code = `block.${code}`;
    }

    const block = createBlock(code, value);

    if (block) {
      includedBlocks.push(block);
    }
  });

  /**
   * Create excluded instruments
   */
  const allExcludedInstruments =
    exclude |> _Arr.map(createInstrument) |> _Arr.filter(Boolean);

  const excludedInstruments = _Arr.filter(
    allExcludedInstruments,
    instrument => !isInstrumentForEntireMethod(instrument)
  );

  /**
   * Create disabled methods
   */
  const excludedMethods =
    allExcludedInstruments
    |> _Arr.filter(isInstrumentForEntireMethod)
    |> _Arr.map(instrument => instrument.method);

  return {
    blocks: includedBlocks,
    exclude: {
      instruments: excludedInstruments,
      methods: excludedMethods,
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
