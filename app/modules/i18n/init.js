import {
  addMessages,
  init as initSvelteI18n,
  isLoading,
  locale,
  register,
  waitLocale,
  getLocaleFromNavigator,
} from 'svelte-i18n';

import en from './bundles/en';

import { getSession } from 'sessionmanager';
import { getLanguageCode, getMerchantLanguage } from 'checkoutstore';

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
    Analytics.track('i18n:bundle:fetch:start', {
      data: { locale },
    });
    fetch({
      url: makeBundleUrl(locale),
      callback: response => {
        if (response.error) {
          Analytics.track('i18n:bundle:fetch:failure', {
            data: { locale },
          });
          reject(response.error);
        } else {
          Analytics.track('i18n:bundle:fetch:success', {
            data: { locale },
          });
          resolve(response);
        }
      },
    });
  });
}

function getValidMerchantLanguage() {
  let language = getMerchantLanguage();

  // If the language is set to "auto", we need to determine it from the browser.
  if (language === 'auto') {
    const localeFromNavigator = getLocaleFromNavigator();
    if (localeFromNavigator) {
      // Navigator locale is of the form {language}-{country}. We need to
      // extract the language part of it.
      language = localeFromNavigator.split('-')[0];
    }
  }

  if (isAllowedLocale(language)) {
    return language;
  }
  return null;
}

function getValidLocaleFromStorage() {
  try {
    const localeFromStorage = global.localStorage.getItem('locale');
    // If the locale from storage is not allowed, use en as the default.
    if (isAllowedLocale(localeFromStorage)) {
      return localeFromStorage;
    }
  } catch (e) {}
  return null;
}

/**
 * Determines the initial locale to be used for rendering. Order of priority is
 * as follows:
 *
 * 1. Local Storage
 * 2. Checkout options
 * 3. Config on API
 * 4. English
 *
 * @returns {string}
 */
function determineInitialLocale() {
  // If the user has changed locale earlier, use it.
  return (
    getValidLocaleFromStorage() ||
    getValidMerchantLanguage() ||
    getLanguageCode() ||
    'en'
  );
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
    Analytics.setMeta('locale.current', value);
    setLocaleInStorage(value);
  });
}

export function init() {
  // Add bundled messages
  addDefaultMessages();

  const initialLocale = determineInitialLocale();

  Analytics.setMeta('locale.initial', initialLocale);

  initSvelteI18n({
    fallbackLocale: 'en',
    initialLocale,
  });

  // waitLocale returns undefined when the language is already loaded, which is
  // the case when it is english. We return a promise that immediately resolves
  // in that case.
  return waitLocale() || Promise.resolve();
}
