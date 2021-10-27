// Svelte store for address
import { writable, derived } from 'svelte/store';
import { INITIAL_ADDRESS } from 'one_click_checkout/address/constants';

export const selectedAddressId = writable('');

export const savedAddresses = writable([]);

export const newUserAddress = writable(INITIAL_ADDRESS);

export const addressCompleted = writable(false);

export const selectedAddress = derived(
  [selectedAddressId, savedAddresses, newUserAddress],
  ([$selectedAddressId, $savedAddresses, $newUserAddress]) => {
    if (
      !$savedAddresses ||
      $savedAddresses.length === 0 ||
      !$selectedAddressId
    ) {
      return $newUserAddress;
    }
    return $savedAddresses.filter((item) => item.id === $selectedAddressId)[0];
  }
);

export const shouldSaveAddress = writable(null);

export const resetNewBillingAddress = () => newUserAddress.set(INITIAL_ADDRESS);

export const updateNewBillingAddress = (address) => newUserAddress.set(address);
