import { EMAIL_REGEX } from 'common/constants';
import { resolveMxRecords } from 'one_click_checkout/common/services/dns';
import { WHITELISTED_DOMAINS } from 'one_click_checkout/common/constants';

/**
 * Function which checks if passed email has a valid regex
 * @param {string} email - Email entered by user
 * @returns {boolean} flag represents wether regex match was success
 */
export const isEmailValidRegex = (value) => EMAIL_REGEX.test(value);

/**
 * Function which checks if MX records exist for given domain name
 * Google DNS Resolver API docs: https://developers.google.com/speed/public-dns/docs/doh
 * @param {string} domain - The domain name to be validated
 * @returns {boolean} flag to represent if MX records we found.
 */
export const mxRecordsExist = (domain = '') => {
  if (!domain) {
    return Promise.reject(false);
  }
  return resolveMxRecords(domain);
};

/**
 * Function which checks if domain name is whitelisted or not.
 * We maintain a list of whitelisted domains to skip checking MX records.
 *
 * @param {string} domain - The domain name to be validated
 * @returns {boolean} represents wether passed domain name is whitelisted or not.
 */
export const isDomainWhitelisted = (domain = '') => {
  if (!domain) {
    return false;
  }

  if (WHITELISTED_DOMAINS.includes(domain.toLowerCase())) {
    return true;
  }

  return false;
};

/**
 * Function checks if passed email is valid or not.
 * A valid email means. The email regex is valid and MX records for the domain actually exist
 *
 * @param {string} email - Email entered by user
 * @returns {Promise} boolean flag which represents if email is valid or not
 */
export const validateEmail = (email) => {
  const regexValid = isEmailValidRegex(email);

  if (!regexValid) {
    return Promise.resolve(false);
  }

  const domain = email.split('@')[1];
  const whitelisted = isDomainWhitelisted(domain);

  if (!whitelisted) {
    return mxRecordsExist(domain);
  }

  return Promise.resolve(true);
};
