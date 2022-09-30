export const IRCTC_KEYS = [
  'rzp_test_mZcDnA8WJMFQQD',
  'rzp_live_ENneAQv5t7kTEQ',
  'rzp_test_kD8QgcxVGzYSOU',
  'rzp_live_alEMh9FVT4XpwM',
];

/**
 * Recurring does not support instrument restriction through config
 * but since it is becoming blocker to onboard potential insurance merchants
 * on recurring we are implementing temp solution for few test merchants
 * through which we can enable instrument config for those merchants
 * Slack 1: https://razorpay.slack.com/archives/C3S9FFBJ7/p1660917022028769
 * Slack 2: https://razorpay.slack.com/archives/C3S9FFBJ7/p1660640968797509
 */
export const RECURRING_METHOD_RESTRICTION_KEYS = [
  'rzp_live_sxkYn3TUteY8fo',
  'rzp_test_7surbBkZYcjZOp',
  'rzp_live_1Wb2o72t1Xi3Eu',
  'rzp_live_8BoyqCVqUNJxcb',
  'rzp_live_bc6Xjbt7e58dXv',
  'rzp_live_33QAwmcDzPFoNx',
  'rzp_test_OuTSnKRGchkgKC',
  'rzp_live_E5fch82RtnFqKy',
  'rzp_test_vgRFLTO99mJGpR',
];

/**
 * Payment Entity Types
 * @enum {string}
 */
export const PAYMENT_ENTITIES = {
  ORDER: 'order',
  SUBSCRIPTION: 'subscription',
  INVOICE: 'invoice',
};

export const entityWithAmount = [
  PAYMENT_ENTITIES.ORDER,
  PAYMENT_ENTITIES.INVOICE,
  PAYMENT_ENTITIES.SUBSCRIPTION,
];
