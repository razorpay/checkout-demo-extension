// svelte imports
import { get } from 'svelte/store';

// store imports
import { savedAddresses } from 'one_click_checkout/address/store';
import {
  showSavedAddressCta,
  selectedAddress as selectedShippingAddress,
  selectedAddressId as selectedShippingAddressId,
  checkServiceabilityStatus,
  selectedShippingOption,
} from 'one_click_checkout/address/shipping_address/store';
import {
  shippingCharge,
  codChargeAmount,
  isShippingAddedToAmount,
} from 'one_click_checkout/charges/store';

// utils imports
import { formatApiAddress } from 'one_click_checkout/address/helpersExtra';
import { getThemeMeta } from 'checkoutstore/theme';

// analytics import
import Analytics, { Events } from 'analytics';
import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
import AddressEvents from 'one_click_checkout/address/analytics';
import {
  ACTIONS,
  CATEGORIES,
} from 'one_click_checkout/merchant-analytics/constant';
import OneClickCheckoutMetaProperties from 'one_click_checkout/analytics/metaProperties';

// constant imports
import {
  ADDRESS_LONG_TYPES,
  SERVICEABILITY_STATUS,
} from 'one_click_checkout/address/constants';

// service imports
import {
  getServiceabilityCache,
  getServiceabilityOfAddresses,
} from 'one_click_checkout/address/service';

/**
 *
 * @param {array} addresses
 * Being used in session
 * Taking addresses array received from api and saving it in store
 */
export const setSavedAddresses = (addresses) => {
  checkServiceabilityStatus.set(SERVICEABILITY_STATUS.UNCHECKED);
  savedAddresses.set(formatAddresses(addresses));
};

export const setDefaultSelectedAddress = () => {
  selectedShippingAddressId.set(get(savedAddresses)[0]?.id);
};

function formatAddresses(addresses) {
  if (!addresses) {
    return [];
  }
  return (addresses = addresses.map((item) => {
    return { ...formatApiAddress(item, item.type), id: item.id };
  }));
}

/**
 * @returns Object
 * Returns session theme
 */
export const getTheme = () => {
  const themeMeta = getThemeMeta();
  return themeMeta;
};

export { showSavedAddressCta };

/**
 *
 * @param {string} id
 * @param {number} index
 * handle actions post selection of an address
 *
 */
export function postAddressSelection(id = null, index = null) {
  const selectedAddress = get(selectedShippingAddress);
  const { shipping_fee, cod_fee, zipcode, serviceability, shipping_methods } =
    selectedAddress;
  let shippingAmount = serviceability ? shipping_fee : 0;
  let codAmount = cod_fee ?? 0;
  if (!shipping_methods || !Object.keys(shipping_methods)?.length) {
    selectedShippingOption.set(null);
    Analytics.setMeta(OneClickCheckoutMetaProperties.COUNT_SHIPPING_OPTIONS, 0);
  } else if (shipping_methods?.length > 1) {
    shippingAmount = 0;
    codAmount = 0;
    Analytics.setMeta(
      OneClickCheckoutMetaProperties.COUNT_SHIPPING_OPTIONS,
      shipping_methods.length
    );
  } else if (shipping_methods?.length === 1) {
    selectedShippingOption.set(shipping_methods[0]);
    shippingAmount = shipping_methods[0].shipping_fee;
    codAmount = shipping_methods[0].cod_fee;
    Analytics.setMeta(OneClickCheckoutMetaProperties.COUNT_SHIPPING_OPTIONS, 1);
  }
  shippingCharge.set(shippingAmount || 0);
  codChargeAmount.set(codAmount);
  isShippingAddedToAmount.set(!!serviceability);
  if (id) {
    Events.TrackBehav(AddressEvents.SAVED_ADDRESS_SELECTED, {
      id,
      index,
      serviceable: serviceability,
    });
    merchantAnalytics({
      event: ACTIONS.SELECT_ADDRESS,
      category: CATEGORIES.ADDRESS,
      params: { zipcode },
    });
  }
}

/**
 *
 * @param {onSavedAddress} onSavedAddress: if call is made from saved_addresses screen
 * loads addresses with serviceability data
 *
 */
export function loadAddressesWithServiceability(onSavedAddress, predicate) {
  checkServiceabilityStatus.set(SERVICEABILITY_STATUS.LOADING);
  const addresses = get(savedAddresses);
  return new Promise((resolve, reject) => {
    getServiceabilityOfAddresses(addresses, onSavedAddress)
      .then((_addresses) => {
        resolve();
        savedAddresses.set(_addresses);
        let latestAddress = _addresses[0];
        if (predicate && !predicate()) {
          return;
        }
        selectedShippingAddressId.set(latestAddress.id);
        postAddressSelection();
      })
      .catch(() => {
        reject();
        if (predicate && !predicate()) {
          return;
        }
        selectedShippingAddressId.set(addresses[0].id);
        postAddressSelection();
      })
      .finally(() => {
        checkServiceabilityStatus.set(SERVICEABILITY_STATUS.CHECKED);
      });
  });
}

/**
 *
 * @param {_addresses} _addresses: array of addresses to be updated in store ( savedAddresses )
 * updates savedAddresses in store by
 *  - adding address entity from post response
 *  - updating existing address entity from put response
 *
 */
export const updateAddressesInStore = (_addresses) => {
  const _savedAddresses = get(savedAddresses);

  _addresses.forEach((addr) => {
    if (!Object.values(ADDRESS_LONG_TYPES).includes(addr.type)) {
      return;
    }

    const addressIndex = _savedAddresses.findIndex(
      (savedAddr) => savedAddr.id === addr.id
    );
    const updatedAddress = {
      ...getServiceabilityCache(addr.zipcode),
      ...formatApiAddress(addr, addr.type),
      id: addr.id,
    };

    if (addressIndex === -1) {
      _savedAddresses.unshift(updatedAddress);
    } else {
      _savedAddresses[addressIndex] = updatedAddress;
    }
  });

  checkServiceabilityStatus.set(SERVICEABILITY_STATUS.UNCHECKED);
  savedAddresses.set([..._savedAddresses]);
};
