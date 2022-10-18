<script lang="ts">
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import Shimmer from 'one_click_checkout/common/ui/Shimmer.svelte';
  import CartItemList from 'one_click_checkout/cart/ui/CartItemList.svelte';
  import CartCta from 'one_click_checkout/coupons/ui/components/CartCta.svelte';

  // store imports
  import { getCurrency, scriptCouponApplied } from 'razorpay';
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
    SCRIPT_COUPON_DISCOUNT_LABEL,
  } from 'summary_modal/i18n/labels';

  // session imports
  import { getIcons } from 'one_click_checkout/sessionInterface';

  // utils imports
  import { formatAmountWithSymbol } from 'common/currency';

  // constant imports
  import { SERVICEABILITY_STATUS } from 'one_click_checkout/address/constants';
  import { DEFAULT_CART_ITEMS_COUNT } from 'one_click_checkout/cart/constants';
  import { SCREEN_LIST } from 'one_click_checkout/analytics/constants';
  import { views } from 'one_click_checkout/routing/constants';

  const currency = getCurrency();
  const { order } = getIcons();
  const spaceAmountWithSymbol = false;
  let showTotal;
  let priceBeforeScriptDisc = null;
  let scriptCouponDiscount = null;

  let cartItemsToShow = [];
  $: {
    if ($areAllCartItemsShown) {
      cartItemsToShow = $cartItems;
    } else {
      cartItemsToShow = $cartItems.slice(0, DEFAULT_CART_ITEMS_COUNT);
    }
  }

  $: {
    showTotal =
      $isShippingAddedToAmount || $isCouponApplied || !!scriptCouponDiscount;
    if ($savedAddresses?.length && $shippingCharge) {
      amount.set($cartAmount - $cartDiscount + $shippingCharge);
    } else {
      amount.set($cartAmount - $cartDiscount);
    }
  }

  $: {
    if (scriptCouponApplied()) {
      priceBeforeScriptDisc = $cartItems.reduce(
        (acc, curr) => acc + curr.quantity * +curr.price,
        0
      );
      scriptCouponDiscount = priceBeforeScriptDisc - $cartAmount;
      showTotal = true;
    }
  }
</script>

<div class="header">
  <div class="order-summary-label">
    <span class="order-icon"><Icon icon={order} /></span>
    {$t(SUMMARY_LABEL)}
  </div>
</div>

<div data-test-id="order-summary" class="order-summary">
  {#if $enableCart}
    <CartItemList
      items={cartItemsToShow}
      screenName={SCREEN_LIST[views.COUPONS]}
    />
    {#if $cartItems.length > DEFAULT_CART_ITEMS_COUNT}
      <CartCta screenName={SCREEN_LIST[views.COUPONS]} />
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
    {#if priceBeforeScriptDisc}
      <p>
        {formatAmountWithSymbol(
          priceBeforeScriptDisc,
          currency,
          spaceAmountWithSymbol
        )}
      </p>
    {:else}
      <p data-test-id="cart-amount">
        {formatAmountWithSymbol($cartAmount, currency, spaceAmountWithSymbol)}
      </p>
    {/if}
  </div>
  {#if scriptCouponDiscount}
    <div class="row justify-between color-gray">
      <p>
        {$t(SCRIPT_COUPON_DISCOUNT_LABEL)}
      </p>
      <p class="color-green">
        - {formatAmountWithSymbol(
          scriptCouponDiscount,
          currency,
          spaceAmountWithSymbol
        )}
      </p>
    </div>
  {/if}
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
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-body);
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
    margin-bottom: -2px;
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
    color: var(--positive-text-color);
  }

  .color-gray {
    color: var(--secondary-text-color);
  }

  .split {
    border: 1px dashed var(--light-dark-color);
    border-bottom: none;
    margin: 16px 0px;
  }
  .total-label {
    font-weight: var(--font-weight-semibold);
    color: var(--primary-text-color);
    font-size: var(--font-size-body);
  }

  .price-label {
    margin: 0px;
  }

  .order-summary :global(.btn-theme) {
    margin-top: 14px;
  }
</style>
