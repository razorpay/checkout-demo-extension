import { fetchAutocompleteSuggestions } from 'one_click_checkout/address/service';

/**
 *
 * @param {object} input An object with all input props
 * @param {function} listBuilder Callback which will return in required format given the response
 * @returns
 */
export const fetchSuggestionsResource = (
  { input, zipCode, selectedCountryISO },
  listBuilder
) => {
  return new Promise((resolve) => {
    fetchAutocompleteSuggestions(input, zipCode, selectedCountryISO)
      .then((response) => {
        if (response.status === 'OK') {
          const suggestions = listBuilder(response);
          resolve(suggestions);
        } else {
          resolve([]);
        }
      })
      .catch(() => {
        resolve([]);
      });
  });
};
