import { getSession } from 'sessionmanager';
import AvailableCoupons from 'one_click_checkout/coupons/ui/AvailableCoupons.svelte';
import Details from 'one_click_checkout/coupons/ui/components/Details.svelte';
import { showBackdrop } from 'checkoutstore/backdrop';
import { Events } from 'analytics';
import CouponEvents from 'one_click_checkout/coupons/analytics';
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
import { timer } from 'utils/timer';

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
  const getDuration = timer();
  validateCoupon(code)
    .then((response) => {
      applyCouponInStore(code, response);
      if (onValid) {
        onValid();
      }
      Events.TrackMetric(CouponEvents.COUPON_VALID, {
        code: couponCode,
        time: getDuration(),
      });
    })
    .catch((error) => {
      if (onInvalid) {
        onInvalid(error);
      }
      // TODO: Check for failure_code and trigger login if required\
      updateFailureReasonInStore(error);
      Events.TrackMetric(CouponEvents.COUPON_INVALID, {
        code: couponCode,
        reason: error.failure_code,
        time: getDuration(),
      });
    });
}

/**
 * Remove the applied coupon
 * @param {function} callback
 */
export function removeCouponCode(callback) {
  const index = get(couponRemovedIndex) + 1;
  couponRemovedIndex.set(index);
  couponState.set('loading');
  const code = get(appliedCoupon);

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
