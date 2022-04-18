import { derived, writable, get } from 'svelte/store';

import { isContactOptional, isEmailOptional } from 'razorpay/index';

import {
  CONTACT_REGEX,
  EMAIL_REGEX,
  INDIA_COUNTRY_CODE,
  INDIA_COUNTRY_ISO_CODE,
  US_COUNTRY_ISO_CODE,
} from 'common/constants';
import {
  isInstrumentGrouped,
  isInstrumentForEntireMethod,
} from 'configurability/instruments';
import { COUNTRY_TO_CODE_MAP } from 'common/countrycodes';
import { findCountryCode } from 'common/countrycodes';

export const getCustomerDetails = () => {
  const data = {
    contact: get(contact),
    email: get(email),
  };
  if (data.contact === INDIA_COUNTRY_CODE || data.contact === '+') {
    delete data.contact;
  }

  if (isContactOptional()) {
    // Merchant is on contact optional feature
    if (!CONTACT_REGEX.test(data.contact)) {
      // However, payload seems to have an invalid contact, delete it.
      delete data.contact;
    }
  } else if (data.contact) {
    data.contact = data.contact.replace(/ /g, '');
  }

  if (isEmailOptional()) {
    // Merchant is on email optional feature
    if (!EMAIL_REGEX.test(data.email)) {
      // However, payload seems to have an invalid email, delete it.
      delete data.email;
    }
  }

  return data;
};

export const country = writable('');
export const phone = writable('');
export const countryISOCode = writable('');
export const contact = derived([country, phone], ([$country, $phone]) => {
  if ($phone) {
    return $country + $phone;
  } else {
    return '';
  }
});

export const proxyCountry = writable('');
export const proxyPhone = writable('');
export const proxyContact = derived(
  [proxyCountry, proxyPhone],
  ([$proxyCountry, $proxyPhone]) => {
    if ($proxyPhone) {
      return $proxyCountry + $proxyPhone;
    } else {
      return '';
    }
  }
);

country.subscribe((country) => {
  proxyCountry.set(country);
});

phone.subscribe((phone) => {
  proxyPhone.set(phone);
});

const getCountryISOCode = (countryContactCode) => {
  const rows = Object.entries(COUNTRY_TO_CODE_MAP);
  for (const [iso, code] of rows) {
    // For similar country code like +1 instead of Canada always we returning US
    if (countryContactCode === '1') {
      return US_COUNTRY_ISO_CODE;
    } else if (countryContactCode === code) {
      return iso;
    }
  }
};
/**
 * Sets $country, $phone, and in turn $contact
 * @param {string} value contact
 */
export function setContact(value) {
  const parsedContact = findCountryCode(value);

  if (parsedContact.code) {
    country.set(`+${parsedContact.code}`);
    countryISOCode.set(getCountryISOCode(parsedContact.code));
  } else {
    country.set(INDIA_COUNTRY_CODE);
    countryISOCode.set(INDIA_COUNTRY_ISO_CODE);
  }

  phone.set(parsedContact.phone);
}

export const email = writable('');

/**
 * Sets $email
 * @param {string} value email
 */
export function setEmail(value) {
  email.set(value);
}

export const emiContact = writable('');

export const address = writable('');
export const pincode = writable('');
export const state = writable('');

export const multiTpvOption = writable('netbanking');
export const partialPaymentOption = writable();
export const partialPaymentAmount = writable('');

export const blocks = writable([]);
export const instruments = derived(blocks, (allBlocks) => {
  const allInstruments = allBlocks.flatMap((block) => block.instruments);

  return allInstruments;
});
export const hiddenInstruments = writable([]);
export const hiddenMethods = writable([]);

export const sequence = writable([]);

export const selectedInstrumentId = writable(null);
export const selectedInstrument = derived(
  [instruments, selectedInstrumentId],
  ([$instruments = [], $selectedInstrumentId = null]) =>
    $instruments.find((instrument) => instrument.id === $selectedInstrumentId)
);

/**
 * Stores the instrument for which method is opened
 */
export const methodInstrument = derived(
  selectedInstrument,
  ($selectedInstrument) => {
    if (!$selectedInstrument) {
      return null;
    }

    if (isInstrumentForEntireMethod($selectedInstrument)) {
      return $selectedInstrument;
    }

    if (isInstrumentGrouped($selectedInstrument)) {
      return $selectedInstrument;
    }

    return null;
  }
);

/**
 * A contact is said to be present if it has more than three characters,
 * the three characters usually being "+91".
 */
export const isContactPresent = derived(
  contact,
  (contactValue) =>
    contactValue && contactValue !== '+91' && contactValue !== '+'
);

export const upiIntentInstrumentsForAnalytics = writable([]);

export const getCustomerCountryISOCode = () => get(countryISOCode);
