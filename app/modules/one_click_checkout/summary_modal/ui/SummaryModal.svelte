<script>
  // UI imports
  import Backdrop from 'one_click_checkout/common/ui/Backdrop.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';

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
  } from 'one_click_checkout/summary_modal/i18n/labels';

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
  import { appliedOffer } from 'checkoutstore/offers';

  // session imports
  import {
    formatAmountWithCurrency,
    createCodPayment,
  } from 'one_click_checkout/summary_modal/sessionInterface';

  // analytics imports
  import { Events } from 'analytics';
  import events from 'one_click_checkout/summary_modal/analytics';

  // utils imports
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
    Events.Track(events.ORDER_SUMMARY_HIDDEN_V2);
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
    Events.TrackRender(events.ORDER_SUMMARY_LOAD_V2);
    Events.Track(events.ORDER_SUMMARY_CTA_CLICK);
    createCodPayment();
  }
</script>

<Backdrop {visible} on:click={hide}>
  <div class="summary-modal">
    <div class="summary-table-wrapper">
      <div class="summary-heading-container">
        <p class="summary-heading">
          {$t(MODAL_TITLE)}
        </p>
        <div class="summary-close" on:click={hide}>
          <Icon icon={close()} />
        </div>
      </div>
      <hr class="summary-separator" />
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
        <hr class="total-separator" />
        <div class="summary-row total-charges-text">
          <div>{$t(TOTAL_CHARGES_LABEL)}</div>
          <div>{formatAmountWithCurrency($amount)}</div>
        </div>
      </div>
    </div>
    {#if ctaVisible}
      <div class="cta-wrapper">
        <button class="summary-modal-cta" on:click={onConfirm}>
          {$t(CTA_LABEL)}
        </button>
      </div>
    {/if}
  </div>
</Backdrop>

<style>
  .summary-modal {
    box-sizing: border-box;
    position: absolute;
    background: white;
    text-align: start;
    bottom: 0;
    width: 100%;
    padding-top: 16px;
  }

  .summary-table-wrapper {
    padding: 0px 16px 4px;
  }
  :global(.mobile) .summary-modal {
    bottom: 0;
  }

  .summary-table {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0;
    color: #8d97a1;
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
    font-size: 14px;
    line-height: 16px;
    color: #363636;
  }

  .summary-heading-container {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .summary-heading {
    font-weight: 600;
    line-height: 16px;
    margin: 0px;
  }

  .summary-close {
    cursor: pointer;
  }

  .summary-separator {
    margin-bottom: 16px;
    border: 1px solid #e1e5ea;
    border-bottom: none;
  }

  .total-separator {
    border: 1px dashed #e1e5ea;
    border-bottom: none;
    margin: 16px 0px;
  }

  .summary-modal-cta::after {
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

  .cta-wrapper {
    padding: 24px 16px;
    box-shadow: 0px -4px 4px rgba(166, 158, 158, 0.08);
  }
</style>
