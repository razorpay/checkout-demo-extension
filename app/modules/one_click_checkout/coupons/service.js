import { getContactPayload } from 'one_click_checkout/store';
import { getOrderId, makeAuthUrl } from 'checkoutstore';
import { timer } from 'utils/timer';
import { Events } from 'analytics';
import CouponEvents from 'one_click_checkout/coupons/analytics';

/**
 * method to fetch coupons for merchant from backend
 * @returns {Array} a list of coupons for the specific merchant.
 */
export function getCoupons() {
  const getDuration = timer();
  Events.TrackMetric(CouponEvents.COUPONS_FETCH_START);

  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl('merchant/coupons'),
      data: {
        ...getContactPayload(),
        order_id: getOrderId(),
      },
      callback: (response) => {
        Events.TrackMetric(CouponEvents.COUPONS_FETCH_END, {
          time: getDuration(),
        });
        if (Array.isArray(response.promotions)) {
          resolve(response.promotions);
        } else {
          reject(response);
        }
      },
    });
  });
}

/**
 * Method to validate coupon entered by user against backend.
 * @param {string} code coupon code entered by the user
 */
export function validateCoupon(code) {
  const getDuration = timer();
  Events.TrackMetric(CouponEvents.COUPON_VALIDITY_START);

  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl('merchant/coupon/apply'),
      data: {
        ...getContactPayload(),
        order_id: getOrderId(),
        code,
      },
      callback: (response) => {
        Events.TrackMetric(CouponEvents.COUPON_VALIDITY_END, {
          time: getDuration(),
        });
        if (response.status_code === 200) {
          resolve(response);
          return;
        }
        reject(response);
      },
    });
  });
}

/**
 * Calls backend and removes the applied coupon
 * @param {string} code Coupon to be removed
 * @returns {Promise}
 */
export function removeCoupon(code) {
  const getDuration = timer();
  Events.TrackMetric(CouponEvents.COUPON_REMOVE_START);

  return new Promise((resolve) => {
    fetch.post({
      url: makeAuthUrl('merchant/coupon/remove'),
      data: {
        order_id: getOrderId(),
        reference_id: code,
      },
      callback: (response) => {
        Events.TrackMetric(CouponEvents.COUPON_REMOVE_END, {
          time: getDuration(),
        });
        resolve(response);
      },
    });
  });
}
