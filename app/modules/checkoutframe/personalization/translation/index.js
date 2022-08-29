import ConfigExtractors from './extractors';
import * as ObjectUtils from 'utils/object';

/**
 * Extracts display config from instrument
 * @param {Object} instrument
 * @return {Object}
 */
function extractConfigData(instrument) {
  if (!instrument) {
    return;
  }

  let extractor = ConfigExtractors[instrument.method];
  if (!extractor) {
    return;
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
  config = ObjectUtils.clone(config);
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
  const config = extractConfigData(instrument);

  if (!config) {
    return;
  }

  return addMetaProperties(addTokenData(config, instrument));
}

/**
 * Adds token data from p13n instrument to config
 * @param config
 * @param instrument
 * @return {Object}
 */
function addTokenData(config, instrument) {
  config = ObjectUtils.clone(config);
  config.id = instrument.id;
  if (instrument.token_id) {
    config.token_id = instrument.token_id;
  }
  return config;
}
