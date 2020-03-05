import InstrumentConfig from './instrument-config';

/**
 * Adds a type and category to an instrument
 * @param {Instrument} instrument
 *
 * @returns {Instrument}
 */
function addTypeAndCategory(instrument) {
  instrument.type = 'instrument';

  if (isInstrumentForEntireMethod(instrument)) {
    instrument.type = 'method';
  }

  return instrument;
}

const INSTRUMENT_CREATORS = {
  default: instrument => instrument,
};

/**
 * Creates an instrument from the instrument config
 * @param {Object} config
 *
 * @returns {Instrument|undefined}
 */
export function createInstrument(config) {
  const { method } = config;

  if (!method) {
    return;
  }

  const creator = INSTRUMENT_CREATORS[method] || INSTRUMENT_CREATORS.default;

  const instrument = creator(config) |> addTypeAndCategory;

  return instrument;
}

/**
 * Tells whether or not the instrument denotes an entire method.
 * Checks if none of the keys for the instrument's method are present
 * @param {Instrument} instrument
 *
 * @returns {boolean}
 */
export function isInstrumentForEntireMethod(instrument) {
  const method = instrument.method;
  const config = InstrumentConfig[method];

  if (!config) {
    return false;
  }

  const currentInsturmentKeys = _Obj.keys(instrument);

  // None of the keys in the config should be present in the instrument
  return _Arr.every(
    config.keys,
    key => !_Arr.contains(currentInsturmentKeys, key)
  );
}
