import { views } from 'one_click_checkout/routing/constants';
import {
  ADDRESS_TYPES,
  views as addressViews,
} from 'one_click_checkout/address/constants';
import { SHIPPING_ADDRESS_LABEL } from 'one_click_checkout/address/i18n/labels';
import { BILLING_ADDRESS_LABEL } from 'one_click_checkout/address/billing_address/i18n/labels';

import {
  newUserAddress as newShippingAddress,
  selectedAddressId as selectedShippingAddress,
  addressCompleted as shippingAddressCompleted,
  shouldSaveAddress as shouldSaveShippingAddress,
} from 'one_click_checkout/address/shipping_address/store';
import {
  newUserAddress as newBillingAddress,
  selectedAddressId as selectedBillingAddress,
  addressCompleted as billingAddressCompleted,
  shouldSaveAddress as shouldSaveBillingAddress,
} from 'one_click_checkout/address/billing_address/store';

/**
 * What is this file about?
 *
 * AddressTab requires a few variables like the label to be displayed at the top.
 * Store to update on selecting/entering address. These variables are dependent on the type of screen user is in
 * It can either be shipping or billing address.
 *
 *
 * This file defines the variables to be used depending to the type of address that is being saved/displayed
 */
export default {
  [ADDRESS_TYPES.SHIPPING_ADDRESS]: {
    title: SHIPPING_ADDRESS_LABEL,
    store: {
      newUserAddress: newShippingAddress,
      selectedAddressId: selectedShippingAddress,
      addressCompleted: shippingAddressCompleted,
      shouldSaveAddress: shouldSaveShippingAddress,
    },
    type: ADDRESS_TYPES.SHIPPING_ADDRESS,
    formId: 'addressForm',
    checkServiceability: true,
    routes: {
      [addressViews.ADD_ADDRESS]: views.ADD_ADDRESS,
      [addressViews.SAVED_ADDRESSES]: views.SAVED_ADDRESSES,
    },
    classes: {
      'billing-address-wrapper': false,
    },
  },
  [ADDRESS_TYPES.BILLING_ADDRESS]: {
    title: BILLING_ADDRESS_LABEL,
    store: {
      newUserAddress: newBillingAddress,
      selectedAddressId: selectedBillingAddress,
      addressCompleted: billingAddressCompleted,
      shouldSaveAddress: shouldSaveBillingAddress,
    },
    type: ADDRESS_TYPES.BILLING_ADDRESS,
    formId: 'addressForm',
    checkServiceability: false,
    routes: {
      [addressViews.ADD_ADDRESS]: views.ADD_BILLING_ADDRESS,
      [addressViews.SAVED_ADDRESSES]: views.SAVED_BILLING_ADDRESS,
    },
    classes: {
      'billing-address-wrapper': true,
    },
  },
};
