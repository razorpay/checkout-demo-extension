/**
 * Check if international providers are in preferred instrument.
 * @param {*} instrument
 * @returns boolean
 */
export const isInternationalInPreferredInstrument = (instrument = {}) => {
  const { method, providers = [] } = instrument;
  return (
    ['app', 'international'].includes(method) &&
    providers.length > 0 &&
    (providers.includes('trustly') || providers.includes('poli'))
  );
};

/**
 * Get provider name from instrument.
 * @param {*} instrument
 * @returns
 */
export const getInternationalProviderName = (instrument = {}) => {
  const { providers = [] } = instrument;
  return Array.isArray(providers) ? providers[0] : null;
};

/**
 * Update international providers method name to international
 * @param {*} instruments
 * @returns
 */
export const updateInternationalProviders = (instruments) => {
  return instruments.map((instrument) => {
    if (isInternationalInPreferredInstrument(instrument)) {
      instrument.method = 'international';
    }

    return instrument;
  });
};
