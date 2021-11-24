// interactions with session

import { savedAddresses } from 'one_click_checkout/address/store';
import { showSavedAddressCta } from 'one_click_checkout/address/shipping_address/store';
import { formatAddress } from 'one_click_checkout/address/helpersExtra';
import { getSession } from 'sessionmanager';
import { screensHistory } from 'one_click_checkout/routing/History';
/**
 *
 * @param {array} addresses
 * Being used in session
 * Taking addresses array received from api and saving it in store
 */
export const setSavedAddresses = (addresses) => {
  savedAddresses.set(formatAddresses(addresses));
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
