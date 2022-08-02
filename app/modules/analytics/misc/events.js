const events = {
  AUTOMATIC_CHECKOUT_OPEN: 'automatic_checkout_open',
  AUTOMATIC_CHECKOUT_CLICK: 'automatic_checkout_click',
  ERROR: 'error',
  OPEN: 'open',
  CUSTOMER_STATUS_START: 'checkoutCustomerStatusAPICallInitated',
  CUSTOMER_STATUS_END: 'checkoutCustomerStatusAPICallCompleted',
  LOGOUT_CLICKED: 'checkoutSignOutOptionClicked',
  EDIT_CONTACT_CLICK: 'checkoutEditContactDetailsOptionClicked',
  CUSTOMER_STATUS_API_INITIATED: '1cc_customer_status_api_call_initiated',
  CUSTOMER_STATUS_API_COMPLETED: '1cc_customer_status_api_call_completed',
  INTL_MISSING: 'intl_missing',
};

export default events;
