<script>
  // UI Imports
  import PaymentDetails from 'ui/tabs/home/PaymentDetails.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Session related imports
  import { getIcons, bindEvents } from 'one_click_checkout/sessionInterface';

  // i18n imports
  import {
    DETAILS_TITLE_LABEL,
    DETAILS_DESCRIPTION_LABEL,
    DETAILS_CTA_LABEL,
  } from 'ui/labels/details-modal';
  import { t } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { errorCode } from 'one_click_checkout/coupons/store';
  import { isIndianCustomer } from 'checkoutstore';
  import { askForOTP } from 'one_click_checkout/common/otp';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
  import { ERROR_USER_NOT_LOGGED_IN } from 'one_click_checkout/coupons/constants';
  import { otpReasons } from 'one_click_checkout/otp/constants';

  export let onClose;
  // export let couponsCta;
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
  {#if $errorCode === ERROR_USER_NOT_LOGGED_IN}
    <div class="details-description">
      {$t(DETAILS_DESCRIPTION_LABEL)}
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

    margin-bottom: 18px;
  }

  .details-fields-wrapper {
    margin-left: -20px;
    margin-right: -20px;

    margin-bottom: 30px;
  }

  .details-signup-label {
    font-style: normal;
    font-weight: normal;
    font-size: 13px;
    line-height: 16px;

    color: rgba(51, 51, 51, 0.6);
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
    color: #043015;
    font-weight: normal;
    font-size: 13px;
    line-height: 20px;
  }
</style>
