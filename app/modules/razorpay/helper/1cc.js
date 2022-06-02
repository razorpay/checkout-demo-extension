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

export const getConsentViewCount = () =>
  getPreferences('customer.1cc_consent_banner_views') || 0;
