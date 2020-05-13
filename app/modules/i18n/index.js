import {
  addMessages,
  init as initSvelteI18n,
  register,
  isLoading,
  dictionary,
  t,
} from 'svelte-i18n';

import { get } from 'svelte/store';

import en from './bundles/en';

import { getSession } from 'sessionmanager';

/**
 * Returns the URL for the locale bundle on CDN
 * @param locale {string}
 * @returns {string}
 */
function makeBundleUrl(locale) {
  // TODO: change URL once finalized
  return `https://cdn.razorpay.com/bundles/${locale}.json`;
}

/**
 * Fetches the bundle for a given locale.
 * @param locale {string}
 * @returns {Promise<Object>}
 */
function fetchBundle(locale) {
  return new Promise((resolve, reject) => {
    fetch({
      url: makeBundleUrl(locale),
      callback: (response) => {
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

  isLoading.subscribe((value) => {
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
 * Returns the bundle stored for a given locale
 * @param {string} locale
 * @returns {Object}
 */
export function getBundle(locale) {
  const bundles = get(dictionary);
  return bundles[locale];
}

/**
 * Returns the method prefix for the current locale
 * @param {string} method
 * @returns {string}
 */
export function getMethodPrefix(method) {
  return get(t)(`methods.prefixes.${method}`);
}

/**
 * Returns the method title for the current locale
 * @param {string} method
 * @returns {string}
 */
export function getMethodTitle(method) {
  return get(t)(`methods.titles.${method}`);
}

/**
 * Returns the network name for the current locale
 * @param {string} network
 * @returns {string}
 */
export function getNetworkName(network) {
  return get(t)(`networks.${network.toUpperCase()}`);
}

/**
 * Returns the method description for the current locale
 * @param {string} method
 * @returns {string}
 */
export function getRawMethodDescription(method) {
  return get(t)(`methods.descriptions.${method}`);
}

/**
 * Returns the pay later provider name for the current locale
 * @param {string} providerCode
 * @returns {string}
 */
export function getPaylaterProviderName(providerCode) {
  return get(t)(`paylater.providers.${providerCode}`);
}

/**
 * Returns the cardless emi provider name for the current locale
 * @param {string} providerCode
 * @returns {string}
 */
export function getCardlessEmiProviderName(providerCode) {
  return get(t)(`cardless_emi.providers.${providerCode}`);
}

/**
 * Returns the wallet name for the current locale
 * @param {string} walletCode
 * @returns {string}
 */
export function getWalletName(walletCode) {
  return get(t)(`wallets.${walletCode}`);
}

/**
 * Returns the bank name for the current locale
 * @param bankCode
 * @returns {*}
 */
export function getBankName(bankCode) {
  return get(t)(`banks.${bankCode.toUpperCase()}`);
}
