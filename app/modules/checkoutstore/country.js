import { get, writable } from 'svelte/store';

/**
 * type Array<{
 *  countryName: string;
 *  countryCode: string;
 *  countryAlpha3Code: string;
 * }>
 */
export const allCountries = writable([]);

/**
 * type {
 *  [countryCode: string]: Array<{
 *    stateName: string;
 *    stateCode: string;
 *  }>
 * }
 */
export const allStates = writable({});

export const setAllCountries = (countries) => {
  allCountries.set(countries);
};

/**
 * Set states for country by country code
 * @param {*} countryCode
 * @param {*} state
 */
export const setStatesByCountryCode = (countryCode, state) => {
  if (countryCode) {
    allStates.update((states) => {
      return {
        ...states,
        [countryCode]: state,
      };
    });
  }
};

/**
 * Get states of country by country code
 * @param {*} countryCode
 * @returns
 */
export const getStatesByCountryCodeFromStore = (countryCode) => {
  if (countryCode) {
    return get(allStates)[countryCode] || [];
  }

  return [];
};

/**
 * Get country by name
 * @param {*} name
 * @returns
 */
export const getCountryByName = (name) => {
  return (
    get(allCountries).find(
      (country) => country.countryName.toLowerCase() === name?.toLowerCase()
    ) || null
  );
};

/**
 * Get state by country code and stateName
 * @param {*} countryCode
 * @param {*} stateName
 * @returns
 */
export const getStateByName = (countryCode, stateName) => {
  return (
    (countryCode &&
      get(allStates)[countryCode]?.find(
        (state) => state.stateName.toLowerCase() == stateName?.toLowerCase()
      )) ||
    null
  );
};
