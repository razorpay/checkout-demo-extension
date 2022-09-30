<script lang="ts">
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';

  // store imports
  import {
    appliedCoupon,
    availableCoupons,
  } from 'one_click_checkout/coupons/store';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    HAVE_COUPON_LABEL,
    REMOVE_LABEL,
    AVAILABLE_LABEL,
    APPLIED_LABEL,
    COUPONS_DISABLED_TOAST_MESSAGE,
  } from 'one_click_checkout/coupons/i18n/labels';

  // analytics imports
  import { Events } from 'analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';

  // constant imports
  import { views } from 'one_click_checkout/routing/constants';

  // utils imports
  import { scriptCouponApplied } from 'razorpay';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import {
    showToast,
    TOAST_THEME,
    TOAST_SCREEN,
  } from 'one_click_checkout/Toast';

  export let removeCoupon;

  const { offers, circle_arrow_next } = getIcons();
  const showAvailableCoupons = () => {
    Events.TrackBehav(CouponEvents.SUMMARY_COUPON_CLICKED);
    if (scriptCouponApplied()) {
      showToast({
        message: $t(COUPONS_DISABLED_TOAST_MESSAGE),
        theme: TOAST_THEME.ERROR,
        screen: TOAST_SCREEN.ONE_CC,
      });
      return;
    }
    navigator.navigateTo({ path: views.COUPONS_LIST });
  };
  const handleRemoveCoupon = () => {
    Events.TrackBehav(CouponEvents.SUMMARY_COUPON_REMOVE_CLICKED);
    removeCoupon();
  };
</script>

<div
  id="coupons-available-container"
  class:apply={!$appliedCoupon}
  class:disabled={scriptCouponApplied()}
  on:click|preventDefault={!$appliedCoupon && showAvailableCoupons}
>
  <Icon icon={offers} />
  {#if $appliedCoupon}
    <div class="coupons-available-text">
      ‘{$appliedCoupon}’ {$t(APPLIED_LABEL)}
    </div>
    <span
      class="coupon-remove-text"
      on:click|preventDefault={handleRemoveCoupon}
    >
      {$t(REMOVE_LABEL)}
    </span>
  {:else}
    <div class="coupons-available-text">
      {$t(HAVE_COUPON_LABEL)}
      {#if $availableCoupons.length}
        <span class="coupons-available-count">
          ({$availableCoupons.length}
          {$t(AVAILABLE_LABEL)})
        </span>
      {/if}
    </div>
    <span class="coupon-arrow-next">
      <Icon icon={circle_arrow_next} />
    </span>
  {/if}
</div>

<style>
  .coupon-remove-text {
    color: var(--primary-color);
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
    margin-left: auto;
    cursor: pointer;
  }
  #coupons-available-container {
    display: flex;
    align-items: center;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
  }
  #coupons-available-container.disabled {
    opacity: 0.55;
  }

  .disabled .coupon-arrow-next {
    opacity: 0.8;
  }

  .coupons-available-text {
    margin-left: 8px;
    font-weight: var(--font-weight-semibold);
  }

  .coupons-available-count {
    padding-left: 2px;
    font-weight: var(--font-weight-regular);
    color: var(--secondary-text-color);
  }
  .coupon-arrow-next {
    margin-left: auto;
    cursor: pointer;
    padding-top: 2px;
  }
  .apply {
    cursor: pointer;
  }
</style>
