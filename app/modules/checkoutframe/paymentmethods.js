import { AVAILABLE_METHODS } from 'common/constants';
import {
  isMethodEnabled,
  getPayLaterProviders,
  getCardlessEMIProviders,
  getWallets,
  getCardNetworks,
  getAppsForCards,
  getEMIBanks,
  isMethodUsable,
  isDebitEMIEnabled,
  isCreditCardEnabled,
  isDebitCardEnabled,
} from 'checkoutstore/methods';

import { getRecurringMethods, isIRCTC, isRecurring } from 'checkoutstore';
import { generateTextFromList } from 'i18n/text-utils';

import {
  getMethodPrefix,
  getRawMethodTitle,
  getNetworkName,
  getPaylaterProviderName,
  getCardlessEmiProviderName,
  getRawMethodDescription,
  getWalletName,
  formatTemplateWithLocale,
  formatMessageWithLocale,
} from 'i18n';

import {
  DESCRIPTION_RECURRING_CARDS,
  DESCRIPTION_CARDLESS_EMI,
} from 'ui/labels/methods';

function getRecurringCardDescription(locale) {
  // TODO: fix this to return network codes instead of names
  const recurringNetworks = getRecurringMethods().card?.credit || [];
  const networks = generateTextFromList(recurringNetworks, locale);
  return formatTemplateWithLocale(
    DESCRIPTION_RECURRING_CARDS, // LABEL: {networks} credit cards
    { networks },
    locale
  );
}

/**
 *
 * @param {String} locale i18n locale
 * @param {'credit'|'debit'} [cardType] card-type to which specific desc required.
 * @returns {String}
 */
const CARD_DESCRIPTION = (locale, cardType = '') => {
  if (isRecurring()) {
    return getRecurringCardDescription(locale);
  }

  // Get all apps from preferences.
  const availableApps = getAppsForCards();

  // Show card type instead of card networks if apps are available.
  if (availableApps.length) {
    // Keep in order that we want to display
    const APPS_ORDER = ['cred', 'google_pay'];
    // Get the app names to show
    const apps =
      APPS_ORDER
      |> _Arr.filter((app) => _Arr.contains(availableApps, app))
      |> _Arr.map((app) => getRawMethodTitle(app, locale));

    const credit = isCreditCardEnabled();
    const debit = isDebitCardEnabled();

    let razorpayMethod;
    if (credit && debit && !cardType) {
      if (apps.length > 1) {
        // LABEL: Credit/Debit
        razorpayMethod = getMethodPrefix('credit_debit', locale);
      } else {
        // LABEL: Credit/Debit cards
        razorpayMethod = getMethodPrefix('credit_debit_cards', locale);
      }
    } else if (credit && (!cardType || cardType === 'credit')) {
      // LABEL: Credit cards
      razorpayMethod = getMethodPrefix('credit_cards', locale);
    } else if (debit && (!cardType || cardType === 'debit')) {
      // LABEL: Debit cards
      razorpayMethod = getMethodPrefix('debit_cards', locale);
    }

    apps.unshift(razorpayMethod);

    // Credit/Debit, CRED, and Google Pay Cards
    return generateTextFromList(apps, locale, 4);
  } else {
    // Keep in order that we want to display
    const NW_ORDER = ['VISA', 'MC', 'RUPAY', 'AMEX', 'DICL', 'MAES', 'JCB'];

    // Get all networks from preferences.
    const networksFromPrefs = getCardNetworks();

    // Get the network names to show
    const networks =
      NW_ORDER
      |> _Arr.filter((network) => Boolean(networksFromPrefs[network]))
      |> _Arr.map((network) => getNetworkName(network, locale));

    return generateTextFromList(networks, locale, 4);
  }
};

/**
 * Map of method v/s description fn
 */
const DESCRIPTIONS = {
  card: CARD_DESCRIPTION,
  cardless_emi: (locale) => {
    /**
     * EMI + Cardless EMI: Cards, ZestMoney, & More
     * Cardless EMI: EMI via ZestMoney & More
     */

    const cardEmi = isMethodUsable('emi');
    let providerNames = [];
    _Obj.loop(getCardlessEMIProviders(), (providerObj) => {
      let providerCode = providerObj.code;
      if (providerCode === 'cards' && isDebitEMIEnabled()) {
        providerCode = 'credit_debit_cards';
      }
      providerNames.push(getCardlessEmiProviderName(providerCode, locale));
    });

    // special treatment to walnut 369
    const walnut369Name = getCardlessEmiProviderName('walnut369', locale);
    const walnutPosition = providerNames.indexOf(walnut369Name);
    if (walnutPosition >= 1) {
      providerNames.splice(walnutPosition, 1);
      providerNames.unshift(walnut369Name);
    }

    if (cardEmi) {
      if (isDebitEMIEnabled()) {
        providerNames.unshift(getMethodPrefix('debit_credit_cards', locale));
      } else {
        providerNames.unshift(getMethodPrefix('card', locale));
      }
    }

    const text = generateTextFromList(providerNames, locale, 3);

    if (cardEmi) {
      return text;
    } else {
      return formatTemplateWithLocale(
        DESCRIPTION_CARDLESS_EMI, // LABEL: EMI via {text}
        { text },
        locale
      );
    }
  },
  credit_card: (locale) => CARD_DESCRIPTION(locale, 'credit'),
  debit_card: (locale) => CARD_DESCRIPTION(locale, 'debit'),
  emandate: (locale) => getRawMethodDescription('emandate', locale),
  emi: (locale) => getRawMethodDescription('emi', locale),
  netbanking: (locale) => getRawMethodDescription('netbanking', locale),
  paylater: (locale) => {
    const providers = getPayLaterProviders().map((p) =>
      getPaylaterProviderName(p.code, locale)
    );
    const text = generateTextFromList(providers, locale, 2);
    return formatTemplateWithLocale(
      'methods.descriptions.paylater',
      { providers: text },
      locale
    );
  },
  paypal: (locale) => getRawMethodDescription('paypal', locale),
  qr: (locale) => getRawMethodDescription('qr', locale),
  gpay: (locale) => getRawMethodDescription('gpay', locale),
  upi: (locale) => {
    if (isRecurring()) {
      return getRawMethodDescription('upi_recurring', locale);
    }

    return getRawMethodDescription('upi', locale);
  },
  wallet: (locale) =>
    generateTextFromList(
      getWallets().map((w) => getWalletName(w.code, locale)),
      locale,
      2
    ),
  upi_otm: (locale) => getRawMethodDescription('upi_otm', locale),
  cod: (locale) => getRawMethodDescription('cod', locale),
};

/**
 * Returns an array of all supported methods
 *
 * @returns {Array<string>}
 */
export const getAllMethods = () => AVAILABLE_METHODS;

/**
 * Returns the method description.
 * @param {string} method
 * @param {string} locale
 *
 * @return {string}
 */
export function getMethodDescription(method, locale) {
  const fn = DESCRIPTIONS[method];

  if (!fn) {
    return '';
  }

  return fn(locale);
}

export function getEMIBanksText(locale) {
  const emiBanks = getEMIBanks();
  const bankNames =
    emiBanks |> _Obj.keys |> _Arr.map((bank) => emiBanks[bank].name);
  return generateTextFromList(bankNames, locale, 12);
}

/**
 * Returns the prefix for the given method.
 * @param {String} method
 * @param {string} locale
 * @return {String}
 */
export function getTranslatedMethodPrefix(method, locale) {
  const methodKey = getMethodForPrefix(method);
  return getMethodPrefix(methodKey, locale);
}

/**
 * Returns the method that should be displayed in the prefix for a given method.
 * Some methods, such as cardless EMI, are displayed as emi on the prefix. This
 * function handles the translation for cardless_emi -> emi.
 *
 * @param {string} method
 * @returns {string}
 */
function getMethodForPrefix(method) {
  switch (method) {
    case 'credit_card':
    case 'debit_card':
      return 'card';

    case 'emandate':
      return 'netbanking';

    case 'cardless_emi':
      return 'emi';

    default:
      return method;
  }
}

/**
 * Returns the overridden method title for some specific merchants
 * @param {string} method
 * @param {string} locale
 *
 * @returns {string}
 */
function getMethodTitle(method, locale) {
  if (isIRCTC()) {
    if (method === 'card') {
      method = 'irctc_card';
    }
    if (method === 'upi') {
      method = 'irctc_upi';
    }
  }

  return getRawMethodTitle(method, locale);
}

/**
 * Returns the name for the payment method.
 * Used for showing the name with payment icon
 * @param {string} method
 * @param {string} locale
 * @param {Object} extra
 *  @prop {Session} session
 *
 * @returns {string}
 */
export function getMethodNameForPaymentOption(method, locale, extra = {}) {
  let hasInstrument = extra.instrument;
  let qrEnabled;
  let hasQr;

  switch (method) {
    case 'upi': {
      qrEnabled = isMethodEnabled('qr');
      hasQr = qrEnabled;

      if (qrEnabled && hasInstrument) {
        hasQr = _Arr.contains(extra.instrument.flows || [], 'qr');
      }

      if (hasQr) {
        return getMethodTitle('upiqr', locale);
      }

      return getMethodTitle('upi', locale);
    }

    case 'cardless_emi': {
      if (hasInstrument) {
        return getMethodTitle('cardless_emi', locale);
      }

      return getMethodTitle('emi', locale);
    }

    case 'emandate': {
      return getMethodTitle('emandate', locale);
    }

    default:
      return getMethodTitle(method, locale);
  }
}

/**
 * Returns the downtime description for the given method.
 * @param {string} method
 * @param {string} locale
 * @param {Object} param1
 *  @prop {Array} availableMethods
 */
export function getMethodDowntimeDescription(
  method,
  locale,
  { availableMethods = [], downMethods = [] } = {}
) {
  const prefix = getTranslatedMethodPrefix(method, locale);
  const pluralPrefix = /s$/i.test(prefix);

  const templateLabel = pluralPrefix
    ? 'misc.downtime_multiple_methods'
    : 'misc.downtime_single_method';

  const sentences = [
    formatTemplateWithLocale(templateLabel, { method: prefix }, locale),
  ];

  // Check if there's another method available that is not down.
  const isAnotherMethodAvailable = availableMethods.some(
    (enabledMethod) => !_Arr.contains(downMethods, enabledMethod)
  );

  // If there's another method available, ask user to select it.
  if (isAnotherMethodAvailable) {
    sentences.push(
      formatMessageWithLocale('misc.select_another_method', locale)
    );
  }

  return sentences.join(' ');
}
