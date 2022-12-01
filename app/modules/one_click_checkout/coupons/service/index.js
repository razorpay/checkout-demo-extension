import fetch from 'utils/fetch';
import { Events } from 'analytics';
import { timer } from 'utils/timer';
import { getOrderId } from 'razorpay/helper/order';
import { makeAuthUrl } from 'common/makeAuthUrl';
import { getContactPayload } from 'one_click_checkout/store';
import CouponEvents from 'one_click_checkout/coupons/analytics';
import { get } from 'svelte/store';
import { contact, email } from 'checkoutstore/screens/home';
import { isEmailValid } from 'one_click_checkout/order/validators';
import { getLazyOrderId } from 'one_click_checkout/order/controller';

let ORDER_ID_FOR_COUPONS;
let CONTACT_FOR_COUPONS;
let EMAIL_FOR_COUPONS;

let SHOPIFY_COUPON_PROMISE;
/**
 * method to fetch coupons for merchant from backend
 * @returns {Array} a list of coupons for the specific merchant.
 */
export async function getCoupons() {
  const orderId = await getLazyOrderId();
  const payload = getContactPayload();

  if (
    orderId !== ORDER_ID_FOR_COUPONS ||
    CONTACT_FOR_COUPONS !== payload.contact ||
    EMAIL_FOR_COUPONS !== payload.email
  ) {
    const getDuration = timer();
    Events.TrackMetric(CouponEvents.COUPONS_FETCH_START);

    ORDER_ID_FOR_COUPONS = orderId;
    CONTACT_FOR_COUPONS = payload.contact;
    EMAIL_FOR_COUPONS = payload.email;

    SHOPIFY_COUPON_PROMISE = new Promise((resolve, reject) => {
      fetch.post({
        url: makeAuthUrl('merchant/coupons'),
        data: {
          ...payload,
          order_id: orderId,
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

  return SHOPIFY_COUPON_PROMISE;
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
