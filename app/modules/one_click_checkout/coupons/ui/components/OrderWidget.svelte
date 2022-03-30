<script>
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import Shimmer from 'one_click_checkout/common/ui/Shimmer.svelte';

  // store imports
  import { getCurrency } from 'razorpay';
  import {
    checkServiceabilityStatus,
    selectedAddressId,
  } from 'one_click_checkout/address/shipping_address/store';
  import {
    appliedCoupon,
    isCouponApplied,
    couponInputValue,
  } from 'one_click_checkout/coupons/store';
  import { savedAddresses } from 'one_click_checkout/address/store';
  import {
    cartAmount,
    cartDiscount,
    amount,
    shippingCharge,
  } from 'one_click_checkout/charges/store';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    SUMMARY_LABEL,
    TOTAL_LABEL,
  } from 'one_click_checkout/coupons/i18n/labels';
  import {
    COUPON_DISCOUNT_LABEL,
    AMOUNT_LABEL,
    SHIPPING_CHARGES_LABEL,
    FREE_LABEL,
  } from 'one_click_checkout/summary_modal/i18n/labels';

  // session imports
  import { getIcons } from 'one_click_checkout/sessionInterface';

  // utils imports
  import { formatAmountWithSymbol } from 'common/currency';

  // constant imports
  import { SERVICEABILITY_STATUS } from 'one_click_checkout/address/constants';

  const currency = getCurrency();
  const { order } = getIcons();
  const spaceAmoutWithSymbol = false;
  let showTotal;
  $: {
    showTotal = $selectedAddressId || $isCouponApplied;
    if ($savedAddresses?.length && $shippingCharge) {
      amount.set($cartAmount - $cartDiscount + $shippingCharge);
    } else {
      amount.set($cartAmount - $cartDiscount);
    }
  }
</script>

<div class="order-summary-label">
  <span class="order-icon"><Icon icon={order} /></span>
  {$t(SUMMARY_LABEL)}
</div>

<div class="order-summary">
  <div class="row justify-between" class:color-gray={showTotal}>
    <p>{$t(AMOUNT_LABEL)}</p>
    <p>
      {formatAmountWithSymbol($cartAmount, currency, spaceAmoutWithSymbol)}
    </p>
  </div>
  {#if $isCouponApplied && $couponInputValue === $appliedCoupon}
    <div class="row justify-between color-gray">
      <p>
        {$t(COUPON_DISCOUNT_LABEL, { values: { code: $appliedCoupon } })}
      </p>
      <p class="color-green">
        - {formatAmountWithSymbol(
          $cartDiscount,
          currency,
          spaceAmoutWithSymbol
        )}
      </p>
    </div>
  {/if}
  {#if $shippingCharge && $savedAddresses?.length}
    <div class="row justify-between color-gray">
      {#if $checkServiceabilityStatus === SERVICEABILITY_STATUS.LOADING}
        <Shimmer width="40%" />
        <Shimmer width="20%" />
      {:else}
        <p>{$t(SHIPPING_CHARGES_LABEL)}</p>
        <p>
          {$shippingCharge
            ? formatAmountWithSymbol(
                $shippingCharge,
                currency,
                spaceAmoutWithSymbol
              )
            : $t(FREE_LABEL)}
        </p>
      {/if}
    </div>
  {/if}
  {#if showTotal}
    <hr class="split" />
    <div class="row justify-between total-label">
      {#if $checkServiceabilityStatus === SERVICEABILITY_STATUS.LOADING}
        <Shimmer width="40%" />
        <Shimmer width="20%" />
      {:else}
        <p>{$t(TOTAL_LABEL)}</p>
        <p>{formatAmountWithSymbol($amount, currency, spaceAmoutWithSymbol)}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .order-summary-label {
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-transform: capitalize;
    display: flex;
    align-items: center;
  }

  .order-icon {
    margin-right: 8px;
    padding-top: 3px;
  }

  .order-summary {
    padding: 12px 0px 0px;
    font-size: 14px;
  }

  .row {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #263a4a;
  }

  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }

  .color-green {
    color: #079f0d;
  }

  .color-gray {
    color: #8d97a1;
  }

  b {
    color: #000000;
    line-height: 17px;
  }

  .split {
    border: 1px dashed #8d97a1;
    border-bottom: none;
    margin: 16px 0px;
  }
  .total-label {
    font-weight: 500;
  }
</style>
