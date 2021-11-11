// api calls
import { makeAuthUrl, getOrderId } from 'checkoutstore';
import {
  getCustomerAddressApiPayload,
  getServiceabilityPayload,
  formatAddress,
  formatResults,
} from 'one_click_checkout/address/helpersExtra';
// analytics import
import { Events } from 'analytics';
import AddressEvents from 'one_click_checkout/address/analytics';
// utils import
import { timer } from 'utils/timer';
import { getContactPayload } from 'one_click_checkout/store';
import { showLoader, loaderLabel } from 'one_click_checkout/loader/store';
import {
  UPDATE_ADDRESS_LABEL,
  CHECK_PIN_LABEL,
  FETCHING_ADDRESS_LABEL,
} from 'one_click_checkout/loader/i18n/labels';

const addressCache = {};
let serviceabilityCache = {};

/**
 *
 * @param {String} pincode
 * @returns Promise {
 *   city: String, (Bengaluru)
 *   state: String, (Karnataka)
 *   state_code: String (KA)
 * }
 **/
export function getCityState(pincode) {
  const cityStateApiTimer = timer();
  const cachedAddress = addressCache[pincode];
  Events.TrackMetric(AddressEvents.CITY_STATE_START);

  return new Promise((resolve, reject) => {
    if (!cachedAddress) {
      fetch({
        url: makeAuthUrl(`1cc/pincodes/${pincode}`),
        callback: (response) => {
          Events.TrackMetric(AddressEvents.CITY_STATE_END, {
            time: cityStateApiTimer(),
          });
          // If request was successful, save response in cache
          showLoader.set(false);
          if (response.error) {
            reject(response.error);
            return;
          }
          addressCache[pincode] = response;
          resolve(response);
        },
      });
    } else {
      showLoader.set(false);
      resolve(cachedAddress);
    }
  });
}
/**
 *
 * @param {Object} combined_address_obj an object containing shipping and billing addresses under separate keys
 * @returns Promise {
 *    address_id
 * }
 * Api call for saving address if user is logged in
 */
export function postCustomerAddress({ shipping_address, billing_address }) {
  loaderLabel.set(UPDATE_ADDRESS_LABEL);
  showLoader.set(true);
  const addressApiTimer = timer();
  Events.TrackMetric(AddressEvents.SAVE_ADDRESS_START);
  const payload = getCustomerAddressApiPayload({
    shipping_address,
    billing_address,
  });
  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl(`customers/addresses`),
      data: payload,
      callback: (response) => {
        Events.TrackMetric(AddressEvents.SAVE_ADDRESS_END, {
          time: addressApiTimer(),
        });
        if (response.error) {
          reject(response.error);
          showLoader.set(false);
          return;
        }
        showLoader.set(false);
        resolve(response);
      },
    });
  });
}
/**
 *
 * @param {String} zipcode
 * @returns Promise address with cod and serviceability info
 */
export function postServiceability(addresses, onSavedAddress = false) {
  if (onSavedAddress) {
    loaderLabel.set(FETCHING_ADDRESS_LABEL);
  } else {
    loaderLabel.set(CHECK_PIN_LABEL);
  }
  showLoader.set(true);
  const serviceabilityApiTimer = timer();
  Events.TrackMetric(AddressEvents.SERVICEABILITY_START);
  const formattedPayload = getServiceabilityPayload(
    addresses,
    serviceabilityCache
  );
  if (!formattedPayload) {
    showLoader.set(false);
    return Promise.resolve(serviceabilityCache);
  }
  const payload = { addresses: formattedPayload, order_id: getOrderId() };
  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl('merchant/shipping_info'),
      data: payload,
      callback: (response) => {
        Events.TrackMetric(AddressEvents.SERVICEABILITY_END, {
          time: serviceabilityApiTimer(),
          response,
        });
        if (response.error) {
          reject(response.error);
          showLoader.set(false);
          return;
        }
        if (Object.keys(serviceabilityCache).length > 0) {
          serviceabilityCache = {
            ...serviceabilityCache,
            ...formatResults(response.addresses),
          };
        } else {
          serviceabilityCache = formatResults(response.addresses);
        }
        showLoader.set(false);
        resolve(serviceabilityCache);
      },
    });
  });
}
/**
 *
 * @param {String} zipcode
 * @returns Third Watch cod check
 */
export function thirdWatchCodServiceability(address) {
  const serviceabilityApiTimer = timer();
  Events.TrackMetric(AddressEvents.TW_START);
  const formattedPayload = formatAddress(address);
  const payload = { address: formattedPayload };
  return new Promise((resolve) => {
    fetch.post({
      url: makeAuthUrl('tw/address/check_cod_eligibility'),
      data: payload,
      callback: (response) => {
        Events.TrackMetric(AddressEvents.TW_END, {
          time: serviceabilityApiTimer(),
          response,
        });
        resolve(response);
      },
    });
  });
}

export function updateOrder(shipping_address, billing_address) {
  loaderLabel.set('');
  showLoader.set(true);
  const orderId = getOrderId();
  // TODO: Add analytics
  return new Promise((resolve, reject) => {
    fetch.patch({
      url: makeAuthUrl(`orders/1cc/${orderId}/customer`),
      data: {
        customer_details: {
          ...getContactPayload(),
          shipping_address: formatAddress(shipping_address),
          billing_address: formatAddress(billing_address, 'billing_address'),
        },
      },
      callback: (response) => {
        if (response.error) {
          reject(response.error);
          showLoader.set(false);
          return;
        }
        showLoader.set(false);
        resolve(response);
      },
    });
  });
}
