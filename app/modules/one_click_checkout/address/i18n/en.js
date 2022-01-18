import billingAddressLabels from 'one_click_checkout/address/billing_address/i18n/en';

// Texts and labels
export default {
  name_label: 'Name',
  pincode_label: 'Pincode',
  city_label: 'City',
  state_label: 'State',
  international_pincode_label: 'Pincode/Zipcode',
  international_state_label: 'State/Province',
  country_label: 'Country',
  house_label: 'House Number/House Name/Apartment/Floor',
  area_label: 'Area/Colony/Street/Sector',
  landmark_label: 'Landmark',
  shipping_address_label: 'Shipping Address',
  save_label: 'Save As',
  cta_label: 'Continue',
  save_consent_label:
    "I agree to save my address for future use according to Razorpay's",
  save_consent_label_tnc: 'T&C',
  save_consent_label_privacy: 'Privacy Policy',
  save_consent_label_and: 'and',
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
  landmark_error_label: 'Enter characters between 2 to 32 only.',
  unserviceable_label: 'Unserviceable',
  serviceable_label: 'Serviceable',
  order_update_failure: 'We could not proceed due to some technical error.',
  state_search_all: 'All states',
  state_search_placeholder: 'Search a state',
  custom_tag_label: 'Save As',
  custom_tag_cta_label: 'CANCEL',
  required_label: 'Required',
  zipcode_error_label: 'Invalid zipcode entered.',
  generic_pattern_error_label: 'Inalid input entered.',
  indian_contact_error_label: 'Enter a 10-digit number only.',
  contact_error_label: 'Enter a valid mobile number.',
  pincode_error_message: 'Enter a 6-digit pincode only.',
  ...billingAddressLabels,
};
