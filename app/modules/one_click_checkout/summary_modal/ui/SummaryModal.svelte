<script>
  import Backdrop from 'one_click_checkout/common/ui/Backdrop.svelte';
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
  } from 'one_click_checkout/summary_modal/i18n/labels';
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
  import { appliedOffer } from 'checkoutstore/offers';
  import {
    formatAmountWithCurrency,
    createCodPayment,
  } from 'one_click_checkout/summary_modal/sessionInterface';
  import { Events } from 'analytics';
  import events from 'one_click_checkout/summary_modal/analytics';
  import { truncateString } from 'utils/strings';

  let visible = false;
  let ctaVisible = false;
  let offerAmount;

  // Sets visible variable to true and makes backdrop and modal visible
  export function show() {
    Events.Track(events.ORDER_SUMMARY_LOAD, {
      ctaVisible,
    });
    visible = true;
  }

  // Sets visible variable to false and makes backdrop and modal visible
  export function hide() {
    Events.Track(events.ORDER_SUMMARY_HIDDEN);
    visible = false;
  }
  $: {
    if ($appliedOffer) {
      offerAmount = $appliedOffer.original_amount - $appliedOffer.amount;
    }
  }

  // Toggles CTA visibility
  export function toggleCta(visible) {
    ctaVisible = visible;
  }

  function onConfirm() {
    Events.Track(events.ORDER_SUMMARY_CTA_CLICK);
    createCodPayment();
  }
</script>

<Backdrop {visible} on:click={hide}>
  <div class="summary-modal">
    <div class="summary-heading">{$t(MODAL_TITLE)}</div>
    <div class="summary-table">
      <div class="summary-row">
        <div>{$t(AMOUNT_LABEL)}</div>
        <div>{formatAmountWithCurrency($cartAmount)}</div>
      </div>
      {#if $isCouponApplied}
        <div class="summary-row">
          <div>
            {$t(COUPON_DISCOUNT_LABEL, { values: { code: $appliedCoupon } })}
          </div>
          <div class="text-green">
            -{formatAmountWithCurrency($cartDiscount)}
          </div>
        </div>
      {/if}
      {#if $isShippingAddedToAmount}
        <div class="summary-row" class:text-green={!$shippingCharge}>
          <div>{$t(SHIPPING_CHARGES_LABEL)}</div>
          <div>
            {$shippingCharge
              ? formatAmountWithCurrency($shippingCharge)
              : $t(FREE_LABEL)}
          </div>
        </div>
      {/if}
      {#if $isCodAddedToAmount && $codChargeAmount}
        <div class="summary-row">
          <div>{$t(COD_CHARGES_LABEL)}</div>
          <div>{formatAmountWithCurrency($codChargeAmount)}</div>
        </div>
      {/if}
      {#if $appliedOffer?.amount}
        <div class="summary-row">
          <div>
            {$t(OFFER_LABEL, {
              values: {
                offer_name: `(${truncateString(
                  $appliedOffer.display_text,
                  20
                )})`,
              },
            })}
          </div>
          <div class="text-green">
            -{formatAmountWithCurrency(offerAmount)}
          </div>
        </div>
      {/if}
      <hr />
      <div class="summary-row total-charges-text">
        <div>{$t(TOTAL_CHARGES_LABEL)}</div>
        <div>{formatAmountWithCurrency($amount)}</div>
      </div>
    </div>
    {#if ctaVisible}
      <button class="summary-modal-cta" on:click={onConfirm}>
        {$t(CTA_LABEL)}
      </button>
    {/if}
  </div>
</Backdrop>

<style>
  .summary-modal {
    box-sizing: border-box;
    position: absolute;
    background: white;
    text-align: start;
    bottom: -55px;
    width: 100%;
    padding: 24px;
  }

  :global(.mobile) .summary-modal {
    bottom: 0;
  }

  .summary-heading {
    font-style: normal;
    font-weight: normal;
    font-size: 13px;
    line-height: 16px;
    text-transform: uppercase;
    color: rgba(51, 51, 51, 0.6);
    text-align: center;
  }

  .summary-table {
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0;
    color: #757575;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .text-green {
    color: #079f0d;
  }

  hr {
    border: 1px solid rgba(0, 0, 0, 0.12);
  }

  .total-charges-text {
    font-style: normal;
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: #363636;
  }
</style>
