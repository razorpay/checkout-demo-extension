import ConfigExtractors from './extractors';

/**
 * Extracts display config from instrument
 * @param {Object} instrument
 * @return {Object}
 */
function extractConfigData(instrument) {
  let extractor = ConfigExtractors[instrument.method];
  if (!extractor) {
    extractor = v => v; // TODO: how do we handle unknown method?
  }
  return extractor(instrument);
}

/**
 * Adds meta properties to indicate that the config is for a personalized
 * instrument.
 *
 * @param {Object} config
 * @return {Object}
 */
function addMetaProperties(config) {
  config = _Obj.clone(config);
  config.meta = {
    preferred: true,
  };
  return config;
}

/**
 * Translate p13n instrument to display config
 * @param {Object} instrument
 * @return {Object}
 */
export function translateInstrumentToConfig(instrument) {
  return addMetaProperties(
    addTokenData(extractConfigData(instrument), instrument)
  );
}

/**
 * Adds token data from p13n instrument to config
 * @param config
 * @param instrument
 * @return {Object}
 */
function addTokenData(config, instrument) {
  config = _Obj.clone(config);
  if (instrument.token_id) {
    config.token_id = instrument.token_id;
  }
  return config;
}
