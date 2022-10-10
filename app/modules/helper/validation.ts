import {
  CONTACT_REGEX,
  INDIA_COUNTRY_CODE,
  PHONE_REGEX_INDIA,
} from 'common/constants';

export function isValidContact(countryCode: string, phoneNumber: string) {
  if (countryCode === INDIA_COUNTRY_CODE) {
    return PHONE_REGEX_INDIA.test(phoneNumber);
  }
  return CONTACT_REGEX.test(`${countryCode}${phoneNumber}`);
}
