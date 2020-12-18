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
  hi: 'Hindi',
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
  return `https://cdn.razorpay.com/static/i18n-bundles/checkout/${locale}.json`;
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
