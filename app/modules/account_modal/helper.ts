import { getIcons } from 'checkoutstore/theme';
import { COLORS } from 'common/constants';
import { countryCodesType, COUNTRY_CODES } from 'common/countrycodes';
import { getIcon } from 'ui/icons/payment-methods';

/**
 * returns array of logos for account tab mapped with country
 * @param {countryCodesType} country country code
 * @returns {array[string]}
 */
export const getLogoByCountry = (country: countryCodesType) => {
  const { curlec_logo } = getIcons();
  const rzp_brand_logo = getIcon('rzp_brand_logo', {
    foregroundColor: COLORS.RAZORPAY_LOGO_COLOR,
  });
  switch (country) {
    case COUNTRY_CODES.MY:
      return [curlec_logo];
    default:
      return [rzp_brand_logo];
  }
};
