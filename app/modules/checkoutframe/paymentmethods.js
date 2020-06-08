import { AVAILABLE_METHODS } from 'common/constants';
import {
  isMethodEnabled,
  getPayLaterProviders,
  getCardlessEMIProviders,
  getWallets,
  getCardNetworks,
  getEMIBanks,
  isMethodUsable,
  isDebitEMIEnabled,
} from 'checkoutstore/methods';

import { getRecurringMethods, isRecurring } from 'checkoutstore';
import { generateTextFromList } from 'lib/utils';

import {
  getMethodPrefix,
  getMethodTitle,
  getNetworkName,
  getPaylaterProviderName,
  getCardlessEmiProviderName,
  getRawMethodDescription,
  getWalletName,
  formatTemplateWithLocale,
} from 'i18n';

import {
  DESCRIPTION_RECURRING_CARDS,
  DESCRIPTION_CARDLESS_EMI,
} from 'ui/labels/methods';

function getRecurringCardDescription(locale) {
  // TODO: fix this to return network codes instead of names
  const recurringNetworks = getRecurringMethods().card?.credit || [];
  const networks = generateTextFromList(recurringNetworks);
  return formatTemplateWithLocale(
    DESCRIPTION_RECURRING_CARDS, // LABEL: {networks} credit cards
    { networks },
    locale
  );
}

const CARD_DESCRIPTION = locale => {
  if (isRecurring()) {
    return getRecurringCardDescription(locale);
  }

  // Keep in order that we want to display
  const NW_ORDER = ['VISA', 'MC', 'RUPAY', 'AMEX', 'DICL', 'MAES', 'JCB'];

  // Get all networks from preferences.
  const networksFromPrefs = getCardNetworks();

  // Get the network names to show
  const networks =
    NW_ORDER
    |> _Arr.filter(network => Boolean(networksFromPrefs[network]))
    |> _Arr.map(network => getNetworkName(network, locale));

  return generateTextFromList(networks, 4);
};

/**
 * Map of method v/s description fn
 */
const DESCRIPTIONS = {
  card: CARD_DESCRIPTION,
  cardless_emi: locale => {
    /**
     * EMI + Cardless EMI: Cards, ZestMoney, & More
     * Cardless EMI: EMI via ZestMoney & More
     */

    const cardEmi = isMethodUsable('emi');
    let providerNames = [];
    _Obj.loop(getCardlessEMIProviders(), providerObj => {
      let providerCode = providerObj.code;
      if (providerCode === 'cards' && isDebitEMIEnabled()) {
        providerCode = 'credit_debit_cards';
      }
      providerNames.push(getCardlessEmiProviderName(providerCode, locale));
    });

    if (cardEmi) {
      providerNames.unshift(getMethodPrefix('card', locale));
    }

    const text = generateTextFromList(providerNames, 3);

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
  credit_card: CARD_DESCRIPTION,
  debit_card: CARD_DESCRIPTION,
  emandate: locale => getRawMethodDescription('emandate', locale),
  emi: locale => getRawMethodDescription('emi', locale),
  netbanking: locale => getRawMethodDescription('netbanking', locale),
  paylater: locale => {
    const providers = getPayLaterProviders().map(p =>
      getPaylaterProviderName(p.code, locale)
    );
    const text = generateTextFromList(providers, 2);
    return formatTemplateWithLocale(
      'methods.descriptions.paylater',
      { providers: text },
      locale
    );
  },
  paypal: locale => getRawMethodDescription('paypal', locale),
  qr: locale => getRawMethodDescription('qr', locale),
  gpay: locale => getRawMethodDescription('gpay', locale),
  upi: locale => getRawMethodDescription('upi', locale),
  wallet: locale =>
    generateTextFromList(
      getWallets().map(w => getWalletName(w.code, locale)),
      2
    ),
  upi_otm: locale => getRawMethodDescription('upi_otm', locale),
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

export function getEMIBanksText() {
  const emiBanks = getEMIBanks();
  const bankNames =
    emiBanks |> _Obj.keys |> _Arr.map(bank => emiBanks[bank].name);
  return generateTextFromList(bankNames, 12);
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

    default:
      return getMethodTitle(method, locale);
  }
}

/**
 * Returns the downtime description for the given method.
 * @param {string} method
 * @param {Object} param1
 *  @prop {Array} availableMethods
 */
export function getMethodDowntimeDescription(
  method,
  { availableMethods = [], downMethods = [] } = {}
) {
  const prefix = getTranslatedMethodPrefix(method);
  const pluralPrefix = /s$/i.test(prefix);

  // TODO: use templates
  const isOrAre = pluralPrefix ? 'are' : 'is';

  const sentences = [`${prefix} ${isOrAre} facing temporary issues right now.`];

  // Check if there's another method available that is not down.
  const isAnotherMethodAvailable = _Arr.any(
    availableMethods,
    enabledMethod => !_Arr.contains(downMethods, enabledMethod)
  );

  // If there's another method available, ask user to select it.
  if (isAnotherMethodAvailable) {
    sentences.push('Please select another method.');
  }

  return sentences.join(' ');
}
