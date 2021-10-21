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
  PAYPAL_RETRY_CANCEL_BTN_CLICK: 'paypal_retry:cancel_click',
  PAYPAL_RETRY_PAYPAL_BTN_CLICK: 'paypal_retry:paypal_click',
};

export default {
  ...avsScreenEvents,
  ...addCardsEvents,
  ...retryPaymentWithPaypalEvents,
};
