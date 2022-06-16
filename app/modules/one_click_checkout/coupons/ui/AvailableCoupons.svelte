<script>
  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import CouponItem from './components/CouponItem.svelte';

  // store imports
  import {
    availableCoupons,
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

  export let applyCoupon;
  export let removeCoupon;

  const { offers } = getIcons();

  onMount(() => {
    Events.TrackRender(CouponEvents.AVAILABLE_COUPONS_MODAL);
  });

  const handleCouponCode = (couponCode, couponIndex) => {
    Events.Track(CouponEvents.AVAILABLE_COUPON_CLICKED);
    Events.TrackBehav(CouponEvents.COUPON_APPLY_BUTTON_CLICKED, {
      coupon_code_index: couponIndex,
      meta: {
        coupon_code: couponCode,
        chosen_coupon_available: 1,
      },
    });

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
      {#each $availableCoupons as coupon, index}
        <CouponItem
          {coupon}
          on:apply={() => handleCouponCode(coupon.code, index)}
          on:remove={removeCoupon}
        />
      {/each}
    </div>
  </div>
{/if}

<style>
  .coupons-list {
    padding: 4px 0px 24px;
  }

  .available-coupons-container {
    margin-bottom: 80px;
    padding: 20px 16px 0px;
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

  .coupon-inactive {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
