import { derived, writable } from 'svelte/store';
import {
  isInstrumentGrouped,
  isInstrumentForEntireMethod,
} from 'configurability/instruments';
import { findCountryCode } from 'common/countrycodes';
import { INDIA_COUNTRY_CODE } from 'common/constants';

export const country = writable('');
export const phone = writable('');
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

country.subscribe(country => {
  proxyCountry.set(country);
});

phone.subscribe(phone => {
  proxyPhone.set(phone);
});

/**
 * Sets $country, $phone, and in turn $contact
 * @param {string} value contact
 */
export function setContact(value) {
  const parsedContact = findCountryCode(value);

  if (parsedContact.code) {
    country.set(`+${parsedContact.code}`);
  } else {
    country.set(INDIA_COUNTRY_CODE);
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
export const instruments = derived(blocks, allBlocks => {
  const allInstruments = _Arr.flatMap(allBlocks, block => block.instruments);

  return allInstruments;
});
export const hiddenInstruments = writable([]);
export const hiddenMethods = writable([]);

export const sequence = writable([]);

export const selectedInstrumentId = writable(null);
export const selectedInstrument = derived(
  [instruments, selectedInstrumentId],
  ([$instruments = [], $selectedInstrumentId = null]) =>
    _Arr.find(
      $instruments,
      instrument => instrument.id === $selectedInstrumentId
    )
);

/**
 * Stores the instrument for which method is opened
 */
export const methodInstrument = derived(
  selectedInstrument,
  $selectedInstrument => {
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
  contactValue => contactValue && contactValue !== '+91' && contactValue !== '+'
);
