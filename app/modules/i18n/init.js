import {
  addMessages,
  init as initSvelteI18n,
  isLoading,
  locale,
  register,
  waitLocale,
  getLocaleFromNavigator,
  t,
} from 'svelte-i18n';

import { get } from 'svelte/store';

import en from './bundles/en';

import { getSession } from 'sessionmanager';
import { getLanguageCode, getLanguageCodeFromPrefs } from 'checkoutstore';
import { shouldUseVernacular } from 'checkoutstore/methods';
import Analytics from 'analytics';
import { getSegmentOrCreate } from 'experiments';
import { ignoreFirstCall } from 'svelte-utils';

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

function getValidLocaleFromConfig() {
  let language = getLanguageCode();

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
    // If the locale from storage is not allowed, do not return it.
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
  return getValidLocaleFromStorage() || getValidLocaleFromConfig() || 'en';
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
  // Svelte store always calls the callback with the value of the
  // store when a subscription is added. We do not want to track the initial
  // value, and only want to track changes. Hence we ignore the first call to
  // `handleLocaleChanged`.
  locale.subscribe(ignoreFirstCall(handleLocaleChanged));
}

function handleLocaleChanged(value) {
  Analytics.setMeta('locale.current', value);
  Analytics.track('i18n:locale:switch', {
    data: { locale: value },
  });
  setLocaleInStorage(value);
  updateRetryBtnText();
}

// TODO: Remove this once overlay is moved to Svelte
function updateRetryBtnText() {
  _Doc.querySelector('#fd-hide').innerText = get(t)('misc.retry');
}

export function init() {
  // Add bundled messages
  addDefaultMessages();

  let initialLocale = 'en';

  const isVernacularEnabled = shouldUseVernacular();
  const isExperimentEnabled =
    getSegmentOrCreate('vernacular_default_selection') === 1;

  // We need to determine a default language only for the experiment.
  // Otherwise, it will always be English.
  if (isVernacularEnabled && isExperimentEnabled) {
    initialLocale = determineInitialLocale();
  }

  Analytics.setMeta('locale.initial', initialLocale);
  Analytics.setMeta('locale.current', initialLocale);
  Analytics.setMeta('locale.default', getLanguageCodeFromPrefs());

  initSvelteI18n({
    fallbackLocale: 'en',
    initialLocale,
  });

  // waitLocale returns undefined when the language is already loaded, which is
  // the case when it is english. We return a promise that immediately resolves
  // in that case.
  return waitLocale() || Promise.resolve();
}
