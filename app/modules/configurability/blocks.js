import { createInstrument } from './instruments';

/**
 * Creates a block from the block config
 * @param {string} code
 * @param {Object} config
 *  @prop {Array<Instrument>} instruments
 *
 * @returns {Object}
 */
export function createBlock(code, config = {}) {
  const block = {
    code,
    type: 'block',
  };

  const { instruments, name } = config;

  if (instruments) {
    block.instruments = _Arr.map(config.instruments, createInstrument);
  }

  if (name) {
    block.title = name;
  }

  return block;
}
