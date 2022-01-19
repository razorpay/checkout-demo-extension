<script>
  import { availableCoupons } from 'one_click_checkout/coupons/store';

  import { AVAILABLE_COUPONS_LABEL } from 'one_click_checkout/coupons/i18n/labels';
  import { t } from 'svelte-i18n';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { showAvailableCoupons } from 'one_click_checkout/coupons/sessionInterface';
  import Icon from 'ui/elements/Icon.svelte';

  export let applyCoupon;
  export let removeCoupon;

  const { offers, arrow_next } = getIcons();
</script>

{#if $availableCoupons.length}
  <button
    id="coupons-available-container"
    class="coupons-available-container"
    on:click|preventDefault={() => {
      showAvailableCoupons({
        onApply: applyCoupon,
        onRemove: removeCoupon,
      });
    }}
  >
    <Icon icon={offers} />
    <div class="coupons-available-text">
      {`${$availableCoupons.length} ${$t(AVAILABLE_COUPONS_LABEL)}`}
    </div>
    <span class="coupon-arrow-next">
      <Icon icon={arrow_next} />
    </span>
  </button>
{/if}

<style>
  .coupons-available-text {
    margin-left: 8px;
    font-weight: 600;
  }

  .coupon-arrow-next {
    margin-left: auto;
  }
</style>
