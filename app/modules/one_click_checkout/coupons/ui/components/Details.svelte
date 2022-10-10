<script lang="ts">
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
  import { contact, email } from 'checkoutstore/screens/home';

  // utils imports
  import { popStack } from 'navstack';
  import {
    isIndianCustomer,
    resetContactToPrevious,
  } from 'checkoutstore/screens/home';
  import { askForOTP } from 'one_click_checkout/common/otp';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
  import { ERROR_USER_NOT_LOGGED_IN } from 'one_click_checkout/coupons/constants';
  import { otpReasons } from 'otp/constants';
  import { toggleHeader } from 'one_click_checkout/header/helper';

  // controller imports
  import { update as updateContactStorage } from 'checkoutframe/contact-storage';
  import { isOneClickCheckout } from 'razorpay';

  const { close } = getIcons();

  export let fullScreen = false;
  // TODO fix logout issue on number change

  let ctaDisabled = false;
  onMount(() => {
    bindEvents('#details-container');
  });

  function onSubmit() {
    let invalids =
      document
        .getElementById('details-container')
        ?.querySelectorAll('.invalid') || [];
    if (invalids.length) {
      invalids[0].className += ' focused mature';
      return;
    }
    if (ctaDisabled) {
      return;
    }
    popStack();
    toggleHeader(true);
    updateContactStorage({
      contact: $contact,
      email: $email,
    });
    if (isOneClickCheckout()) {
      if (!isUserLoggedIn() && $isIndianCustomer) {
        askForOTP(otpReasons.verify_coupon);
      }
    }
  }
</script>

<div class="details-container" class:fullScreen id="details-container">
  <div class="detail-container-content">
    <div class="details-header-row">
      <div class="details-signup-label">{$t(DETAILS_TITLE_LABEL)}</div>
      <button
        on:click|preventDefault={() => {
          resetContactToPrevious();
          popStack();
        }}
      >
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
      <PaymentDetails bind:disabled={ctaDisabled} />
    </div>
  </div>
  <button
    class="button details-verify-button"
    disabled={ctaDisabled}
    on:click|preventDefault={onSubmit}
  >
    {$t(DETAILS_CTA_LABEL)}
  </button>
</div>

<style lang="scss">
  .details-container.fullScreen {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .details-header-row {
      padding: 16px;
      margin: 0;
      box-shadow: 10px 10px 30px #6b6c6d1a;
    }

    hr {
      margin: 0;
    }

    .details-verify-button {
      margin: 16px;
      width: calc(100% - 32px);
      border-radius: 4px;
    }
  }
  .details-container {
    text-align: start;
    white-space: initial;
    padding: 20px;
    box-sizing: border-box;
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
    font-size: 14px;
    font-weight: 600;
    font-style: normal;
    line-height: 19px;
  }

  .details-verify-button[disabled] {
    background: #cdd2d6;
  }

  .details-description {
    font-weight: normal;
    font-size: 14px;
    line-height: 22px;
    color: #757575;
    padding-bottom: 20px;
  }

  hr {
    margin-top: 0;
    margin-bottom: 16px;
    border: 1px solid #e0e0e0;
    border-bottom: none;
  }

  .coupon-text {
    font-weight: bold;
  }
</style>
