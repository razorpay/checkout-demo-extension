import countrycodes from 'modules/countrycodes';

const MAX_LENGTH_COUNTRY_CODE = 3;

export default function findCountryCode(phno) {
  let number = phno;
  number = number.replace(/^0{2}/, '+');

  if (number[0] === '+') {
    number = number.split('+')[1];
    let num = checkForInternational(number);
    if (num) {
      return {
        countrycode: num,
        phnumber: number.replace(num, ''),
      };
    } else {
      return {
        code: undefined,
        phnumber: phno,
      };
    }
  } else {
    if (number.length === 10) {
      let regex = /^[6-9]/;
      if (number.match(regex)) {
        return {
          code: 91,
          phnumber: number,
        };
      } else
        return {
          code: undefined,
          phnumber: phno,
        };
    } else if (number.length === 12) {
      let regex = /^91[6-9]/;
      if (number.match(regex)) {
        return {
          code: 91,
          phnumber: number.substring(2),
        };
      } else
        return {
          code: undefined,
          phnumber: phno,
        };
    } else
      return {
        code: undefined,
        phnumber: phno,
      };
  }
}

function checkForInternational(number) {
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
