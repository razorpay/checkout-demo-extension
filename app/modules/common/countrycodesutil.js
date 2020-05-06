import countrycodes from 'countrycodes';

/**
 * There are 3 possible scenarios for a given number - 
    I Starts with + 
    II Starts with 00
    III Starts without + or 00

  1) For numbers starting with 00, the leading 2 zeros are converted to +, so that cuts it down to final 2 scenarios(I & III).
  2) Picking scenario(I) - The + is ignored and the first 3 digits are picked up to be checked against the list of country codes. The maximum length of a country code is 3 digits, hence going for a top-to-bottom approach. 
  3) The 3 digit country code is checked against all 3 digit country codes - If it matches, function returns country code.
  4) Next step - Pick first 2 digits and check against all 2 digit country codes - If it matches, function returns country code.
  5) Next step - Pick first 1 digit and check against all 1 digit country codes - If it matches, function returns country code or else undefined.
  6) Picking scenario(III) - checking for an Indian number is our 1st priority so checking for 10 or 12 digits.
  7) If the number is a 10 digit one - and starts with [6-9] - It will be classified as an Indian phone number.
  8) If the number is a 12 digit one - and starts with 91[6-9] - It will be classified as an Indian phone number.
  9) Other than these scenarios, numbers starting without  a +  or 00 make it difficult to determine country code from a given number.
 */

const MAX_LENGTH_COUNTRY_CODE = 3;
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
 * @param {string} phonenumber
 * @returns {Object} With country code and phonenumber
 */
export function findCountryCode(phno) {
  let indian = getIndianNumber(phno);

  if (indian.success) {
    return {
      phone: indian.phone,
      code: indian.code,
    };
  }

  let american = getAmericanFormattedNumber(phno);

  if (american.success) {
    return {
      phone: american.phone,
      code: american.code,
    };
  }

  let number = sanitizeNumber(phno);

  const intlCode = checkForInternational(number);

  let phone = removePlus(number);

  if (intlCode) {
    phone = phone.slice(intlCode.length);
  }

  return {
    phone,
    code: intlCode,
  };
}

/**
 * Returns country code for a given international phonenumber
 * @param {string} phonenumber
 * @returns {string} country code
 */
function checkForInternational(number) {
  number = removePlus(number);

  let countryCode = '';

  const singleDigitCodes = Object.keys(countrycodes.ones);
  const doubleDigitCodes = Object.keys(countrycodes.twos);
  const tripleDigitCodes = Object.keys(countrycodes.threes);

  for (let i = MAX_LENGTH_COUNTRY_CODE; i >= 1; i--) {
    let code = number.substring(0, i);

    if (code.length === 3) {
      if (tripleDigitCodes.indexOf(code) >= 0) {
        countryCode = code;
        break;
      }
    } else if (code.length === 2) {
      if (doubleDigitCodes.indexOf(code) >= 0) {
        countryCode = code;
        break;
      }
    } else if (code.length === 1) {
      if (singleDigitCodes.indexOf(code) >= 0) {
        countryCode = code;
        break;
      }
    }
  }

  return countryCode;
}
