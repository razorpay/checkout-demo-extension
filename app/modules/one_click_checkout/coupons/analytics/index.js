const events = {
  COUPONS_SCREEN: 'checkoutCouponScreenLoaded',
  INPUT: 'checkoutCouponEntered',
  COUPON_APPLY_CLICKED: 'checkoutCouponApplyClicked',
  COUPON_REMOVE_CLICKED: 'checkoutCouponRemoveClicked',
  COUPON_APPLIED: 'coupon_applied',
  COUPON_REMOVED: 'coupon_removed',
  COUPON_VALID: 'checkoutCouponValidationSuccess',
  COUPON_INVALID: 'checkoutCouponValidationFailed',
  AVAILABLE_COUPONS_MODAL: 'checkoutAvailableCouponsScreenLoaded',
  AVAILABLE_COUPON_CLICKED: 'checkoutAvailableCouponsSelected',
  SHOW_AVAILABLE_COUPONS: 'show_available_coupons',
  COUPONS_FETCHED: 'coupons_fetched',
  COUPONS_FETCH_START: 'coupons_fetch:start',
  COUPONS_FETCH_END: 'coupons_fetch:end',
  COUPONS_FETCH_FAILED: 'coupons_fetch_failed',
  COUPON_REMOVE_START: 'coupon_remove:start',
  COUPON_REMOVE_END: 'coupon_remove:end',
  COUPONS_SUBMIT: 'checkoutCouponSubmitted',
  COUPON_VALIDITY_START: 'checkoutCouponValidationStarted',
  COUPON_VALIDITY_END: 'checkoutCouponValidationCompleted',
  SUMMARY_SCREEN_INITIATED: '1cc_summary_screen_loading_initiated',
  SUMMARY_SCREEN_LOADED: '1cc_summary_screen_loaded_completed',
  SUMMARY_CONTINUE_CTA_CLICKED: '1cc_summary_screen_continue_CTA_clicked',
  SUMMARY_COUPON_CLICKED: '1cc_summary_screen_have_coupon_clicked',
  SUMMARY_COUPON_REMOVE_CLICKED: '1cc_summary_screen_remove_coupon_clicked',
  SUMMARY_EDIT_ADDRESS_CLICKED: '1cc_summary_screen_edit_address_clicked',
  SUMMARY_ADDRESS_SHIPPING_UNCHECKED:
    '1cc_summary_screen_billing_same_as_shipping_unchecked',
  SUMMARY_COUPONS_COUNT: '1cc_summary_screen_coupons_count',
  SUMMARY_LANGUAGE_CHANGED: '1cc_summary_screen_language_changed',
  SUMMARY_MOBILE_ENTERED: '1cc_summary_screen_contact_number_entered',
  SUMMARY_EMAIL_ENTERED: '1cc_summary_screen_contact_email_entered',
  SUMMARY_BILLING_SAME_AS_SHIPPING:
    '1cc_summary_screen_billing_same_as_shipping_address',
  SUMMARY_SELECTED_SAVED_ADDRESS: '1cc_summary_screen_selected_saved_address',
  COUPON_SCREEN_LOADED: '1cc_coupons_screen_loaded',
  COUPON_BACK_BUTTON_CLICKED: '1cc_coupons_screen_back_button_clicked',
  CUSTOM_COUPON_ENTERED: '1cc_coupons_screen_custom_coupon_entered',
  COUPON_APPLY_BUTTON_CLICKED: '1cc_coupons_screen_coupon_applied',
  COUPON_VALIDATION_COMPLETED: '1cc_coupons_screen_coupon_validation_completed',
  SUMMARY_CONTACT_CHANGE_CLICKED:'1cc_clicked_change_contact_summary_screen',
};

export default events;
