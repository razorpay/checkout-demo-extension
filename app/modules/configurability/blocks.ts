import {
  validateKeysAndCreateInstrument,
  createInstrument,
  sendInvalidConfigEvent,
} from './instruments';
import { getUniqueValues } from 'utils/array';
import type {
  Config,
  Block,
  Instruments,
  PartialInstrumentKey,
} from 'configurability/types';
import type { ErrorParam } from 'error-service/types';

/**
 *
 * @param {Object} obj
 * @returns object with sorted ordered members and (if: member values arrays with unique values)
 */
function sortAndUniqObj(obj: Instruments) {
  return (Object.keys(obj) as Array<keyof Instruments>)
    .sort()
    .reduce(function (result: Instruments, key) {
      let value = obj[key] as string;
      if (Array.isArray(value)) {
        value = getUniqueValues(value);
      }
      result[key as PartialInstrumentKey] = value;
      return result;
    }, {} as Instruments);
}

/**
 *
 * @param {Instruments} instruments
 * @returns unique instruments
 */
function removeDuplicateInstruments(instruments: Instruments[]) {
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
function _createBlock(code: string, config: Config = {}, validate = false) {
  const block: Block = {
    code,
    _type: 'block',
  };

  try {
    let { instruments } = config;
    const { name } = config;

    if (instruments) {
      instruments = removeDuplicateInstruments(instruments);
      block.instruments = (instruments as Instruments[])
        .map(validate ? validateKeysAndCreateInstrument : createInstrument)
        .filter(Boolean) as Instruments[];
    }

    if (name) {
      block.title = name;
    }

    return block;
  } catch (error) {
    sendInvalidConfigEvent(error as ErrorParam);
  }
}

/**
 * Creates a block from the block config
 * @param {string} code
 * @param {Object} config
 *  @prop {Array<Instrument>} instruments
 *
 * @returns {Object}
 */
export function createBlock(code: string, config?: Config) {
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
export function validateAndCreateBlock(code: string, config: Config) {
  return _createBlock(code, config, true);
}
