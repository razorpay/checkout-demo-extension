import { getOption } from 'razorpay';
import type { Cart } from './interface';

export function getLineItemsTotal() {
  const cart: Cart = getOption('cart');

  return cart.line_items?.reduce((sum, line_item) => {
    return sum + (line_item.offer_price || line_item.price);
  }, 0);
}
