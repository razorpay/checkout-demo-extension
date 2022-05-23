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
  INPUT_ENTERED_country: 'checkoutAddressCountrySelected',
  INPUT_ENTERED_zipcode: 'checkoutAddressPincodeEntered',
  INPUT_ENTERED_line1: 'checkoutAddressLine1Entered',
  INPUT_ENTERED_line2: 'checkoutAddressLine2Entered',
  INPUT_ENTERED_landmark: 'checkoutAddressLandmarkEntered',
  BILLING_SAME_AS_SHIPPING_CHECKED:
    'checkoutShippingAndBillingAddressSameOptionChecked',
  BILLING_SAME_AS_SHIPPING_UNCHECKED:
    'checkoutShippingAndBillingAddressSameOptionUnchecked',
  SUGGESTIONS_API_START: 'checkoutSuggestionsAPIInitiated',
  SUGGESTIONS_API_END: 'checkoutSuggestionsAPICompleted',
  OTHER_TAG_SELECTED: 'checkoutAddressTagOtherSelected',
  CUSTOM_TAG_INPUT: 'checkoutCustomAddressTagInput',
  ADDRESS_VALIDATION_ERROR: 'AddressValidationError',
  SUGGESTION_SELECTED: 'checkoutSuggestionSelected',
  SUGGESTION_CLEARED: 'checkoutSuggestionCleared',
  STATES_API_START: 'checkoutStatesAPIInitiated',
  STATES_API_END: 'checkoutStatesAPICompleted',
  PINCODE_MISSING_CITY: 'checkoutPincodeMissingCity',
  PINCODE_MISSING_STATE: 'checkoutPincodeMissingState',
  // New Events
  NEW_ADDRESS_SCREEN_LOADED_V2: '1cc_add_new_address_screen_loaded_completed',
  INPUT_ENTERED_name_V2: '1cc_add_new_address_name_entered',
  INPUT_ENTERED_contact_V2: '1cc_add_new_address_contact_entered',
  INPUT_ENTERED_country_V2: '1cc_add_new_address_country_entered',
  INPUT_ENTERED_zipcode_V2: '1cc_add_new_address_pincode_entered',
  INPUT_ENTERED_line1_V2: '1cc_add_new_address_line1_entered',
  INPUT_ENTERED_line2_V2: '1cc_add_new_address_line2_entered',
  INPUT_ENTERED_landmark_V2: '1cc_add_new_address_landmark_entered',
  SUGGESTIONS_API_START_V2: '1cc_checkout_suggestions_api_initiated',
  SUGGESTIONS_API_END_V2: '1cc_checkout_suggestions_api_completed',
  SUGGESTION_SELECTED_V2: '1cc_checkout_suggestions_selected',
  SUGGESTION_CLEARED_V2: '1cc_checkout_suggestions_cleared',
  INPUT_ENTERED_city_V2: '1cc_add_new_address_city_entered',
  INPUT_ENTERED_state_V2: '1cc_add_new_address_state_entered',
  SAVE_ADDRESS_START_V2: '1cc_add_new_address_save_api_initiated',
  SAVE_ADDRESS_END_V2: '1cc_add_new_address_save_api_completed',
  ADDRESS_SUBMIT_CLICKED_V2: '1cc_add_new_address_screen_continue_CTA_clicked',
  CITY_STATE_START_V2: '1cc_add_new_address_pincode_api_initiated',
  CITY_STATE_END_V2: '1cc_add_new_address_pincode_api_completed',
  SHIPPING_INFO_API_INITIATED: '1cc_shipping_info_api_call_initiated',
  SHIPPING_INFO_API_COMPLETED: '1cc_shipping_info_api_call_completed',
  THRIDWARTCH_API_INITIATED: '1cc_Thridwartch_API_Call_initiated',
  THRIDWARTCH_API_COMPLETED: '1cc_Thridwartch_API_Call_Completed',
  SAVED_SHIPPING_ADDRESS_LOADED: '1cc_saved_shipping_address_screen_loaded',
  SAVED_SHIPPING_ADDRESS_SELECTED: '1cc_saved_shipping_address_selected',
  TOP_SHOWN_SHIPPING_ADDRESS: '1cc_used_top_shown_shipping_address',
  SAVED_BILLING_ADDRESS_LOADED: '1cc_saved_billing_address_screen_loaded',
  SAVED_BILLING_ADDRESS_SELECTED: '1cc_saved_billing_address_selected',
  SAVED_ADDRESS_CONTINUE_CLICKED:
    '1cc_saved_address_screen_continue_CTA_clicked',
  TOP_SHOWN_BILLING_ADDRESS: '1cc_used_top_shown_billing_address',
};

export default address;
