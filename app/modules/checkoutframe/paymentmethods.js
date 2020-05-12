import { TAB_TITLES, AVAILABLE_METHODS } from 'common/constants';
import {
  isMethodEnabled,
  getPayLaterProviders,
  getCardlessEMIProviders,
  getWallets,
  getCardNetworks,
  getEMIBanks,
} from 'checkoutstore/methods';
import { getRecurringMethods, isRecurring } from 'checkoutstore';
import { generateTextFromList } from 'lib/utils';

import { getBundle } from 'i18n';

function getRecurringCardDescription() {
  if (isRecurring()) {
    return getRecurringMethods().card?.credit?.join(' and ') + ' credit cards';
  }
}

const CARD_DESCRIPTION = ({ session }) => {
  const recurring_text = getRecurringCardDescription();
  if (recurring_text) {
    return recurring_text;
  }

  // Keep in order that we want to display
  const NW_MAP = {
    VISA: 'Visa',
    MC: 'MasterCard',
    RUPAY: 'RuPay',
    AMEX: 'Amex',
    DICL: 'Diners Club',
    MAES: 'Maestro',
    JCB: 'JCB',
  };

  // Get all networks from preferences.
  const networksFromPrefs = getCardNetworks();

  // Get the network names to show
  const networks =
    NW_MAP
    |> _Obj.keys
    |> _Arr.filter((network) => Boolean(networksFromPrefs[network]))
    |> _Arr.map((network) => NW_MAP[network]);

  return generateTextFromList(networks, 4);
};

/**
 * Map of method v/s description fn
 */
const DESCRIPTIONS = {
  card: CARD_DESCRIPTION,
  cardless_emi: () => {
    /**
     * EMI + Cardless EMI: Cards, ZestMoney, & More
     * Cardless EMI: EMI via ZestMoney & More
     */

    const cardEmi = isMethodEnabled('emi');
    let providerNames = [];
    _Obj.loop(getCardlessEMIProviders(), (providerObj) => {
      providerNames.push(providerObj.name);
    });

    if (cardEmi) {
      providerNames.unshift('Cards');
    }

    const text = generateTextFromList(providerNames, 3);

    if (cardEmi) {
      return text;
    } else {
      return `EMI via ${text}`;
    }
  },
  credit_card: CARD_DESCRIPTION,
  debit_card: CARD_DESCRIPTION,
  emandate: () => 'Pay with Netbanking',
  emi: () => 'EMI via Credit & Debit Cards',
  netbanking: () => 'All Indian banks',
  paylater: () => {
    const providers = getPayLaterProviders().map((p) => p.name);
    const text = generateTextFromList(providers, 2);

    return `Pay later using ${text}`;
  },
  paypal: () => 'Pay using PayPal wallet',
  qr: () => 'Pay by scanning QR Code',
  gpay: () => 'Instant payment using Google Pay App',
  upi: () => 'Instant payment using UPI App',
  wallet: () =>
    generateTextFromList(
      getWallets().map((w) => w.name),
      2
    ),
};

/**
 * Returns an array of all supported methods
 *
 * @returns {Array<string>}
 */
export const getAllMethods = () => AVAILABLE_METHODS;

/**
 * Returns the method description.
 * @param {String} method
 * @param {Object} props
 *  @prop {Object} session
 *
 * @return {String}
 */
export function getMethodDescription(method, props) {
  const fn = DESCRIPTIONS[method];

  if (!fn) {
    return '';
  }

  return fn(props);
}

export function getEMIBanksText() {
  const emiBanks = getEMIBanks();
  const bankNames =
    emiBanks |> _Obj.keys |> _Arr.map((bank) => emiBanks[bank].name);
  return generateTextFromList(bankNames, 12);
}

/**
 * Returns the prefix for the given method.
 * @param {String} method
 * @param {string} locale
 * @return {String}
 */
export function getMethodPrefix(method, locale = 'en') {
  const bundle = getBundle(locale);
  const methodKey = getMethodForPrefix(`methods.prefixes.${method}`);
  // TODO: remove capitalized fallback
  return bundle[methodKey] || method[0].toUpperCase() + method.slice(1);
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
 * @param {Object} extra
 *  @prop {Session} session
 * @param {string} locale
 *
 * @returns {string}
 */
export function getMethodNameForPaymentOption(method, extra = {}, locale) {
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
        return 'UPI / QR';
      }

      return TAB_TITLES.upi;
    }

    case 'cardless_emi': {
      if (hasInstrument) {
        return 'Cardless EMI';
      }

      return TAB_TITLES[method];
    }

    default:
      return TAB_TITLES[method];
  }
}

/**
 * Returns the downtime description for the given method.
 * @param {String} method
 * @param {Object} param1
 *  @prop {Array} availableMethods
 */
export function getMethodDowntimeDescription(
  method,
  { availableMethods = [], downMethods = [] } = {}
) {
  const prefix = getMethodPrefix(method);
  const pluralPrefix = /s$/i.test(prefix);
  const isOrAre = pluralPrefix ? 'are' : 'is';

  const sentences = [`${prefix} ${isOrAre} facing temporary issues right now.`];

  // Check if there's another method available that is not down.
  const isAnotherMethodAvailable = _Arr.any(
    availableMethods,
    (enabledMethod) => !_Arr.contains(downMethods, enabledMethod)
  );

  // If there's another method available, ask user to select it.
  if (isAnotherMethodAvailable) {
    sentences.push('Please select another method.');
  }

  return sentences.join(' ');
}
