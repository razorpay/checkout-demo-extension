var countrycodes = require('./countrycodes');

const MAX_LENGTH_COUNTRY_CODE = 3;

function findCountryCode(number) {
  number = number.replace(/^0{2}/, '+');

  if (number[0] === '+') {
    number = number.split('+')[1];
    let num = checkForInternational(number);
    if (num) {
      return num;
    } else {
      return '91';
    }
  } else {
    if (number.length === 10) {
      let regex = /^[6-9]/;
      if (number.match(regex)) {
        return '91';
      }
    }

    if (number.length === 12) {
      let regex = /^91[6-9]/;
      if (number.match(regex)) {
        return '91';
      }
    }
  }
}

function checkForInternational(number) {
  let countryCode = '';

  for (let i = MAX_LENGTH_COUNTRY_CODE; i >= 1; i--) {
    let code = number.substring(0, i);

    const allCodes = Object.keys(countrycodes);
    if (allCodes.indexOf(code) >= 0) {
      countryCode = code;
      break;
    }
  }

  return countryCode;
}

console.log(findCountryCode('+6620765451'));
