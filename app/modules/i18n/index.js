import {
  addMessages,
  init as initSvelteI18n,
  register,
  isLoading,
  dictionary,
  t,
  locale,
} from 'svelte-i18n';

import { get } from 'svelte/store';

import en from './bundles/en';

import { getSession } from 'sessionmanager';

import popupLabels from 'ui/labels/popup';

/**
 * Returns the URL for the locale bundle on CDN
 * @param {string} locale
 * @returns {string}
 */
function makeBundleUrl(locale) {
  // TODO: change URL once finalized
  return `https://cdn.razorpay.com/bundles/${locale}.json`;
}

/**
 * Fetches the bundle for a given locale.
 * @param {string} locale
 * @returns {Promise<Object>}
 */
function fetchBundle(locale) {
  return new Promise((resolve, reject) => {
    fetch({
      url: makeBundleUrl(locale),
      callback: response => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      },
    });
  });
}

export function init() {
  // Add bundled messages
  addMessages('en', en);
  register('hi', () => fetchBundle('hi'));

  const session = getSession();

  isLoading.subscribe(value => {
    if (value) {
      // TODO: lock overlay and prevent dismissal
      session.showLoadError('Loading');
    } else {
      // TODO: fix this and remove try/catch
      try {
        session.hideOverlayMessage();
      } catch (e) {}
    }
  });

  initSvelteI18n({
    fallbackLocale: 'en',
    initialLocale: 'en', // TODO: select from navigator
  });
}

/**
 * Returns the currently selected locale
 * @returns {string}
 */
export function getCurrentLocale() {
  return get(locale);
}

/**
 * Returns the bundle stored for a given locale
 * @param {string} locale
 * @returns {Object}
 */
export function getBundle(locale) {
  const bundles = get(dictionary);
  return bundles[locale];
}

/**
 * Returns template formatted using values from `data`.
 * @param {string} label
 * @param {Object} data
 * @param {string} locale
 * @param {string} [defaultValue]
 * @returns {string}
 */
export function formatTemplateWithLocale(label, data, locale, defaultValue) {
  return get(t)(label, { locale, values: data, default: defaultValue });
}

/**
 * Formats the message with the given locale
 * @param {string} label
 * @param {string} locale
 * @param {string} [defaultValue]
 * @returns {string}
 */
export function formatMessageWithLocale(label, locale, defaultValue) {
  return get(t)(label, { locale, default: defaultValue });
}

/**
 * Returns the method prefix for the given locale
 * @param {string} method
 * @param {string} locale
 * @returns {string}
 */
export function getMethodPrefix(method, locale) {
  return formatMessageWithLocale(`methods.prefixes.${method}`, locale);
}

/**
 * Returns the method title for the given locale
 * @param {string} method
 * @param {string} locale
 * @returns {string}
 */
export function getMethodTitle(method, locale) {
  return formatMessageWithLocale(`methods.titles.${method}`, locale);
}

/**
 * Returns the method title for the given locale
 * @param {string} method
 * @param {string} name
 * @param {string} locale
 * @returns {string}
 */
export function getInstrumentTitle(method, name, locale) {
  return formatTemplateWithLocale(
    `instruments.titles.${method}`,
    { name },
    locale
  );
}

/**
 * Returns the network name for the given locale
 * @param {string} network
 * @param {string} locale
 * @returns {string}
 */
export function getNetworkName(network, locale) {
  return formatMessageWithLocale(`networks.${network.toUpperCase()}`, locale);
}

/**
 * Returns the method description for the given locale
 * @param {string} method
 * @param {string} locale
 * @returns {string}
 */
export function getRawMethodDescription(method, locale) {
  return formatMessageWithLocale(`methods.descriptions.${method}`, locale);
}

/**
 * Returns the pay later provider name for the given locale
 * @param {string} providerCode
 * @param {string} locale
 * @returns {string}
 */
export function getPaylaterProviderName(providerCode, locale) {
  return formatMessageWithLocale(`paylater.providers.${providerCode}`, locale);
}

/**
 * Returns the cardless emi provider name for the given locale
 * @param {string} providerCode
 * @param {string} locale
 * @returns {string}
 */
export function getCardlessEmiProviderName(providerCode, locale) {
  return formatMessageWithLocale(
    `cardless_emi.providers.${providerCode}`,
    locale
  );
}

/**
 * Returns the wallet name for the given locale
 * @param {string} walletCode
 * @param {string} locale
 * @returns {string}
 */
export function getWalletName(walletCode, locale) {
  return formatMessageWithLocale(`wallets.${walletCode}`, locale);
}

/**
 * Returns the upi app name for the given locale
 * @param {string} shortcode upi app shortcode
 * @param {string} locale the locale in which the string is expected
 * @param {string} [defaultName]
 * @returns {string} translated upi app name
 */
export function getUpiIntentAppName(shortcode, locale, defaultName) {
  return formatMessageWithLocale(
    `upi_intent_apps.${shortcode}`,
    locale,
    defaultName
  );
}

/**
 * Returns the long bank name for the given locale
 * @param {string} bankCode
 * @param {string} locale
 * @param {string} [defaultValue]
 * @returns {string}
 */
export function getLongBankName(bankCode, locale, defaultValue) {
  return formatMessageWithLocale(
    `banks.long.${bankCode.toUpperCase()}`,
    locale,
    defaultValue
  );
}

/**
 * Returns the short bank name for the given locale
 * @param {string} bankCode
 * @param {string} locale
 * @returns {string}
 */
export function getShortBankName(bankCode, locale) {
  return get(t)(`banks.short.${bankCode.toUpperCase()}`, {
    locale,
    default: getLongBankName(bankCode, locale),
  });
}

/**
 * Returns the translated labels for popup
 * @param {string} tab
 * @param {string} locale
 * @returns {string}
 */
export function translatePaymentPopup(label, data = {}) {
  let translated = formatMessageWithLocale(
    `popup.${label}`,
    getCurrentLocale()
  );
  let variables = Object.keys(data);
  variables.forEach(variable => {
    translated = translated.replace(`{${variable}}`, data[variable]);
  });
  return translated;
}

/**
 * Returns the tab title for the given locale
 * @param {string} tab
 * @param {string} locale
 * @returns {string}
 */
export function getTabTitle(tab, locale) {
  return formatMessageWithLocale(`tab_titles.${tab}`, locale);
}

/**
 * Returns the title to be shown on OTP screen for a given view
 * @param {string} view
 * @param {Object} data
 * @param {string} locale
 * @returns {string}
 */
export function getOtpScreenTitle(view, data, locale) {
  return formatTemplateWithLocale(`otp.title.${view}`, data, locale, view);
}
