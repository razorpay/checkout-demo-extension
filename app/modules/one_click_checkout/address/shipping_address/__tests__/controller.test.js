import { get } from 'svelte/store';
import { isShippingAddedToAmount } from 'one_click_checkout/charges/store';
import { removeShippingCharges } from 'one_click_checkout/address/shipping_address/controller';

jest.mock('one_click_checkout/charges/store', () => {
  const { writable } = jest.requireActual('svelte/store');
  const originalModule = jest.requireActual('one_click_checkout/charges/store');
  return {
    ...originalModule,
    isShippingAddedToAmount: writable(true),
  };
});

describe('Shipping Address Controller tests', () => {
  describe('removeShippingCharges method', () => {
    it('should mark store value as false', () => {
      removeShippingCharges();

      expect(get(isShippingAddedToAmount)).toBe(false);
    });
  });
});
