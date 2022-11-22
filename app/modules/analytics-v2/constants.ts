import { IS_PROD } from 'common/constants';

/**
 * flattened Context keys
 */
export const ContextProperties = {
  AMOUNT: 'checkout.amount',
  ENV: 'checkout.env',
  EXP_CONFIGS: 'checkout.experimentConfigs',
  EXPERIMENTS: 'checkout.experiments',
  FEATURES: 'checkout.features',
  CHECKOUT_ID: 'checkout.id',
  REFERRER_TYPE: 'checkout.referrerType',
  INTEGRATION_NAME: 'checkout.integration.name',
  INTEGRATION_TYPE: 'checkout.integration.type',
  INTEGRATION_VERSION: 'checkout.integration.version',
  INTEGRATION_PARENT_VERSION: 'checkout.integration.parentVersion',
  INTEGRATION_PLATFORM: 'checkout.integration.platform',
  LIBRARY: 'checkout.library',
  MERCHANT_KEY: 'checkout.merchant.key',
  MERCHANT_NAME: 'checkout.merchant.name',
  MERCHANT_ID: 'checkout.merchant.id',
  MODE: 'checkout.mode',
  ORDER_ID: 'checkout.order.id',
  OPTIONAL_CONTACT: 'checkout.optional.contact',
  OPTIONAL_EMAIL: 'checkout.optional.email',
  SDK: 'checkout.sdk',
  SDK_FRAMEWORK: 'checkout.sdk.framework',
  SDK_NAME: 'checkout.sdk.name',
  SDK_PLATFORM: 'checkout.sdk.platform',
  SDK_TYPE: 'checkout.sdk.type',
  SDK_VERSION: 'checkout.sdk.version',
  INIT_TO_RENDER: 'checkout.timeSince.initToRender',
  RENDER_TO_SUBMIT: 'checkout.timeSince.renderToSubmit',
  VERSION: 'checkout.version',
  LOCALE: 'locale',
  TRAITS_CONTACT: 'traits.contact',
  TRAITS_EMAIL: 'traits.email',
  USER_LOGGEDIN: 'user.loggedIn',
  REFERRER: 'referrer',
  SECTION: 'section',
} as const;

export const RUDDERSTACK_URL = IS_PROD
  ? 'https://rudderstack.razorpay.com'
  : 'https://rudderstack.ext.dev.razorpay.in';

export const RUDDERSTACK_KEY = IS_PROD
  ? '2Fle0rY1hHoLCMetOdzYFs1RIJF'
  : '27TM2uVMCl4nm4d7gqR4tysvdU1';

/**
 * type of referrer which launched checkout
 */
export enum REFERRER_TYPE {
  /**
   * for plugin, sdk, web integration
   */
  INTEGRATION = 'integration',
  /**
   * for payment_pages, payment_links, etc
   */
  RZP_APP = 'rzp_app',
  /**
   * for external integration like HDFC VAS
   */
  EXTERNAL = 'external',
}

export enum INTEGRATION_PLATFORM {
  WEB = 'web',
  PLUGIN = 'plugin',
  SDK = 'sdk',
}

export enum FUNNEL_NAMES {
  HIGH_LEVEL = 'high-level',
  CARD = 'card',
  WALLET = 'wallet',
  NETBANKING = 'netbanking',
  EMI = 'emi',
  PAYLATER = 'paylater',
  UPI = 'upi',
}
