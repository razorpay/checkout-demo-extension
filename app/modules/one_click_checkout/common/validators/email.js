import { EMAIL_REGEX } from 'common/constants';

export const validateEmail = (value) => {
  let valid = false;

  valid = EMAIL_REGEX.test(value);

  if (value.includes('@gmail') && !value.endsWith('@gmail.com')) {
    valid = false;
  }

  return valid;
};
