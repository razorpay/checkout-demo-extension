// svelte imports
import { get } from 'svelte/store';

// i18n imports
import { locale } from 'svelte-i18n';

// analytics imports
import Analytics from 'analytics';

// store imports
import { shouldShowCoupons, isCodForced } from 'one_click_checkout/store';
import { RTBExperiment } from 'rtb/store';
import {
  gstinErrCount,
  gstIn,
  orderInstruction,
} from 'one_click_checkout/gstin/store';
import { showLoader } from 'one_click_checkout/loader/store';

// service imports
import { updateOrderNotes } from 'one_click_checkout/gstin/service';

// utils imports
import { isRTBEnabled } from 'rtb/helper';
import {
  isEnableAutoFetchCoupons,
  isCodEnabled,
  isBillingAddressEnabled,
  isIntlShippingEnabled,
  isGoogleAnalyticsEnabled,
  isFacebookAnalyticsEnabled,
  isMandatoryLoginEnabled,
  showGiftCard,
  enabledGSTIN,
  enabledOrderInstruction,
} from 'razorpay';
import { updateGSTIN, showGSTINErrMsg } from 'one_click_checkout/gstin/helpers';

export function initSummaryMetaAnalytics() {
  Analytics.setMeta(
    'is_RTB_live_on_merchant',
    isRTBEnabled(get(RTBExperiment))
  );
  Analytics.setMeta('is_force_cod_enabled', isCodForced());
  Analytics.setMeta('is_mandatory_signup_enabled', isMandatoryLoginEnabled());
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
  Analytics.setMeta('gc_enabled', showGiftCard());
  Analytics.setMeta('gstin_enabled', enabledGSTIN());
  Analytics.setMeta('order_instructions_enabled', enabledOrderInstruction());
}

export const handleGSTIN = (onSubmitUser) => {
  if (updateGSTIN()) {
    showLoader.set(true);
    updateOrderNotes({
      gstIn: get(gstIn),
      orderInstruction: get(orderInstruction),
    })
      .then(() => {
        onSubmitUser();
      })
      .catch(() => {
        if (!get(gstinErrCount)) {
          showGSTINErrMsg();
          const errorCount = get(gstinErrCount) + 1;
          gstinErrCount.set(errorCount);
        } else {
          onSubmitUser();
        }
      })
      .finally(() => {
        showLoader.set(false);
      });
  } else {
    onSubmitUser();
  }
};
