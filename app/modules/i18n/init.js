import {
  addMessages,
  init as initSvelteI18n,
  isLoading,
  locale,
  register,
  waitLocale,
} from 'svelte-i18n';

import en from './bundles/en';

import { getSession } from '../sessionmanager';
import { getLanguageCode } from 'checkoutstore';

const LOCALES = {
  en: 'English',
  hi: 'हिंदी',
};

const ALLOWED_LOCALES = _Obj.keys(LOCALES);

function isAllowedLocale(locale) {
  return _Arr.any(ALLOWED_LOCALES, allowedLocale => locale === allowedLocale);
}

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

function determineInitialLocale() {
  let localeFromStorage;
  try {
    localeFromStorage = global.localStorage.getItem('locale');
  } catch (e) {}

  // If the user has changed locale earlier, use it.
  // TODO: handle auto option from checkout.
  let locale = localeFromStorage || getLanguageCode() || 'en';

  // If the locale from storage/API is not allowed, use en as the default.
  if (!isAllowedLocale(locale)) {
    locale = 'en';
  }

  return locale;
}

function setLocaleInStorage(locale) {
  global.localStorage.setItem('locale', locale);
}

export function addDefaultMessages() {
  addMessages('en', en);
  register('hi', () => fetchBundle('hi'));
}

export function bindI18nEvents() {
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
  locale.subscribe(value => {
    setLocaleInStorage(value);
  });
}

export function init() {
  // Add bundled messages
  addDefaultMessages();

  const initialLocale = determineInitialLocale();

  initSvelteI18n({
    fallbackLocale: 'en',
    initialLocale,
  });

  // waitLocale returns undefined when the language is already loaded, which is
  // the case when it is english. We return a promise that immediately resolves
  // in that case.
  return waitLocale() || Promise.resolve();
}
