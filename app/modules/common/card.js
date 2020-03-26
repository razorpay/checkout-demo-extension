import RazorpayConfig from 'common/RazorpayConfig';
import { generateTextFromList } from 'lib/utils';
import { getCommonBankName } from 'common/bank';

export const networks = {
  amex: 'American Express',
  diners: 'Diners Club',
  maestro: 'Maestro',
  mastercard: 'MasterCard',
  rupay: 'RuPay',
  visa: 'Visa',
  bajaj: 'Bajaj Finserv',
  unknown: 'unknown',
};

const cdnUrl = RazorpayConfig.cdn;
const fullPrefix = cdnUrl + 'acs/network/';

export const getFullNetworkLogo = code => `${fullPrefix}${code}.svg`;

/**
 * Strips everything but digits.
 * @param {String} cardNumber
 *
 * @return {String}
 */
export const getCardDigits = cardNumber => cardNumber.replace(/\D/g, '');

/**
 * Returns the IIN of the card.
 * @param {String} cardNumber
 *
 * @return {String}
 */
export const getIin = cardNumber => getCardDigits(cardNumber).slice(0, 6);

/**
 * @param {String} name {eg: MasterCard}
 *
 * @return {String} {eg: mastercard}
 */
export const findCodeByNetworkName = name => {
  let code;

  _Obj.loop(networks, (val, key) => {
    if (name === val || name === key) {
      code = key;
    }
  });

  return code;
};

/**
 * @param {String} code {eg: mastercard}
 *
 * @return {String} {eg: MasterCard}
 */
export const findNetworkNameByCode = code => {
  return networks[code];
};

const cardPatterns = [
  {
    name: 'visa',
    regex: /^4/,
  },
  {
    name: 'mastercard',
    regex: /^(5[1-5]|2[2-7])/,
  },
  {
    name: 'maestro16',
    regex: /^(50(81(25|26|59|92)|8227)|4(437|681))/,
  },
  {
    name: 'amex',
    regex: /^3[47]/,
  },
  // keep more specific rupay above catchall maestro
  {
    name: 'rupay',
    regex: /^(508[5-9]|60(80(0|)[^0]|8[1-4]|8500|698[5-9]|699|7[^9]|79[0-7]|798[0-4])|65(2(1[5-9]|[2-9])|30|31[0-4])|817[2-9]|81[89]|820[01])/,
  },
  {
    name: 'discover',
    regex: /^(65[1,3-9]|6011)/,
  },
  {
    name: 'maestro',
    regex: /^(6|5(0|[6-9])).{5}/,
  },
  {
    name: 'diners',
    regex: /^3[0689]/,
  },
  {
    name: 'jcb',
    regex: /^35/,
  },
  {
    name: 'bajaj',
    regex: /^203040/,
  },
];

const cardLengths = {
  amex: 15,
  diners: 14,
  maestro: 19,
  '': 19,
};

export const getCardType = cardNumber => {
  cardNumber = cardNumber.replace(/\D/g, '');
  let cardType = '';
  _Arr.loop(cardPatterns, card => {
    if (card.regex.test(cardNumber)) {
      if (!cardType) {
        cardType = card.name;
      }
    }
  });
  return cardType;
};

export const getCardMaxLen = cardType => cardLengths[cardType] || 16;

export const getCardSpacing = maxLen => {
  if (maxLen !== 19) {
    if (maxLen < 16) {
      return /(^.{4}|.{6})/g;
    } else {
      return /(.{4})/g;
    }
  }
};

export const luhnCheck = num => {
  let sum = 0;
  let digits = String(num)
    .split('')
    .reverse();

  for (var i = 0; i < digits.length; i++) {
    let digit = digits[i];
    digit = parseInt(digit, 10);
    if (i % 2) {
      digit *= 2;
    }
    if (digit > 9) {
      digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0;
};

/**
 * Checks if the card network in payment is one among the list provided.
 * @param {Object} paymentData
 * @param {Array} listOfNetworks
 * @param {*} tokens
 */
export function isCardNetworkInPaymentOneOf(
  paymentData,
  listOfNetworks,
  tokens = []
) {
  const cardNumber = paymentData['card[number]'];
  const token = paymentData['token'];
  let network = '';

  if (token) {
    const cardToken = _Arr.find(tokens, t => t.token === token);

    if (cardToken && cardToken.card && cardToken.card.network) {
      network = cardToken.card.network;
    }
  } else if (cardNumber) {
    network = getCardType(cardNumber);
  } else {
    // Not a card payment
    return false;
  }

  network = network.toLowerCase();

  return Boolean(
    _Arr.find(
      listOfNetworks,
      listNetwork => listNetwork.toLowerCase() === network
    )
  );
}

/**
 * Generates a string from the list after filtering for truthy values
 * @param {Array<string>} list
 *
 * @returns {string}
 */
function concatTruthyString(list) {
  return list |> _Arr.filter(Boolean) |> _Arr.join(' ');
}

/**
 * Creates subtext to be used for a Card Instrument
 * To understand how the strings are supposed to be generated,
 * take a look at the tests, or the document here:
 * https://docs.google.com/spreadsheets/d/1Yqz_4GBT0aSxvYu1xjflQLy2I-PnLq5GZsFY8Pi-3OY/edit?usp=sharing
 * @param {Instrument} instrument
 *
 * @returns {string}
 */
export function getSubtextFromCardInstrument(instrument) {
  const instrumentIssuers =
    instrument.issuers || []
    |> _Arr.map(bank => getCommonBankName(bank).replace(/ Bank$/, ''));
  const instrumentNetworks =
    instrument.networks || [] |> _Arr.map(network => networks[network]);
  const instrumentTypes = instrument.types || [];

  const issuersLength = instrumentIssuers.length;
  const networksLength = instrumentNetworks.length;
  const typesLength = instrumentTypes.length;

  const allIssusers = issuersLength === 0;
  const allNetworks = networksLength === 0;
  const allTypes = typesLength === 0;

  if (allIssusers) {
    let stringList = ['Only'];

    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!allTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (allNetworks) {
      if (allTypes) {
        return 'All cards supported';
      }
    } else if (networksLength <= 2) {
      networksString = generateTextFromList(instrumentNetworks, 2);
    } else {
      if (allTypes) {
        networksString = 'select networks';
        cardsString = null;
      } else {
        networksString = 'select network';
      }
    }

    stringList = _Arr.mergeWith(stringList, [
      networksString,
      typesString,
      cardsString,
      'supported',
    ]);

    return concatTruthyString(stringList);
  } else if (issuersLength === 1) {
    let stringList = ['Only'];

    let issuersString = instrumentIssuers[0];
    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!allTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (allNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      networksString = instrumentNetworks[0];
    } else {
      issuersString = `select ${issuersString}`;
    }

    stringList = _Arr.mergeWith(stringList, [
      issuersString,
      networksString,
      typesString,
      cardsString,
      'supported',
    ]);

    return concatTruthyString(stringList);
  } else if (issuersLength === 2) {
    let stringList = ['Only'];

    let issuersString = generateTextFromList(instrumentIssuers, 2);
    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!allTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (allNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      if (allTypes) {
        networksString = instrumentNetworks[0];
      } else {
        issuersString = `select ${issuersString}`;
      }
    } else {
      issuersString = `select`;
    }

    stringList = _Arr.mergeWith(stringList, [
      issuersString,
      networksString,
      typesString,
      cardsString,
      'supported',
    ]);

    return concatTruthyString(stringList);
  } else {
    let stringList = ['Only'];

    let issuersString = 'select';
    let typesString;
    let cardsString = 'cards';
    let networksString;

    if (!allTypes) {
      typesString = generateTextFromList(instrumentTypes);
    }

    if (allNetworks) {
      // Do nothing
    } else if (networksLength === 1) {
      networksString = instrumentNetworks[0];
    } else {
      issuersString = `select`;
    }

    stringList = _Arr.mergeWith(stringList, [
      issuersString,
      networksString,
      typesString,
      cardsString,
      'supported',
    ]);

    return concatTruthyString(stringList);
  }
}
