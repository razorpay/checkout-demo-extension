/**
 * 1cc
 */

import { isEmpty } from 'utils/object';
import { getOption, getPreferences } from './base';
import { getMerchantOrder } from './preferences';

export const hasCart = () => getOption('cart') || getOption('shopify_cart');

// Returns true if one_click_checkout is enabled on BE, passed in option and checkout is initialised using order
export const isOneClickCheckout = () =>
  Boolean(
    (getMerchantOrder()?.line_items_total || hasCart()) &&
      getPreferences('features.one_click_checkout')
  );

export const getPrefilledCouponCode = () => getOption('prefill.coupon_code');

export const isGoogleAnalyticsEnabled = () =>
  getPreferences('features.one_cc_ga_analytics') ||
  getOption('enable_ga_analytics');

export const isFacebookAnalyticsEnabled = () =>
  getPreferences('features.one_cc_fb_analytics') ||
  getOption('enable_fb_analytics');

export const getCustomerCart = () => getOption('customer_cart');

export const isCodEnabled = () => getPreferences('methods.cod') || false;

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

export const allowLangEngOnly = () =>
  getPreferences('features.one_cc_input_english');

export const shouldOverrideBrandColor = () =>
  getPreferences('features.one_cc_override_theme') || false;

export const enabledGSTIN = () =>
  getPreferences('1cc.configs.one_cc_capture_gstin') || false;

export const enabledOrderInstruction = () =>
  getPreferences('1cc.configs.one_cc_capture_order_instructions') || false;

export const scriptCouponApplied = () => {
  const cart = getOption('shopify_cart');
  if (cart) {
    // @TODO cart option is passed in case of optimized load time for shopify
    return Boolean(cart.total_discount);
  }
  return getOption('script_coupon_applied');
};

export const customerConsentDefaultAccept = () =>
  getPreferences('features.one_cc_consent_default');

export const consumerConsentDefaultDeny = () =>
  getPreferences('features.one_cc_consent_notdefault');

export const isCustomerConsentFeatureEnabled = () =>
  customerConsentDefaultAccept() || consumerConsentDefaultDeny();

export const showGiftCard = () =>
  getPreferences('1cc.configs.one_cc_gift_card') || false;

export const enabledRestrictCoupon = () =>
  getPreferences('1cc.configs.one_cc_gift_card_restrict_coupon') || false;

export const enabledMultipleGiftCard = () =>
  getPreferences('1cc.configs.one_cc_multiple_gift_card') || false;

export const enabledBuyGiftCard = () =>
  getPreferences('1cc.configs.one_cc_buy_gift_card') || false;

export const enabledRestrictCOD = () =>
  getPreferences('1cc.configs.one_cc_gift_card_cod_restrict') || false;

export const disableEmailAsCookie = () => {
  return getPreferences('features.one_cc_disableemailcookie') || false;
};

export const isMoEngageAnalyticsEnabled = () =>
  getOption('enable_moengage_analytics');

export const getSingleShippingExpVariant = () =>
  getPreferences('1cc_multiple_shipping');
