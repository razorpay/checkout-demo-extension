/**
 * 1cc
 */

import { getOption, getPreferences } from './base';
import { getMerchantOrder } from './preferences';

// Returns true if one_click_checkout is enabled on BE, passed in option and checkout is initialised using order
export const isOneClickCheckout = () =>
  getMerchantOrder()?.line_items_total &&
  getPreferences('features.one_click_checkout');

export const getPrefilledCouponCode = () => getOption('prefill.coupon_code');

export const isGoogleAnalyticsEnabled = () =>
  getPreferences('features.one_cc_ga_analytics') ||
  getOption('enable_ga_analytics');

export const isFacebookAnalyticsEnabled = () =>
  getPreferences('features.one_cc_fb_analytics') ||
  getOption('enable_fb_analytics');

export const getCustomerCart = () => getOption('customer_cart');

export const getMerchantName = () => getOption('name');

export const isCodEnabled = () =>
  getPreferences('preferences.methods.cod') || false;

export const isBillingAddressEnabled = () =>
  getPreferences('1cc.configs.one_cc_capture_billing_address') || false;

export const isMandatoryLoginEnabled = () =>
  getPreferences('features.one_cc_mandatory_login') || false;

export const isIntlShippingEnabled = () =>
  getPreferences('1cc.configs.one_cc_international_shipping') || false;

export const isEnableAutoFetchCoupons = () =>
  getPreferences('1cc.configs.one_cc_auto_fetch_coupons') || false;

export const getConsentViewCount = () =>
  getPreferences('customer.1cc_consent_banner_views') || 0;

export const showOptimisedAddr = () =>
  getPreferences('1cc_address_flow_exp') === 'true';

export const allowLangEngOnly = () =>
  getPreferences('features.one_cc_input_english');

export const shouldOverrideBrandColor = () =>
  getPreferences('features.one_cc_override_theme') || false;

export const disableCODOnAppliedCoupon = () =>
  getPreferences('merchant_key') === 'rzp_live_doOidGOxQnkbe5'; // temp: GoNoise live keys
// getPreferences('features.one_cc_coupon_disable_cod') || false;

export const customerConsentDefaultAccept = () =>
  getPreferences('features.one_cc_consent_default');
export const consumerConsentDefaultDeny = () =>
  getPreferences('features.one_cc_consent_notdefault');

export const isCustomerConsentFeatureEnabled = () =>
  customerConsentDefaultAccept() || consumerConsentDefaultDeny();