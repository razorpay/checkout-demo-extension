import { derived, writable } from 'svelte/store';
import { isCartTruthy } from 'one_click_checkout/cart/helpers';

export const cartItems = writable([]);

export const areAllCartItemsShown = writable(false);

export const enableCart = derived([cartItems], ([$cartItems]) =>
  isCartTruthy($cartItems)
);
