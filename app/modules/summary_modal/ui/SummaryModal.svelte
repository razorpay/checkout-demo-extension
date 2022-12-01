<script lang="ts">
  // svelte imports
  import { onMount, afterUpdate } from 'svelte';

  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';
  import CartItemList from 'one_click_checkout/cart/ui/CartItemList.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    AMOUNT_LABEL,
    MODAL_TITLE,
    CTA_LABEL,
    COD_CHARGES_LABEL,
    TOTAL_CHARGES_LABEL,
    SHIPPING_CHARGES_LABEL,
    COUPON_DISCOUNT_LABEL,
    FREE_LABEL,
    OFFER_LABEL,
    SCRIPT_COUPON_DISCOUNT_LABEL,
  } from 'summary_modal/i18n/labels';
  import { GIFT_CARD } from 'one_click_checkout/gift_card/i18n/labels';

  // store imports
  import {
    cartAmount,
    cartDiscount,
    isCodAddedToAmount,
    isShippingAddedToAmount,
    shippingCharge,
    codChargeAmount,
    amount,
  } from 'one_click_checkout/charges/store';
  import {
    appliedCoupon,
    isCouponApplied,
  } from 'one_click_checkout/coupons/store';
  import { appliedOffer } from 'offers/store/store';
  import { cartItems, enableCart } from 'one_click_checkout/cart/store';
  import { totalAppliedGCAmt } from 'one_click_checkout/gift_card/store';
  import {
    getAmount,
    getCurrency,
    getOption,
    isOneClickCheckout,
    scriptCouponApplied,
  } from 'razorpay';

  // analytics imports
  import { Events } from 'analytics';
  import events from 'summary_modal/analytics';

  // utils / constant imports
  import { truncateString } from 'utils/strings';
  import { MODAL_MAX_HEIGHT } from 'summary_modal/constants';
  import { getSession } from 'sessionmanager';
  import { selectedInstrumentId } from 'checkoutstore/screens/home';
  import { formatAmountWithSymbol } from 'common/currency';
  import { popStack } from 'navstack';
  import { dynamicFeeObject } from 'checkoutstore/dynamicfee';

  export let ctaVisible = false;
  export let cartVisible = false;
  let showShadow = false;
  let offerAmount = 0;

  let tableHeight: number;
  let backdropHeight: number;
  let currency = getCurrency();
  const spaceAmountWithSymbol = false;
  let priceBeforeScriptDisc = $cartAmount;
  let scriptCouponDiscount: number | null = null;

  afterUpdate(() => {
    tableHeight = (document.getElementById('summary-table') as HTMLElement)
      .offsetHeight;
    backdropHeight = (document.getElementById('overlay') as HTMLElement)
      .offsetHeight;

    const cartListEle = document.querySelector('#cart-list');

    if (cartListEle) {
      const maxHeight =
        (MODAL_MAX_HEIGHT / 100) * backdropHeight -
        tableHeight -
        40 - // header height
        72 - // margin/paddings
        10;
      if (cartListEle.scrollHeight > maxHeight && !showShadow) {
        showShadow = true;
      }
    }
  });

  onMount(() => {
    Events.Track(events.ORDER_SUMMARY_LOAD, {
      ctaVisible,
    });
    if (ctaVisible) {
      Events.TrackRender(events.CONFIRM_ORDER_SUMMARY_LOAD);
    } else {
      Events.TrackRender(events.ORDER_SUMMARY_LOAD_V2);
    }
  });

  function getPaymentAmount() {
    const session = getSession();
    let amount = getAmount();
    if (session.dccPayload) {
      /** value of dccPayload set via DynamicCurrencyView.svelte */
      if (session.dccPayload.enable && session.dccPayload.currency) {
        currency = session.dccPayload.currency;
      }
      if (
        session.dccPayload.enable &&
        session.dccPayload.currencyPayload &&
        session.dccPayload.currencyPayload.all_currencies
      ) {
        const dccAmount =
          session.dccPayload.currencyPayload.all_currencies[currency];

        if (dccAmount) {
          amount = dccAmount.amount;
        }
      }
    }
    return amount;
  }

  export function preventBack() {
    Events.Track(events.ORDER_SUMMARY_HIDDEN);
    return false;
  }

  function onClose() {
    Events.Track(events.ORDER_SUMMARY_HIDDEN);
    popStack();
  }

  $: {
    if (
      $appliedOffer &&
      $appliedOffer.original_amount &&
      $appliedOffer.amount
    ) {
      offerAmount = $appliedOffer.original_amount - $appliedOffer.amount;
    }
  }

  $: {
    if (scriptCouponApplied()) {
      priceBeforeScriptDisc = $cartItems.reduce(
        (acc: number, curr: { quantity: number; price: number | string }) =>
          acc + curr.quantity * +curr.price,
        0
      );
      scriptCouponDiscount = priceBeforeScriptDisc - $cartAmount;
    }
  }

  function onConfirm() {
    Events.Track(events.ORDER_SUMMARY_CTA_CLICK);
    Events.TrackBehav(events.ORDER_SUMMARY_CTA_CLICK_V2);

    getSession().submit();
    selectedInstrumentId.set(null);
    popStack();
  }
</script>

<div
  data-test-id="summary-modal"
  class="summary-modal"
  style="max-height: {MODAL_MAX_HEIGHT}%;"
>
  <div class="summary-table-wrapper">
    <div class="summary-heading-container">
      <div class="summary-heading">
        <div>{$t(MODAL_TITLE)}</div>
        <div class="summary-heading-description">
          {getOption('description')?.trim()}
        </div>
      </div>
      <div class="summary-close" on:click={onClose}>
        <Icon icon={close()} />
      </div>
    </div>
    <hr class="summary-separator" />
    {#if $enableCart && cartVisible}
      <div class:inset-shadow={showShadow}>
        <CartItemList
          --max-height="{(MODAL_MAX_HEIGHT / 100) * backdropHeight -
            tableHeight -
            40 - // header height
            72 - // margin/paddings
            10}px"
          items={$cartItems}
          scrollable
        />
      </div>
      {#if !showShadow}
        <hr class="total-separator mv-16 mh-16" />
      {/if}
    {/if}
    <div id="summary-table" class="summary-table">
      <div class="summary-row">
        <div>{$t(AMOUNT_LABEL)}</div>
        <div data-test-id="cart-amount">
          {formatAmountWithSymbol(
            isOneClickCheckout() ? priceBeforeScriptDisc : getPaymentAmount(),
            currency,
            spaceAmountWithSymbol
          )}
        </div>
      </div>
      {#if scriptCouponDiscount}
        <div class="summary-row">
          <div>
            {$t(SCRIPT_COUPON_DISCOUNT_LABEL)}
          </div>
          <div class="text-green">
            - {formatAmountWithSymbol(
              scriptCouponDiscount,
              currency,
              spaceAmountWithSymbol
            )}
          </div>
        </div>
      {/if}
      {#if $isCouponApplied}
        <div class="summary-row">
          <div data-test-id="applied-coupon-label">
            {$t(COUPON_DISCOUNT_LABEL, { values: { code: $appliedCoupon } })}
          </div>
          <div data-test-id="discount-amount" class="text-green">
            - {formatAmountWithSymbol(
              $cartDiscount,
              currency,
              spaceAmountWithSymbol
            )}
          </div>
        </div>
      {/if}
      {#if $isShippingAddedToAmount}
        <div class="summary-row" class:text-green={!$shippingCharge}>
          <div>{$t(SHIPPING_CHARGES_LABEL)}</div>
          <div data-test-id="shipping-amount">
            {$shippingCharge
              ? formatAmountWithSymbol(
                  $shippingCharge,
                  currency,
                  spaceAmountWithSymbol
                )
              : $t(FREE_LABEL)}
          </div>
        </div>
      {/if}
      {#if $isCodAddedToAmount && $codChargeAmount}
        <div class="summary-row">
          <div>{$t(COD_CHARGES_LABEL)}</div>
          <div data-test-id="cod-amount">
            {formatAmountWithSymbol(
              $codChargeAmount,
              currency,
              spaceAmountWithSymbol
            )}
          </div>
        </div>
      {/if}
      {#if $totalAppliedGCAmt}
        <div class="summary-row">
          <div>{$t(GIFT_CARD)}</div>
          <div class="text-green">
            -{formatAmountWithSymbol(
              $totalAppliedGCAmt,
              currency,
              spaceAmountWithSymbol
            )}
          </div>
        </div>
      {/if}
      {#if $appliedOffer?.amount}
        <div class="summary-row">
          <div data-test-id="offer-label">
            {$t(OFFER_LABEL, {
              values: {
                offer_name: `(${truncateString(
                  $appliedOffer.display_text,
                  20
                )})`,
              },
            })}
          </div>
          <div data-test-id="offer-amount" class="text-green">
            -{formatAmountWithSymbol(
              offerAmount,
              currency,
              spaceAmountWithSymbol
            )}
          </div>
        </div>
      {/if}
      <!-- Todo to fix this after dynamicfee.js move to TS -->
      {#if $dynamicFeeObject?.convenience_fee}
        <div class="summary-row">
          <div>
            {$dynamicFeeObject?.checkout_label || ''}
          </div>
          <div data-test-id="offer-amount" class="text-green">
            {formatAmountWithSymbol(
              $dynamicFeeObject?.convenience_fee || 0,
              currency,
              spaceAmountWithSymbol
            )}
          </div>
        </div>
      {/if}

      <hr class="total-separator mv-16" />
      <div class="summary-row total-charges-text">
        <div>{$t(TOTAL_CHARGES_LABEL)}</div>
        <div data-test-id="total-amount">
          {formatAmountWithSymbol(
            isOneClickCheckout()
              ? $amount
              : getPaymentAmount() -
                  offerAmount +
                  ($dynamicFeeObject?.convenience_fee || 0),
            currency,
            spaceAmountWithSymbol
          )}
        </div>
      </div>
    </div>
  </div>
  {#if ctaVisible}
    <div class="cta-container">
      <div class="cta-wrapper">
        <button class="summary-modal-cta" on:click={onConfirm}>
          {$t(CTA_LABEL)}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .summary-modal {
    box-sizing: border-box;
    background: white;
    text-align: start;
    bottom: 0;
    width: 100%;
    padding-top: 16px;
  }

  .summary-modal-cta:hover::after {
    left: 0;
    top: 0;
    opacity: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    content: '';
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1),
      rgba(0, 0, 0, 0.1)
    );
  }

  .summary-modal-cta::after {
    opacity: 0;
  }

  .summary-table-wrapper {
    padding-bottom: 4px;
  }
  :global(.mobile) .summary-modal {
    bottom: 0;
  }

  .summary-table {
    font-size: var(--font-size-body);
    font-style: normal;
    font-weight: var(--font-weight-regular);
    line-height: 16px;
    letter-spacing: 0;
    color: var(--secondary-text-color);
    padding: 0px 16px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .text-green {
    color: var(--positive-text-color);
  }

  hr {
    border: 1px solid #e1e5ea;
    border-bottom: none;
    margin: 12px 0;
  }

  .total-charges-text {
    font-style: normal;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-body);
    line-height: 16px;
    color: var(--primary-text-color);
    margin-bottom: 16px;
  }

  .summary-heading-container {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0px 16px;
  }

  .summary-heading {
    font-weight: 600;
    line-height: 16px;
    margin: 0px;
    color: #3f71d7;
  }

  .summary-heading-description {
    color: var(--tertiary-text-color);
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-small);
    line-height: 15px;
  }

  .summary-close {
    cursor: pointer;
  }

  :global(.redesign) .summary-separator {
    margin: 0px 16px 16px;
    border: 1px solid var(--light-dark-color);
    border-bottom: none;
  }

  .total-separator {
    border: 1px dashed var(--light-dark-color);
    border-bottom: none;
  }

  .mv-16 {
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .mh-16 {
    margin-left: 16px;
    margin-right: 16px;
  }
  .cta-container {
    padding: 10px 14px;
    box-shadow: 0px -4px 4px rgba(166, 158, 158, 0.08);
  }

  .cta-wrapper {
    position: relative;
  }
  .summary-modal-cta {
    width: 100%;
    padding: 14px 18px;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    border-radius: 6px;
    font-family: 'Inter', 'lato', ubuntu, helvetica, sans-serif !important;

    color: var(--text-color);
    background: var(--primary-color);
  }

  .summary-table-wrapper :global(#cart-list) {
    padding: 0px 16px;
  }

  .inset-shadow {
    box-shadow: inset 0px -4px 8px rgba(107, 108, 109, 0.13);
    margin-bottom: 16px;
    border-bottom: 1px solid #e1e5ea;
  }

  .inset-shadow :global(#cart-list) {
    padding-bottom: 16px;
  }
</style>
