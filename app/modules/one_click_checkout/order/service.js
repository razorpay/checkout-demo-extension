// util imports
import { timer } from 'utils/timer';
import fetch from 'utils/fetch';
// store imports
import { getOrderId } from 'razorpay/helper/order';
import { makeAuthUrl } from 'common/makeAuthUrl';

// Analytics imports
import Analytics, { Events } from 'analytics';
import {
  PARTIAL_ORDER_UPDATE_START,
  PARTIAL_ORDER_UPDATE_END,
  FETCH_SHOPIFY_ORDER_END,
  FETCH_SHOPIFY_ORDER_START,
} from 'one_click_checkout/order/analytics';
import { getSession } from 'sessionmanager';
import { getPreferencesParams } from 'checkoutframe/utils';
import { isNonNullObject, unflatten } from 'utils/object';

export function updateOrder(payload) {
  const orderId = getOrderId();

  const getDuration = timer();
  const meta = { fields: Object.keys(payload) };
  Events.TrackMetric(PARTIAL_ORDER_UPDATE_START, {
    meta,
  });
  return new Promise((resolve) => {
    fetch.patch({
      url: makeAuthUrl(`orders/1cc/${orderId}/customer`),
      data: { customer_details: payload },
      callback: (response) => {
        Events.TrackMetric(PARTIAL_ORDER_UPDATE_END, {
          success: response.ok ? true : false,
          duration: getDuration(),
          meta,
        });
        resolve(response);
      },
    });
  });
}

/**
 * Lazily get the order_id and prefs for the checkout session
 * using the corresponding shopify checkout ID
 * ref: https://docs.google.com/document/d/1vXnXFOAZJU1VjMzFm4g_juSsSNz4huxZXXEvNioho8c/edit#heading=h.93xu2hw1mf9b
 * @returns Promise making the api call
 */
export function createShopifyOrder(shopifyCheckoutId) {
  const session = getSession();
  const params = getPreferencesParams(session);

  if (isNonNullObject(params)) {
    params['_[request_index]'] = Analytics.updateRequestIndex('preferences');
  }

  const getDuration = timer();
  Events.TrackMetric(FETCH_SHOPIFY_ORDER_START);

  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl(`magic/order/shopify`),
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        shopify_checkout_id: shopifyCheckoutId,
        preference_params: { ...unflatten(params), send_preferences: true },
      }),
      callback: (res) => {
        const success = res.status_code === 200 || res.xhr.status === 200;
        Events.TrackMetric(FETCH_SHOPIFY_ORDER_END, {
          success,
          duration: getDuration(),
        });
        if (success) {
          resolve(res);
        } else {
          reject(res);
        }
      },
    });
  });
}

export function updateShopifyCartUrl(data) {
  fetch.post({
    url: makeAuthUrl(`1cc/shopify/checkout/url`),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'text/plain',
    },
    data: JSON.stringify(data),
  });
}
