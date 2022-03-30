// api calls
import { makeAuthUrl } from 'checkoutstore';
import { getOrderId } from 'razorpay';
import { makeUrl } from 'common/helper';
import {
  getCustomerAddressApiPayload,
  getServiceabilityPayload,
  formatAddress,
  formatResults,
  getDevicePayload,
  hydrateSamePincodeAddresses,
} from 'one_click_checkout/address/helpersExtra';
// analytics import
import { Events } from 'analytics';
import AddressEvents from 'one_click_checkout/address/analytics';
// utils import
import { timer } from 'utils/timer';
import { getContactPayload } from 'one_click_checkout/store';
import {
  UPDATE_ADDRESS_LABEL,
  CHECK_PIN_LABEL,
} from 'one_click_checkout/loader/i18n/labels';
import { didSaveAddress } from 'one_click_checkout/address/store';
import {
  showLoaderView,
  hideLoaderView,
} from 'one_click_checkout/loader/helper';

const addressCache = {};
let serviceabilityCache = {};
let availableStateList = {};

/**
 *
 * @param {String} pincode
 * @returns Promise {
 *   city: String, (Bengaluru)
 *   state: String, (Karnataka)
 *   state_code: String (KA)
 * }
 **/
export function getCityState(pincode, country) {
  const cityStateApiTimer = timer();
  const cachedAddress = addressCache[pincode];
  showLoaderView();
  Events.TrackMetric(AddressEvents.CITY_STATE_START);

  return new Promise((resolve, reject) => {
    if (!cachedAddress) {
      fetch({
        url: makeAuthUrl(`locations/country/${country}/pincode/${pincode}`),
        callback: (response) => {
          Events.TrackMetric(AddressEvents.CITY_STATE_END, {
            time: cityStateApiTimer(),
          });
          // If request was successful, save response in cache
          hideLoaderView();
          if (response.error) {
            reject(response.error);
            return;
          }
          addressCache[pincode] = response;
          resolve(response);
        },
      });
    } else {
      hideLoaderView();
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
 * Api call for updating address
 */
export function putCustomerAddress({ shipping_address, billing_address }) {
  showLoaderView(UPDATE_ADDRESS_LABEL);
  const addressApiTimer = timer();
  Events.TrackMetric(AddressEvents.SAVE_ADDRESS_START);
  const payload = getCustomerAddressApiPayload(
    {
      shipping_address,
      billing_address,
    },
    true
  );
  return new Promise((resolve, reject) => {
    fetch.put({
      url: makeAuthUrl(`customers/addresses`),
      data: payload,
      callback: (response) => {
        Events.TrackMetric(AddressEvents.SAVE_ADDRESS_END, {
          time: addressApiTimer(),
          addressSaved: response.status_code === 200,
          failure_reason: response?.error?.description,
          address_id: response?.shipping_address?.id,
        });
        if (response.error) {
          reject(response.error);
          hideLoaderView();
          return;
        }
        didSaveAddress.set(true);
        hideLoaderView();
        resolve(response);
      },
    });
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
  showLoaderView(UPDATE_ADDRESS_LABEL);
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
          addressSaved: response.status_code === 200,
          failure_reason: response?.error?.description,
          address_id: response?.shipping_address?.id,
        });
        if (response.error) {
          reject(response.error);
          hideLoaderView();
          return;
        }
        didSaveAddress.set(true);
        hideLoaderView();
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
export function postServiceability(
  addresses,
  onSavedAddress,
  withLoader = true
) {
  if (withLoader) {
    showLoaderView(CHECK_PIN_LABEL);
  }
  Events.TrackMetric(AddressEvents.SERVICEABILITY_START, {
    is_saved_address: onSavedAddress,
  });

  const order_id = getOrderId();

  const serviceabilityApiTimer = timer();
  const formattedPayload = getServiceabilityPayload(
    addresses,
    serviceabilityCache[order_id]
  );
  if (!formattedPayload) {
    hideLoaderView();
    return Promise.resolve(serviceabilityCache[order_id]);
  }
  const payload = { addresses: formattedPayload, order_id };
  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeAuthUrl('merchant/shipping_info'),
      data: payload,
      callback: (response) => {
        Events.TrackMetric(AddressEvents.SERVICEABILITY_END, {
          time: serviceabilityApiTimer(),
          response,
          is_saved_address: onSavedAddress,
        });
        if (response.error) {
          reject({ err: response.error, payload });
          hideLoaderView();
          return;
        }
        if (
          serviceabilityCache &&
          serviceabilityCache[order_id] &&
          Object.keys(serviceabilityCache[order_id]).length > 0
        ) {
          serviceabilityCache[order_id] = {
            ...serviceabilityCache[order_id],
            ...formatResults(response.addresses),
          };
        } else {
          serviceabilityCache[order_id] = formatResults(response.addresses);
        }
        hideLoaderView();
        resolve(serviceabilityCache[order_id]);
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
  const orderId = getOrderId();
  const formattedPayload = formatAddress(address);
  const payload = {
    address: { ...formattedPayload, id: address.id ?? null },
    order_id: orderId,
    device: getDevicePayload(),
  };
  return new Promise((resolve, reject) => {
    fetch.post({
      url: makeUrl('1cc/check_cod_eligibility'),
      data: payload,
      callback: (response) => {
        Events.TrackMetric(AddressEvents.TW_END, {
          time: serviceabilityApiTimer(),
          response,
        });
        if (response.error) {
          reject(response.error);
          return;
        }
        resolve(response);
      },
    });
  });
}

export function updateOrder(shipping_address, billing_address) {
  showLoaderView();
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
          device: getDevicePayload(),
        },
      },
      callback: (response) => {
        if (response.error) {
          reject(response.error);
          hideLoaderView();
          return;
        }
        hideLoaderView();
        resolve(response);
      },
    });
  });
}

export function fetchAutocompleteSuggestions(query, zipcode, country) {
  Events.Track(AddressEvents.SUGGESTIONS_API_START, {
    query,
    country,
    zipcode,
  });
  return new Promise((resolve, reject) => {
    fetch({
      url: makeAuthUrl(
        `locations/autosuggest?input=${query}&zipcode=${zipcode}&country=${country}`
      ),
      callback: (response) => {
        Events.Track(AddressEvents.SUGGESTIONS_API_END, {
          success: !response.error,
          result_count: response.predictions?.length || 0,
        });
        if (response.error) {
          reject(response.error);
          return;
        }
        resolve(response);
      },
    });
  });
}

export function getStatesList(country) {
  Events.Track(AddressEvents.STATES_API_START, { country });
  if (availableStateList[country]) {
    Events.Track(AddressEvents.STATES_API_END, {
      result_count: availableStateList[country]?.length || 0,
    });
    return Promise.resolve(availableStateList[country]);
  }
  return new Promise((resolve, reject) => {
    fetch({
      url: makeAuthUrl(`locations/countries/${country}/states`),
      callback: (response) => {
        Events.Track(AddressEvents.STATES_API_END, {
          success: !response.error,
          result_count: response.length || 0,
        });
        if (response.error) {
          reject(response.error);
          return;
        }
        if (availableStateList && !availableStateList[country]) {
          availableStateList[country] = response;
        }
        resolve(response);
      },
    });
  });
}

/**
 *
 * @param {Array<Addresses>} addresses
 * @param {boolean} onSavedAddress
 * @returns Promise which returns array of addresses with serviceability data
 *
 **/
export function getServiceabilityOfAddresses(addresses, onSavedAddress) {
  // unique pincode hash
  const zipecodeHash = {};
  addresses.forEach(({ zipcode, country }) => {
    if (!zipecodeHash[zipcode]) {
      zipecodeHash[zipcode] = {
        zipcode,
        country,
      };
    }
  });

  const order_id = getOrderId();

  return Promise.allSettled(
    Object.values(zipecodeHash).map((address) =>
      postServiceability([address], onSavedAddress, false)
    )
  ).then((res) => {
    // done to ensure if any 1 pincode api fails, it doesn't mark unserviceable for all
    const rejectedResponse = res
      .filter(({ status }) => status === 'rejected')
      .map(({ reason }) => ({
        ...reason.payload.addresses[0],
        serviceable: false,
      }));

    const unserviceablePincodes = formatResults(rejectedResponse);

    return hydrateSamePincodeAddresses(addresses, {
      ...serviceabilityCache[order_id],
      ...unserviceablePincodes,
    });
  });
}
