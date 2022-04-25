export const IRCTC_KEYS = [
  'rzp_test_mZcDnA8WJMFQQD',
  'rzp_live_ENneAQv5t7kTEQ',
  'rzp_test_kD8QgcxVGzYSOU',
  'rzp_live_alEMh9FVT4XpwM',
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
