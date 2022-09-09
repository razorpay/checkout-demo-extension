import { get } from 'svelte/store';
import { setCartDiscount } from 'one_click_checkout/charges/store';
import { applyCouponInStore } from 'one_click_checkout/coupons/store';
import { cartAmount, cartDiscount } from 'one_click_checkout/charges/store';
import { MIN_REQ_AMOUNT } from 'one_click_checkout/coupons/constants';

jest.mock('sessionmanager', () => ({
  getSession: jest.fn(() => ({
    get: jest.fn(),
    bindEvents: jest.fn(),
    setAmount: jest.fn(),
  })),
}));

const couponCode = 'FLAT10';
const couponRes = {
  promotions: [
    {
      code: 'FLAT10',
      description: 'Use code FLAT10 and get ₹10 off on your purchase',
      reference_id: 'FLAT10',
      type: 'flat',
      value: 1100, // ₹11
      value_type: 'number',
    },
  ],
};

describe('setCartDiscount', () => {
  it('Coupon value is greater than the cart value & shipping charge is applied', () => {
    cartAmount.set(1000); // ₹10
    applyCouponInStore(couponCode, couponRes);
    const shippingAmount = 1000; // ₹10
    setCartDiscount(shippingAmount);
    expect(get(cartDiscount)).toBe(get(cartAmount));
  });
  it('Coupon value is greater than the cart value & shipping charge is not applied', () => {
    cartAmount.set(1000); // ₹10
    applyCouponInStore(couponCode, couponRes);
    const shippingAmount = 0; // ₹0
    setCartDiscount(shippingAmount);
    expect(get(cartDiscount)).toBe(get(cartAmount) - MIN_REQ_AMOUNT);
  });
  it('Coupon value is less than the cart value', () => {
    cartAmount.set(1500); // ₹15
    applyCouponInStore(couponCode, couponRes);
    const shippingAmount = 0; // ₹0
    const couponValue = couponRes.promotions[0].value;
    setCartDiscount(shippingAmount);
    expect(get(cartDiscount)).toBe(couponValue);
  });
});
