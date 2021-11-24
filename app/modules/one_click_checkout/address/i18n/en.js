import billingAddressLabels from 'one_click_checkout/address/billing_address/i18n/en';

// Texts and labels
export default {
  name_label: 'Name',
  pincode_label: 'Pincode',
  city_label: 'City',
  state_label: 'State',
  country_label: 'Country',
  house_label: 'House Number/House Name/Apartment/Floor',
  area_label: 'Area/Colony/Street/Sector',
  landmark_label: 'Landmark',
  shipping_address_label: 'Shipping Address',
  save_label: 'Save As',
  cta_label: 'Continue',
  save_consent_label: 'Save this address for next time',
  input_error_label: 'Please enter your {field}',
  house_error_label: 'Enter a minimum of 10 characters',
  area_error_label: 'Enter a minimum of 5 characters',
  add_address_label: 'Add New Address',
  non_serviceable_label: 'This order cannot be delivered to this location.',
  saved_address_cta_label: 'Use saved addresses',
  shipping_charges_label: '{charge} shipping charge added',
  same_address_checkbox_label: 'Billing address same as shipping address',
  saved_address_label: 'Your address has been saved',
  error_label: 'Address should be less than 255 characters',
  landmark_error_label: 'Landmark entered should be between 2-32 characters',
  unserviceable_label: 'Unserviceable',
  serviceable_label: 'Serviceable',
  order_update_failure:
    'We could not proceed due to some technical error. Please retry.',
  ...billingAddressLabels,
};
