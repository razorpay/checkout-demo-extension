const address = {
  ADDRESS_SCREEN: 'checkoutAddressScreenLoaded',
  SAVED_ADDRESS_SCREEN: 'checkoutSavedAddressListViewLoaded',
  ADD_ADDRESS_VIEW: 'checkoutAddNewAddressViewLoaded',
  ADDRESS_INPUT: 'address:input',
  SAVED_ADDRESS_SELECTED: 'checkoutSavedAddressOptionSelected',
  ADDRESS_SUBMIT_CLICKED: 'checkoutAddressSubmitted',
  ACCESS_SAVED_ADDRESS_CLICKED: 'checkoutAccessSavedAddressCTAClicked',
  SAVE_ADDRESS_CHECKED: 'checkoutSaveNewAddressOptionChecked',
  SAVE_ADDRESS_UNCHECKED: 'checkoutSaveNewAddressOptionUnchecked',
  ADD_ADDRESS_CTA_ENABLED: 'checkoutNewAddressSubmitCTAEnabled',
  ADD_NEW_ADDRESS_CLICKED: 'checkoutAddNewAddressCTAClicked',
  CITY_STATE_START: 'checkoutPincodeAPICallInitiated',
  CITY_STATE_END: 'checkoutPincodeAPICallCompleted',
  SERVICEABILITY_START: 'checkoutShippingInfoAPICallInitiated',
  SERVICEABILITY_END: 'checkoutShippingInfoAPICallCompleted',
  SAVE_ADDRESS_START: 'save_address:start',
  SAVE_ADDRESS_END: 'save_address:end',
  TW_START: 'checkoutThridwartchAPICallInitiated',
  TW_END: 'checkoutThridwartchAPICallCompleted',
  INPUT_ENTERED_name: 'checkoutAddressNameEntered',
  INPUT_ENTERED_contact: 'checkoutShippingNumberEntered',
  INPUT_ENTERED_zipcode: 'checkoutAddressPincodeEntered',
  INPUT_ENTERED_line1: 'checkoutAddressLine1Entered',
  INPUT_ENTERED_line2: 'checkoutAddressLine2Entered',
  INPUT_ENTERED_landmark: 'checkoutAddressLandmarkEntered',
  BILLING_SAME_AS_SHIPPING_CHECKED:
    'checkoutShippingAndBillingAddressSameOptionChecked',
  BILLING_SAME_AS_SHIPPING_UNCHECKED:
    'checkoutShippingAndBillingAddressSameOptionUnchecked',
};

export default address;
