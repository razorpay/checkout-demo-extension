import { cartItems } from 'one_click_checkout/cart/store';
import { formatLineItems } from 'one_click_checkout/cart/helpers';

/**
 *
 * @param {array} line_items received from BE
 * set formatted lineItems in FE store
 */
export const setLineItems = (line_items) => {
  cartItems.set(formatLineItems(line_items || []));
};
