/**
 * flattened Context keys
 */
export const ContextProperties = {
  AMOUNT: 'checkout.amount',
  ENV: 'checkout.env',
  EXP_CONFIGS: 'checkout.experimentConfigs', // TODO
  EXPERIMENTS: 'checkout.experiments',
  FEATURES: 'checkout.features',
  CHECKOUT_ID: 'checkout.id',
  INTEGRATION_NAME: 'checkout.integration.name', // TODO
  INTEGRATION_TYPE: 'checkout.integration.type', // TODO
  INTEGRATION_VERSION: 'checkout.integration.version', // TODO
  LIBRARY: 'checkout.library',
  MERCHANT_KEY: 'checkout.merchant.key',
  MERCHANT_NAME: 'checkout.merchant.name',
  MERCHANT_ID: 'checkout.merchant.id',
  MODE: 'checkout.mode',
  ORDER_ID: 'checkout.order.id',
  OPTIONAL_CONTACT: 'checkout.optional.contact',
  OPTIONAL_EMAIL: 'checkout.optional.email',
  SDK: 'checkout.sdk',
  SDK_FRAMEWORK: 'checkout.sdk.framework', // TODO
  SDK_NAME: 'checkout.sdk.name', // TODO
  SDK_PLATFORM: 'checkout.sdk.platform',
  SDK_TYPE: 'checkout.sdk.type', // TODO
  SDK_VERSION: 'checkout.sdk.version',
  TIME_SINCE: 'checkout.timeSince', // TODO
  VERSION: 'checkout.version',
  LOCALE: 'locale',
  TRAITS_CONTACT: 'traits.contact',
  TRAITS_EMAIL: 'traits.email',
  USER_LOGGEDIN: 'user.loggedIn',
  REFERRER: 'referrer',
} as const;
