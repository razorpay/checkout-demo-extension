/* eslint-disable no-useless-escape */
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

const hasPlus = (number) => number.startsWith('+');
const removePlus = (number) => number.replace(/^\+/, '');

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

  const startsWithPlus = number.startsWith('+');

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
  if (hasPlus(number) && !number.startsWith('+91')) {
    return {
      success: false,
    };
  }

  let phone = removePlus(number);
  let success = false;

  if (phone.length === 12 && number.startsWith('91')) {
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

  _Obj.loop(COUNTRY_TO_CODE_MAP, (/** @type {string} */ code) => {
    const length = code.length;

    if (!codesByLength[length]) {
      codesByLength[length] = [];
    }

    codesByLength[length].push(code);
  });

  codesByLength = codesByLength.filter(Boolean).reverse();

  for (let i = 0; i < codesByLength.length; i++) {
    const codes = codesByLength[i];

    const code = codes.find((/** @type {string} */ _code) =>
      number.startsWith(_code)
    );

    if (code) {
      return code;
    }
  }

  return;
}

export const COUNTRY_POSTALS_MAP = {
  AF: {
    pattern: '^[0-9]{4}$',
    name: 'Afghanistan',
  },
  AL: {
    pattern: null,
    name: 'Albania',
  },
  AN: {
    pattern: null,
    name: 'Netherlands Antilles',
  },
  AQ: {
    pattern: null,
    name: 'Antarctica',
  },
  AX: {
    pattern: null,
    name: 'Åland Islands',
  },
  CC: {
    pattern: null,
    name: 'Cocos Islands',
  },
  CX: {
    pattern: null,
    name: 'Christmas Island',
  },
  EH: {
    pattern: null,
    name: 'Western Sahara',
  },
  DZ: {
    pattern: '^[0-9]{5}$',
    name: 'Algeria',
  },
  AS: {
    pattern: null,
    name: 'American Samoa',
  },
  AD: {
    pattern: '^AD ?[0-9]{3}$',
    name: 'Andorra',
  },
  AO: {
    pattern: null,
    name: 'Angola',
  },
  AI: {
    pattern: null,
    name: 'Anguilla',
  },
  AG: {
    pattern: null,
    name: 'Antigua and Barbuda',
  },
  AR: {
    pattern: '^[A-Z]{1}[0-9]{4}[A-Z]{3}$',
    name: 'Argentina',
  },
  AM: {
    pattern: '^[0-9]{4}$',
    name: 'Armenia',
  },
  AW: {
    pattern: null,
    name: 'Aruba',
  },
  AU: {
    pattern: '^[0-9]{4}$',
    name: 'Australia',
  },
  AT: {
    pattern: '^[0-9]{4}$',
    name: 'Austria',
  },
  AZ: {
    pattern: '^[0-9]{4}$',
    name: 'Azerbaijan',
  },
  BS: {
    pattern: null,
    name: 'Bahamas',
  },
  BH: {
    pattern: null,
    name: 'Bahrain',
  },
  BD: {
    pattern: '^[0-9]{4}$',
    name: 'Bangladesh',
  },
  BB: {
    pattern: '^BB[0-9]{5}$',
    name: 'Barbados',
  },
  BY: {
    pattern: '^[0-9]{6}$',
    name: 'Belarus',
  },
  BE: {
    pattern: '^[0-9]{4}$',
    name: 'Belgium',
  },
  BZ: {
    pattern: null,
    name: 'Belize',
  },
  BJ: {
    pattern: null,
    name: 'Benin',
  },
  BM: {
    pattern: '^[A-Z]{2}[0-9]{2}$',
    name: 'Bermuda',
  },
  BT: {
    pattern: '^[0-9]{5}$',
    name: 'Bhutan',
  },
  BO: {
    pattern: null,
    name: 'Bolivia',
  },
  BA: {
    pattern: null,
    name: 'Bosnia and Herzegovina',
  },
  BW: {
    pattern: null,
    name: 'Botswana',
  },
  BR: {
    pattern: '^[0-9]{5}-[0-9]{3}$',
    name: 'Brazil',
  },
  BN: {
    pattern: '^[A-Z]{2}[0-9]{4}$',
    name: 'Brunei',
  },
  BG: {
    pattern: '^[0-9]{4}$',
    name: 'Bulgaria',
  },
  BF: {
    pattern: null,
    name: 'Burkina Faso',
  },
  BI: {
    pattern: null,
    name: 'Burundi',
  },
  KH: {
    pattern: '^[0-9]{5}$',
    name: 'Cambodia',
  },
  CM: {
    pattern: null,
    name: 'Cameroon',
  },
  CA: {
    pattern: '^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$',
    name: 'Canada',
  },
  CV: {
    pattern: null,
    name: 'Cape Verde',
  },
  KY: {
    pattern: '^[A-Z]{2}[0-9]-[0-9]{4}$',
    name: 'Cayman Islands',
  },
  CF: {
    pattern: null,
    name: 'Central African Republic',
  },
  TD: {
    pattern: null,
    name: 'Chad',
  },
  CL: {
    pattern: '^[0-9]{7}$',
    name: 'Chile',
  },
  CN: {
    pattern: '^[0-9]{6}$',
    name: "China, People's Republic",
  },
  CO: {
    pattern: '^[0-9]{6}$',
    name: 'Colombia',
  },
  KM: {
    pattern: null,
    name: 'Comoros',
  },
  CG: {
    pattern: null,
    name: 'Congo',
  },
  CD: {
    pattern: null,
    name: 'Congo, The Democratic Republic of',
  },
  CK: {
    pattern: null,
    name: 'Cook Islands',
  },
  CR: {
    pattern: '^[0-9]{5}$',
    name: 'Costa Rica',
  },
  HR: {
    pattern: '^[0-9]{5}$',
    name: 'Croatia',
  },
  CU: {
    pattern: '^[0-9]{5}$',
    name: 'Cuba',
  },
  CW: {
    pattern: null,
    name: 'Curacao',
  },
  CY: {
    pattern: '^[0-9]{4}$',
    name: 'Cyprus',
  },
  CZ: {
    pattern: '^[0-9]{3} [0-9]{2}$',
    name: 'Czech Republic',
  },
  DK: {
    pattern: '^[0-9]{4}$',
    name: 'Denmark',
  },
  DJ: {
    pattern: null,
    name: 'Djibouti',
  },
  DM: {
    pattern: null,
    name: 'Dominica',
  },
  DO: {
    pattern: null,
    name: 'Dominican Republic',
  },
  TL: {
    pattern: null,
    name: 'East Timor',
  },
  EC: {
    pattern: '^[0-9]{6}$',
    name: 'Ecuador',
  },
  EG: {
    pattern: '^[0-9]{5}$',
    name: 'Egypt',
  },
  SV: {
    pattern: null,
    name: 'El Salvador',
  },
  ER: {
    pattern: null,
    name: 'Eritrea',
  },
  EE: {
    pattern: '^[0-9]{5}$',
    name: 'Estonia',
  },
  ET: {
    pattern: '^[0-9]{4}$',
    name: 'Ethiopia',
  },
  FK: {
    pattern: null,
    name: 'Falkland Islands',
  },
  FO: {
    pattern: null,
    name: 'Faroe Islands',
  },
  FJ: {
    pattern: null,
    name: 'Fiji',
  },
  FI: {
    pattern: '^[0-9]{5}$',
    name: 'Finland',
  },
  FR: {
    pattern: '^[0-9]{5}$',
    name: 'France',
  },
  PF: {
    pattern: null,
    name: 'French Polynesia',
  },
  GA: {
    pattern: null,
    name: 'Gabon',
  },
  GM: {
    pattern: null,
    name: 'Gambia',
  },
  GE: {
    pattern: null,
    name: 'Georgia',
  },
  DE: {
    pattern: '^[0-9]{5}$',
    name: 'Germany',
  },
  GH: {
    pattern: null,
    name: 'Ghana',
  },
  GI: {
    pattern: null,
    name: 'Gibraltar',
  },
  GR: {
    pattern: '^[0-9]{3} ?[0-9]{2}$',
    name: 'Greece',
  },
  GL: {
    pattern: null,
    name: 'Greenland',
  },
  GD: {
    pattern: null,
    name: 'Grenada',
  },
  GP: {
    pattern: null,
    name: 'Guadeloupe',
  },
  GU: {
    pattern: null,
    name: 'Guam',
  },
  FM: {
    pattern: null,
    name: 'Micronesia',
  },
  GT: {
    pattern: null,
    name: 'Guatemala',
  },
  IM: {
    pattern: null,
    name: 'Isle of Man',
  },
  IO: {
    pattern: null,
    name: 'British Indian Ocean Territory',
  },
  MF: {
    pattern: '^97150$',
    name: 'Saint Martin',
  },
  NF: {
    pattern: null,
    name: 'Norfolk Island',
  },
  PM: {
    pattern: null,
    name: 'Saint Pierre and Miquelon',
  },
  PN: {
    pattern: null,
    name: 'Pitcairn',
  },
  GG: {
    pattern: null,
    name: 'Guernsey',
  },
  PS: {
    pattern: null,
    name: 'Palestine',
  },
  GW: {
    pattern: '^[0-9]{4}$',
    name: 'Guinea-Bissau',
  },
  GQ: {
    pattern: null,
    name: 'Guinea-Equatorial',
  },
  GN: {
    pattern: '^[0-9]{3}$',
    name: 'Guinea Republic',
  },
  GY: {
    pattern: null,
    name: 'Guyana (British)',
  },
  GF: {
    pattern: null,
    name: 'Guyana (French)',
  },
  HT: {
    pattern: '^[0-9]{4}$',
    name: 'Haiti',
  },
  HN: {
    pattern: null,
    name: 'Honduras',
  },
  HK: {
    pattern: null,
    name: 'Hong Kong',
  },
  HU: {
    pattern: '^[0-9]{4}$',
    name: 'Hungary',
  },
  IS: {
    pattern: '^[0-9]{3}$',
    name: 'Iceland',
  },
  IN: {
    pattern: '^[1-9][0-9]{5}$',
    name: 'India',
  },
  ID: {
    pattern: '^[0-9]{5}$',
    name: 'Indonesia',
  },
  IR: {
    pattern: 'null',
    name: 'Iran',
  },
  IQ: {
    pattern: '^[0-9]{5}$',
    name: 'Iraq',
  },
  IE: {
    pattern: '(?:^[AC-FHKNPRTV-Y][0-9]{2}|D6W)[ -]?[0-9AC-FHKNPRTV-Y]{4}$',
    name: 'Ireland, Republic of',
  },
  IL: {
    pattern: '^[0-9]{5}|[0-9]{7}$',
    name: 'Israel',
  },
  IT: {
    pattern: '^[0-9]{5}$',
    name: 'Italy',
  },
  SJ: {
    pattern: null,
    name: 'Svalbard and Jan Mayen',
  },
  SM: {
    pattern: null,
    name: 'San Marino',
  },
  CI: {
    pattern: null,
    name: 'Ivory Coast',
  },
  JM: {
    pattern: '(JM)[A-Z]{3}[0-9]{2}$',
    name: 'Jamaica',
  },
  JP: {
    pattern: '^[0-9]{3}-?[0-9]{4}$',
    name: 'Japan',
  },
  JE: {
    pattern: null,
    name: 'Jersey',
  },
  JO: {
    pattern: '^[0-9]{5}$',
    name: 'Jordan',
  },
  KZ: {
    pattern: '^[0-9]{6}$',
    name: 'Kazakhstan',
  },
  TJ: {
    pattern: '^[0-9]{6}$',
    name: 'Tajikistan',
  },
  TK: {
    pattern: null,
    name: 'Tokelau',
  },
  KE: {
    pattern: '^[0-9]{5}$',
    name: 'Kenya',
  },
  KI: {
    pattern: null,
    name: 'Kiribati',
  },
  KR: {
    pattern: '^[0-9]{3}[-][0-9]{3}$',
    name: 'Korea, Republic of',
  },
  KP: {
    pattern: null,
    name: 'Korea, The D.P.R of',
  },
  XK: {
    pattern: null,
    name: 'Kosovo',
  },
  KW: {
    pattern: '^[0-9]{5}$',
    name: 'Kuwait',
  },
  KG: {
    pattern: '^[0-9]{6}$',
    name: 'Kyrgyzstan',
  },
  LA: {
    pattern: '^[0-9]{5}$',
    name: 'Laos',
  },
  LV: {
    pattern: '^[0-9]{4}$',
    name: 'Latvia',
  },
  LB: {
    pattern: '^[0-9]{4} ?[0-9]{4}$',
    name: 'Lebanon',
  },
  LS: {
    pattern: '^[0-9]{3}$',
    name: 'Lesotho',
  },
  LR: {
    pattern: '^[0-9]{4}$',
    name: 'Liberia',
  },
  LY: {
    pattern: null,
    name: 'Libya',
  },
  LI: {
    pattern: null,
    name: 'Liechtenstein',
  },
  LT: {
    pattern: '^LT-[0-9]{5}$',
    name: 'Lithuania',
  },
  LU: {
    pattern: '^[0-9]{4}$',
    name: 'Luxembourg',
  },
  MO: {
    pattern: null,
    name: 'Macau',
  },
  MK: {
    pattern: null,
    name: 'Macedonia, Republic of',
  },
  MG: {
    pattern: '^[0-9]{3}$',
    name: 'Madagascar',
  },
  MW: {
    pattern: null,
    name: 'Malawi',
  },
  MY: {
    pattern: '^[0-9]{5}$',
    name: 'Malaysia',
  },
  MV: {
    pattern: '^[0-9]{5}$',
    name: 'Maldives',
  },
  ML: {
    pattern: null,
    name: 'Mali',
  },
  MT: {
    pattern: null,
    name: 'Malta',
  },
  MH: {
    pattern: null,
    name: 'Marshall Islands',
  },
  MQ: {
    pattern: null,
    name: 'Martinique',
  },
  MR: {
    pattern: null,
    name: 'Mauritania',
  },
  MU: {
    pattern: '^[0-9]{5}$',
    name: 'Mauritius',
  },
  YT: {
    pattern: null,
    name: 'Mayotte',
  },
  MX: {
    pattern: '^[0-9]{5}$',
    name: 'Mexico',
  },
  MD: {
    pattern: '^MD-?[0-9]{4}$',
    name: 'Moldova, Republic of',
  },
  MC: {
    pattern: null,
    name: 'Monaco',
  },
  MN: {
    pattern: '^[0-9]{5}$',
    name: 'Mongolia',
  },
  ME: {
    pattern: null,
    name: 'Montenegro',
  },
  MS: {
    pattern: '^MSR ?[0-9]{4}$',
    name: 'Montserrat',
  },
  MA: {
    pattern: '^[0-9]{5}$',
    name: 'Morocco',
  },
  MZ: {
    pattern: '^[0-9]{4}$',
    name: 'Mozambique',
  },
  MM: {
    pattern: '^[0-9]{5}$',
    name: 'Myanmar',
  },
  NA: {
    pattern: null,
    name: 'Namibia',
  },
  NR: {
    pattern: null,
    name: 'Nauru',
  },
  NP: {
    pattern: '^[0-9]{5}$',
    name: 'Nepal',
  },
  NL: {
    pattern: '^(?:NL-)?([0-9]{4}) ?([A-Za-z]{2})$',
    name: 'Netherlands',
  },
  NC: {
    pattern: null,
    name: 'New Caledonia',
  },
  NZ: {
    pattern: '^[0-9]{4}$',
    name: 'New Zealand',
  },
  NI: {
    pattern: null,
    name: 'Nicaragua',
  },
  NE: {
    pattern: '^[0-9]{4}$',
    name: 'Niger',
  },
  NG: {
    pattern: '^[0-9]{6}$',
    name: 'Nigeria',
  },
  NU: {
    pattern: null,
    name: 'Niue',
  },
  MP: {
    pattern: null,
    name: 'Northern Mariana Islands',
  },
  NO: {
    pattern: '^[0-9]{4}$',
    name: 'Norway',
  },
  OM: {
    pattern: '^[0-9]{3}$',
    name: 'Oman',
  },
  PK: {
    pattern: null,
    name: 'Pakistan',
  },
  PW: {
    pattern: null,
    name: 'Palau',
  },
  PA: {
    pattern: '^[0-9]{4}$',
    name: 'Panama',
  },
  PG: {
    pattern: '^[0-9]{3}$',
    name: 'Papua New Guinea',
  },
  PY: {
    pattern: '^[0-9]{4}$',
    name: 'Paraguay',
  },
  PE: {
    pattern: '^[0-9]{5}$',
    name: 'Peru',
  },
  PH: {
    pattern: '^[0-9]{4}$',
    name: 'Philippines',
  },
  PL: {
    pattern: '^[0-9]{2}-[0-9]{3}$',
    name: 'Poland',
  },
  PT: {
    pattern: '^[0-9]{4}-[0-9]{3}$',
    name: 'Portugal',
  },
  PR: {
    pattern: null,
    name: 'Puerto Rico',
  },
  QA: {
    pattern: null,
    name: 'Qatar',
  },
  RE: {
    pattern: null,
    name: 'Réunion',
  },
  RO: {
    pattern: '^[0-9]{6}$',
    name: 'Romania',
  },
  RU: {
    pattern: '^[0-9]{6}$',
    name: 'Russian Federation',
  },
  RW: {
    pattern: null,
    name: 'Rwanda',
  },
  WS: {
    pattern: null,
    name: 'Samoa',
  },
  ST: {
    pattern: null,
    name: 'Sao Tome and Principe',
  },
  SA: {
    pattern: '^[0-9]{5}(-[0-9]{4})?$',
    name: 'Saudi Arabia',
  },
  SN: {
    pattern: '^[0-9]{5}$',
    name: 'Senegal',
  },
  RS: {
    pattern: '^[0-9]{5}$',
    name: 'Serbia',
  },
  SC: {
    pattern: null,
    name: 'Seychelles',
  },
  SL: {
    pattern: null,
    name: 'Sierra Leone',
  },
  SG: {
    pattern: '^[0-9]{6}$',
    name: 'Singapore',
  },
  SK: {
    pattern: '^[0-9]{3} ?[0-9]{2}$',
    name: 'Slovakia',
  },
  SI: {
    pattern: '^[0-9]{4}$',
    name: 'Slovenia',
  },
  SB: {
    pattern: null,
    name: 'Solomon Islands',
  },
  SO: {
    pattern: null,
    name: 'Somalia',
  },
  ZA: {
    pattern: '^[0-9]{4}$',
    name: 'South Africa',
  },
  SS: {
    pattern: null,
    name: 'South Sudan',
  },
  ES: {
    pattern: '^[0-9]{5}$',
    name: 'Spain',
  },
  LK: {
    pattern: '^[0-9]{5}$',
    name: 'Sri Lanka',
  },
  BL: {
    pattern: null,
    name: 'St. Barthélemy',
  },
  SH: {
    pattern: null,
    name: 'St. Helena',
  },
  KN: {
    pattern: '^[A-Z]{2}[0-9]{4}$',
    name: 'St. Kitts and Nevis',
  },
  LC: {
    pattern: '^[A-Z]{2}[0-9]{2} ?[0-9]{3}$',
    name: 'St. Lucia',
  },
  SX: {
    pattern: null,
    name: 'St. Maarten',
  },
  VC: {
    pattern: '^VC[0-9]{4}$',
    name: 'St. Vincent and the Grenadines',
  },
  SD: {
    pattern: '^[0-9]{5}$',
    name: 'Sudan',
  },
  SR: {
    pattern: null,
    name: 'Suriname',
  },
  SZ: {
    pattern: '^[A-Z]{1}[0-9]{3}$',
    name: 'Swaziland',
  },
  SE: {
    pattern: '^[0-9]{3} ?[0-9]{2}$',
    name: 'Sweden',
  },
  CH: {
    pattern: '^[0-9]{4}$',
    name: 'Switzerland',
  },
  SY: {
    pattern: null,
    name: 'Syria',
  },
  TW: {
    pattern: '^[0-9]{3}(-[0-9]{2})?$',
    name: 'Taiwan',
  },
  TZ: {
    pattern: '^[0-9]{5}$',
    name: 'Tanzania',
  },
  TH: {
    pattern: '^[0-9]{5}$',
    name: 'Thailand',
  },
  TG: {
    pattern: null,
    name: 'Togo',
  },
  TO: {
    pattern: null,
    name: 'Tonga',
  },
  TT: {
    pattern: '^[0-9]{6}$',
    name: 'Trinidad and Tobago',
  },
  TN: {
    pattern: '^[0-9]{4}$',
    name: 'Tunisia',
  },
  TR: {
    pattern: '^[0-9]{5}$',
    name: 'Turkey',
  },
  TM: {
    pattern: '^[0-9]{6}$',
    name: 'Turkmenistan',
  },
  TC: {
    pattern: '^TKCA ?1ZZ$',
    name: 'Turks and Caicos Islands',
  },
  TV: {
    pattern: null,
    name: 'Tuvalu',
  },
  UG: {
    pattern: null,
    name: 'Uganda',
  },
  UA: {
    pattern: '^[0-9]{5}$',
    name: 'Ukraine',
  },
  AE: {
    pattern: null,
    name: 'United Arab Emirates',
  },
  GB: {
    pattern:
      '^([Gg][Ii][Rr] ?0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) ?[0-9][A-Za-z]{2})$',
    name: 'United Kingdom',
  },
  US: {
    pattern: '^[0-9]{5}(?:[-s][0-9]{4})?$',
    name: 'United States of America',
  },
  UY: {
    pattern: '^[0-9]{5}$',
    name: 'Uruguay',
  },
  UZ: {
    pattern: '^[0-9]{6}$',
    name: 'Uzbekistan',
  },
  WF: {
    pattern: null,
    name: 'Wallis and Futuna',
  },
  VA: {
    pattern: null,
    name: 'Vatican',
  },
  VU: {
    pattern: null,
    name: 'Vanuatu',
  },
  VE: {
    pattern: '^[0-9]{4}(-[A-Z]{1})?$',
    name: 'Venezuela',
  },
  VN: {
    pattern: '^[0-9]{6}$',
    name: 'Vietnam',
  },
  VG: {
    pattern: null,
    name: 'British Virgin Islands',
  },
  VI: {
    pattern: null,
    name: 'U.S. Virgin Islands',
  },
  YE: {
    pattern: null,
    name: 'Yemen',
  },
  ZM: {
    pattern: '^[0-9]{5}$',
    name: 'Zambia',
  },
  ZW: {
    pattern: null,
    name: 'Zimbabwe',
  },
};

export const INDIAN_PINCODE_LENGTH = 6;
