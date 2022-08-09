// svelte imports
import { get } from 'svelte/store';

// store imports
import { savedAddresses } from 'one_click_checkout/address/store';
import {
  showSavedAddressCta,
  selectedAddress as selectedShippingAddress,
  selectedAddressId as selectedShippingAddressId,
  checkServiceabilityStatus,
} from 'one_click_checkout/address/shipping_address/store';
import {
  shippingCharge,
  codChargeAmount,
  isShippingAddedToAmount,
} from 'one_click_checkout/charges/store';

// utils imports
import {
  formatApiAddress,
  getLatestServiceableAddress,
} from 'one_click_checkout/address/helpersExtra';
import { getThemeMeta } from 'checkoutstore/theme';

// analytics import
import { Events } from 'analytics';
import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
import AddressEvents from 'one_click_checkout/address/analytics';
import {
  ACTIONS,
  CATEGORIES,
} from 'one_click_checkout/merchant-analytics/constant';

// constant imports
import {
  ADDRESS_LONG_TYPES,
  SERVICEABILITY_STATUS,
} from 'one_click_checkout/address/constants';

// service imports
import { getServiceabilityOfAddresses } from 'one_click_checkout/address/service';

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
export function postAddressSelection(id, index) {
  const selectedAddress = get(selectedShippingAddress);
  const { shipping_fee, cod_fee, zipcode, serviceability } = selectedAddress;
  const shippingAmount = serviceability ? shipping_fee : 0;
  shippingCharge.set(shippingAmount || 0);
  codChargeAmount.set(cod_fee);
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
export function loadAddressesWithServiceability(onSavedAddress) {
  checkServiceabilityStatus.set(SERVICEABILITY_STATUS.LOADING);
  const addresses = get(savedAddresses);
  return new Promise((resolve, reject) => {
    getServiceabilityOfAddresses(addresses, onSavedAddress)
      .then((_addresses) => {
        resolve();
        savedAddresses.set(_addresses);

        let latestAddress;
        if (onSavedAddress) {
          // to set first address as selected even if unserviceable
          latestAddress = _addresses[0];
        } else {
          // to set last updated serviceable address as selected
          latestAddress =
            getLatestServiceableAddress(_addresses) || _addresses[0];
        }
        selectedShippingAddressId.set(latestAddress.id);
        postAddressSelection();
      })
      .catch(() => {
        reject();
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
