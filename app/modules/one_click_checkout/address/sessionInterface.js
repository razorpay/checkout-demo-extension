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
import { getSession } from 'sessionmanager';

// analytics import
import { Events } from 'analytics';
import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
import AddressEvents from 'one_click_checkout/address/analytics';
import {
  ACTIONS,
  CATEGORIES,
} from 'one_click_checkout/merchant-analytics/constant';

// constant imports
import { SERVICEABILITY_STATUS } from 'one_click_checkout/address/constants';

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
  if (!addresses) return [];
  return (addresses = addresses.map((item) => {
    return { ...formatApiAddress(item, item.type), id: item.id };
  }));
}

/**
 * @returns Object
 * Returns session theme
 */
export const getTheme = () => {
  const session = getSession();
  return session.themeMeta;
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
  shippingCharge.set(shipping_fee || 0);
  codChargeAmount.set(cod_fee);
  isShippingAddedToAmount.set(true);
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
  getServiceabilityOfAddresses(addresses, onSavedAddress)
    .then((_addresses) => {
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
      selectedShippingAddressId.set(addresses[0].id);
      postAddressSelection();
    })
    .finally(() => {
      checkServiceabilityStatus.set(SERVICEABILITY_STATUS.CHECKED);
    });
}
