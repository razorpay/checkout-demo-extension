// interactions with session
import { savedAddresses } from 'one_click_checkout/address/store';
import { showSavedAddressCta } from 'one_click_checkout/address/shipping_address/store';
import { formatApiAddress } from 'one_click_checkout/address/helpersExtra';
import { getSession } from 'sessionmanager';

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
  return (addresses = addresses
    .map((item) => {
      return { ...formatApiAddress(item, type), id: item.id };
    })
    .reverse());
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
