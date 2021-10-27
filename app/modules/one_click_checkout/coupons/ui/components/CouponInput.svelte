<script>
  import {
    error,
    couponInputValue,
    isCouponApplied,
    couponState,
    couponAppliedIndex,
  } from 'one_click_checkout/coupons/store';

  import {
    COUPON_INPUT_PLACEHOLDER,
    COUPON_APPLIED_LABEL,
    APPLY_LABEL,
  } from 'one_click_checkout/coupons/i18n/labels';
  import { t } from 'svelte-i18n';

  import Icon from 'ui/elements/Icon.svelte';
  import { getIcons } from 'one_click_checkout/sessionInterface';

  import { Events } from 'analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';

  const { close, tick_filled_donate } = getIcons();

  function onBlur() {
    if ($couponInputValue) {
      Events.TrackBehav(CouponEvents.INPUT, {
        couponCode: $couponInputValue,
      });
    }
  }

  export let removeCoupon;
  export let applyCoupon;
  export let onCouponInput;
</script>

<div class="row coupon-input-group" class:invalid={$error}>
  <input
    on:input={onCouponInput}
    bind:value={$couponInputValue}
    on:blur={onBlur}
    type="text"
    id="coupon-input"
    placeholder={$t(COUPON_INPUT_PLACEHOLDER)}
  />
  {#if $isCouponApplied || $error}
    <button class="close-button" on:click|preventDefault={removeCoupon}>
      <Icon icon={close} />
    </button>
  {:else if $couponState === 'loading'}
    <div class="spinner coupon-spinner" />
  {:else}
    <button
      disabled={!$couponInputValue}
      class={`${$couponInputValue ? 'theme-highlight' : ''} coupon-apply-btn`}
      on:click|preventDefault={() => {
        Events.TrackBehav(CouponEvents.COUPON_APPLY_CLICKED, {
          index: $couponAppliedIndex,
        });
        applyCoupon();
      }}
    >
      {$t(APPLY_LABEL)}
    </button>
  {/if}
</div>

{#if $isCouponApplied}
  <div class="row justify-start" id="success-message">
    <Icon icon={tick_filled_donate} />
    <div class="color-green">{$t(COUPON_APPLIED_LABEL)}</div>
  </div>
{/if}

{#if $error}
  <div id="error-feedback">{$error}</div>
{/if}

<style>
  #success-message > * {
    margin-left: 4px;
  }

  #success-message {
    margin-bottom: 20px;
  }

  .close-button {
    padding: 0 !important;
    height: 40px;
    width: 42px;
  }

  .coupon-input-group {
    border: 1px solid #e6e7e8;
    border-radius: 2px;
  }

  .coupon-input-group:focus-within {
    border: 1px solid var(--background-color, #3684d6);
  }

  #coupon-input {
    padding: 12px;
    color: #424242;
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 800;
    caret-color: var(--background-color, #3684d6);
  }

  .justify-start {
    justify-content: start !important;
  }

  .row {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .coupon-apply-btn {
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
    padding-right: 14px;
  }

  .invalid {
    border: 1px solid #fc6e51;
  }

  #error-feedback {
    color: #fc6e51;
    margin-bottom: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .coupon-spinner {
    margin-right: 12px;
  }

  .color-green {
    font-size: 12px;
    font-weight: 500;
    color: #079f0d;
  }

  input::-webkit-input-placeholder {
    color: #333333;
    font-weight: normal;
    opacity: 0.6;
  }
  input:focus::-webkit-input-placeholder {
    opacity: 0.3;
  }
  input:-moz-placeholder {
    /* FF 4-18 */
    color: #333333;
    font-weight: normal;
    opacity: 0.6;
  }

  input:focus:-moz-placeholder {
    opacity: 0.3;
  }

  input::-moz-placeholder {
    /* FF 19+ */
    color: #333333;
    font-weight: normal;
    opacity: 0.6;
  }

  input:focus:-moz-placeholder {
    opacity: 0.3;
  }
  input:-ms-input-placeholder {
    /* IE 10+ */
    color: #333333;
    font-weight: normal;
    opacity: 0.6;
  }

  input:focus:-ms-input-placeholder {
    opacity: 0.3;
  }
  input::-ms-input-placeholder {
    /* Microsoft Edge */
    color: #333333;
    font-weight: normal;
    opacity: 0.6;
  }

  input:focus::-ms-input-placeholder {
    opacity: 0.3;
  }

  input::placeholder {
    /* modern browser */
    color: #333333;
    font-weight: normal;
    opacity: 0.6;
  }

  input:focus::placeholder {
    opacity: 0.3;
  }
</style>
