import { contact, email } from 'checkoutstore/screens/home';
import { get as storeGetter } from 'svelte/store';
import { selectedCountryISO as selectedShippingCountryISO } from 'one_click_checkout/address/shipping_address/store';
import { selectedCountryISO as selectedBillingCountryISO } from 'one_click_checkout/address/billing_address/store';
import { getDeviceId } from 'fingerprint';
/**
 *
 * @param {Object} address Address object which is to be formatted
 * @param {string} type Address type (shipping_address/billing_address)
 * @returns Object
 * format the added address to send it to the api
 */
export const formatAddress = (
  {
    name,
    line1,
    line2,
    landmark,
    zipcode,
    city,
    state,
    tag,
    contact = '',
    country,
  },
  type = 'shipping_address'
) => {
  const countryName =
    country ||
    (type === 'shipping_address'
      ? storeGetter(selectedShippingCountryISO)
      : storeGetter(selectedBillingCountryISO));

  let contactNumber;
  if (contact && typeof contact === 'object') {
    const { countryCode, phoneNum } = contact;
    contactNumber = `${countryCode}${phoneNum}`;
  } else {
    contactNumber = contact;
  }

  return {
    name,
    type,
    line1,
    line2,
    zipcode: zipcode || countryName,
    city,
    state,
    tag,
    landmark,
    country: countryName,
    contact: contactNumber,
  };
};

/**
 *
 * @param {Object} combined_address_obj an object containing shipping and billing addresses under separate keys
 * @returns Object
 * Format the address and create Payload for saving the address
 */
export const getCustomerAddressApiPayload = ({
  shipping_address,
  billing_address,
}) => {
  const storedContact = storeGetter(contact);
  const storedEmail = storeGetter(email);
  const payload = {
    contact: storedContact,
    email: storedEmail,
  };

  if (shipping_address) {
    payload['shipping_address'] = { ...formatAddress(shipping_address) };
  }

  if (billing_address) {
    payload['billing_address'] = {
      ...formatAddress(billing_address, 'billing_address'),
    };
  }

  return payload;
};

/**
 *
 * @param {Array<Addresses>} addresses
 * @param {Object} cache
 * @returns Array if there is any zipcode which is not cached, else false
 */
export const getServiceabilityPayload = (addresses, cache = {}) => {
  let zipcodesProcessed = {};
  let addPayload = addresses.reduce((acc, { zipcode, country }) => {
    if (!cache[zipcode] && !zipcodesProcessed[zipcode]) {
      zipcodesProcessed[zipcode] = true;
      return acc.concat({
        zipcode,
        country,
      });
    }
    return acc;
  }, []);
  if (addPayload.length === 0) {
    return false;
  }
  return addPayload;
};

/**
 *
 * @param {Array<Address>} addresses List of addresses that needs to be formatted
 * @returns Object
 */
export const formatResults = (addresses = []) => {
  return addresses.reduce(
    (
      acc,
      {
        zipcode,
        serviceable,
        cod,
        shipping_fee,
        cod_fee,
        city,
        state,
        state_code,
      }
    ) => {
      acc[zipcode] = {
        serviceability: serviceable,
        cod,
        shipping_fee,
        cod_fee,
        city,
        state,
        state_code,
      };
      return acc;
    },
    {}
  );
};

/**
 *
 * @returns payload object containing the device ID in the desired format
 */
export const getDevicePayload = () => {
  const deviceId = getDeviceId();
  return deviceId ? { id: deviceId } : null;
};
