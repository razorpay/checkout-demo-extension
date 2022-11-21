// util imports
import { timer } from 'utils/timer';
import fetch from 'utils/fetch';
// store imports
import { getOrderId } from 'razorpay/helper/order';
import { getShopifyCheckoutId } from 'razorpay/helper/1cc';
import { makeAuthUrl } from 'common/makeAuthUrl';

// Analytics imports
import { Events } from 'analytics';
import {
  PARTIAL_ORDER_UPDATE_START,
  PARTIAL_ORDER_UPDATE_END,
  FETCH_SHOPIFY_ORDER_END,
  FETCH_SHOPIFY_ORDER_START,
} from 'one_click_checkout/order/analytics';

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
 * usiing the corresponding shopify checkout ID
 * ref: https://docs.google.com/document/d/1vXnXFOAZJU1VjMzFm4g_juSsSNz4huxZXXEvNioho8c/edit#heading=h.93xu2hw1mf9b
 * @returns Promise making the api call
 */
export async function createShopifyOrder() {
  const shopifyCheckoutId = await getShopifyCheckoutId();

  const getDuration = timer();
  Events.TrackMetric(FETCH_SHOPIFY_ORDER_START);
  return new Promise((resolve) => {
    fetch.post({
      url: makeAuthUrl(`magic/checkout/shopify/${shopifyCheckoutId}/order`),
      callback: (res) => {
        Events.TrackMetric(FETCH_SHOPIFY_ORDER_END, {
          success: res.ok ? true : false,
          duration: getDuration(),
        });
        // res contains both order_id and complete prefs
        resolve(res);
      },
    });
  });
}
