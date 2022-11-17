import fetch from 'utils/fetch';
import { Events } from 'analytics';
import { timer } from 'utils/timer';
import { getOrderId } from 'razorpay';
import { makeAuthUrl } from 'common/makeAuthUrl';
import { getContactPayload } from 'one_click_checkout/store';
import CouponEvents from 'one_click_checkout/coupons/analytics';
import { getCache, setCache } from 'one_click_checkout/coupons/service/cache';
import { get } from 'svelte/store';
import { contact, email } from 'checkoutstore/screens/home';
import { isEmailValid } from 'one_click_checkout/order/validators';

let inProgress = false;
let pendingPromise = null;
/**
 * method to fetch coupons for merchant from backend
 * @returns {Array} a list of coupons for the specific merchant.
 */
export function getCoupons() {
  // return pending promise to avoid hitting rate limiting
  if (inProgress) {
    return pendingPromise;
  }

  const getDuration = timer();
  Events.TrackMetric(CouponEvents.COUPONS_FETCH_START);

  pendingPromise = new Promise((resolve, reject) => {
    const payload = getContactPayload();

    const key = payload.contact || 'default';
    const cachedValue = getCache(key);

    if (cachedValue) {
      resolve(cachedValue);
      return;
    }

    inProgress = true;
    fetch.post({
      url: makeAuthUrl('merchant/coupons'),
      data: {
        ...payload,
        order_id: getOrderId(),
      },
      callback: (response) => {
        inProgress = false;
        Events.TrackMetric(CouponEvents.COUPONS_FETCH_END, {
          time: getDuration(),
        });
        if (Array.isArray(response.promotions)) {
          setCache(key, response.promotions);
          resolve(response.promotions);
        } else {
          reject(response);
        }
      },
    });
  });
  return pendingPromise;
}

/**
 * Method to validate coupon entered by user against backend.
 * @param {string} code coupon code entered by the user
 */
export function validateCoupon(code, source) {
  const getDuration = timer();
  Events.TrackMetric(CouponEvents.COUPON_VALIDITY_START, {
    input_source: source,
  });

  const payload = {};

  if (get(email) && isEmailValid(get(email))) {
    payload['email'] = get(email);
  }
  if (get(contact)) {
    payload['contact'] = get(contact);
  }

  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl('merchant/coupon/apply'),
      data: {
        ...payload,
        order_id: getOrderId(),
        code,
      },
      callback: (response) => {
        Events.TrackMetric(CouponEvents.COUPON_VALIDITY_END, {
          time: getDuration(),
          code,
          validation_status: response.status_code === 200,
          input_source: source,
          reason: response.failure_code,
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
