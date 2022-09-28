<script lang="ts">
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
    ctaOneCCDisabled,
    disableCTA,
  } from 'checkoutstore/screens/otp';
  import { cardNumber, selectedCard } from 'checkoutstore/screens/card';
  import { selectedInstrument } from 'checkoutstore/screens/home';
  import { showFeeLabel } from 'checkoutstore/fee';
  import { isEmiV2, isRecurring, isRedesignV15 } from 'razorpay';

  // Utils
  import { getFormattedDateTime } from 'lib/utils';

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
  import ResendButtonOneCC from 'otp/ui/components/ResendButton.svelte';
  import CardBox from 'ui/elements/CardBox.svelte';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';
  import OtpInput from 'otp/ui/OtpInput.svelte';

  import otpEvents from 'ui/tabs/otp/analytics';
  import { Events } from 'analytics';

  import { Safari } from 'common/useragent';
  import { VERIFY_LABEL } from 'cta/i18n';
  import CTA, { hideCta } from 'cta';
  import { showAccountTab, tabStore } from 'checkoutstore';
  import { isDebitIssuer } from 'common/bank';
  import {
    trackDebitCardEligibilityChecked,
    trackOtpEntered,
  } from 'emiV2/events/tracker';
  import type { OtpType } from 'emiV2/types';
  import { CardsTracker } from 'card/analytics/events';

  // Props
  export let on = {};
  export let addShowableClass;

  // Refs
  export let input = null;

  // Computed
  export let inputWidth;
  export let showInput;

  let otpPromptVisible: boolean;
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

  $: compact = isDebitIssuer($mode) || ($ipAddress && $accessTime);

  $: if ($action === 'paypal') {
    Analytics.track(CardEvents.SHOW_PAYPAL_RETRY_ON_OTP_SCREEN, {
      immediately: true,
    });
  }

  $: {
    // Track DC EMI Eligibility check
    // if the user has reached OTP Screen -> means DC EMI was eligible for user
    // sending otp verfied as false since user has not verified OTP yet
    if (isDebitIssuer($mode) && isEmiV2() && otpPromptVisible) {
      trackDebitCardEligibilityChecked(true);
    }
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
  $: isRazorpayOTPAndOneCC = $isRazorpayOTP && isRedesignV15();
  let isNativeOTPAndOneCC;
  $: isNativeOTPAndOneCC = !$isRazorpayOTP && isRedesignV15();
  let isOneCC = isRedesignV15();
  const isNewEmiFlow = isEmiV2();

  export function invoke(type, event) {
    const method = on[type];

    if (method) {
      method(event);
    }
  }

  export function trackInput() {
    $showAccountTab = true;
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

      if (!isWallet) {
        if (session.headless) {
          CardsTracker.GEN_NATIVE_OTP_FILLED();
        } else {
          CardsTracker.GEN_OTP_ENTERED();
        }
      }
    }

    trackEmiOtpEntered();
  }

  function trackEmiOtpEntered() {
    if (isNewEmiFlow && session.tab === 'emi') {
      const isEmiPaymentflow =
        session.payload &&
        ['emi', 'cardless_emi'].includes(session.payload.method);
      const showTimer = document.querySelector('#timeout');
      // If a payment payload exists for emi method
      // otp is of type native otp else it's a login otp (earlysalary asks otp before showing emi plans -> login otp)
      // or if it's a razorpay otp it will be login otp
      const otpType: OtpType =
        $isRazorpayOTP || !isEmiPaymentflow ? 'login' : 'native';
      trackOtpEntered(!!showTimer, otpType);
    }
  }

  export function onBack() {
    $mode = '';
    $resendTimeout = null;
    $ipAddress = '';
    $accessTime = '';
    hideCta();
  }

  function onResend(event) {
    Events.TrackBehav(otpEvents.OTP_RESEND_CLICK);
    invoke('resend', event);
  }

  $: {
    const isCard = session?.tab === 'card';
    if (showInput && isCard && !session.headless) {
      CardsTracker.GEN_OTP_SCREEN();
    }
  }
</script>

<div
  id="form-otp"
  class="tab-content screen"
  class:loading={$loading}
  class:showable={addShowableClass}
  class:tab-content-one-cc={isOneCC}
>
  <!-- The only reason "div.otp-screen-contents" exists is because we want to use "display: flex;" -->
  <!-- But since we have legacy code using "makeVisible()", it does "display: block;" -->
  <div
    class="otp-screen-contents"
    class:heading-1cc={isOneCC}
    class:otp-wrapper-1cc={isOneCC}
  >
    {#if otpPromptVisible && isDebitIssuer($mode)}
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
      class:is-loading={$loading}
      class:otp-controls-one-cc={isOneCC}
      class:recurring-alignment={isRecurring() ? !allowSkipButton : false}
    >
      <div id="otp-prompt" class:otp-header={isOneCC}>
        {#if $loading}
          <AsyncLoading>
            {getOtpScreenTitle($textView, $templateData, $locale)}
          </AsyncLoading>
        {:else}
          {#if isOneCC && $headingText}
            <p class="otp-heading" class:heading-1cc={isOneCC}>
              {getOtpScreenHeading('default_login', $templateData, $locale)}
            </p>
          {/if}
          {#if $tabLogo && isOneCC}
            <img class="title-logo" alt="Logo" src={$tabLogo} />
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
            style="width: {isOneCC ? '100%' : inputWidth};"
            class:compact
            class={isOneCC ? 'theme-border-color' : 'border-bottom-grey'}
            class:error-border={Boolean($errorMessage)}
            class:hidden={!showInput}
          >
            <div class="help">{$t(OTP_FIELD_HELP)}</div>
            <input
              bind:this={input}
              on:blur={trackInput}
              on:focus={() => {
                $showAccountTab = false;
              }}
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

      {#if isOneCC && $errorMessage}
        <div class="error-message" class:hidden={!showInput}>
          {$t($errorMessage)}
        </div>
      {/if}

      <div id="otp-sec-outer" class:compact>
        <div
          class="otp-action-container"
          class:action-container-center={isRazorpayOTPAndOneCC}
          class:action-native-otp={isNativeOTPAndOneCC}
          class:with-two-action={$allowResend &&
            (allowSkipButton || $allowBack)}
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
  <CTA
    screen="otp"
    tab={$tabStore}
    disabled={$ctaOneCCDisabled || $disableCTA || $loading}
    show={!$addFunds && !$action}
    label={VERIFY_LABEL}
    showAmount={false}
  />
</div>

<style lang="scss">
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

  :global(.redesign) .otp-controls.is-loading {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
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
    justify-content: center;
    flex: 1;
  }

  .with-two-action {
    justify-content: space-between;
  }

  .action-container-center {
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .action-native-otp :global(.one-cc-btn) {
    font-size: 13px;
  }

  #form-otp :global(.one-cc-btn) {
    font-size: 12px;
  }

  .tab-content-one-cc {
    margin-top: 12px;
  }

  .otp-heading {
    margin-bottom: 26px;
    text-align: center;
    color: var(--primary-text-color);
    text-transform: capitalize;
    font-weight: var(--font-weight-semibold);
  }

  #form-otp .heading-1cc {
    margin-top: 0px;
  }

  .error-message {
    color: #d64052;
    margin: 12px 0px;
    font-size: 12px;
    text-align: center;
  }

  #otp-prompt.otp-header {
    margin-bottom: 24px;
  }

  .border-bottom-grey {
    border-bottom: 1px solid #ccc;
  }

  .tab-content-one-cc #otp-elem {
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
  }

  .otp-wrapper-1cc {
    min-height: 110%;
  }
  .title-logo {
    height: 18px;
    margin-bottom: 18px;
  }

  #otp-prompt img[src*='freecharge.png'] {
    height: 36px;
  }

  :global(.redesign) {
    .title-logo {
      height: 28px;
    }

    :global(.otp-screen-contents .card-box:first-child .emboss) {
      background-color: #fff;
      border: 0;
      justify-content: center;
    }

    .otp-title {
      font-weight: 400;
    }

    .error-border {
      border-color: #b21528 !important;
    }
  }
</style>
