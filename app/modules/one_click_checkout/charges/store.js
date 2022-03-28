import { writable, get } from 'svelte/store';
import { getSession } from 'sessionmanager';
import { appliedOffer } from 'checkoutstore/offers';
import { isOneClickCheckout } from 'razorpay';
import { showAmountInCta } from 'checkoutstore/cta';

// Store to keep track of shipping charge
export const shippingCharge = writable(null);

export const amount = writable(0);
export const offerAmount = writable(0);
amount.subscribe((amount) => {
  if (amount) {
    const session = getSession();
    session.setAmount(amount);
    showAmountInCta();
  }
});
appliedOffer.subscribe((offer) => {
  if (!isOneClickCheckout()) return;
  let currentAmount = offer ? get(cartAmount) : get(amount);
  if (offer) {
    const shippingCharges = get(shippingCharge) || 0;
    const couponDis = get(cartDiscount) || 0;
    const offerDiscount = offer.original_amount - offer.amount || 0;
    currentAmount = currentAmount + shippingCharges - offerDiscount - couponDis;
    offerAmount.set(offerDiscount);
  } else {
    currentAmount = currentAmount + get(offerAmount);
    offerAmount.set(0);
  }
  amount.set(currentAmount);
});

export const cartAmount = writable(0);

export const cartDiscount = writable(0);

// Store to keep track of COD Charge
export const codChargeAmount = writable(0);

// Store to check if cod was added to amount
export const isCodAddedToAmount = writable(null);

isCodAddedToAmount.subscribe((isAdded) => {
  if (isAdded === true) {
    amount.set(get(amount) + get(codChargeAmount));
  } else if (isAdded === false) {
    amount.set(get(amount) - get(codChargeAmount));
  }
});

export const isShippingAddedToAmount = writable(null);

isShippingAddedToAmount.subscribe((isAdded) => {
  if (isAdded === true) {
    amount.set(
      get(cartAmount) - get(cartDiscount) + (get(shippingCharge) || 0)
    );
  } else if (isAdded === false) {
    amount.set(get(amount) - (get(shippingCharge) || 0));
  }
});

shippingCharge.subscribe((shippingAmount) => {
  amount.set(get(cartAmount) - get(cartDiscount) + (shippingAmount || 0));
});
// Stores to keep track of charges from api
export function resetCharges() {
  shippingCharge.set(0);
  isCodAddedToAmount.set(false);
  isShippingAddedToAmount.set(false);
}

export function initializeCharges(line_items_total) {
  cartAmount.set(line_items_total);
  amount.set(line_items_total);
  cartDiscount.set();
}
