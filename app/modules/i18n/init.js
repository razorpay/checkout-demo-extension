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
import fetch from 'utils/fetch';
import { get } from 'svelte/store';

import en from './bundles/en';

import { getSession } from 'sessionmanager';
import { getLanguageCode, getLanguageCodeFromPrefs } from 'razorpay';
import { shouldUseVernacular } from 'checkoutstore/methods';
import Analytics from 'analytics';
import { ignoreFirstCall } from 'svelte-utils';
import BrowserStorage from 'browserstorage';
import { showLoader } from 'one_click_checkout/account_modal/store';
import { isOneClickCheckout } from 'razorpay';
import { querySelector } from 'utils/doc';

const LOCALES = {
  en: 'English',
  ben: 'বাংলা',
  hi: 'हिंदी',
  mar: 'मराठी',
  guj: 'ગુજરાતી',
  tam: 'தமிழ்',
  tel: 'తెలుగు',
};

const ALLOWED_LOCALES = Object.keys(LOCALES);

function isAllowedLocale(locale) {
  return ALLOWED_LOCALES.some((allowedLocale) => locale === allowedLocale);
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
  return `https://cdn.razorpay.com/static/i18n-bundles/checkout/${locale}.json`;
}

let fetchCount = 0;

/**
 * Fetches the bundle for a given locale.
 * @param {string} locale
 * @returns {Promise<Object>}
 */
function fetchBundle(locale) {
  // Set meta property for counting no. of fetches
  fetchCount = fetchCount + 1;
  Analytics.setMeta('count.i18n:bundle:fetch', fetchCount);

  return new Promise((resolve, reject) => {
    Analytics.track('i18n:bundle:fetch:start', {
      data: { locale },
    });
    fetch({
      url: makeBundleUrl(locale),
      callback: (response) => {
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
  BrowserStorage.setItem('locale', locale);
}

export function addDefaultMessages() {
  addMessages('en', en);

  Object.keys(LOCALES).forEach((locale) => {
    if (locale !== 'en') {
      register(locale, () => fetchBundle(locale));
    }
  });
}

export function bindI18nEvents(retryErrorHandler = false, queryParams = {}) {
  const session = getSession();

  // Show loader whenever language bundle is loading
  isLoading.subscribe((value) => {
    if (value) {
      if (isOneClickCheckout()) {
        showLoader.set(true);
      } else {
        session.showLoadError('Loading', false, true);
      }
    } else {
      // TODO: fix this and remove try/catch
      try {
        /**
         * When there's an error via sdk, i18n Loading text takes over and gets dismissed after language resolution
         * We need to invoke the error handler again to display relevant error message
         */
        if (retryErrorHandler) {
          session.errorHandler(queryParams);
          retryErrorHandler = false;
        } else {
          if (isOneClickCheckout()) {
            showLoader.set(false);
          } else {
            session.hideOverlayMessage();
          }
        }
      } catch (e) {}
    }
  });

  // Set retry button to correct language initially
  updateRetryBtnText();

  // Svelte store always calls the callback with the value of the
  // store when a subscription is added. We do not want to track the initial
  // value, and only want to track changes. Hence we ignore the first call to
  // `handleLocaleChanged`.
  locale.subscribe(ignoreFirstCall(handleLocaleChanged));
}

let localeSwitchCount = 0;

function handleLocaleChanged(value) {
  // Set meta property for counting no. of switches
  localeSwitchCount += 1;
  Analytics.setMeta('count.i18n:locale:switch', localeSwitchCount);

  Analytics.track('i18n:locale:switch', {
    data: { to: value },
  });

  Analytics.setMeta('locale.current', value);
  setLocaleInStorage(value);
  updateRetryBtnText();
}

// TODO: Remove this once overlay is moved to Svelte
function updateRetryBtnText() {
  const retryButtonEl = querySelector('#fd-hide');
  if (retryButtonEl) {
    retryButtonEl.innerText = get(t)('misc.retry');
  }
}

export function init() {
  // Add bundled messages
  addDefaultMessages();

  let initialLocale = 'en';

  const isVernacularEnabled = shouldUseVernacular();

  if (isVernacularEnabled) {
    initialLocale = determineInitialLocale();
  }

  initSvelteI18n({
    fallbackLocale: 'en',
    initialLocale,
    warnOnMissingMessages: false,
  });

  Analytics.setMeta('locale.initial', initialLocale);
  Analytics.setMeta('locale.current', initialLocale);
  Analytics.setMeta('locale.previous', getValidLocaleFromStorage());
  Analytics.setMeta('locale.default', getLanguageCodeFromPrefs());
  Analytics.setMeta('count.i18n:bundle:fetch', fetchCount);
  Analytics.setMeta('count.i18n:locale:switch', localeSwitchCount);

  // waitLocale returns undefined when the language is already loaded, which is
  // the case when it is english. We return a promise that immediately resolves
  // in that case.
  return waitLocale() || Promise.resolve();
}
