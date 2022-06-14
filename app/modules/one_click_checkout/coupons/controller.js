// svelte imports
import { get } from 'svelte/store';

// i18n imports
import { locale } from 'svelte-i18n';

// analytics imports
import Analytics from 'analytics';

// store imports
import {
  shouldShowCoupons,
  isCodForced,
  isLoginMandatory,
} from 'one_click_checkout/store';
import { RTBExperiment } from 'rtb/store';

// utils imports
import { isRTBEnabled } from 'rtb/helper';
import {
  isEnableAutoFetchCoupons,
  isCodEnabled,
  isBillingAddressEnabled,
  isIntlShippingEnabled,
  isGoogleAnalyticsEnabled,
  isFacebookAnalyticsEnabled,
} from 'razorpay';

export function initSummaryMetaAnalytics() {
  Analytics.setMeta('is_RTB_live_on_merchant', isRTBEnabled(get(RTBExperiment)));
  Analytics.setMeta('is_force_cod_enabled', isCodForced());
  Analytics.setMeta('is_mandatory_signup_enabled', isLoginMandatory());
  Analytics.setMeta('is_coupons_enabled', shouldShowCoupons());
  Analytics.setMeta('is_thirdwatch_insured', !isCodForced());
  Analytics.setMeta('summary_screen_default_language', get(locale));
  Analytics.setMeta('is_cod_enabled', isCodEnabled());
  Analytics.setMeta('auto_fetch_coupon', isEnableAutoFetchCoupons());
  Analytics.setMeta('international_shipping', isIntlShippingEnabled());
  Analytics.setMeta('capture_billing_address', isBillingAddressEnabled());
  Analytics.setMeta('google_analytics', isGoogleAnalyticsEnabled());
  Analytics.setMeta('facebook_pixel', isFacebookAnalyticsEnabled());
  Analytics.setMeta('magic_checkout', true);
}