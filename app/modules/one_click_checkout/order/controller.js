import { computeHash } from 'one_click_checkout/order/utils';
import * as Service from 'one_click_checkout/order/service';
import { getDefaultCustomerDetails } from 'one_click_checkout/order/helpers';
import {
  isContactValid,
  isEmailValid,
} from 'one_click_checkout/order/validators';
import RazorpayStore, {
  getOption,
  getOrderId,
  setShopifyOrderId,
} from 'razorpay';
import { getSession } from 'sessionmanager';

/**
 * resolves to order id
 * @type Promise<string>
 */
export let SHOPIFY_ORDER_PROMISE;
let hash = null;

export function updateOrderWithCustomerDetails(
  payload = getDefaultCustomerDetails()
) {
  if (!Object.keys(payload).length) {
    return;
  }

  const { email = '', contact = '' } = payload;

  if (!isEmailValid(email)) {
    return;
  }

  if (!isContactValid(contact)) {
    return;
  }

  let newHash = computeHash(contact, email);

  if (newHash !== hash) {
    hash = newHash;

    Service.updateOrder(payload);
  }
}

/**
 * @returns {string|Promise<string>}
 */
export function getLazyOrderId() {
  return getOrderId() || SHOPIFY_ORDER_PROMISE;
}

export function clearShopifyOrder() {
  SHOPIFY_ORDER_PROMISE = null;
  setShopifyOrderId('');
}

export function createShopifyOrder(shopifyCheckoutPromise) {
  SHOPIFY_ORDER_PROMISE = shopifyCheckoutPromise
    .then(Service.createShopifyOrder)
    .then(({ order_id, preferences }) => {
      setShopifyOrderId(order_id);
      const session = getSession();

      if (session.isOpen) {
        const razorpayInstance = session.r;
        razorpayInstance.preferences = preferences;
        RazorpayStore.updateInstance(razorpayInstance);

        session.setPreferences(preferences);
        session.setOffers();

        Service.updateShopifyCartUrl({
          order_id,
          cart_note: getOption('shopify_cart').cart.note ?? null,
        });
      }

      return order_id;
    });

  return SHOPIFY_ORDER_PROMISE;
}
