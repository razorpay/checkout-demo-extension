import { writable, get } from 'svelte/store';
import {
  amount,
  cartAmount,
  cartDiscount,
  resetCharges,
} from 'one_click_checkout/charges/store';

export const appliedCoupon = writable('');
export const isCouponApplied = writable(null);

export const couponState = writable('idle');

export const availableCoupons = writable([]);

export const couponInputValue = writable('');

export const error = writable('');
export const errorCode = writable('');

// Analytics specific stores
export const couponInputSource = writable('');
export const couponAppliedIndex = writable(0); // Count of how many times coupon is applied
export const couponRemovedIndex = writable(0); // Count of how many times coupon is removed

/**
 * @param {number} new_amount The new amount to be set after removing coupon
 */
export function removeCouponInStore() {
  isCouponApplied.set(false);
  appliedCoupon.set('');
  couponInputValue.set('');
  error.set('');
  amount.set(get(cartAmount));
  cartDiscount.set(0);
}

export function applyCouponInStore(code, response) {
  couponState.set('idle');
  appliedCoupon.set(code);
  cartDiscount.set(response.promotions[0].value);

  let value = get(cartAmount) - response.promotions[0].value;
  if (value < 100) {
    value = 100;
  }
  amount.set(value);
  error.set('');
  isCouponApplied.set(true);
}

/**
 * @param {object} error Error response passed by coupon validity API
 */
export function updateFailureReasonInStore(response) {
  couponState.set('idle');
  error.set(response.failure_reason);
  isCouponApplied.set(false);
  appliedCoupon.set('');
  amount.set(get(cartAmount));
}

export function resetChargesCoupons() {
  resetCharges();
  removeCouponInStore();
}

export const couponListTimer = writable('');
