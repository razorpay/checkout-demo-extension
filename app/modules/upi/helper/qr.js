import { getOffersForTab } from 'checkoutframe/offers/index';
import { makeUrl } from 'common/helper';
import {
  getOption,
  getPreferences,
  isCustomerFeeBearer,
  isPartialPayment,
} from 'razorpay';
import { getSession } from 'sessionmanager';
import { elapsed, fallBack, qrExpanded, qrUrl, timer } from 'upi/store/qr';
import { get } from 'svelte/store';

//  Analytics imports
import Analytics from 'analytics';
import { POLL_FREQUENCY } from 'upi/constants';

/**
 * @description This method checks if we can show the NewQR Flow
 * or to fall back to old implementation based on the below checks
 * from options and prefernces
 * @returns {Boolean}
 */

export function shouldShowNewQrFlow() {
  //  decides whether to show the NEW QR Flow or not
  const offers = getOffersForTab('upi') || [];
  if (
    isCustomerFeeBearer() ||
    isPartialPayment() ||
    getOption('invoice_id') ||
    getOption('account_id') ||
    getOption('timeout') ||
    offers.length ||
    (!getOption('key') && !getPreferences('merchant_key'))
  ) {
    return false;
  }
  return true;
}
/**
 *
 * @param {Function} successCallback
 * @description Method takes a callBack function as param
 * this method makes an api call to generate the QR image
 * use merchant key with btoa encryption as Basic Auth.
 * Constructs the required data object to be sent based on if order id is there or not
 * if order id is not there we send the amount or else the order id
 */
export function createQR(successCallback) {
  // if merchant key is not there in options or prefs
  let key = getOption('key') || getPreferences('merchant_key');

  let encryptedKey = btoa(`${key}:`);
  let url = makeUrl('checkout/qr_codes');
  let order_id = getOption('order_id');
  const data = {};

  if (order_id) {
    data['entity_type'] = 'order';
    data['entity_id'] = order_id;
  } else {
    data['payment_amount'] = getOption('amount');
  }

  fetch.post({
    url,
    data: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encryptedKey}`,
    },
    callback: (response) => {
      successCallback(response);
    },
  });
}

/**
 *
 * @param {String} qrId
 * @description Method checks the payment status with the associated QR code using the qrId
 * keeps calling itself until unless the elapsed a store variable becomes true or
 * until the payment is captured and we recieve a payment id in response
 * use merchant key with btoa encryption as Basic Auth.
 */
export function paymentStatus(qrId) {
  let key = getOption('key') || getPreferences('merchant_key');
  if (!key) {
    return;
  }
  let encryptedKey = btoa(`${key}:`);
  let url = makeUrl(`checkout/qr_code/${qrId}/payment`);
  let session = getSession();
  fetch({
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encryptedKey}`,
    },

    callback: (response) => {
      if ('razorpay_payment_id' in response) {
        // calling successHandler from session to complete the payment
        // once we have the payment id from response
        session.successHandler.call(session, response);
        Analytics.track('submit', {
          data: {
            flow: 'qr',
          },
        });
        return;
      }
      // Checking if timer is expired or not if timer is expired we stop polling
      if (!get(elapsed)) {
        //  calling the payment status api after every 500ms to check if payment is captured
        setTimeout(() => {
          paymentStatus(qrId);
        }, POLL_FREQUENCY);
      }
    },
  });
}
/**
 * @description Sets the timer to zero so that elapsed becomes true
 * and polling is stopped
 */
export function stopPolling() {
  timer.set(0);
}

/**
 *
 * @param {Number} timeStamp
 * @description Function basically takes in a timestamp
 * and calculates the differnce in seconds between the timestamp and current time
 * @returns {Number}
 */
export function calculateTime(timeStamp) {
  // calculating the number of mins the QR is valid
  // for based on close_by timestamp from createQR response
  let endBY = new Date(timeStamp * 1000);
  let currentTime = new Date();
  //  returning the time in seconds
  return (endBY - currentTime) / 1000;
}
/**
 * Store modifier functions
 */

export const setFallback = () => fallBack.update(() => true);
export const toggleQRTab = () => qrExpanded.update((expanded) => !expanded);
export const setQrUrl = (url) => qrUrl.set(url);
