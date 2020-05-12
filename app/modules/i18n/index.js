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
  return Promise.resolve({
    netbanking: {
      select_label: 'Select a different bank2',
      select_help: 'Please select a bank2',
    },
    methods: {
      prefixes: {
        card: 'Cards2',
        netbanking: 'Netbanking2',
        emi: 'EMI2',
        paylater: 'PayLater2',
        paypal: 'PayPal2',
        qr: 'UPI QR2',
        upi: 'UPI2',
        wallet: 'Wallets2',
        gpay: 'Google Pay2',
      },
      titles: {
        card: 'Card2',
        cardless_emi: 'EMI2',
        credit_card: 'Credit Card2',
        debit_card: 'Debit Card2',
        emi: 'EMI2',
        nach: 'NACH2',
        netbanking: 'Netbanking2',
        paylater: 'Pay Later2',
        paypal: 'PayPal2',
        qr: 'UPI QR2',
        upiqr: 'UPI / QR2',
        upi: 'UPI2',
        gpay: 'Google Pay2',
        wallet: 'Wallet2',
        bank_transfer: 'Bank Transfer2',
      },
    },
  });
  // return new Promise((resolve, reject) => {
  //   fetch({
  //     url: makeBundleUrl(locale),
  //     callback: (response) => {
  //       if (response.error) {
  //         reject(response.error);
  //       } else {
  //         resolve(response);
  //       }
  //     },
  //   });
  // });
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
