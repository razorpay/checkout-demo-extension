import validateEmailAndContact from 'one_click_checkout/common/validators/validateEmailAndContact';
import { views } from 'one_click_checkout/routing/constants';
import {
  showDetailsOverlay,
  applyCoupon,
} from 'one_click_checkout/coupons/sessionInterface';
import { getCoupons } from 'one_click_checkout/coupons/service';
import Analytics, { Events } from 'analytics';
import CouponEvents from 'one_click_checkout/coupons/analytics';
import { get } from 'svelte/store';
import {
  availableCoupons,
  couponInputValue,
  errorCode,
  couponInputSource,
  couponAppliedIndex,
} from 'one_click_checkout/coupons/store';
import { ERROR_USER_NOT_LOGGED_IN } from 'one_click_checkout/coupons/constants';
import MetaProperties from 'one_click_checkout/analytics/metaProperties';
import { navigator } from 'one_click_checkout/routing/helpers/routing';
import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
import {
  CATEGORIES,
  ACTIONS,
} from 'one_click_checkout/merchant-analytics/constant';
import { showToast, TOAST_THEME, TOAST_SCREEN } from 'one_click_checkout/Toast';
import { COUPON_TOAST_MESSAGE } from 'one_click_checkout/coupons/i18n/labels';
import { getCurrency } from 'razorpay';
import { formatAmountWithSymbol } from 'common/currency';
import { formatTemplateWithLocale } from 'i18n';
import { locale } from 'svelte-i18n';
import { cartDiscount } from 'one_click_checkout/charges/store';

export function nextView() {
  const { DETAILS, ADDRESS } = views;
  const [isContactValid, isEmailValid] = validateEmailAndContact();
  if (!isContactValid || !isEmailValid) {
    return DETAILS;
  }
  return ADDRESS;
}

export function fetchCoupons() {
  getCoupons()
    .then((coupons) => {
      Analytics.setMeta(MetaProperties.AVAILABLE_COUPONS_COUNT, coupons.length);
      availableCoupons.set(coupons);
    })
    .catch((e) => {
      Events.TrackMetric(CouponEvents.COUPONS_FETCH_FAILED, {
        failure_reason: e.error.reason,
      });
    })
    .finally(() => {
      Events.TrackRender(CouponEvents.COUPONS_SCREEN, {
        coupons_count: get(availableCoupons).length,
      });
    });
}

/**
 * Calls backend to verify if coupon code is valid.
 * @param {string} code The coupon code enetered/selected by the user
 */
export function applyCouponCode(code) {
  const source = code ? 'selection' : 'manual_entry';
  const input = code || get(couponInputValue);

  couponInputSource.set(source);
  couponAppliedIndex.set(get(couponAppliedIndex) + 1);

  if (input) {
    applyCoupon(input, source, {
      onValid: () => {
        merchantAnalytics({
          event: ACTIONS.COUPONS_APPLIED_SUCCESS,
          category: CATEGORIES.COUPONS,
          params: {
            page_title: CATEGORIES.COUPONS,
            coupon_code: input,
          },
        });
        Events.TrackBehav(CouponEvents.COUPON_APPLIED, {
          index: get(couponAppliedIndex),
          meta: {
            is_coupon_applied: true,
            coupon_code: input,
          },
        });
        navigator.navigateTo({ path: views.COUPONS });
        showToast({
          delay: 5000,
          message: formatTemplateWithLocale(
            COUPON_TOAST_MESSAGE,
            {
              amount: formatAmountWithSymbol(
                get(cartDiscount),
                getCurrency(),
                false
              ),
            },
            get(locale)
          ),
          theme: TOAST_THEME.SUCCESS,
          screen: TOAST_SCREEN.ONE_CC,
        });
      },
      onInvalid: (error) => {
        merchantAnalytics({
          event: ACTIONS.COUPONS_APPLIED_FAILED,
          category: CATEGORIES.COUPONS,
          params: {
            page_title: CATEGORIES.COUPONS,
            coupon_code: input,
          },
        });
        if (error.failure_code === ERROR_USER_NOT_LOGGED_IN) {
          showDetailsOverlay(true);
          errorCode.set(error.failure_code);
        }
      },
    });
  }
}

export function successHandler() {
  fetchCoupons();
  applyCouponCode();
  navigator.replace(views.COUPONS);
}

export function skipCouponOTP() {
  navigator.replace(views.COUPONS);
}

export function skipCouponListOTP() {
  navigator.replace(views.COUPONS_LIST);
}
