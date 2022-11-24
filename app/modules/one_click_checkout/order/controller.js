import { computeHash } from 'one_click_checkout/order/utils';
import * as Service from 'one_click_checkout/order/service';
import { getDefaultCustomerDetails } from 'one_click_checkout/order/helpers';
import {
  isContactValid,
  isEmailValid,
} from 'one_click_checkout/order/validators';
import RazorpayStore, { getOrderId, setShopifyOrderId } from 'razorpay';
import { getSession } from 'sessionmanager';

let FINAL_PREFERENCES_SYNCED = false;
let CREATE_SHOPIFY_ORDER_PROMISE;
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

export async function getLazyOrderId() {
  if (getOrderId()) {return Promise.resolve(getOrderId());}

  const response = await getShopifyOrder();
  return response.order_id;
}

export function getShopifyOrder() {
  if (CREATE_SHOPIFY_ORDER_PROMISE) {
    return CREATE_SHOPIFY_ORDER_PROMISE;
  }

  CREATE_SHOPIFY_ORDER_PROMISE = Service.createShopifyOrder();
  return CREATE_SHOPIFY_ORDER_PROMISE;
}

export async function syncPreferences() {
  if (getOrderId() || FINAL_PREFERENCES_SYNCED) {
    return;
  }

  const response = await getShopifyOrder();

  setShopifyOrderId(response.order_id);

  const session = getSession();
  const razorpayInstance = session.r;
  razorpayInstance.preferences = response.preferences;
  RazorpayStore.updateInstance(razorpayInstance);

  session.setPreferences(response.preferences);
  session.setOffers();

  FINAL_PREFERENCES_SYNCED = true;
}
