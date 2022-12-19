/* eslint-disable no-useless-escape */
import * as ObjectUtils from 'utils/object';
import type { CountryConfig } from './types/countrycodes';

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

const hasPlus = (number: string) => number.startsWith('+');
const removePlus = (number: string) => number.replace(/^\+/, '');

function hasAtLeastTwoLeadingZeroes(number: string) {
  return /^0{2}/.test(number);
}

function removeLeadingZeroes(number: string) {
  return number.replace(/^0*/, '');
}

/**
 * Sanitizes a phone number
 * @param {string} number Phone number
 *
 * @returns {string}
 */
function sanitizeNumber(number: string) {
  number = number + ''; // make sure its string
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
function getIndianNumber(number: string) {
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
 * Returns the object if the number is found valid
 * @param {string} number
 * @param {string} countryCode
 * @param {string} regexPattern
 * @returns {Object}
 */
function getCountryFormattedNumber(
  number: string,
  countryCode: string,
  regexPattern: string
) {
  number = number.trim();
  const dialCodeRegex = new RegExp(regexPattern);

  if (dialCodeRegex.test(number)) {
    const countryDetails = COUNTRY_CONFIG[countryCode];
    const dialCode = countryDetails.dial_code;
    const plusDialCode = '+' + dialCode;
    // remove leading dial code
    if (number.startsWith(dialCode)) {
      number = number.slice(dialCode.length);
    } else if (number.startsWith(plusDialCode)) {
      number = number.slice(plusDialCode.length);
    }

    return {
      success: true,
      code: dialCode,
      phone: sanitizeNumber(number),
    };
  }

  return {
    success: false,
  };
}

const regexCountryPriority = ['IN', 'US', 'MY'];

/**
 * Finds country code for a given phonenumber
 * @param {string} phoneNumber
 * @returns {Object} With country code and phonenumber
 */
export function findCountryCode(phoneNumber: string) {
  for (const countryCode of regexCountryPriority) {
    const countryDetails = COUNTRY_CONFIG[countryCode];
    const regexPattern = countryDetails.phone_number_regex;
    let phoneNumberDetails;

    if (countryCode === 'IN') {
      phoneNumberDetails = getIndianNumber(phoneNumber);
    } else {
      if (regexPattern) {
        phoneNumberDetails = getCountryFormattedNumber(
          phoneNumber,
          countryCode,
          regexPattern
        );
      }
    }
    if (phoneNumberDetails?.success) {
      return {
        phone: phoneNumberDetails.phone,
        code: phoneNumberDetails.code,
      };
    }
  }

  const number = sanitizeNumber(phoneNumber);

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
function getCountryCodeFromNumber(number: string) {
  number = removePlus(number);

  let codesByLength: any = [];

  ObjectUtils.loop(COUNTRY_CONFIG, (countryDetails) => {
    const code = countryDetails.dial_code;
    const length = code.length;

    if (!codesByLength[length]) {
      codesByLength[length] = [];
    }

    codesByLength[length].push(code);
  });

  codesByLength = codesByLength.filter(Boolean).reverse();

  for (let i = 0; i < codesByLength.length; i++) {
    const codes = codesByLength[i];

    const code = codes.find((_code: string) => number.startsWith(_code));

    if (code) {
      return code;
    }
  }

  return;
}

export const COUNTRY_CONFIG: CountryConfig = {
  AF: {
    pattern: '^[0-9]{4}$',
    name: 'Afghanistan',
    phone_number_regex: null,
    dial_code: '93',
  },
  AL: {
    pattern: null,
    name: 'Albania',
    phone_number_regex: null,
    dial_code: '355',
  },
  AN: {
    pattern: null,
    name: 'Netherlands Antilles',
    phone_number_regex: null,
    dial_code: '599',
  },
  AQ: {
    pattern: null,
    name: 'Antarctica',
    phone_number_regex: null,
    dial_code: '672',
  },
  AX: {
    pattern: null,
    name: 'Åland Islands',
    phone_number_regex: null,
    dial_code: '358',
  },
  CC: {
    pattern: null,
    name: 'Cocos Islands',
    phone_number_regex: null,
    dial_code: '61',
  },
  CX: {
    pattern: null,
    name: 'Christmas Island',
    phone_number_regex: null,
    dial_code: '61',
  },
  EH: {
    pattern: null,
    name: 'Western Sahara',
    phone_number_regex: null,
    dial_code: '212',
  },
  DZ: {
    pattern: '^[0-9]{5}$',
    name: 'Algeria',
    phone_number_regex: null,
    dial_code: '213',
  },
  AS: {
    pattern: null,
    name: 'American Samoa',
    phone_number_regex: null,
    dial_code: '1684',
  },
  AD: {
    pattern: '^AD ?[0-9]{3}$',
    name: 'Andorra',
    phone_number_regex: null,
    dial_code: '376',
  },
  AO: {
    pattern: null,
    name: 'Angola',
    phone_number_regex: null,
    dial_code: '244',
  },
  AI: {
    pattern: null,
    name: 'Anguilla',
    phone_number_regex: null,
    dial_code: '1264',
  },
  AG: {
    pattern: null,
    name: 'Antigua and Barbuda',
    phone_number_regex: null,
    dial_code: '1268',
  },
  AR: {
    pattern: '^[A-Z]{1}[0-9]{4}[A-Z]{3}$',
    name: 'Argentina',
    phone_number_regex: null,
    dial_code: '54',
  },
  AM: {
    pattern: '^[0-9]{4}$',
    name: 'Armenia',
    phone_number_regex: null,
    dial_code: '374',
  },
  AW: {
    pattern: null,
    name: 'Aruba',
    phone_number_regex: null,
    dial_code: '297',
  },
  AU: {
    pattern: '^[0-9]{4}$',
    name: 'Australia',
    phone_number_regex: null,
    dial_code: '61',
  },
  AT: {
    pattern: '^[0-9]{4}$',
    name: 'Austria',
    phone_number_regex: null,
    dial_code: '43',
  },
  AZ: {
    pattern: '^[0-9]{4}$',
    name: 'Azerbaijan',
    phone_number_regex: null,
    dial_code: '994',
  },
  BS: {
    pattern: null,
    name: 'Bahamas',
    phone_number_regex: null,
    dial_code: '1242',
  },
  BH: {
    pattern: null,
    name: 'Bahrain',
    phone_number_regex: null,
    dial_code: '973',
  },
  BD: {
    pattern: '^[0-9]{4}$',
    name: 'Bangladesh',
    phone_number_regex: null,
    dial_code: '880',
  },
  BB: {
    pattern: '^BB[0-9]{5}$',
    name: 'Barbados',
    phone_number_regex: null,
    dial_code: '1246',
  },
  BY: {
    pattern: '^[0-9]{6}$',
    name: 'Belarus',
    phone_number_regex: null,
    dial_code: '375',
  },
  BE: {
    pattern: '^[0-9]{4}$',
    name: 'Belgium',
    phone_number_regex: null,
    dial_code: '32',
  },
  BZ: {
    pattern: null,
    name: 'Belize',
    phone_number_regex: null,
    dial_code: '501',
  },
  BJ: {
    pattern: null,
    name: 'Benin',
    phone_number_regex: null,
    dial_code: '229',
  },
  BM: {
    pattern: '^[A-Z]{2}[0-9]{2}$',
    name: 'Bermuda',
    phone_number_regex: null,
    dial_code: '1441',
  },
  BT: {
    pattern: '^[0-9]{5}$',
    name: 'Bhutan',
    phone_number_regex: null,
    dial_code: '975',
  },
  BO: {
    pattern: null,
    name: 'Bolivia',
    phone_number_regex: null,
    dial_code: '591',
  },
  BA: {
    pattern: null,
    name: 'Bosnia and Herzegovina',
    phone_number_regex: null,
    dial_code: '387',
  },
  BW: {
    pattern: null,
    name: 'Botswana',
    phone_number_regex: null,
    dial_code: '267',
  },
  BR: {
    pattern: '^[0-9]{5}-[0-9]{3}$',
    name: 'Brazil',
    phone_number_regex: null,
    dial_code: '55',
  },
  BN: {
    pattern: '^[A-Z]{2}[0-9]{4}$',
    name: 'Brunei',
    phone_number_regex: null,
    dial_code: '673',
  },
  BG: {
    pattern: '^[0-9]{4}$',
    name: 'Bulgaria',
    phone_number_regex: null,
    dial_code: '359',
  },
  BF: {
    pattern: null,
    name: 'Burkina Faso',
    phone_number_regex: null,
    dial_code: '226',
  },
  BI: {
    pattern: null,
    name: 'Burundi',
    phone_number_regex: null,
    dial_code: '257',
  },
  KH: {
    pattern: '^[0-9]{5}$',
    name: 'Cambodia',
    phone_number_regex: null,
    dial_code: '855',
  },
  CM: {
    pattern: null,
    name: 'Cameroon',
    phone_number_regex: null,
    dial_code: '237',
  },
  CA: {
    pattern: '^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$',
    name: 'Canada',
    phone_number_regex: null,
    dial_code: '1',
  },
  CV: {
    pattern: null,
    name: 'Cape Verde',
    phone_number_regex: null,
    dial_code: '238',
  },
  KY: {
    pattern: '^[A-Z]{2}[0-9]-[0-9]{4}$',
    name: 'Cayman Islands',
    phone_number_regex: null,
    dial_code: '1345',
  },
  CF: {
    pattern: null,
    name: 'Central African Republic',
    phone_number_regex: null,
    dial_code: '236',
  },
  TD: {
    pattern: null,
    name: 'Chad',
    phone_number_regex: null,
    dial_code: '235',
  },
  CL: {
    pattern: '^[0-9]{7}$',
    name: 'Chile',
    phone_number_regex: null,
    dial_code: '56',
  },
  CN: {
    pattern: '^[0-9]{6}$',
    name: "China, People's Republic",
    phone_number_regex: null,
    dial_code: '86',
  },
  CO: {
    pattern: '^[0-9]{6}$',
    name: 'Colombia',
    phone_number_regex: null,
    dial_code: '57',
  },
  KM: {
    pattern: null,
    name: 'Comoros',
    phone_number_regex: null,
    dial_code: '269',
  },
  CG: {
    pattern: null,
    name: 'Congo',
    phone_number_regex: null,
    dial_code: '242',
  },
  CD: {
    pattern: null,
    name: 'Congo, The Democratic Republic of',
    phone_number_regex: null,
    dial_code: '243',
  },
  CK: {
    pattern: null,
    name: 'Cook Islands',
    phone_number_regex: null,
    dial_code: '682',
  },
  CR: {
    pattern: '^[0-9]{5}$',
    name: 'Costa Rica',
    phone_number_regex: null,
    dial_code: '506',
  },
  HR: {
    pattern: '^[0-9]{5}$',
    name: 'Croatia',
    phone_number_regex: null,
    dial_code: '385',
  },
  CU: {
    pattern: '^[0-9]{5}$',
    name: 'Cuba',
    phone_number_regex: null,
    dial_code: '53',
  },
  CW: {
    pattern: null,
    name: 'Curacao',
    phone_number_regex: null,
    dial_code: '599',
  },
  CY: {
    pattern: '^[0-9]{4}$',
    name: 'Cyprus',
    phone_number_regex: null,
    dial_code: '357',
  },
  CZ: {
    pattern: '^[0-9]{3} [0-9]{2}$',
    name: 'Czech Republic',
    phone_number_regex: null,
    dial_code: '420',
  },
  DK: {
    pattern: '^[0-9]{4}$',
    name: 'Denmark',
    phone_number_regex: null,
    dial_code: '45',
  },
  DJ: {
    pattern: null,
    name: 'Djibouti',
    phone_number_regex: null,
    dial_code: '253',
  },
  DM: {
    pattern: null,
    name: 'Dominica',
    phone_number_regex: null,
    dial_code: '1767',
  },
  DO: {
    pattern: null,
    name: 'Dominican Republic',
    phone_number_regex: null,
    dial_code: '1849',
  },
  TL: {
    pattern: null,
    name: 'East Timor',
    phone_number_regex: null,
    dial_code: '670',
  },
  EC: {
    pattern: '^[0-9]{6}$',
    name: 'Ecuador',
    phone_number_regex: null,
    dial_code: '593',
  },
  EG: {
    pattern: '^[0-9]{5}$',
    name: 'Egypt',
    phone_number_regex: null,
    dial_code: '20',
  },
  SV: {
    pattern: null,
    name: 'El Salvador',
    phone_number_regex: null,
    dial_code: '503',
  },
  ER: {
    pattern: null,
    name: 'Eritrea',
    phone_number_regex: null,
    dial_code: '291',
  },
  EE: {
    pattern: '^[0-9]{5}$',
    name: 'Estonia',
    phone_number_regex: null,
    dial_code: '372',
  },
  ET: {
    pattern: '^[0-9]{4}$',
    name: 'Ethiopia',
    phone_number_regex: null,
    dial_code: '251',
  },
  FK: {
    pattern: null,
    name: 'Falkland Islands',
    phone_number_regex: null,
    dial_code: '500',
  },
  FO: {
    pattern: null,
    name: 'Faroe Islands',
    phone_number_regex: null,
    dial_code: '298',
  },
  FJ: {
    pattern: null,
    name: 'Fiji',
    phone_number_regex: null,
    dial_code: '679',
  },
  FI: {
    pattern: '^[0-9]{5}$',
    name: 'Finland',
    phone_number_regex: null,
    dial_code: '358',
  },
  FR: {
    pattern: '^[0-9]{5}$',
    name: 'France',
    phone_number_regex: null,
    dial_code: '33',
  },
  PF: {
    pattern: null,
    name: 'French Polynesia',
    phone_number_regex: null,
    dial_code: '689',
  },
  GA: {
    pattern: null,
    name: 'Gabon',
    phone_number_regex: null,
    dial_code: '241',
  },
  GM: {
    pattern: null,
    name: 'Gambia',
    phone_number_regex: null,
    dial_code: '220',
  },
  GE: {
    pattern: null,
    name: 'Georgia',
    phone_number_regex: null,
    dial_code: '995',
  },
  DE: {
    pattern: '^[0-9]{5}$',
    name: 'Germany',
    phone_number_regex: null,
    dial_code: '49',
  },
  GH: {
    pattern: null,
    name: 'Ghana',
    phone_number_regex: null,
    dial_code: '233',
  },
  GI: {
    pattern: null,
    name: 'Gibraltar',
    phone_number_regex: null,
    dial_code: '350',
  },
  GR: {
    pattern: '^[0-9]{3} ?[0-9]{2}$',
    name: 'Greece',
    phone_number_regex: null,
    dial_code: '30',
  },
  GL: {
    pattern: null,
    name: 'Greenland',
    phone_number_regex: null,
    dial_code: '299',
  },
  GD: {
    pattern: null,
    name: 'Grenada',
    phone_number_regex: null,
    dial_code: '1473',
  },
  GP: {
    pattern: null,
    name: 'Guadeloupe',
    phone_number_regex: null,
    dial_code: '590',
  },
  GU: {
    pattern: null,
    name: 'Guam',
    phone_number_regex: null,
    dial_code: '1671',
  },
  FM: {
    pattern: null,
    name: 'Micronesia',
    phone_number_regex: null,
    dial_code: '691',
  },
  GT: {
    pattern: null,
    name: 'Guatemala',
    phone_number_regex: null,
    dial_code: '502',
  },
  IM: {
    pattern: null,
    name: 'Isle of Man',
    phone_number_regex: null,
    dial_code: '441624',
  },
  IO: {
    pattern: null,
    name: 'British Indian Ocean Territory',
    phone_number_regex: null,
    dial_code: '246',
  },
  MF: {
    pattern: '^97150$',
    name: 'Saint Martin',
    phone_number_regex: null,
    dial_code: '590',
  },
  NF: {
    pattern: null,
    name: 'Norfolk Island',
    phone_number_regex: null,
    dial_code: '672',
  },
  PM: {
    pattern: null,
    name: 'Saint Pierre and Miquelon',
    phone_number_regex: null,
    dial_code: '508',
  },
  PN: {
    pattern: null,
    name: 'Pitcairn',
    phone_number_regex: null,
    dial_code: '64',
  },
  GG: {
    pattern: null,
    name: 'Guernsey',
    phone_number_regex: null,
    dial_code: '441481',
  },
  PS: {
    pattern: null,
    name: 'Palestine',
    phone_number_regex: null,
    dial_code: '970',
  },
  GW: {
    pattern: '^[0-9]{4}$',
    name: 'Guinea-Bissau',
    phone_number_regex: null,
    dial_code: '245',
  },
  GQ: {
    pattern: null,
    name: 'Guinea-Equatorial',
    phone_number_regex: null,
    dial_code: '240',
  },
  GN: {
    pattern: '^[0-9]{3}$',
    name: 'Guinea Republic',
    phone_number_regex: null,
    dial_code: '224',
  },
  GY: {
    pattern: null,
    name: 'Guyana (British)',
    phone_number_regex: null,
    dial_code: '592',
  },
  GF: {
    pattern: null,
    name: 'Guyana (French)',
    phone_number_regex: null,
    dial_code: '594',
  },
  HT: {
    pattern: '^[0-9]{4}$',
    name: 'Haiti',
    phone_number_regex: null,
    dial_code: '509',
  },
  HN: {
    pattern: null,
    name: 'Honduras',
    phone_number_regex: null,
    dial_code: '504',
  },
  HK: {
    pattern: null,
    name: 'Hong Kong',
    phone_number_regex: null,
    dial_code: '852',
  },
  HU: {
    pattern: '^[0-9]{4}$',
    name: 'Hungary',
    phone_number_regex: null,
    dial_code: '36',
  },
  IS: {
    pattern: '^[0-9]{3}$',
    name: 'Iceland',
    phone_number_regex: null,
    dial_code: '354',
  },
  IN: {
    pattern: '^[1-9][0-9]{5}$',
    name: 'India',
    phone_number_regex: null,
    dial_code: '91',
  },
  ID: {
    pattern: '^[0-9]{5}$',
    name: 'Indonesia',
    phone_number_regex: null,
    dial_code: '62',
  },
  IR: {
    pattern: 'null',
    name: 'Iran',
    phone_number_regex: null,
    dial_code: '98',
  },
  IQ: {
    pattern: '^[0-9]{5}$',
    name: 'Iraq',
    phone_number_regex: null,
    dial_code: '964',
  },
  IE: {
    pattern: '(?:^[AC-FHKNPRTV-Y][0-9]{2}|D6W)[ -]?[0-9AC-FHKNPRTV-Y]{4}$',
    name: 'Ireland, Republic of',
    phone_number_regex: null,
    dial_code: '353',
  },
  IL: {
    pattern: '^[0-9]{5}|[0-9]{7}$',
    name: 'Israel',
    phone_number_regex: null,
    dial_code: '972',
  },
  IT: {
    pattern: '^[0-9]{5}$',
    name: 'Italy',
    phone_number_regex: null,
    dial_code: '39',
  },
  SJ: {
    pattern: null,
    name: 'Svalbard and Jan Mayen',
    phone_number_regex: null,
    dial_code: '47',
  },
  SM: {
    pattern: null,
    name: 'San Marino',
    phone_number_regex: null,
    dial_code: '378',
  },
  CI: {
    pattern: null,
    name: 'Ivory Coast',
    phone_number_regex: null,
    dial_code: '225',
  },
  JM: {
    pattern: '(JM)[A-Z]{3}[0-9]{2}$',
    name: 'Jamaica',
    phone_number_regex: null,
    dial_code: '1876',
  },
  JP: {
    pattern: '^[0-9]{3}-?[0-9]{4}$',
    name: 'Japan',
    phone_number_regex: null,
    dial_code: '81',
  },
  JE: {
    pattern: null,
    name: 'Jersey',
    phone_number_regex: null,
    dial_code: '441534',
  },
  JO: {
    pattern: '^[0-9]{5}$',
    name: 'Jordan',
    phone_number_regex: null,
    dial_code: '962',
  },
  KZ: {
    pattern: '^[0-9]{6}$',
    name: 'Kazakhstan',
    phone_number_regex: null,
    dial_code: '7',
  },
  TJ: {
    pattern: '^[0-9]{6}$',
    name: 'Tajikistan',
    phone_number_regex: null,
    dial_code: '992',
  },
  TK: {
    pattern: null,
    name: 'Tokelau',
    phone_number_regex: null,
    dial_code: '690',
  },
  KE: {
    pattern: '^[0-9]{5}$',
    name: 'Kenya',
    phone_number_regex: null,
    dial_code: '254',
  },
  KI: {
    pattern: null,
    name: 'Kiribati',
    phone_number_regex: null,
    dial_code: '686',
  },
  KR: {
    pattern: '^[0-9]{3}[-][0-9]{3}$',
    name: 'Korea, Republic of',
    phone_number_regex: null,
    dial_code: '82',
  },
  KP: {
    pattern: null,
    name: 'Korea, The D.P.R of',
    phone_number_regex: null,
    dial_code: '850',
  },
  XK: {
    pattern: null,
    name: 'Kosovo',
    phone_number_regex: null,
    dial_code: '383',
  },
  KW: {
    pattern: '^[0-9]{5}$',
    name: 'Kuwait',
    phone_number_regex: null,
    dial_code: '965',
  },
  KG: {
    pattern: '^[0-9]{6}$',
    name: 'Kyrgyzstan',
    phone_number_regex: null,
    dial_code: '996',
  },
  LA: {
    pattern: '^[0-9]{5}$',
    name: 'Laos',
    phone_number_regex: null,
    dial_code: '856',
  },
  LV: {
    pattern: '^[0-9]{4}$',
    name: 'Latvia',
    phone_number_regex: null,
    dial_code: '371',
  },
  LB: {
    pattern: '^[0-9]{4} ?[0-9]{4}$',
    name: 'Lebanon',
    phone_number_regex: null,
    dial_code: '961',
  },
  LS: {
    pattern: '^[0-9]{3}$',
    name: 'Lesotho',
    phone_number_regex: null,
    dial_code: '266',
  },
  LR: {
    pattern: '^[0-9]{4}$',
    name: 'Liberia',
    phone_number_regex: null,
    dial_code: '231',
  },
  LY: {
    pattern: null,
    name: 'Libya',
    phone_number_regex: null,
    dial_code: '218',
  },
  LI: {
    pattern: null,
    name: 'Liechtenstein',
    phone_number_regex: null,
    dial_code: '423',
  },
  LT: {
    pattern: '^LT-[0-9]{5}$',
    name: 'Lithuania',
    phone_number_regex: null,
    dial_code: '370',
  },
  LU: {
    pattern: '^[0-9]{4}$',
    name: 'Luxembourg',
    phone_number_regex: null,
    dial_code: '352',
  },
  MO: {
    pattern: null,
    name: 'Macau',
    phone_number_regex: null,
    dial_code: '853',
  },
  MK: {
    pattern: null,
    name: 'Macedonia, Republic of',
    phone_number_regex: null,
    dial_code: '389',
  },
  MG: {
    pattern: '^[0-9]{3}$',
    name: 'Madagascar',
    phone_number_regex: null,
    dial_code: '261',
  },
  MW: {
    pattern: null,
    name: 'Malawi',
    phone_number_regex: null,
    dial_code: '265',
  },
  MY: {
    pattern: '^[0-9]{5}$',
    name: 'Malaysia',
    phone_number_regex: '^(\\+60|0)?(1)-*[0-9]{8}$|^(\\+60|0)?(11)-*[0-9]{8}$',
    dial_code: '60',
  },
  MV: {
    pattern: '^[0-9]{5}$',
    name: 'Maldives',
    phone_number_regex: null,
    dial_code: '960',
  },
  ML: {
    pattern: null,
    name: 'Mali',
    phone_number_regex: null,
    dial_code: '223',
  },
  MT: {
    pattern: null,
    name: 'Malta',
    phone_number_regex: null,
    dial_code: '356',
  },
  MH: {
    pattern: null,
    name: 'Marshall Islands',
    phone_number_regex: null,
    dial_code: '692',
  },
  MQ: {
    pattern: null,
    name: 'Martinique',
    phone_number_regex: null,
    dial_code: '596',
  },
  MR: {
    pattern: null,
    name: 'Mauritania',
    phone_number_regex: null,
    dial_code: '222',
  },
  MU: {
    pattern: '^[0-9]{5}$',
    name: 'Mauritius',
    phone_number_regex: null,
    dial_code: '230',
  },
  YT: {
    pattern: null,
    name: 'Mayotte',
    phone_number_regex: null,
    dial_code: '262',
  },
  MX: {
    pattern: '^[0-9]{5}$',
    name: 'Mexico',
    phone_number_regex: null,
    dial_code: '52',
  },
  MD: {
    pattern: '^MD-?[0-9]{4}$',
    name: 'Moldova, Republic of',
    phone_number_regex: null,
    dial_code: '373',
  },
  MC: {
    pattern: null,
    name: 'Monaco',
    phone_number_regex: null,
    dial_code: '377',
  },
  MN: {
    pattern: '^[0-9]{5}$',
    name: 'Mongolia',
    phone_number_regex: null,
    dial_code: '976',
  },
  ME: {
    pattern: null,
    name: 'Montenegro',
    phone_number_regex: null,
    dial_code: '382',
  },
  MS: {
    pattern: '^MSR ?[0-9]{4}$',
    name: 'Montserrat',
    phone_number_regex: null,
    dial_code: '1664',
  },
  MA: {
    pattern: '^[0-9]{5}$',
    name: 'Morocco',
    phone_number_regex: null,
    dial_code: '212',
  },
  MZ: {
    pattern: '^[0-9]{4}$',
    name: 'Mozambique',
    phone_number_regex: null,
    dial_code: '258',
  },
  MM: {
    pattern: '^[0-9]{5}$',
    name: 'Myanmar',
    phone_number_regex: null,
    dial_code: '95',
  },
  NA: {
    pattern: null,
    name: 'Namibia',
    phone_number_regex: null,
    dial_code: '264',
  },
  NR: {
    pattern: null,
    name: 'Nauru',
    phone_number_regex: null,
    dial_code: '674',
  },
  NP: {
    pattern: '^[0-9]{5}$',
    name: 'Nepal',
    phone_number_regex: null,
    dial_code: '977',
  },
  NL: {
    pattern: '^(?:NL-)?([0-9]{4}) ?([A-Za-z]{2})$',
    name: 'Netherlands',
    phone_number_regex: null,
    dial_code: '31',
  },
  NC: {
    pattern: null,
    name: 'New Caledonia',
    phone_number_regex: null,
    dial_code: '687',
  },
  NZ: {
    pattern: '^[0-9]{4}$',
    name: 'New Zealand',
    phone_number_regex: null,
    dial_code: '64',
  },
  NI: {
    pattern: null,
    name: 'Nicaragua',
    phone_number_regex: null,
    dial_code: '505',
  },
  NE: {
    pattern: '^[0-9]{4}$',
    name: 'Niger',
    phone_number_regex: null,
    dial_code: '227',
  },
  NG: {
    pattern: '^[0-9]{6}$',
    name: 'Nigeria',
    phone_number_regex: null,
    dial_code: '234',
  },
  NU: {
    pattern: null,
    name: 'Niue',
    phone_number_regex: null,
    dial_code: '683',
  },
  MP: {
    pattern: null,
    name: 'Northern Mariana Islands',
    phone_number_regex: null,
    dial_code: '1670',
  },
  NO: {
    pattern: '^[0-9]{4}$',
    name: 'Norway',
    phone_number_regex: null,
    dial_code: '47',
  },
  OM: {
    pattern: '^[0-9]{3}$',
    name: 'Oman',
    phone_number_regex: null,
    dial_code: '968',
  },
  PK: {
    pattern: null,
    name: 'Pakistan',
    phone_number_regex: null,
    dial_code: '92',
  },
  PW: {
    pattern: null,
    name: 'Palau',
    phone_number_regex: null,
    dial_code: '680',
  },
  PA: {
    pattern: '^[0-9]{4}$',
    name: 'Panama',
    phone_number_regex: null,
    dial_code: '507',
  },
  PG: {
    pattern: '^[0-9]{3}$',
    name: 'Papua New Guinea',
    phone_number_regex: null,
    dial_code: '675',
  },
  PY: {
    pattern: '^[0-9]{4}$',
    name: 'Paraguay',
    phone_number_regex: null,
    dial_code: '595',
  },
  PE: {
    pattern: '^[0-9]{5}$',
    name: 'Peru',
    phone_number_regex: null,
    dial_code: '51',
  },
  PH: {
    pattern: '^[0-9]{4}$',
    name: 'Philippines',
    phone_number_regex: null,
    dial_code: '63',
  },
  PL: {
    pattern: '^[0-9]{2}-[0-9]{3}$',
    name: 'Poland',
    phone_number_regex: null,
    dial_code: '48',
  },
  PT: {
    pattern: '^[0-9]{4}-[0-9]{3}$',
    name: 'Portugal',
    phone_number_regex: null,
    dial_code: '351',
  },
  PR: {
    pattern: null,
    name: 'Puerto Rico',
    phone_number_regex: null,
    dial_code: '1939',
  },
  QA: {
    pattern: null,
    name: 'Qatar',
    phone_number_regex: null,
    dial_code: '974',
  },
  RE: {
    pattern: null,
    name: 'Réunion',
    phone_number_regex: null,
    dial_code: '262',
  },
  RO: {
    pattern: '^[0-9]{6}$',
    name: 'Romania',
    phone_number_regex: null,
    dial_code: '40',
  },
  RU: {
    pattern: '^[0-9]{6}$',
    name: 'Russian Federation',
    phone_number_regex: null,
    dial_code: '7',
  },
  RW: {
    pattern: null,
    name: 'Rwanda',
    phone_number_regex: null,
    dial_code: '250',
  },
  WS: {
    pattern: null,
    name: 'Samoa',
    phone_number_regex: null,
    dial_code: '685',
  },
  ST: {
    pattern: null,
    name: 'Sao Tome and Principe',
    phone_number_regex: null,
    dial_code: '239',
  },
  SA: {
    pattern: '^[0-9]{5}(-[0-9]{4})?$',
    name: 'Saudi Arabia',
    phone_number_regex: null,
    dial_code: '966',
  },
  SN: {
    pattern: '^[0-9]{5}$',
    name: 'Senegal',
    phone_number_regex: null,
    dial_code: '221',
  },
  RS: {
    pattern: '^[0-9]{5}$',
    name: 'Serbia',
    phone_number_regex: null,
    dial_code: '381',
  },
  SC: {
    pattern: null,
    name: 'Seychelles',
    phone_number_regex: null,
    dial_code: '248',
  },
  SL: {
    pattern: null,
    name: 'Sierra Leone',
    phone_number_regex: null,
    dial_code: '232',
  },
  SG: {
    pattern: '^[0-9]{6}$',
    name: 'Singapore',
    phone_number_regex: null,
    dial_code: '65',
  },
  SK: {
    pattern: '^[0-9]{3} ?[0-9]{2}$',
    name: 'Slovakia',
    phone_number_regex: null,
    dial_code: '421',
  },
  SI: {
    pattern: '^[0-9]{4}$',
    name: 'Slovenia',
    phone_number_regex: null,
    dial_code: '386',
  },
  SB: {
    pattern: null,
    name: 'Solomon Islands',
    phone_number_regex: null,
    dial_code: '677',
  },
  SO: {
    pattern: null,
    name: 'Somalia',
    phone_number_regex: null,
    dial_code: '252',
  },
  ZA: {
    pattern: '^[0-9]{4}$',
    name: 'South Africa',
    phone_number_regex: null,
    dial_code: '27',
  },
  SS: {
    pattern: null,
    name: 'South Sudan',
    phone_number_regex: null,
    dial_code: '211',
  },
  ES: {
    pattern: '^[0-9]{5}$',
    name: 'Spain',
    phone_number_regex: null,
    dial_code: '34',
  },
  LK: {
    pattern: '^[0-9]{5}$',
    name: 'Sri Lanka',
    phone_number_regex: null,
    dial_code: '94',
  },
  BL: {
    pattern: null,
    name: 'St. Barthélemy',
    phone_number_regex: null,
    dial_code: '590',
  },
  SH: {
    pattern: null,
    name: 'St. Helena',
    phone_number_regex: null,
    dial_code: '290',
  },
  KN: {
    pattern: '^[A-Z]{2}[0-9]{4}$',
    name: 'St. Kitts and Nevis',
    phone_number_regex: null,
    dial_code: '1869',
  },
  LC: {
    pattern: '^[A-Z]{2}[0-9]{2} ?[0-9]{3}$',
    name: 'St. Lucia',
    phone_number_regex: null,
    dial_code: '1758',
  },
  SX: {
    pattern: null,
    name: 'St. Maarten',
    phone_number_regex: null,
    dial_code: '1721',
  },
  VC: {
    pattern: '^VC[0-9]{4}$',
    name: 'St. Vincent and the Grenadines',
    phone_number_regex: null,
    dial_code: '1784',
  },
  SD: {
    pattern: '^[0-9]{5}$',
    name: 'Sudan',
    phone_number_regex: null,
    dial_code: '249',
  },
  SR: {
    pattern: null,
    name: 'Suriname',
    phone_number_regex: null,
    dial_code: '597',
  },
  SZ: {
    pattern: '^[A-Z]{1}[0-9]{3}$',
    name: 'Swaziland',
    phone_number_regex: null,
    dial_code: '268',
  },
  SE: {
    pattern: '^[0-9]{3} ?[0-9]{2}$',
    name: 'Sweden',
    phone_number_regex: null,
    dial_code: '46',
  },
  CH: {
    pattern: '^[0-9]{4}$',
    name: 'Switzerland',
    phone_number_regex: null,
    dial_code: '41',
  },
  SY: {
    pattern: null,
    name: 'Syria',
    phone_number_regex: null,
    dial_code: '963',
  },
  TW: {
    pattern: '^[0-9]{3}(-[0-9]{2})?$',
    name: 'Taiwan',
    phone_number_regex: null,
    dial_code: '886',
  },
  TZ: {
    pattern: '^[0-9]{5}$',
    name: 'Tanzania',
    phone_number_regex: null,
    dial_code: '255',
  },
  TH: {
    pattern: '^[0-9]{5}$',
    name: 'Thailand',
    phone_number_regex: null,
    dial_code: '66',
  },
  TG: {
    pattern: null,
    name: 'Togo',
    phone_number_regex: null,
    dial_code: '228',
  },
  TO: {
    pattern: null,
    name: 'Tonga',
    phone_number_regex: null,
    dial_code: '676',
  },
  TT: {
    pattern: '^[0-9]{6}$',
    name: 'Trinidad and Tobago',
    phone_number_regex: null,
    dial_code: '1868',
  },
  TN: {
    pattern: '^[0-9]{4}$',
    name: 'Tunisia',
    phone_number_regex: null,
    dial_code: '216',
  },
  TR: {
    pattern: '^[0-9]{5}$',
    name: 'Turkey',
    phone_number_regex: null,
    dial_code: '90',
  },
  TM: {
    pattern: '^[0-9]{6}$',
    name: 'Turkmenistan',
    phone_number_regex: null,
    dial_code: '993',
  },
  TC: {
    pattern: '^TKCA ?1ZZ$',
    name: 'Turks and Caicos Islands',
    phone_number_regex: null,
    dial_code: '1649',
  },
  TV: {
    pattern: null,
    name: 'Tuvalu',
    phone_number_regex: null,
    dial_code: '688',
  },
  UG: {
    pattern: null,
    name: 'Uganda',
    phone_number_regex: null,
    dial_code: '256',
  },
  UA: {
    pattern: '^[0-9]{5}$',
    name: 'Ukraine',
    phone_number_regex: null,
    dial_code: '380',
  },
  AE: {
    pattern: null,
    name: 'United Arab Emirates',
    phone_number_regex: null,
    dial_code: '971',
  },
  GB: {
    pattern:
      '^([Gg][Ii][Rr] ?0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) ?[0-9][A-Za-z]{2})$',
    name: 'United Kingdom',
    phone_number_regex: null,
    dial_code: '44',
  },
  US: {
    pattern: '^[0-9]{5}(?:[-s][0-9]{4})?$',
    name: 'United States of America',
    phone_number_regex: '^\\(\\d{3}\\)[\\s-]?\\d{3}-?\\d{4}$',
    dial_code: '1',
  },
  UY: {
    pattern: '^[0-9]{5}$',
    name: 'Uruguay',
    phone_number_regex: null,
    dial_code: '598',
  },
  UZ: {
    pattern: '^[0-9]{6}$',
    name: 'Uzbekistan',
    phone_number_regex: null,
    dial_code: '998',
  },
  WF: {
    pattern: null,
    name: 'Wallis and Futuna',
    phone_number_regex: null,
    dial_code: '681',
  },
  VA: {
    pattern: null,
    name: 'Vatican',
    phone_number_regex: null,
    dial_code: '379',
  },
  VU: {
    pattern: null,
    name: 'Vanuatu',
    phone_number_regex: null,
    dial_code: '678',
  },
  VE: {
    pattern: '^[0-9]{4}(-[A-Z]{1})?$',
    name: 'Venezuela',
    phone_number_regex: null,
    dial_code: '58',
  },
  VN: {
    pattern: '^[0-9]{6}$',
    name: 'Vietnam',
    phone_number_regex: null,
    dial_code: '84',
  },
  VG: {
    pattern: null,
    name: 'British Virgin Islands',
    phone_number_regex: null,
    dial_code: '1284',
  },
  VI: {
    pattern: null,
    name: 'U.S. Virgin Islands',
    phone_number_regex: null,
    dial_code: '1340',
  },
  YE: {
    pattern: null,
    name: 'Yemen',
    phone_number_regex: null,
    dial_code: '967',
  },
  ZM: {
    pattern: '^[0-9]{5}$',
    name: 'Zambia',
    phone_number_regex: null,
    dial_code: '260',
  },
  ZW: {
    pattern: null,
    name: 'Zimbabwe',
    phone_number_regex: null,
    dial_code: '263',
  },
};

export const INDIAN_PINCODE_LENGTH = 6;

/**
 * @deprecated Avoid using COUNTRY_TO_CODE_MAP, use COUNTRY_CONFIG instead
 */
export const COUNTRY_TO_CODE_MAP = Object.keys(COUNTRY_CONFIG).reduce(
  (final: { [key: string]: string }, key) => {
    final[key] = COUNTRY_CONFIG[key].dial_code;
    return final;
  },
  {}
);

export type countryCodesType = keyof typeof COUNTRY_CONFIG;

/**
 * creates a constant COUNTRY_CODES
 * @type {Record<countryCodesType, countryCodesType>}
 * eg @constant {{
 *  IN: 'IN',
 *  MY: 'MY',
 *  ... all country codes
 * }}
 */
export const COUNTRY_CODES: Record<countryCodesType, countryCodesType> = (
  Object.keys(COUNTRY_CONFIG) as countryCodesType[]
).reduce(
  (acc: Record<countryCodesType, countryCodesType>, curr: countryCodesType) => {
    acc[curr] = curr;
    return acc;
  },
  {} as Record<countryCodesType, countryCodesType>
);

export const COUNTRY_TO_PHONE_CODE_MAP: {
  [countryISO in countryCodesType]: [string, string];
} = {
  IN: ['0', '+91'],
  MY: ['+60', '0'],
};
