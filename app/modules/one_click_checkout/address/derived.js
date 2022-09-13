import { get, derived } from 'svelte/store';
import { disableCODOnAppliedCoupon } from 'razorpay';
import {
  savedAddresses,
  isBillingSameAsShipping,
} from 'one_click_checkout/address/store';
import {
  newUserAddress as newShippingAddress,
  addressCompleted as shippingAddressCompleted,
  shouldSaveAddress as shouldSaveShippingAddress,
  resetAddress as resetShippingAddress,
  selectedAddress as selectedShippingAddress,
} from 'one_click_checkout/address/shipping_address/store';
import {
  newUserAddress as newBillingAddress,
  addressCompleted as billingAddressCompleted,
  shouldSaveAddress as shouldSaveBillingAddress,
  resetAddress as resetBillingAddress,
} from 'one_click_checkout/address/billing_address/store';
import { isCouponApplied } from 'one_click_checkout/coupons/store';

export const isCodAvailable = derived(
  [selectedShippingAddress, isCouponApplied],
  ([$selectedShippingAddress, $isCouponApplied]) => {
    if ($isCouponApplied && disableCODOnAppliedCoupon()) {
      return false;
    }
    return $selectedShippingAddress?.cod;
  }
);

export const resetAddresses = () => {
  savedAddresses.set([]);

  resetBillingAddress();
  resetShippingAddress();
};

export function getSaveAddressPayload() {
  let payload = {};
  if (get(shippingAddressCompleted) && get(shouldSaveShippingAddress)) {
    payload['shipping_address'] = get(newShippingAddress);
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

shippingAddressCompleted.subscribe((completed) => {
  if (completed && get(isBillingSameAsShipping)) {
    billingAddressCompleted.set(true);
  }
});
