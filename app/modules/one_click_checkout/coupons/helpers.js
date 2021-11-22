import { validateEmailAndContact } from 'one_click_checkout/helper';
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
import { screensHistory } from 'one_click_checkout/routing/History';
import MetaProperties from 'one_click_checkout/analytics/metaProperties';

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
        Events.TrackBehav(CouponEvents.COUPON_APPLIED, {
          index: get(couponAppliedIndex),
          meta: {
            is_coupon_applied: true,
            coupon_code: input,
          },
        });
      },
      onInvalid: (error) => {
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
  screensHistory.replace(views.COUPONS);
}

export function skipCouponOTP() {
  screensHistory.replace(views.COUPONS);
}
