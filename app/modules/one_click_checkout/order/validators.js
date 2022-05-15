import { get } from 'svelte/store';

import { country } from 'checkoutstore/screens/home';

import {
  EMAIL_REGEX,
  INDIA_COUNTRY_CODE,
  INDIAN_CONTACT_REGEX,
  CONTACT_REGEX,
  COUNTRY_CODE_REGEX,
} from 'common/constants';

export function isEmailValid(email) {
  if (email && !EMAIL_REGEX.test(email)) {
    return false;
  }
  return true;
}

export function isContactValid(contact) {
  const countryCode = get(country);

  if (!COUNTRY_CODE_REGEX.test(countryCode)) {
    return false;
  }

  const regex =
    get(country) === INDIA_COUNTRY_CODE ? INDIAN_CONTACT_REGEX : CONTACT_REGEX;

  if (contact && !regex.test(contact)) {
    return false;
  }
  return true;
}
