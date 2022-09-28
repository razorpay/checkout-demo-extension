import { writable, get } from 'svelte/store';
import {
  amount,
  cartAmount,
  cartDiscount,
  resetCharges,
  shippingCharge,
  couponValRem,
} from 'one_click_checkout/charges/store';
import { MIN_REQ_AMOUNT } from 'one_click_checkout/coupons/constants';

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
  const couponValue = get(cartDiscount);
  const total = get(amount) + couponValue;
  isCouponApplied.set(false);
  appliedCoupon.set('');
  couponInputValue.set('');
  error.set('');
  amount.set(total);
  cartDiscount.set(0);
  couponValRem.set(0);
  disabledMethods.set([]);
}

export function applyCouponInStore(code, response) {
  couponState.set('idle');
  disabledMethods.set(response.promotions[0].disabled_methods || []);
  appliedCoupon.set(code);
  const cartValue = get(cartAmount);
  let couponValue = response.promotions[0].value;
  /* if coupon amount is greater than or equal to cart amount & shipping charge is available,
   * The maximum consumable coupon amount is equal to cart amount
   */
  if (couponValue >= cartValue && get(shippingCharge)) {
    couponValue = cartValue;
  } else if (couponValue >= cartValue) {
    /* if coupon amount is greater than or equal to cart amount,
     * The maximum consumable coupon amount is cart amount - ₹1
     */
    couponValRem.set(MIN_REQ_AMOUNT);
    couponValue = cartValue - MIN_REQ_AMOUNT;
  }
  cartDiscount.set(couponValue);

  const totalAmt = get(amount) || cartValue;
  /* In both the cases of totalAmt(cart amount + shipping amount) or totalAmt(cart amount) then we are subtracting
   * the coupon value and assigning to amount store again.
   */
  let value = totalAmt - couponValue;
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

export const disabledMethods = writable([]);
