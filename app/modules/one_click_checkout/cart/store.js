import { getCartExperiment } from 'one_click_checkout/store';
import { derived, writable } from 'svelte/store';
import { CART_EXPERIMENTS } from 'one_click_checkout/cart/constants';
import { isCartTruthy } from 'one_click_checkout/cart/helpers';

export const cartItems = writable([]);

export const areAllCartItemsShown = writable(false);

export const enableCart = derived(
  [cartItems],
  ([$cartItems]) =>
    Object.values(CART_EXPERIMENTS).includes(getCartExperiment()) &&
    isCartTruthy($cartItems)
);
