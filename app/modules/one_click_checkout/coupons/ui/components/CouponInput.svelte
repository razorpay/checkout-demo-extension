<script>
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    COUPON_APPLIED_LABEL,
    APPLY_LABEL,
    COUPON_INPUT_PLACEHOLDER,
  } from 'one_click_checkout/coupons/i18n/labels';

  // store imports
  import {
    error,
    couponInputValue,
    isCouponApplied,
    couponState,
    couponAppliedIndex,
  } from 'one_click_checkout/coupons/store';

  // Analytics Imports
  import { Events } from 'analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import {
    ACTIONS,
    CATEGORIES,
  } from 'one_click_checkout/merchant-analytics/constant';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';

  // utils imports
  import { getIcons } from 'one_click_checkout/sessionInterface';

  // constant imports
  import { LOADING_STATUS } from 'one_click_checkout/coupons/constants';

  const { close, tick_filled_donate } = getIcons();
  let couponField;
  function onBlur() {
    if ($couponInputValue) {
      Events.TrackBehav(CouponEvents.INPUT, {
        couponCode: $couponInputValue,
      });
      merchantAnalytics({
        event: ACTIONS.COUPONS_MANUAL_INPUT,
        category: CATEGORIES.COUPONS,
        params: {
          coupon_code: $couponInputValue,
        },
      });
    }
  }

  function handleClickLabel() {
    couponField.focus();
  }

  export let removeCoupon;
  export let applyCoupon;
  export let onCouponInput;
</script>

<div class="input-group" class:invalid={$error}>
  <input
    id="coupon-input"
    type="text"
    class="input-area"
    required
    on:input={onCouponInput}
    bind:value={$couponInputValue}
    on:blur={onBlur}
    bind:this={couponField}
  />
  <label for="inputField" class="label" on:click={handleClickLabel}
    >{$t(COUPON_INPUT_PLACEHOLDER)}</label
  >
  {#if $isCouponApplied || $error}
    <button class="close-button" on:click|preventDefault={removeCoupon}>
      <Icon icon={close} />
    </button>
  {:else if $couponState === LOADING_STATUS}
    <div class="spinner coupon-spinner" />
  {:else}
    <button
      disabled={!$couponInputValue}
      id="coupon-apply-btn"
      class="theme-highlight coupon-apply-btn"
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
    color: #263a4a;
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
    font-weight: 600;
    padding-right: 22px;
  }

  .invalid {
    border: 1px solid #fc6e51;
  }

  #error-feedback {
    color: #b21528;
    font-size: 12px;
    font-weight: 500;
  }

  .coupon-spinner {
    display: inline-block;
    position: relative;
    top: 12px;
    right: 24px;
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

  .input-group {
    display: flex;
    justify-content: space-between;
    position: relative;
    border: 1px solid #dadce0;
    border-radius: 4px;
    margin-bottom: 5px;
  }

  .input-area {
    outline: none;
    padding: 12px;
    border-radius: 4px;
    font-size: 15px;
    color: #263a4a;
    width: 205px;
  }
  .label {
    color: #8d8d8d;
    position: absolute;
    top: 12px;
    left: 15px;
    background: #fff;
    cursor: inherit;
    transition: all ease-in 0.2s;
  }

  .input-group:focus-within {
    border: 1px solid var(--highlight-color);
    color: var(--highlight-color);
  }

  .input-group.invalid {
    border: 1px solid #b21528;
    color: #b21528;
  }

  .input-group .input-area:focus + .label {
    top: -8px;
    padding: 0 3px;
    font-size: 12px;
    left: 9px;
    color: var(--highlight-color);
    transition: all ease-out 0.2s;
  }

  .input-group .input-area:valid + .label {
    top: -8px;
    padding: 0 3px;
    font-size: 12px;
    left: 9px;
  }

  .input-group.invalid label {
    color: #b21528;
  }
</style>
