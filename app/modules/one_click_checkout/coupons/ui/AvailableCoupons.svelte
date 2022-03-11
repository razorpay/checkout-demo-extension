<script>
  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import CouponItem from './components/CouponItem.svelte';

  // store imports
  import {
    availableCoupons,
    appliedCoupon,
    couponState,
  } from 'one_click_checkout/coupons/store';

  // svelte imports
  import { onMount } from 'svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { AVAILABLE_COUPONS_LABEL } from 'one_click_checkout/coupons/i18n/labels';

  // utils import
  import { getIcons } from 'one_click_checkout/sessionInterface';

  // Analytics imports
  import { Events } from 'analytics';
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';

  // constant imports
  import { LOADING_STATUS } from 'one_click_checkout/coupons/constants';

  export let onClose;
  export let applyCoupon;
  export let removeCoupon;

  const { offers } = getIcons();

  onMount(() => {
    Events.TrackRender(CouponEvents.AVAILABLE_COUPONS_MODAL);
  });

  const handleCouponCode = (couponCode) => {
    Events.Track(CouponEvents.AVAILABLE_COUPON_CLICKED);
    merchantAnalytics({
      event: ACTIONS.COUPON_AVAILABLE_CLICKED,
      category: CATEGORIES.COUPONS,
      params: {
        coupon_code: couponCode,
      },
    });
    applyCoupon(couponCode);
  };
</script>

{#if $availableCoupons.length}
  <div
    class="available-coupons-container"
    class:coupon-inactive={$couponState === LOADING_STATUS}
  >
    <div class="row justify-between">
      <div id="available-coupons-heading" class="available-coupons-heading">
        <Icon icon={offers} />
        <span class="available-coupons-text">{$t(AVAILABLE_COUPONS_LABEL)}</span
        >
      </div>
    </div>

    <div class="coupons-list">
      {#each $availableCoupons as coupon, i}
        <CouponItem
          selected={coupon.code === $appliedCoupon}
          {coupon}
          on:apply={() => handleCouponCode(coupon.code)}
          on:remove={removeCoupon}
        />
      {/each}
    </div>
  </div>
{/if}

<style>
  .coupons-list {
    margin-left: -20px;
    margin-right: -20px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .available-coupons-container {
    margin-bottom: 80px;
    padding: 20px 18px 0px;
  }
  .available-coupons-heading {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-transform: capitalize;
  }

  .available-coupons-text {
    margin-left: 5px;
  }

  .row {
    display: flex;
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }

  .coupon-inactive {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
