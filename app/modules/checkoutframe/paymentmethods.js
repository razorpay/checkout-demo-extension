import { getProvider as getCardlessEmiProvider } from 'common/cardlessemi';

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
        providers.push(getCardlessEmiProvider(code).name);
      });
    }

    // Bajaj Finserv shows up in the Cardless EMI screen.
    if (session.emi_options.banks['BAJAJ']) {
      providers.push(getCardlessEmiProvider('bajaj').name);
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
  qr: () => 'Pay by scanning QR Code',
  tez: () => 'Instant payment using Google Pay App',
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
