<script>
  // Store imports
  import {
    action,
    addFunds,
    allowBack,
    allowResend,
    allowSkip,
    loading,
    maxlength,
    otp,
    skipTextLabel,
    textView,
    templateData,
    mode,
    resendTimeout,
    ipAddress,
    accessTime,
    tabLogo,
    headingText,
    errorMessage,
    isRazorpayOTP,
  } from 'checkoutstore/screens/otp';
  import { cardNumber, selectedCard } from 'checkoutstore/screens/card';
  import { selectedInstrument } from 'checkoutstore/screens/home';
  import { isOneClickCheckout, showFeeLabel } from 'checkoutstore/index.js';
  import { isRecurring } from 'razorpay';

  // Utils
  import { getFormattedDateTime } from 'lib/utils';
  import { setTabTitleLogo } from 'one_click_checkout/topbar/helper';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import {
    getOtpScreenTitle,
    getOtpScreenMiscText,
    getOtpScreenHeading,
  } from 'i18n';

  import {
    ADD_FUNDS_LABEL,
    BACK_LABEL,
    RETRY_LABEL,
    CANCEL_LABEL,
    PAY_WITH_PAYPAL_LABEL,
    TRY_DIFFERENT_LABEL,
    OTP_FIELD_HELP,
    CLOSE_AND_DISMISS_LABEL,
  } from 'ui/labels/otp';

  // Utils imports
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import CardEvents from 'analytics/card';
  import { getSession } from 'sessionmanager';

  // UI imports
  import LinkButton from 'components/LinkButton.svelte';
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import EmiDetails from 'ui/components/EmiDetails.svelte';
  import TermsAndConditions from 'ui/components/TermsAndConditions.svelte';
  import ResendButton from 'ui/elements/ResendButton.svelte';
  import ResendButtonOneCC from 'one_click_checkout/otp/ui/components/ResendButton.svelte';
  import CardBox from 'ui/elements/CardBox.svelte';
  import OneClickCheckoutOtp from 'one_click_checkout/otp/ui/OTP.svelte';
  import AccountTab from 'one_click_checkout/account_modal/ui/AccountTab.svelte';
  import OtpInput from 'one_click_checkout/otp/ui/OTPInput.svelte';

  import otpEvents from 'ui/tabs/otp/analytics';
  import { Events } from 'analytics';

  import { Safari } from 'common/useragent';

  // Props
  export let on = {};
  export let addShowableClass;

  // Refs
  export let input = null;

  // Computed
  export let inputWidth;
  export let showInput;

  let otpPromptVisible;
  let compact;
  let allowSkipButton = $allowSkip;
  const session = getSession();
  // As of Jan 2021, Safari is the only browser that supports one-time-code
  let autoCompleteMethod = 'off';
  if (Safari) {
    autoCompleteMethod = 'one-time-code';
  }

  // This flag indicates whether or not the OTP input field will be visible.
  // We don't want to show EMI details on loading state or error state.
  $: otpPromptVisible = !$action && !$loading;

  $: compact = $mode === 'HDFC_DC' || ($ipAddress && $accessTime);

  $: if ($action === 'paypal') {
    Analytics.track(CardEvents.SHOW_PAYPAL_RETRY_ON_OTP_SCREEN, {
      immediately: true,
    });
  }

  $: {
    /**
     * Base width (Mandatory): 19px
     * Each digit: 14px
     * Each space between two digits: 10px
     *
     * There are maxlength-1 spaces and maxlength digits.
     */

    inputWidth = `${19 + ($maxlength - 1) * 10 + $maxlength * 14}px`;
    // For recurring payments Skip Saving card is not an option
    // Since we already took mandatory consent on privios screen(Save Checkbox)
    // we are not allowing Skip saving option on OTP Screen
    const isSaveYourCardOTPScreen =
      $skipTextLabel === 'skip_saving_card' ||
      $skipTextLabel === 'skip_saving_card_one_cc';
    allowSkipButton = isRecurring() ? !isSaveYourCardOTPScreen : $allowSkip;
  }

  $: {
    const prevShowInput = showInput;

    showInput = !($action || $loading);

    if (showInput && !prevShowInput) {
      input && input.focus();
    }
  }

  let isRazorpayOTPAndOneCC;
  $: isRazorpayOTPAndOneCC = $isRazorpayOTP && isOneClickCheckout();

  export function onShown() {
    setTabTitleLogo($tabLogo);
  }

  export function invoke(type, event) {
    const method = on[type];

    if (method) {
      method(event);
    }
  }

  export function trackInput(event) {
    if (!$otp) {
      $showFeeLabel = false;
    }
    if ($otp) {
      const isWallet = session.payload && session.payload.method === 'wallet';

      Analytics.track('otp:input', {
        type: AnalyticsTypes.BEHAV,
        data: {
          wallet: isWallet,
          headless: session.headless,
        },
      });
    }
  }

  export function onBack() {
    $mode = '';
    $resendTimeout = null;
    $ipAddress = '';
    $accessTime = '';
  }

  function onResend(event) {
    Events.TrackBehav(otpEvents.OTP_RESEND_CLICK);
    invoke('resend', event);
  }
</script>

<div
  id="form-otp"
  class="tab-content screen"
  class:loading={$loading}
  class:showable={addShowableClass}
  class:tab-content-one-cc={isOneClickCheckout()}
>
  <!-- The only reason "div.otp-screen-contents" exists is because we want to use "display: flex;" -->
  <!-- But since we have legacy code using "makeVisible()", it does "display: block;" -->
  <div class="otp-screen-contents" class:heading-1cc={isOneClickCheckout()}>
    {#if otpPromptVisible && $mode === 'HDFC_DC'}
      <EmiDetails />
    {:else if otpPromptVisible && $ipAddress && $accessTime}
      <CardBox
        entity={($selectedInstrument && $selectedInstrument.token_id) ||
          ($selectedCard && $selectedCard.id) ||
          $cardNumber}
      />
    {/if}

    <div
      class="otp-controls"
      class:otp-controls-one-cc={isOneClickCheckout()}
      class:recurring-alignment={isRecurring() ? !allowSkipButton : false}
    >
      <div id="otp-prompt" class:otp-header={isOneClickCheckout()}>
        {#if $loading}
          <AsyncLoading>
            {getOtpScreenTitle($textView, $templateData, $locale)}
          </AsyncLoading>
        {:else}
          {#if isOneClickCheckout() && $headingText}
            <p class="otp-heading" class:heading-1cc={isOneClickCheckout()}>
              {getOtpScreenHeading('default_login', $templateData, $locale)}
            </p>
          {/if}
          <div class="otp-title">
            {#if isRazorpayOTPAndOneCC}
              {@html getOtpScreenTitle($textView, $templateData, $locale)}
            {:else}
              {getOtpScreenTitle($textView, $templateData, $locale)}
            {/if}
          </div>
        {/if}
      </div>
      {#if $addFunds}
        <div id="add-funds" class="add-funds">
          <!-- LABEL: Add Funds -->
          <div
            id="add-funds-action"
            class="btn"
            on:click={(event) => invoke('addFunds', event)}
          >
            {$t(ADD_FUNDS_LABEL)}
          </div>

          <div class="text-center" style="margin-top: 20px;">
            <!-- LABEL: Try different payment method -->
            <LinkButton
              id="choose-payment-method"
              on:click={(event) => invoke('chooseMethod', event)}
            >
              {$t(TRY_DIFFERENT_LABEL)}
            </LinkButton>
          </div>
        </div>
      {/if}

      <div id="otp-section">
        {#if $action}
          {#if $action === 'paypal'}
            <!-- LABEL: Pay with Paypal -->
            <div
              id="otp-action"
              class="btn text-initial"
              on:click={(event) => invoke('retryWithPaypal', event)}
            >
              {$t(PAY_WITH_PAYPAL_LABEL)}
            </div>

            <div class="otp-action-cancel">
              <LinkButton
                id="otp-sec"
                on:click={(event) => invoke('cancelRetryWithPaypal', event)}
              >
                {$t(CANCEL_LABEL)}
              </LinkButton>
            </div>
          {:else if $action === 'closeAndDismiss'}
            <!-- LABEL: Retry -->
            <div
              id="otp-action"
              class="btn"
              on:click={(event) => invoke('closeAndDismiss', event)}
            >
              {$t(CLOSE_AND_DISMISS_LABEL)}
            </div>
          {:else}
            <!-- LABEL: Retry -->
            <div
              id="otp-action"
              class="btn"
              on:click={(event) => invoke('retry', event)}
            >
              {$t(RETRY_LABEL)}
            </div>
          {/if}
        {/if}

        <!-- LABEL: Please enter the OTP -->

        {#if isRazorpayOTPAndOneCC}
          <OtpInput hidden={!showInput} isError={$errorMessage} />
        {:else}
          <div
            id="otp-elem"
            style="width: {inputWidth};"
            class:compact
            class:hidden={!showInput}
          >
            <div class="help">{$t(OTP_FIELD_HELP)}</div>
            <input
              bind:this={input}
              on:blur={trackInput}
              type="tel"
              class="input"
              name="otp"
              id="otp"
              bind:value={$otp}
              pattern="[0-9]"
              maxlength={$maxlength || 6}
              autocomplete={autoCompleteMethod}
              required
            />
          </div>
        {/if}
      </div>

      {#if isOneClickCheckout() && $errorMessage}
        <div class="error-message" class:hidden={!showInput}>
          {$t($errorMessage)}
        </div>
      {/if}

      <div id="otp-sec-outer" class:compact>
        <div
          class="otp-action-container"
          class:action-container-center={isRazorpayOTPAndOneCC}
        >
          {#if showInput}
            {#if $allowResend}
              <!-- LABEL: Resend OTP -->
              {#if isRazorpayOTPAndOneCC}
                <ResendButtonOneCC
                  id="otp-resend"
                  resendTimeout={$resendTimeout}
                  on:resend={onResend}
                />
              {:else}
                <ResendButton
                  id="otp-resend"
                  resendTimeout={$resendTimeout}
                  on:resend={onResend}
                />
              {/if}
            {/if}
            {#if allowSkipButton}
              <LinkButton
                id="otp-sec"
                on:click={(event) => invoke('secondary', event)}
              >
                {$t(`otp.skip_text.${$skipTextLabel}`)}
              </LinkButton>
            {:else if $allowBack}
              <!-- LABEL: Go Back -->
              <LinkButton
                id="otp-sec"
                on:click={(event) => {
                  Events.TrackBehav(otpEvents.OTP_SKIP_CLICK);
                  invoke('secondary', event);
                }}
              >
                {$t(BACK_LABEL)}
              </LinkButton>
            {/if}
          {/if}
        </div>
      </div>
    </div>
    {#if otpPromptVisible && $mode}
      <TermsAndConditions mode={$mode} />
    {/if}
    {#if otpPromptVisible && $ipAddress && $accessTime}
      <span class="security-text">
        {getOtpScreenMiscText(
          'security_text',
          {
            ipAddress: $ipAddress,
            accessTime: getFormattedDateTime($accessTime),
          },
          $locale
        )}
      </span>
    {/if}
  </div>
  <AccountTab />
</div>

<style>
  h3 {
    margin: 10px 0;
  }

  .otp-title {
    margin: 0 40px;
    line-height: 150%;
  }

  .otp-screen-contents {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  /* For recurring we are not showing Skip saving card button as
     saving card is mandatory for recurring payments.
  */
  .otp-screen-contents .recurring-alignment #otp-sec-outer {
    justify-content: center;
  }

  .otp-controls {
    flex-grow: 1;
    padding-left: 24px;
    padding-right: 24px;
  }

  .otp-controls-one-cc {
    padding: 0px 16px;
  }

  /* If otp controls is the first thing in the screen, then push it down by 40px */
  .otp-screen-contents .otp-controls:first-child {
    margin-top: 40px;
  }

  .otp-screen-contents .otp-controls-one-cc:first-child {
    margin-top: 34px;
  }

  :global(.otp-screen-contents .card-box:first-child) {
    margin-bottom: 12px;
    padding-left: 24px;
    padding-right: 24px;
  }

  /* If otp controls is not the first thing in the screen, avoid unnecessary padding */
  .otp-screen-contents:first-child {
    margin-top: 12px;
  }

  #otp-elem.compact .help {
    display: none;
  }

  .security-text {
    background: #fafafa;
    color: #999;
    font-size: 12px;
    text-align: center;
    padding: 12px;
    padding-bottom: 24px;
  }

  .otp-action-cancel {
    margin-top: 12px;
  }

  .text-initial {
    text-transform: initial;
  }
  .otp-action-container {
    display: flex;
    justify-content: space-between;
    flex: 1;
  }

  .action-container-center {
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .tab-content-one-cc {
    margin-top: 0px;
  }

  .otp-heading {
    margin-bottom: 26px;
    text-align: center;
    color: #263a4a;
    text-transform: capitalize;
    font-weight: 600;
  }

  #form-otp .heading-1cc {
    margin-top: 0px;
  }

  .error-message {
    color: #d64052;
    margin: 12px 0px;
    font-size: 12px;
  }

  #otp-prompt.otp-header {
    margin-bottom: 24px;
  }
</style>
