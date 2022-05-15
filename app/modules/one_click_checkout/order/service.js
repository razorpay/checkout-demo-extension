// util imports
import { timer } from 'utils/timer';

// store imports
import { getOrderId } from 'razorpay';
import { makeAuthUrl } from 'checkoutstore';

// Analytics imports
import { Events } from 'analytics';
import {
  PARTIAL_ORDER_UPDATE_START,
  PARTIAL_ORDER_UPDATE_END,
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
