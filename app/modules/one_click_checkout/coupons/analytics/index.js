const events = {
  COUPONS_SCREEN: 'checkoutCouponScreenLoaded',
  INPUT: 'checkoutCouponEntered',
  COUPON_APPLY_CLICKED: 'checkoutCouponApplyClicked',
  COUPON_REMOVE_CLICKED: 'checkoutCouponRemoveClicked',
  COUPON_APPLIED: 'coupon_applied',
  COUPON_REMOVED: 'coupon_removed',
  COUPON_VALID: 'checkoutCouponValidationSuccess',
  COUPON_INVALID: 'checkoutCouponValidationFailed',
  AVAILABLE_COUPONS_CLICKED: 'checkoutAvailableCouponsClicked',
  AVAILABLE_COUPONS_MODAL: 'checkoutAvailableCouponsScreenLoaded',
  AVAILABLE_COUPON_CLICKED: 'checkoutAvailableCouponsSelected',
  SHOW_AVAILABLE_COUPONS: 'show_available_coupons',
  COUPONS_FETCHED: 'coupons_fetched',
  COUPONS_FETCH_START: 'coupons_fetch:start',
  COUPONS_FETCH_FAILED: 'coupons_fetch_failed',
  COUPON_REMOVE_START: 'coupon_remove:start',
  COUPON_REMOVE_END: 'coupon_remove:end',
  COUPONS_SUBMIT: 'checkoutCouponSubmitted',
};

export default events;