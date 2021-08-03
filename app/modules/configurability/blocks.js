import {
  validateKeysAndCreateInstrument,
  createInstrument,
} from './instruments';

/**
 * Creates a block from the block config
 * @param {string} code
 * @param {Object} config
 *  @prop {Array<Instrument>} instruments
 * @param {boolean} validate Should we validate the keys of instruments?
 *
 * @returns {Object}
 */
function _createBlock(code, config = {}, validate = false) {
  const block = {
    code,
    _type: 'block',
  };

  const { instruments, name } = config;

  if (instruments) {
    block.instruments =
      config.instruments
      |> _Arr.map(validate ? validateKeysAndCreateInstrument : createInstrument)
      |> _Arr.filter(Boolean);
  }

  if (name) {
    block.title = name;
  }

  return block;
}

/**
 * Creates a block from the block config
 * @param {string} code
 * @param {Object} config
 *  @prop {Array<Instrument>} instruments
 *
 * @returns {Object}
 */
export function createBlock(code, config) {
  return _createBlock(code, config, false);
}

/**
 * Creates a block from the block config
 * but performs validations on the keys of the instruments
 * @param {string} code
 * @param {Object} config
 *  @prop {Array<Instrument>} instruments
 *
 * @returns {Object}
 */
export function validateAndCreateBlock(code, config) {
  return _createBlock(code, config, true);
}
