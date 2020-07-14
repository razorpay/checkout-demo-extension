import {
  addMessages,
  isLoading,
  register,
  init as initSvelteI18n,
} from 'svelte-i18n';

import en from './bundles/en';
import { getSession } from '../sessionmanager';

const LOCALES = {
  en: 'English',
  hi: 'हिंदी',
};

/**
 * Returns the display name for a given language.
 * @param {string} locale
 * @return {string}
 */
export function getLocaleName(locale) {
  return LOCALES[locale] || locale;
}

/**
 * Returns the URL for the locale bundle on CDN
 * @param {string} locale
 * @returns {string}
 */
function makeBundleUrl(locale) {
  return `https://betacdn.razorpay.com/static/i18n-bundles/checkout/${locale}.json`;
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

export function determineInitialLocale() {
  debugger;
  let localeFromStorage;
  try {
    localeFromStorage = global.localStorage.getItem('locale');
  } catch (e) {}

  // If the user has changed locale earlier, use it.
  // TODO: handle auto option from checkout.
  return localeFromStorage || getLanguageCode();
}

function setLocaleInStorage(locale) {
  global.localStorage.setItem('locale', locale);
}

export function addDefaultMessages() {
  addMessages('en', en);
  register('hi', () => fetchBundle('hi'));
}

export function init() {
  // Add bundled messages
  addDefaultMessages();

  const session = getSession();

  isLoading.subscribe(value => {
    if (value) {
      session.showLoadError('Loading', false, true);
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
