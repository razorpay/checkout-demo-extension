import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
import { cartAmount } from 'one_click_checkout/charges/store';
import { VALID_URL_REGEX } from 'one_click_checkout/common/utils';
import { get } from 'svelte/store';
import { CART_TRUTHY_KEYS } from 'one_click_checkout/cart/constants';
import { formatAmount } from 'helper/currency';

/**
 * @param {array} lineItems recieved from BE
 * @returns formatted array of lineItems
 */
export const formatLineItems = (lineItems) => {
  return lineItems.map((item) => {
    const {
      name,
      price,
      quantity,
      description,
      image_url,
      variant_id,
      product_url,
      offer_price,
    } = item;
    return {
      name,
      price,
      quantity,
      description,
      image_url,
      variant_id,
      product_url,
      offer_price,
    };
  });
};

/**
 * @param {object} item cartItem
 * @param {object}
 * @returns payload for cart-item render analytics
 */
export const getCartItemAnalyticsPayload = (
  item,
  { itemsShown, totalItems, screenName }
) => {
  const { name, image_url, price, quantity, product_url, variant_id } = item;
  return {
    item_name: name,
    item_image_url: image_url,
    item_price: formatAmount(price),
    item_quantity: quantity,
    item_url: product_url,
    item_variant_id: variant_id,
    count_of_items_shown: itemsShown,
    count_of_items_hidden: totalItems - itemsShown,
    screen_name: screenName || getCurrentScreen(),
    total_items_in_the_cart: totalItems,
  };
};

/**
 * @param {array} cart array of cartItems
 * @returns true if Cart Items meet all the requirements else false
 */
export const isCartTruthy = (cart) => {
  if (!cart.length) {
    return false;
  }

  const areAllItemsTruthy = cart.every((item) => {
    return CART_TRUTHY_KEYS.every((key) => {
      if (!(key in item)) {
        return false;
      }

      if (key === 'image_url') {
        return VALID_URL_REGEX.test(item[key]);
      }

      return item[key] || item[key] === 0;
    });
  });

  const lineItemsTotalAmount = cart.reduce((acc, curr) => {
    if (
      !Number.isNaN(parseInt(curr.offer_price, 10)) &&
      +curr.price !== +curr.offer_price
    ) {
      return acc + curr.quantity * +curr.offer_price;
    }
    return acc + curr.quantity * +curr.price;
  }, 0);

  return areAllItemsTruthy && lineItemsTotalAmount === get(cartAmount);
};
