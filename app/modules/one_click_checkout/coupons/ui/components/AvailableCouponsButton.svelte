<script>
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
  } from 'one_click_checkout/coupons/i18n/labels';

  // constant imports
  import { views } from 'one_click_checkout/routing/constants';

  // utils imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';

  export let applyCoupon;
  export let removeCoupon;

  const { offers, circle_arrow_next } = getIcons();
  const showAvailableCoupons = () => {
    navigator.navigateTo({ path: views.COUPONS_LIST });
  };
</script>

<div id="coupons-available-container">
  <Icon icon={offers} />
  {#if $appliedCoupon}
    <div class="coupons-available-text">
      ‘{$appliedCoupon}’ {$t(APPLIED_LABEL)}
    </div>
    <span class="coupon-remove-text" on:click|preventDefault={removeCoupon}>
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
    <span
      class="coupon-arrow-next"
      on:click|preventDefault={showAvailableCoupons}
    >
      <Icon icon={circle_arrow_next} />
    </span>
  {/if}
</div>

<style>
  .coupons-available-text {
    margin-left: 8px;
    font-weight: 600;
  }

  .coupons-available-count {
    padding-left: 2px;
    font-weight: 300;
    color: rgba(51, 51, 51, 0.6);
  }
  .coupon-arrow-next {
    margin-left: auto;
    cursor: pointer;
    padding-top: 2px;
  }
</style>
