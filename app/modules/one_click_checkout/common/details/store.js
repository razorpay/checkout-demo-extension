import { country } from 'checkoutstore/screens/home';
import { INDIA_COUNTRY_CODE } from 'common/constants';
import { isContactOptional, isEmailOptional } from 'razorpay';
import { derived, writable } from 'svelte/store';

export const isContactValid = writable(false);

export const isEmailValid = writable(false);

/**
 * Email optional available only for indian contact for now
 */

export const isOptionalEmail = derived([country], ([$country]) => {
  if ($country === INDIA_COUNTRY_CODE) {
    return isEmailOptional();
  }
  return false;
});

export const isContactAndEmailValid = derived(
  [isEmailValid, isContactValid, isOptionalEmail],
  ([$isEmailValid, $isContactValid, $isOptionalEmail]) =>
    ($isEmailValid || $isOptionalEmail) &&
    ($isContactValid || isContactOptional())
);
