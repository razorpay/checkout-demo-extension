/**
 * Popup template exists for razorpay.js as well. We don't want svelte-i18n to
 * be bundled with razorpay.js just to translate a few strings. These functions
 * below are wrappers on top of the i18n module that invoke it using discreet.js
 * which is only present for checkout-frame.js and not razorpay.js. For
 * razorpay.js there is a fallback defined in the same file that does not use
 * svelte-i18n.
 */

/**
 * Returns the current locale. If i18n is present, it returns the locale
 * configured there. Otherwise, it returns 'en' as a fallback.
 * @returns {string}
 */
export function getCurrentLocale() {
  if (global.discreet) {
    return global.discreet.I18n.getCurrentLocale.apply(null, arguments);
  }

  return defaultGetCurrentLocale.apply(null, arguments);
}

/**
 * Translates payment popup labels from using i18n. If i18n is not present,
 * translates them using a fallback.
 * @returns {string}
 */
export function translatePaymentPopup() {
  if (global.discreet) {
    return global.discreet.I18n.translatePaymentPopup.apply(null, arguments);
  }

  return defaultTranslatePaymentPopup.apply(null, arguments);
}

/**
 * Fallback for getCurrentLocale. Always returns 'en'.
 * @returns {string}
 */
function defaultGetCurrentLocale() {
  return 'en';
}

/**
 * Fallback for translatePaymentPopup. Uses hard-coded strings in this file to
 * perform translation.
 * @param {string} label
 * @param {Object} data
 * @returns {string}
 */
function defaultTranslatePaymentPopup(label, data) {
  return replaceLabels(labels[label], data);
}

/**
 * Replaces placeholders with data using the i18n interpolation syntax
 * @param {string} string
 * @param {Object} data
 * @returns {string}
 */
function replaceLabels(string, data) {
  _Obj.entries(data).forEach(([key, value]) => {
    string = string.replace(`{${key}}`, value);
  });
  return string;
}

const labels = {
  paying: 'PAYING',
  secured_by: 'Secured by',
  trying_to_load: 'Still trying to load...',
  want_to_cancel: 'Do you want to cancel the ongoing payment?',
  processing: 'Processing, Please Wait...',
  wait_while_we_redirect:
    'Please wait while we redirect you to your {method} page.',
  redirecting: 'Redirecting...',
  loading_method_page: 'Loading {method} page…',
  trying_bank_page_msg:
    'The bank page is taking time to load. You can either wait or change the payment method.',
};
