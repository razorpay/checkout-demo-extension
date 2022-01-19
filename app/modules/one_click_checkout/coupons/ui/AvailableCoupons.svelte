<script>
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import Icon from 'ui/elements/Icon.svelte';
  import CouponItem from './components/CouponItem.svelte';
  import {
    availableCoupons,
    appliedCoupon,
  } from 'one_click_checkout/coupons/store';
  import { AVAILABLE_COUPONS_LABEL } from 'one_click_checkout/coupons/i18n/labels';
  import { t } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { Events } from 'analytics';
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';

  export let onClose;
  export let applyCoupon;
  export let removeCoupon;

  const { close } = getIcons();

  onMount(() => {
    Events.TrackRender(CouponEvents.AVAILABLE_COUPONS_MODAL);
  });
</script>

<div class="available-coupons-container">
  <div class="row justify-between">
    <p id="available-coupons-heading" class="available-coupons-heading">
      {$t(AVAILABLE_COUPONS_LABEL)}
    </p>
    <button on:click={onClose}>
      <Icon icon={close} />
    </button>
  </div>

  <div class="coupons-list">
    {#each $availableCoupons as coupon, i}
      <CouponItem
        selected={coupon.code === $appliedCoupon}
        {coupon}
        on:apply={() => {
          Events.Track(CouponEvents.AVAILABLE_COUPON_CLICKED);
          merchantAnalytics({
            event: ACTIONS.COUPON_AVAILABLE_CLICKED,
            category: CATEGORIES.COUPONS,
            params: {
              coupon_code: coupon.code,
            },
          });
          applyCoupon(coupon.code);
        }}
        on:remove={removeCoupon}
      />
    {/each}
  </div>
</div>

<style>
  .coupons-list {
    max-height: 350px;
    overflow-y: scroll;
    margin-left: -20px;
    margin-right: -20px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .available-coupons-heading {
    font-weight: normal;
    font-size: 13px;
    line-height: 16px;
    color: rgba(51, 51, 51, 0.6);
    text-transform: uppercase;
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
</style>
