// Svelte store for address
import { writable, derived, get } from 'svelte/store';
import { INITIAL_ADDRESS } from 'one_click_checkout/address/constants';
import {
  addressCompleted as billingAddressCompleted,
  shouldSaveAddress as shouldSaveBillingAddress,
  newUserAddress as newBillingAddress,
  selectedAddressId as selectedBillingAddressId,
  shouldSaveAddress as shouldSaveBilling,
} from 'one_click_checkout/address/billing_address/store';

export const selectedAddressId = writable('');

export const savedAddresses = writable([]);

export const newUserAddress = writable(INITIAL_ADDRESS);

export const addressCompleted = writable(false);

addressCompleted.subscribe((completed) => {
  if (completed && get(isBillingSameAsShipping)) {
    billingAddressCompleted.set(true);
  }
});

export const forcedView = writable('');

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

export const isCodAvailable = derived(
  [selectedAddress],
  ([$selectedAddress]) => $selectedAddress?.cod
);

export const codReason = writable(''); // reason for COD unavailability

export const shouldSaveAddress = writable(null);

export const showSavedAddressCta = writable(false);

export const isBillingSameAsShipping = writable(true);

export const resetAddresses = () => {
  savedAddresses.set([]);
  selectedAddressId.set(null);
  newUserAddress.set(INITIAL_ADDRESS);

  selectedBillingAddressId.set(null);
  newBillingAddress.set(INITIAL_ADDRESS);
};

export function saveAddresspayload() {
  let payload = {};
  if (get(addressCompleted) && get(shouldSaveAddress)) {
    payload['shipping_address'] = get(newUserAddress);
  }
  if (
    get(billingAddressCompleted) &&
    get(shouldSaveBillingAddress) &&
    !get(isBillingSameAsShipping)
  ) {
    payload['billing_address'] = get(newBillingAddress);
  }
  return payload;
}

export const didSaveAddress = derived(
  [
    selectedAddressId,
    addressCompleted,
    shouldSaveAddress,
    selectedBillingAddressId,
    billingAddressCompleted,
    shouldSaveBilling,
  ],
  ([
    $selectedAddressId,
    $addressCompleted,
    $shouldSaveAddress,
    $selectedBillingAddressId,
    $billingAddressCompleted,
    $shouldSaveBilling,
  ]) => {
    const isShippingSaved =
      $addressCompleted && $shouldSaveAddress && !$selectedAddressId;
    const isBillingSaved =
      !$selectedBillingAddressId &&
      $billingAddressCompleted &&
      $shouldSaveBilling;
    return isShippingSaved || isBillingSaved;
  }
);
