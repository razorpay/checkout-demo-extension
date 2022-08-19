<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import Shimmer from 'one_click_checkout/common/ui/Shimmer.svelte';
  import CartItemList from 'one_click_checkout/cart/ui/CartItemList.svelte';
  import CartCta from 'one_click_checkout/coupons/ui/components/CartCta.svelte';

  // store imports
  import { getCurrency } from 'razorpay';
  import { checkServiceabilityStatus } from 'one_click_checkout/address/shipping_address/store';
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
    isShippingAddedToAmount,
  } from 'one_click_checkout/charges/store';
  import {
    areAllCartItemsShown,
    cartItems,
    enableCart,
  } from 'one_click_checkout/cart/store';

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
  import {
    CART_EXPERIMENTS,
    DEFAULT_CART_ITEMS_COUNT,
  } from 'one_click_checkout/cart/constants';
  import { SCREEN_LIST } from 'one_click_checkout/analytics/constants';
  import { views } from 'one_click_checkout/routing/constants';
  import { getCartExperiment } from 'one_click_checkout/store';

  const currency = getCurrency();
  const { order } = getIcons();
  const spaceAmountWithSymbol = false;
  let showTotal;
  const cartExperiment = getCartExperiment();

  let cartItemsToShow = [];
  $: {
    if ($areAllCartItemsShown) {
      cartItemsToShow = $cartItems;
    } else {
      cartItemsToShow = $cartItems.slice(
        0,
        cartExperiment === CART_EXPERIMENTS.VARIANT_A
          ? 0
          : DEFAULT_CART_ITEMS_COUNT
      );
    }
  }

  onMount(() => {
    showTotal = $isShippingAddedToAmount || $isCouponApplied;
    $isShippingAddedToAmount = $savedAddresses?.length && $shippingCharge;
  });
</script>

<div class="header">
  <div class="order-summary-label">
    <span class="order-icon"><Icon icon={order} /></span>
    {$t(SUMMARY_LABEL)}
  </div>
  {#if $enableCart}
    <CartCta
      screenName={SCREEN_LIST[views.COUPONS]}
      variant={CART_EXPERIMENTS.VARIANT_A}
    />
  {/if}
</div>

<div data-test-id="order-summary" class="order-summary">
  {#if $enableCart}
    <CartItemList
      items={cartItemsToShow}
      screenName={SCREEN_LIST[views.COUPONS]}
    />
    {#if $cartItems.length > DEFAULT_CART_ITEMS_COUNT}
      <CartCta
        screenName={SCREEN_LIST[views.COUPONS]}
        variant={CART_EXPERIMENTS.VARIANT_B}
      />
    {/if}
    {#if cartItemsToShow.length}
      <hr class="split" />
    {/if}
  {/if}
  <div
    class="row justify-between"
    class:color-gray={showTotal}
    class:price-label={!showTotal}
  >
    <p>{$t(AMOUNT_LABEL)}</p>
    <p data-test-id="cart-amount">
      {formatAmountWithSymbol($cartAmount, currency, spaceAmountWithSymbol)}
    </p>
  </div>
  {#if $isCouponApplied && $couponInputValue === $appliedCoupon}
    <div class="row justify-between color-gray">
      <p>
        {$t(COUPON_DISCOUNT_LABEL, { values: { code: $appliedCoupon } })}
      </p>
      <p data-test-id="discount-amount" class="color-green">
        - {formatAmountWithSymbol(
          $cartDiscount,
          currency,
          spaceAmountWithSymbol
        )}
      </p>
    </div>
  {/if}
  {#if $isShippingAddedToAmount && $savedAddresses?.length}
    <div class="row justify-between color-gray">
      {#if $checkServiceabilityStatus === SERVICEABILITY_STATUS.LOADING}
        <Shimmer width="40%" />
        <Shimmer width="20%" />
      {:else}
        <p>{$t(SHIPPING_CHARGES_LABEL)}</p>
        <p data-test-id="shipping-amount">
          {$shippingCharge
            ? formatAmountWithSymbol(
                $shippingCharge,
                currency,
                spaceAmountWithSymbol
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
        <p data-test-id="total-amount">
          {formatAmountWithSymbol($amount, currency, spaceAmountWithSymbol)}
        </p>
      {/if}
    </div>
  {/if}
</div>

<style>
  * {
    box-sizing: border-box;
    margin: 0px;
    padding: 0px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
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
    padding: 16px 0px 0px;
    font-size: 14px;
  }

  .row {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #263a4a;
  }

  .row:last-child {
    margin-bottom: 2px;
  }

  .color-green {
    color: #079f0d;
  }

  .color-gray {
    color: #8d97a1;
  }

  .split {
    border: 1px dashed #e1e5ea;
    border-bottom: none;
    margin: 16px 0px;
  }
  .total-label {
    font-weight: 500;
  }

  .price-label {
    margin: 0px;
  }

  .order-summary :global(.btn-theme-B) {
    margin-top: 14px;
  }
</style>
