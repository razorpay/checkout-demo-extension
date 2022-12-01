import { writable, get } from 'svelte/store';
import { getSession } from 'sessionmanager';
import { MIN_REQ_AMOUNT } from 'one_click_checkout/coupons/constants';
import { totalAppliedGCAmt } from 'one_click_checkout/gift_card/store';

// Store to keep track of shipping charge
export const shippingCharge = writable(null);

export const amount = writable(0);
export const offerAmount = writable(0);
amount.subscribe((amount) => {
  if (amount) {
    const session = getSession();
    session.setAmount(amount, true); // this will automatically set amount in cta
  }
});

export const cartAmount = writable(0);

export const cartDiscount = writable(0);

export const couponValRem = writable(0);

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
      get(cartAmount) -
        get(cartDiscount) +
        get(shippingCharge) -
        get(totalAppliedGCAmt)
    );
  } else if (isAdded === false) {
    amount.set(get(amount) - get(shippingCharge));
  }
});

export const setCartDiscount = (shippingAmount) => {
  const cartAmt = get(cartAmount);
  const cartDis = get(cartDiscount);
  if (shippingAmount && get(couponValRem) && cartDis < cartAmt) {
    cartDiscount.set(cartAmt);
  } else if (!shippingAmount && cartAmt && cartDis === cartAmt) {
    cartDiscount.set(cartAmt - MIN_REQ_AMOUNT);
    couponValRem.set(MIN_REQ_AMOUNT);
  }
};

shippingCharge.subscribe((shippingAmount) => {
  setCartDiscount(shippingAmount);
  amount.set(
    get(cartAmount) -
      get(cartDiscount) +
      (shippingAmount || 0) -
      get(totalAppliedGCAmt)
  );
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
  cartDiscount.set(0);
}
