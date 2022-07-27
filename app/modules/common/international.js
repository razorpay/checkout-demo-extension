import { get } from 'svelte/store';

import { getMerchantMethods } from 'razorpay';
import RazorpayConfig from 'common/RazorpayConfig';
import {
  contact as customerContact,
  getCustomerCountryISOCode,
} from 'checkoutstore/screens/home';
import { INDIA_COUNTRY_ISO_CODE } from 'common/constants';

const cdnUrl = RazorpayConfig.cdn;

export const INTERNATIONAL_APPS = {
  TRUSTLY: 'trustly',
  POLI: 'poli',
  SOFORT: 'sofort',
  GIROPAY: 'giropay',
};

export const INTERNATIONAL_WALLETS = {
  PAYPAL: 'paypal',
};

/**
 * @returns {{ trustly: {}, poli: {}, sofort: {}, giropay: {} }}
 */
export const getInternationalAppsConfig = () => {
  const config = {};
  Object.keys(INTERNATIONAL_APPS).forEach((key) => {
    config[INTERNATIONAL_APPS[key]] = {
      code: INTERNATIONAL_APPS[key],
      logo: cdnUrl + 'international/' + INTERNATIONAL_APPS[key] + '.png',
      uri: '',
      package_name: '',
      isCompatibleWithSDK: ({ platform }) => {
        return platform === 'android' || platform === 'ios';
      },
    };
  });
  return config;
};

/**
 * Check if international providers are in preferred instrument.
 * @param {{ method: string, providers: string[] }} instrument
 * @returns {boolean}
 */
export const isInternationalInPreferredInstrument = (instrument = {}) => {
  const { method, providers = [] } = instrument;
  return (
    ['app', 'international'].includes(method) &&
    providers.length > 0 &&
    Object.values(INTERNATIONAL_APPS).some((provider) =>
      providers.includes(provider)
    )
  );
};

/**
 * Get provider name from instrument.
 * @param {*} instrument
 * @returns {string | null}
 */
export const getInternationalProviderName = (instrument = {}) => {
  const { providers = [] } = instrument;
  return Array.isArray(providers) ? providers[0] : null;
};

/**
 * Update international providers method name to international
 * @param {Array<{ method: string }>} instruments
 * @returns {Array<{ method: string }>}
 */
export const updateInternationalProviders = (instruments) => {
  return instruments.map((instrument) => {
    if (isInternationalInPreferredInstrument(instrument)) {
      instrument.method = 'international';
    }

    return instrument;
  });
};

/**
 * Check if the method is international
 * @param {string} providerName TRUSTLY, POLI, SOFORT, GIROPAY
 * @returns {boolean}
 */
export const isInternationalProvider = (providerName) => {
  return Object.values(INTERNATIONAL_APPS).includes(providerName);
};

/**
 * Check if DCC is enabled for the provider. By default DCC is enabled for all international apps.
 * @param {string} providerName TRUSTLY, POLI, SOFORT, GIROPAY, PAYPAL
 * @returns {boolean}
 */
export const isDCCEnabledForProvider = (providerName) => {
  return [
    ...Object.values(INTERNATIONAL_APPS),
    ...Object.values(INTERNATIONAL_WALLETS),
  ].includes(providerName);
};

/**
 * Check if merchant has international app enabled in preferences
 * @returns {boolean}
 */
export const isMerchantInternationalMethodEnabled = () => {
  const merchantApps = getMerchantMethods()?.app || {};
  return Object.values(INTERNATIONAL_APPS).some((app) => merchantApps[app]);
};

/**
 * Check if merchant has international app enabled in preferences
 * @param {string} app
 * @returns {boolean}
 */
export const isMerchantInternationalAppEnabled = (app) => {
  const merchantApps = getMerchantMethods()?.app || {};
  return !!merchantApps[app];
};

export const isCustomerWithIntlPhone = (countryCode) => {
  return countryCode && countryCode !== INDIA_COUNTRY_ISO_CODE;
};

export const getCustomerContactNumber = (contact) => {
  return contact || get(customerContact);
};

export const isInternationalCustomer = () => {
  return isCustomerWithIntlPhone(getCustomerCountryISOCode());
};
