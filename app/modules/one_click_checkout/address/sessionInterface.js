// interactions with session

import {
  savedAddresses as savedShippingAddresses,
  forcedView,
  showSavedAddressCta,
} from 'one_click_checkout/address/store';
import { formatAddress } from 'one_click_checkout/address/helpersExtra';
import { savedAddresses as savedBillingAddresses } from 'one_click_checkout/address/billing_address/store';
import { getSession } from 'sessionmanager';
import { views } from 'one_click_checkout/address/constants';
import { screensHistory } from 'one_click_checkout/routing/History';
/**
 *
 * @param {array} addresses
 * Being used in session
 * Taking addresses array received from api and saving it in store
 */
export const setSavedAddresses = (addresses) => {
  // TODO: Address formatting
  forcedView.set(views.SAVED_ADDRESSES);
  const shippingAddresses = addresses;
  const billingAddresses = addresses;
  savedShippingAddresses.set(
    formatAddresses(shippingAddresses, 'shipping_address')
  );
  savedBillingAddresses.set(
    formatAddresses(billingAddresses, 'billing_address')
  );
};

function formatAddresses(addresses, type) {
  if (!addresses) return [];
  return (addresses = addresses.map((item) => {
    return { ...formatAddress(item, type), id: item.id };
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
