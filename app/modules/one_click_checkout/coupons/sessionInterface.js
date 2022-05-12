import { getSession } from 'sessionmanager';
import AvailableCoupons from 'one_click_checkout/coupons/ui/AvailableCoupons.svelte';
import Details from 'one_click_checkout/coupons/ui/components/Details.svelte';
import { hideToast } from 'one_click_checkout/Toast';
import { showBackdrop } from 'checkoutstore/backdrop';
import Analytics, { Events } from 'analytics';
import CouponEvents from 'one_click_checkout/coupons/analytics';
import { showLoaderView } from 'one_click_checkout/loader/helper.js';
import { showLoader } from 'one_click_checkout/loader/store';
import { get } from 'svelte/store';
import {
  couponInputValue,
  couponState,
  appliedCoupon,
  removeCouponInStore,
  updateFailureReasonInStore,
  applyCouponInStore,
  couponRemovedIndex,
  couponInputSource,
} from 'one_click_checkout/coupons/store';
import {
  removeCoupon,
  validateCoupon,
} from 'one_click_checkout/coupons/service';
import { APPLY_COUPON } from 'one_click_checkout/loader/i18n/labels';
import { setOption, getPrefilledCouponCode } from 'razorpay';

/**
 * Method which shows an overlay with available methods.
 * @param {function} onApply callback to be executed when user clicks on apply
 * @param {function} onRemove callback to be executed when user clicks on remove
 */
export function showAvailableCoupons({ onApply, onRemove }) {
  Events.Track(CouponEvents.AVAILABLE_COUPONS_CLICKED);

  const session = getSession();

  session.svelteOverlay.$$set({
    component: AvailableCoupons,
    props: {
      onClose: function (e) {
        session.hideErrorMessage(e);
      },

      applyCoupon: function (code) {
        onApply(code);
        session.hideErrorMessage();
      },

      removeCoupon: function () {
        onRemove();
        session.hideErrorMessage();
      },
    },
  });
  session.showSvelteOverlay();
  showBackdrop();
}

/**
 * Shows the details modal
 * @param {object} cta object with show, hide methods to control CTA display of parent screen
 * @param {string} code coupon code entered by user, to be shown inside
 */
export function showDetailsOverlay() {
  const session = getSession();

  session.svelteOverlay.$$set({
    component: Details,
    props: {
      onClose: function () {
        session.hideErrorMessage();
      },
    },
  });
  session.showSvelteOverlay();
  showBackdrop();
}

/**
 * Calls validate coupon to update BE and emits track events
 * @param {string} couponCode the coupon code which has to be applied
 * @param {string} source the source of coupon input (manual_entry/selection)
 * @param {object} callback methods which are called when a coupon application is successful/error
 */
export function applyCoupon(couponCode, source, { onValid, onInvalid } = {}) {
  if (couponCode) {
    couponInputValue.set(couponCode);
  }
  const code = get(couponInputValue);
  Events.TrackBehav(CouponEvents.COUPON_APPLIED, {
    code,
    input_source: source,
  });
  couponState.set('loading');
  showLoaderView(APPLY_COUPON);
  validateCoupon(code, source)
    .then((response) => {
      applyCouponInStore(code, response);
      if (onValid) {
        onValid();
      }
    })
    .catch((error) => {
      if (onInvalid) {
        onInvalid(error);
      }
      // TODO: Check for failure_code and trigger login if required\
      updateFailureReasonInStore(error);
    })
    .finally(() => {
      showLoader.set(false);
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

  removeCoupon(code).then((response) => {
    Events.TrackRender(CouponEvents.COUPON_REMOVED, {
      index: get(couponRemovedIndex),
      meta: {
        code: get(couponInputValue),
        source: get(couponInputSource),
      },
    });
    couponState.set('idle');
    removeCouponInStore(response.amount);
    // If amount read from preferences is same as discounted amount, reset the amount
    if (typeof callback === 'function') {
      callback();
    }
    Events.TrackRender(CouponEvents.COUPON_REMOVED);
  });
}

/**
 * Handling the amount in the header
 */
export function showAmountInTopBar() {
  const session = getSession();

  session.showAmountInTopBar();
}

export function hideAmountInTopBar() {
  const session = getSession();

  session.hideAmountInTopBar();
}
