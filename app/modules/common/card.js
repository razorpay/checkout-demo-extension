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
    regex: /^50(81(25|26|59|92)|8227)|4(437|681)/,
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
];

const cardLengths = {
  amex: 15,
  diners: 14,
  maestro: 19,
  '': 19,
};

export const getCardType = cardNumber => {
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
