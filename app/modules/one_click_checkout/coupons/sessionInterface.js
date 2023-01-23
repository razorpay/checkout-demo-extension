// svelte imports
import { get } from 'svelte/store';
import { locale } from 'svelte-i18n';

import { hideToast } from 'one_click_checkout/Toast';
import Analytics, { Events } from 'analytics';
import CouponEvents from 'one_click_checkout/coupons/analytics';
import { showLoaderView } from 'one_click_checkout/loader/helper.js';
import { showLoader } from 'one_click_checkout/loader/store';

import {
  couponInputValue,
  couponState,
  appliedCoupon,
  removeCouponInStore,
  updateFailureReasonInStore,
  applyCouponInStore,
  couponRemovedIndex,
  couponInputSource,
  availableCoupons,
  prevAppliedCoupon,
} from 'one_click_checkout/coupons/store';
import {
  removeCoupon,
  validateCoupon,
} from 'one_click_checkout/coupons/service';
import { emitMagicFunnelEvent } from 'one_click_checkout/merchant-analytics/MagicFunnel';
import { setOption, getPrefilledCouponCode } from 'razorpay';

// i18n imports
import { formatMessageWithLocale } from 'i18n';
import { APPLY_COUPON } from 'one_click_checkout/loader/i18n/labels';
import { INVALID_EMAIL_LABEL } from 'one_click_checkout/coupons/i18n/labels';

// constants imports
import { MAGIC_FUNNEL } from 'one_click_checkout/merchant-analytics/constant';
import { ERROR_INPUT_VALIDATION_FAILED } from 'one_click_checkout/coupons/constants';

/**
 * Calls validate coupon to update BE and emits track events
 * @param {string} couponCode the coupon code which has to be applied
 * @param {string} source the source of coupon input (manual_entry/selection)
 * @param {object} callback methods which are called when a coupon application is successful/error
 */
export function applyCoupon(
  couponCode,
  source,
  { onValid, onInvalid } = {},
  hideLoader = false
) {
  if (couponCode) {
    couponInputValue.set(couponCode);
  }
  const code = get(couponInputValue);
  Events.TrackBehav(CouponEvents.COUPON_APPLIED, {
    code,
    input_source: source,
  });
  couponState.set('loading');
  if (!hideLoader) {
    showLoaderView(APPLY_COUPON);
  }
  validateCoupon(code, source)
    .then((response) => {
      applyCouponInStore(code, response);
      if (onValid) {
        onValid();
      }
      return { success: true, response };
    })
    .catch((error) => {
      if (onInvalid) {
        onInvalid(error);
      }
      const { reason, field } = error?.error || {};
      if (reason === ERROR_INPUT_VALIDATION_FAILED && field === 'email') {
        updateFailureReasonInStore({
          failure_reason: formatMessageWithLocale(
            INVALID_EMAIL_LABEL,
            get(locale)
          ),
        });
        return { success: false, response: error };
      }
      // TODO: Check for failure_code and trigger login if required\
      updateFailureReasonInStore(error);
      return { success: false, response: error };
    })
    .then(({ success, response }) => {
      emitMagicFunnelEvent(MAGIC_FUNNEL.COUPON_APPLIED, {
        coupon: code,
        description:
          get(availableCoupons).find((coupon) => coupon.code === code)
            ?.description || '',
        discount: response.promotions?.[0]?.value || null,
        currency: 'INR',
        success,
      });
      showLoader.set(false);
      prevAppliedCoupon.set({});
    });
}

/**
 * Remove the applied coupon
 * @param {function} callback
 */
export function removeCouponCode(callback) {
  Analytics.removeMeta('coupon_code');
  Analytics.removeMeta('is_coupon_valid');
  hideToast();
  const index = get(couponRemovedIndex) + 1;
  couponRemovedIndex.set(index);
  couponState.set('loading');
  const code = get(appliedCoupon);
  if (getPrefilledCouponCode()) {
    setOption('prefill.coupon_code', '');
  }

  Events.TrackBehav(CouponEvents.COUPON_REMOVE_CLICKED, {
    index: get(couponRemovedIndex),
  });

  removeCoupon(code).then(() => {
    Events.TrackRender(CouponEvents.COUPON_REMOVED, {
      index: get(couponRemovedIndex),
      meta: {
        code: get(couponInputValue),
        source: get(couponInputSource),
      },
    });
    couponState.set('idle');
    removeCouponInStore();
    // If amount read from preferences is same as discounted amount, reset the amount
    if (typeof callback === 'function') {
      callback();
    }
    Events.TrackRender(CouponEvents.COUPON_REMOVED);
  });
}
