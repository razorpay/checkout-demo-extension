import { getAmount, getOrderId } from 'checkoutstore';
import {
  initializeCharges,
  isShippingAddedToAmount,
  isCodAddedToAmount,
} from 'one_click_checkout/charges/store';
import { get as storeGetter } from 'svelte/store';
import { resetOrderApiCall } from './service';
import { resetChargesCoupons } from 'one_click_checkout/coupons/store';
import { resetAddresses } from 'one_click_checkout/address/store';

/**
 *
 * @param {number} line_items_total The final amount of order
 */
export function initializeAndReset(line_items_total) {
  initializeCharges(line_items_total);
  resetOrder();
}

export function resetOrder(shouldResetAddresses = false) {
  const orderId = getOrderId();

  resetOrderApiCall(orderId).then((response) => {
    if (shouldResetAddresses) {
      resetAddresses();
    }
    resetChargesCoupons();
  });
}

export function removeShippingCharges() {
  if (storeGetter(isShippingAddedToAmount)) {
    isShippingAddedToAmount.set(false);
  }
}

export function removeCodCharges() {
  if (storeGetter(isCodAddedToAmount)) {
    isCodAddedToAmount.set(false);
  }
}
