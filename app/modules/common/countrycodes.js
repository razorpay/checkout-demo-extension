// @ts-check

export const COUNTRY_TO_CODE_MAP = {
  AD: '376',
  AE: '971',
  AF: '93',
  AG: '1268',
  AI: '1264',
  AL: '355',
  AM: '374',
  AN: '599',
  AO: '244',
  AQ: '672',
  AR: '54',
  AS: '1684',
  AT: '43',
  AU: '61',
  AW: '297',
  AX: '358',
  AZ: '994',
  BA: '387',
  BB: '1246',
  BD: '880',
  BE: '32',
  BF: '226',
  BG: '359',
  BH: '973',
  BI: '257',
  BJ: '229',
  BL: '590',
  BM: '1441',
  BN: '673',
  BO: '591',
  BR: '55',
  BS: '1242',
  BT: '975',
  BW: '267',
  BY: '375',
  BZ: '501',
  CA: '1',
  CC: '61',
  CD: '243',
  CF: '236',
  CG: '242',
  CH: '41',
  CI: '225',
  CK: '682',
  CL: '56',
  CM: '237',
  CN: '86',
  CO: '57',
  CR: '506',
  CU: '53',
  CV: '238',
  CW: '599',
  CX: '61',
  CY: '357',
  CZ: '420',
  DE: '49',
  DJ: '253',
  DK: '45',
  DM: '1767',
  DO: '1849',
  DZ: '213',
  EC: '593',
  EE: '372',
  EG: '20',
  EH: '212',
  ER: '291',
  ES: '34',
  ET: '251',
  FI: '358',
  FJ: '679',
  FK: '500',
  FM: '691',
  FO: '298',
  FR: '33',
  GA: '241',
  GB: '44',
  GD: '1473',
  GE: '995',
  GF: '594',
  GG: '441481',
  GH: '233',
  GI: '350',
  GL: '299',
  GM: '220',
  GN: '224',
  GP: '590',
  GQ: '240',
  GR: '30',
  GT: '502',
  GU: '1671',
  GW: '245',
  GY: '592',
  HK: '852',
  HN: '504',
  HR: '385',
  HT: '509',
  HU: '36',
  ID: '62',
  IE: '353',
  IL: '972',
  IM: '441624',
  IN: '91',
  IO: '246',
  IQ: '964',
  IR: '98',
  IS: '354',
  IT: '39',
  JE: '441534',
  JM: '1876',
  JO: '962',
  JP: '81',
  KE: '254',
  KG: '996',
  KH: '855',
  KI: '686',
  KM: '269',
  KN: '1869',
  KP: '850',
  KR: '82',
  KW: '965',
  KY: '1345',
  KZ: '7',
  LA: '856',
  LB: '961',
  LC: '1758',
  LI: '423',
  LK: '94',
  LR: '231',
  LS: '266',
  LT: '370',
  LU: '352',
  LV: '371',
  LY: '218',
  MA: '212',
  MC: '377',
  MD: '373',
  ME: '382',
  MF: '590',
  MG: '261',
  MH: '692',
  MK: '389',
  ML: '223',
  MM: '95',
  MN: '976',
  MO: '853',
  MP: '1670',
  MQ: '596',
  MR: '222',
  MS: '1664',
  MT: '356',
  MU: '230',
  MV: '960',
  MW: '265',
  MX: '52',
  MY: '60',
  MZ: '258',
  NA: '264',
  NC: '687',
  NE: '227',
  NF: '672',
  NG: '234',
  NI: '505',
  NL: '31',
  NO: '47',
  NP: '977',
  NR: '674',
  NU: '683',
  NZ: '64',
  OM: '968',
  PA: '507',
  PE: '51',
  PF: '689',
  PG: '675',
  PH: '63',
  PK: '92',
  PL: '48',
  PM: '508',
  PN: '64',
  PR: '1939',
  PS: '970',
  PT: '351',
  PW: '680',
  PY: '595',
  QA: '974',
  RE: '262',
  RO: '40',
  RS: '381',
  RU: '7',
  RW: '250',
  SA: '966',
  SB: '677',
  SC: '248',
  SD: '249',
  SE: '46',
  SG: '65',
  SH: '290',
  SI: '386',
  SJ: '47',
  SK: '421',
  SL: '232',
  SM: '378',
  SN: '221',
  SO: '252',
  SR: '597',
  SS: '211',
  ST: '239',
  SV: '503',
  SX: '1721',
  SY: '963',
  SZ: '268',
  TC: '1649',
  TD: '235',
  TG: '228',
  TH: '66',
  TJ: '992',
  TK: '690',
  TL: '670',
  TM: '993',
  TN: '216',
  TO: '676',
  TR: '90',
  TT: '1868',
  TV: '688',
  TW: '886',
  TZ: '255',
  UA: '380',
  UG: '256',
  US: '1',
  UY: '598',
  UZ: '998',
  VA: '379',
  VC: '1784',
  VE: '58',
  VG: '1284',
  VI: '1340',
  VN: '84',
  VU: '678',
  WF: '681',
  WS: '685',
  XK: '383',
  YE: '967',
  YT: '262',
  ZA: '27',
  ZM: '260',
  ZW: '263',
};

/**
 * There are three possible scenarios for a given number:
 * 1. Starts with +
 * 2. Starts with 00
 * 3. Starts without + or 00
 *
 * For numbers starting with 00, the leading two zeroes are converted to +.
 *
 * Then, we check if the phone number is Indian or American.
 * If it's neither, we try to find the country code using this approach:
 * - Sort all the codes by decreasing length
 * - For each code, check if the phone number starts using that code. If it does, that is the desired code.
 */

const AMERICAN_REGEX = /^\(\d{3}\)[\s-]?\d{3}-?\d{4}$/;

const hasPlus = number => _Str.startsWith(number, '+');
const removePlus = number => number.replace(/^\+/, '');

function hasAtLeastTwoLeadingZeroes(number) {
  return /^0{2}/.test(number);
}

function removeLeadingZeroes(number) {
  return number.replace(/^0*/, '');
}

/**
 * Sanitizes a phone number
 * @param {string} number Phone number
 *
 * @returns {string}
 */
function sanitizeNumber(number) {
  // Decide whether or not to add plus
  if (hasAtLeastTwoLeadingZeroes(number)) {
    number = `+${removeLeadingZeroes(number)}`;
  } else {
    number = removeLeadingZeroes(number);
  }

  const startsWithPlus = _Str.startsWith(number, '+');

  let sanitized = number.replace(/\D/g, '');

  if (startsWithPlus) {
    sanitized = '+' + sanitized;
  }

  return sanitized;
}

/**
 * Returns the object if the number is Indian
 * @param {string} number
 *
 * @returns {Object}
 */
function getIndianNumber(number) {
  number = sanitizeNumber(number);

  // If it starts with + and is not followed by 91, it's not Indian
  if (hasPlus(number) && !_Str.startsWith(number, '+91')) {
    return {
      success: false,
    };
  }

  let phone = removePlus(number);
  let success = false;

  if (phone.length === 12 && _Str.startsWith(number, '91')) {
    phone = phone.slice(2);
  }

  if (phone.length === 10 && /^[6-9]/.test(phone)) {
    success = true;
  }

  return {
    success,
    phone,
    code: '91',
  };
}

/**
 * Returns the object if the number is American
 * @param {string} number
 *
 * @returns {Object}
 */
function getAmericanFormattedNumber(number) {
  number = number.trim();

  if (AMERICAN_REGEX.test(number)) {
    return {
      success: true,
      code: '1',
      phone: sanitizeNumber(number),
    };
  }

  return {
    success: false,
  };
}

/**
 * Finds country code for a given phonenumber
 * @param {string} phoneNumber
 * @returns {Object} With country code and phonenumber
 */
export function findCountryCode(phoneNumber) {
  let indian = getIndianNumber(phoneNumber);

  if (indian.success) {
    return {
      phone: indian.phone,
      code: indian.code,
    };
  }

  let american = getAmericanFormattedNumber(phoneNumber);

  if (american.success) {
    return {
      phone: american.phone,
      code: american.code,
    };
  }

  let number = sanitizeNumber(phoneNumber);

  const code = getCountryCodeFromNumber(number);

  let phone = removePlus(number);

  if (code) {
    phone = phone.slice(code.length);
  }

  return {
    phone,
    code,
  };
}

/**
 * Returns country code for a given international phonenumber
 * @param {string} number
 * @returns {string|undefined} country code
 */
function getCountryCodeFromNumber(number) {
  number = removePlus(number);

  let codesByLength = [];

  _Obj.loop(COUNTRY_TO_CODE_MAP, code => {
    const length = code.length;

    if (!codesByLength[length]) {
      codesByLength[length] = [];
    }

    codesByLength[length].push(code);
  });

  codesByLength = _Arr.filter(codesByLength, Boolean).reverse();

  for (let i = 0; i < codesByLength.length; i++) {
    const codes = codesByLength[i];

    const code = _Arr.find(codes, _code => _Str.startsWith(number, _code));

    if (code) {
      return code;
    }
  }

  return;
}
