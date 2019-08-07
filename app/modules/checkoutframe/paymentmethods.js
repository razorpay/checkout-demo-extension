import { getProvider as getCardlessEmiProvider } from 'common/cardlessemi';
import { getProvider as getPayLaterProvider } from 'common/paylater';

/**
 * Returns the text with commas or "and" as the separator.
 * Example: list: ['a', 'b', 'c', 'd'], max: 2 - returns "a, b & More"
 * Example: list: ['a', 'b'], max: 2 - returns "a and b"
 * @param {Array} list
 * @param {Number} max
 *
 * @return {String}
 */
function generateTextFromList(list, max) {
  if (list.length <= max) {
    return list.slice(0, max).join(' and ');
  } else {
    return `${list.slice(0, max).join(', ')} & More`;
  }
}

const CARD_DESCRIPTION = ({ session }) => {
  if (session.recurring_card_text) {
    return session.recurring_card_text;
  }

  const networks = ['MasterCard', 'Visa'];

  if (!session.irctc) {
    networks.push('RuPay');
    networks.push('Maestro');
  }

  if (session.preferences.methods.amex) {
    networks.push('Amex');
  }

  return networks.join(', ');
};

/**
 * Map of method v/s description fn
 */
const DESCRIPTIONS = {
  card: CARD_DESCRIPTION,
  cardless_emi: ({ session }) => {
    /**
     * EMI + Cardless EMI: Cards, ZestMoney, & More
     * Cardless EMI: EMI via ZestMoney & More
     */

    const providers = [];
    const cardEmi = session.methods.emi;
    const cardlessEmiProviders = session.methods.cardless_emi;

    if (cardEmi) {
      providers.push('Cards');
    }

    if (cardlessEmiProviders && _.isNonNullObject(cardlessEmiProviders)) {
      _Obj.loop(cardlessEmiProviders, (_, code) => {
        const cardlessEmiProviderObj = getCardlessEmiProvider(code);

        if (cardlessEmiProviderObj) {
          providers.push(cardlessEmiProviderObj.name);
        }
      });
    }

    const text = generateTextFromList(providers, 2);

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
  paylater: ({ session }) => {
    const providers = [];
    const paylaterProviders = session.methods.paylater;

    if (paylaterProviders && _.isNonNullObject(paylaterProviders)) {
      _Obj.loop(paylaterProviders, (_, code) => {
        const paylaterProviderObj = getPayLaterProvider(code);

        if (paylaterProviderObj) {
          providers.push(paylaterProviderObj.name);
        }
      });
    }

    const text = generateTextFromList(providers, 2);

    return `Pay later using ${text}`;
  },
  paypal: () => 'Pay using PayPal wallet',
  qr: () => 'Pay by scanning QR Code',
  gpay: () => 'Instant payment using Google Pay App',
  upi: () => 'Instant payment using UPI App',
  wallet: ({ session }) => {
    const walletNames = _Arr.map(
      session.methods.wallet.slice(0, 2),
      item => item.name
    );

    if (session.methods.wallet.length <= 2) {
      return walletNames.join(' and ');
    } else {
      return walletNames.join(', ') + ' & More';
    }
  },
};

/**
 * Returns an array of all supported methods
 *
 * @returns {Array<string>}
 */
export const getAllMethods = () => _Obj.keys(DESCRIPTIONS);

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

/**
 * Returns the prefix for the given method.
 * @param {String} method
 * @return {String}
 */
export function getMethodPrefix(method) {
  switch (method) {
    case 'card':
    case 'credit_card':
    case 'debit_card':
      return 'Cards';

    case 'netbanking':
    case 'emandate':
      return 'Netbanking';

    case 'emi':
    case 'cardless_emi':
      return 'EMI';

    case 'paylater':
      return 'PayLater';

    case 'paypal':
      return 'PayPal';

    case 'qr':
      return 'UPI QR';

    case 'upi':
      return 'UPI';

    case 'wallet':
      return 'Wallets';

    case 'gpay':
      return 'Google Pay';

    default:
      return method[0].toUpperCase() + method.slice(1);
  }
}

/**
 * Returns the name for the payment method.
 * Used for showing the name with payment icon
 * @param {string} method
 * @param {Object} extra
 *  @prop {Session} session
 *
 * @returns {string}
 */
export function getMethodNameForPaymentOption(method, { session }) {
  switch (method) {
    case 'upi':
      if (session.methods.qr) {
        return 'UPI / QR';
      }

      return session.tab_titles.upi;

    default:
      return session.tab_titles[method];
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
  { availableMethods, downMethods = [] }
) {
  const prefix = getMethodPrefix(method);
  const pluralPrefix = /s$/i.test(prefix);
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
