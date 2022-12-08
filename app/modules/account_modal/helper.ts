import { getIcons } from 'checkoutstore/theme';
import { countryCodesType, COUNTRY_CODES } from 'common/countrycodes';

/**
 * returns array of logos for account tab mapped with country
 * @param {countryCodesType} country country code
 * @returns {array[string]}
 */
export const getLogoByCountry = (country: countryCodesType) => {
  const { rzp_brand_logo, curlec_logo } = getIcons();
  switch (country) {
    case COUNTRY_CODES.MY:
      return [curlec_logo];

    default:
      return [rzp_brand_logo];
  }
};
