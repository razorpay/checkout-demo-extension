<script>
  // svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import PaymentDetails from 'ui/tabs/home/PaymentDetails.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Session related imports
  import { getIcons, bindEvents } from 'one_click_checkout/sessionInterface';

  // i18n imports
  import {
    COUPON_DETAIL_LABEL,
    COUPON_OTP_LABEL,
  } from 'one_click_checkout/coupons/i18n/labels';
  import { t } from 'svelte-i18n';
  import {
    DETAILS_TITLE_LABEL,
    DETAILS_CTA_LABEL,
  } from 'ui/labels/details-modal';

  // store imports
  import {
    errorCode,
    couponInputValue,
  } from 'one_click_checkout/coupons/store';

  // utils imports
  import { isIndianCustomer } from 'checkoutstore';
  import { askForOTP } from 'one_click_checkout/common/otp';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
  import { ERROR_USER_NOT_LOGGED_IN } from 'one_click_checkout/coupons/constants';
  import { otpReasons } from 'one_click_checkout/otp/constants';

  export let onClose;
  const { close } = getIcons();

  onMount(() => {
    bindEvents('#details-container');
  });

  function onSubmit() {
    var invalids = document
      .getElementById('details-container')
      .querySelectorAll('.invalid');
    if (invalids.length) {
      invalids[0].className += ' focused mature';
      return;
    }
    onClose();
    if (!isUserLoggedIn() && $isIndianCustomer) {
      askForOTP(otpReasons.coupons_edit_contact);
    }
    // couponsCta.hide();
  }
</script>

<div class="details-container" id="details-container">
  <div class="details-header-row">
    <div class="details-signup-label">{$t(DETAILS_TITLE_LABEL)}</div>
    <button on:click|preventDefault={onClose}>
      <Icon icon={close} />
    </button>
  </div>
  <hr />
  {#if $errorCode === ERROR_USER_NOT_LOGGED_IN}
    <div class="details-description">
      {$t(COUPON_DETAIL_LABEL)}
      “<span class="coupon-text">{$couponInputValue}</span>”
      {$t(COUPON_OTP_LABEL)}
    </div>
  {/if}
  <div class="details-fields-wrapper">
    <PaymentDetails />
  </div>
  <button
    class="button details-verify-button"
    on:click|preventDefault={onSubmit}
  >
    {$t(DETAILS_CTA_LABEL)}
  </button>
</div>

<style>
  .details-container {
    text-align: start;
    white-space: initial;
  }

  .details-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 16px;
  }

  .details-fields-wrapper {
    margin-left: -20px;
    margin-right: -20px;
    padding: 0px 20px;
    margin-bottom: 18px;
  }

  .details-signup-label {
    font-style: normal;
    font-size: 14px;
    line-height: 16px;
    font-weight: 600;
  }

  .details-verify-button {
    height: 45px;
    padding-top: 12px;
    padding-bottom: 12px;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 19px;
  }

  .details-description {
    font-weight: normal;
    font-size: 14px;
    line-height: 22px;
    color: #757575;
    padding-bottom: 20px;
  }

  hr {
    margin-bottom: 16px;
    border: 1px solid #e0e0e0;
    border-bottom: none;
  }

  .coupon-text {
    font-weight: bold;
  }
</style>
