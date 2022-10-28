import Analytics from 'analytics';

import { dictionary, t, locale } from 'svelte-i18n';

import { get } from 'svelte/store';

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
  try {
    return get(t)(label, { locale, values: data, default: defaultValue });
  } catch (e) {
    Analytics.track('i18n:template:error', {
      data: {
        message: e.message,
        label,
        locale,
        data,
      },
    });
    return defaultValue || label;
  }
}

export const formatCountriesMessage = (instrumentCountries) => {
  let countriesString;
  instrumentCountries
    .map((data) => {
      if (data.includes('non_IN')) {
        return (countriesString = 'international');
      } else if (data.includes('IN')) {
        return (countriesString = 'Indian');
      }
      return;
    })
    .filter((countriesString) => !!countriesString);
  return countriesString;
};

/**
 * Formats the message with the given locale
 * @param {string} label
 * @param {string} locale
 * @param {string} [defaultValue]
 * @returns {string}
 */
export function formatMessageWithLocale(label, locale, defaultValue) {
  const value = get(t)(label, { locale, default: defaultValue });
  if (value === label && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }
  return value;
}

/**
 * Formats the message with the current locale
 * @param {string} label
 * @param {string} [defaultValue]
 * @returns {string}
 */
export function format(label, defaultValue) {
  const locale = getCurrentLocale();
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
export function getRawMethodTitle(method, locale) {
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
 * Returns the app name for the given locale
 * @param {string} providerCode
 * @param {string} locale
 * @returns {string}
 */
export function getAppProviderName(providerCode, locale) {
  return formatMessageWithLocale(`app.providers.${providerCode}.name`, locale);
}

/**
 * Returns the app subtext for the given locale
 * @param {string} providerCode
 * @param {string} locale
 * @returns {string}
 */
export function getAppProviderSubtext(providerCode, locale) {
  return formatMessageWithLocale(
    `app.providers.${providerCode}.subtext`,
    locale
  );
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
 * Returns the cardless emi provider data like subtitle, sideLabel, highlightLabel
 * @param {string} providerCode
 * @param {string} dataKey
 * @param {string} locale
 * @returns {string}
 */
export function getCardlessEmiProviderData(providerCode, dataKey, locale) {
  return formatMessageWithLocale(
    `cardless_emi.${providerCode}.${dataKey}`,
    locale,
    ''
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
 * Returns the wallet subtitle for the given locale
 * @param {string} walletCode
 * @param {string} locale
 * @returns {string}
 */
export function getWalletSubtitle(walletCode, locale) {
  return formatMessageWithLocale(`wallets_subtitle.${walletCode}`, locale, '');
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
 * @param {string} label
 * @param {Object} data
 * @returns {string}
 */
export function translatePaymentPopup(label, data = {}) {
  return formatTemplateWithLocale(`popup.${label}`, data, getCurrentLocale());
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
/**
 * Returns the title to be shown on OTP screen for a given view
 * @param {string} view
 * @param {Object} data
 * @param {string} locale
 * @returns {string}
 */
export function getOtpScreenHeading(view, data, locale) {
  const res = formatTemplateWithLocale(
    `otp.heading.${view}`,
    data,
    locale,
    view
  );
  return res === view ? '' : res;
}

/**
 * Returns the miscellaneous text to be shown on OTP screen
 * @param {string} key
 * @param {Object} data
 * @param {string} locale
 * @returns {string}
 */
export function getOtpScreenMiscText(key, data, locale) {
  return formatTemplateWithLocale(`otp.misc.${key}`, data, locale, key);
}

/**
 * Returns the name for a given EMI issuer
 * @param {string} issuer
 * @param {string} locale
 * @param {string} [defaultValue]
 *
 * @returns {string}
 */
export function getEmiIssuerName(issuer, locale, defaultValue) {
  return formatMessageWithLocale(`emi_issuers.${issuer}`, locale, defaultValue);
}

/**
 * Translates error description that is returned from API. Falls back to the
 * passed description if a translation is not available.
 *
 * @param {string} description
 * @param {string} locale
 * @return {string}
 */
export function translateErrorDescription(description, locale) {
  return formatMessageWithLocale(
    `errors.descriptions.${description}`,
    locale,
    description
  );
}

export function translateEmiTabName(tab, locale) {
  return formatMessageWithLocale(`emi.${tab}`, locale);
}
