import {
  validateKeysAndCreateInstrument,
  createInstrument,
} from './instruments';
import { getUniqueValues } from 'utils/array';

/**
 *
 * @param {Object} obj
 * @returns object with sorted ordered members and (if: member values arrays with unique values)
 */
function sortAndUniqObj(obj) {
  return Object.keys(obj)
    .sort()
    .reduce(function (result, key) {
      let value = obj[key];
      if (Array.isArray(value)) {
        value = getUniqueValues(value);
      }
      result[key] = value;
      return result;
    }, {});
}

/**
 *
 * @param {Instruments} instruments
 * @returns unique instruments
 */
function removeDuplicateInstruments(instruments) {
  return getUniqueValues(instruments, sortAndUniqObj);
}

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

  let { instruments, name } = config;

  if (instruments) {
    instruments = removeDuplicateInstruments(instruments);
    block.instruments =
      instruments
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
