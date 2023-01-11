import { computeHash } from 'one_click_checkout/order/utils';
import * as Service from 'one_click_checkout/order/service';
import { getDefaultCustomerDetails } from 'one_click_checkout/order/helpers';
import feature_overrides from 'checkoutframe/overrideConfig';

import {
  isContactValid,
  isEmailValid,
} from 'one_click_checkout/order/validators';
import RazorpayStore, {
  getMerchantKey,
  getOption,
  getOrderId,
  setLazyOrderId,
} from 'razorpay';
import { getSession } from 'sessionmanager';
import { getLitePreferencesFromStorage } from 'checkout-frame-lite/service';

/**
 * resolves to order id
 * @type Promise<string>
 */
function setOrderWithPreferences({ order_id, preferences }) {
  setLazyOrderId(order_id);
  // since preferences is fetched using internal auth,
  // microservice is returning rzp_test/rzp_live as key here
  preferences.merchant_key = getMerchantKey();
  const session = getSession();

  const updatedPrefs = {
    feature_overrides,
    ...preferences,
  };

  /**
   * use the cached truecaller id if present
   */
  const cachedTruecallerReqId = getLitePreferencesFromStorage(getOption('key'))
    ?.preferences.truecaller?.request_id;
  if (cachedTruecallerReqId) {
    updatedPrefs.truecaller = {
      ...updatedPrefs.truecaller,
      request_id: cachedTruecallerReqId,
    };
  }

  if (session.isOpen) {
    const razorpayInstance = session.r;
    razorpayInstance.preferences = updatedPrefs;
    RazorpayStore.updateInstance(razorpayInstance);

    session.setPreferences(updatedPrefs);
    session.setOffers();
  }

  return order_id;
}

export let LAZY_ORDER_PROMISE;
let hash = null;

export let lazyOrderResolver;
export function initLazyOrderResolver() {
  LAZY_ORDER_PROMISE = new Promise((resolve) => {
    lazyOrderResolver = resolve;
  }).then(setOrderWithPreferences);
}

export async function updateOrderWithCustomerDetails(
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

    await getLazyOrderId();
    Service.updateOrder(payload);
  }
}

/**
 * @returns {string|Promise<string>}
 */
export function getLazyOrderId() {
  return getOrderId() || LAZY_ORDER_PROMISE;
}

export function clearShopifyOrder() {
  LAZY_ORDER_PROMISE = null;
  setLazyOrderId('');
}

export function createShopifyOrder(shopifyCheckoutPromise) {
  LAZY_ORDER_PROMISE = shopifyCheckoutPromise
    .then(Service.createShopifyOrder)
    .then(setOrderWithPreferences)
    .then((order_id) => {
      const session = getSession();

      if (session.isOpen) {
        Service.updateShopifyCartUrl({
          order_id,
          cart_note: getOption('shopify_cart').note,
        });
      }

      return order_id;
    });

  return LAZY_ORDER_PROMISE;
}
