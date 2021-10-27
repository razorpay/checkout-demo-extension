// Events for AVS Screen
const avsScreenEvents = {
  /** Show AVS Screen */
  SHOW_AVS_SCREEN: 'avs_screen:show',
};

/** Events for Add Cards */
const addCardsEvents = {
  HIDE_ADD_CARD_SCREEN: 'add_cards:hide',
};

const retryPaymentWithPaypalEvents = {
  SHOW_PAYPAL_RETRY_SCREEN: 'paypal_retry:show',
  SHOW_PAYPAL_RETRY_ON_OTP_SCREEN: 'paypal_retry:show:otp_screen',
  PAYPAL_RETRY_CANCEL_BTN_CLICK: 'paypal_retry:cancel_click',
  PAYPAL_RETRY_PAYPAL_BTN_CLICK: 'paypal_retry:paypal_click',
  PAYPAL_RETRY_PAYPAL_ENABLED: 'paypal_retry:paypal_enabled',
};

export default {
  ...avsScreenEvents,
  ...addCardsEvents,
  ...retryPaymentWithPaypalEvents,
};
