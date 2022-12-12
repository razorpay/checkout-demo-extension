export const ACTIONS = {
  PAGE_VIEW: 'page_view',
  COUPONS_MANUAL_INPUT: 'coupon_manually_entered',
  COUPON_AVAILABLE_CLICKED: 'available_coupon_applied',
  COUPONS_APPLIED_SUCCESS: 'coupons_applied_success',
  COUPONS_APPLIED_FAILED: 'coupons_applied_failed',
  SELECT_ADDRESS: 'saved_address_selected',
  ADDRESS_ENTERED: 'address_entered',
  CTA_CLICKED: 'continue_clicked',
  PAYMENT_METHOD_SELECT: 'payment_method_selected',
  PAYMENT_SUCCESSFUL: 'payment_successful',
  PAYMENT_FAILED: 'payment_failed',
  PAY_NOW_CLICKED: 'pay_now_clicked',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  MAGIC_CHECKOUT_REQUESTED: 'magic_checkout_requested',
  INITIATECHECKOUT: 'InitiateCheckout',
  ADDPAYMENTINFO: 'AddPaymentInfo',
};

export const CATEGORIES = {
  COUPONS: 'rzp_coupons',
  ADDRESS: 'rzp_address',
  LOGIN: 'rzp_login',
  ADD_ADDRESS: 'rzp_add_address',
  PAYMENT_METHODS: 'rzp_payments',
  MAGIC_CHECKOUT: 'rzp_magic_checkout',
};

export const MAGIC_FUNNEL = {
  COUPON_APPLIED: 'magic_funnel.coupon_applied',
  CHECKOUT_RENDERED: 'magic_funnel.checkout_rendered',
  ADDRESS_ENTERED: 'magic_funnel.address_entered',
  ADDRESS_SCREEN: 'magic_funnel.address_screen',
  PAYMENTS_SCREEN: 'magic_funnel.payments_screen',
  PAYMENT_ATTEMPT: 'magic_funnel.payment_attempted',
};

export const MOENGAGE_EVENTS = {
  CHECKOUT_INITIATED: 'Started_Checkout_MAGIC',
  MOBILE_ADDED: 'Mobile_Added_MAGIC',
  PINCODE_ADDED: 'PIN_Code_Added_MAGIC',
  ADDRESS_ADDED: 'Address_Added_MAGIC',
  ADDRESS_SELECTED: 'Address_Selected_MAGIC',
  PAYMENT_METHOD_SELECTED: 'Payment_Method_Selected_MAGIC',
  PAYMENT_COMPLETED: 'Payment_Complete_MAGIC',
};
