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
    phone,
  } from 'checkoutstore/screens/otp';
  import { cardNumber, selectedCard } from 'checkoutstore/screens/card';
  import { selectedInstrument } from 'checkoutstore/screens/home';
  import { showFeeLabel } from 'checkoutstore/index.js';

  // Utils
  import { getFormattedDateTime } from 'lib/utils';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getOtpScreenTitle, getOtpScreenMiscText } from 'i18n';

  import {
    ADD_FUNDS_LABEL,
    BACK_LABEL,
    RESEND_LABEL,
    RETRY_LABEL,
    TRY_DIFFERENT_LABEL,
    OTP_FIELD_HELP,
  } from 'ui/labels/otp';

  // Utils imports
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getSession } from 'sessionmanager';
  import { getCardMetadata } from 'common/card';

  // UI imports
  import LinkButton from 'components/LinkButton.svelte';
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import EmiDetails from 'ui/components/EmiDetails.svelte';
  import TermsAndConditions from 'ui/components/TermsAndConditions.svelte';
  import ResendButton from 'ui/elements/ResendButton.svelte';
  import CardBox from 'ui/elements/CardBox.svelte';

  import { Safari } from 'common/useragent';

  // Props
  export let on = {};

  // Refs
  export let input = null;

  // Computed
  export let inputWidth;
  export let showInput;

  let otpPromptVisible;
  let compact;

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

  $: {
    /**
     * Base width (Mandatory): 19px
     * Each digit: 14px
     * Each space between two digits: 10px
     *
     * There are maxlength-1 spaces and maxlength digits.
     */

    inputWidth = `${19 + ($maxlength - 1) * 10 + $maxlength * 14}px`;
  }

  $: {
    const prevShowInput = showInput;

    showInput = !($action || $loading);

    if (showInput && !prevShowInput) {
      input && input.focus();
    }
  }

  export function invoke(type, event) {
    const method = on[type];

    if (method) {
      method(event);
    }
  }

  export function trackInput(event) {
    if ($otp === '' || $otp.length > 0) {
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
</script>

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

  .otp-controls {
    flex-grow: 1;
    padding-left: 24px;
    padding-right: 24px;
  }
  /* If otp controls is the first thing in the screen, then push it down by 40px */
  .otp-screen-contents .otp-controls:first-child {
    margin-top: 40px;
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
</style>

<div id="form-otp" class="tab-content showable screen" class:loading={$loading}>
  <!-- The only reason "div.otp-screen-contents" exists is because we want to use "display: flex;" -->
  <!-- But since we have legacy code using "makeVisible()", it does "display: block;" -->
  <div class="otp-screen-contents">
    {#if otpPromptVisible && $mode === 'HDFC_DC'}
      <EmiDetails />
    {:else if otpPromptVisible && $ipAddress && $accessTime}
      <CardBox
        entity={($selectedInstrument && $selectedInstrument.token_id) || ($selectedCard && $selectedCard.id) || $cardNumber} />
    {/if}
    <div class="otp-controls">
      <div id="otp-prompt">
        {#if $loading}
          <AsyncLoading>
            {getOtpScreenTitle($textView, $templateData, $locale)}
          </AsyncLoading>
        {:else}
          <div class="otp-title">
            {getOtpScreenTitle($textView, $templateData, $locale)}
          </div>
        {/if}
      </div>
      {#if $addFunds}
        <div id="add-funds" class="add-funds">
          <!-- LABEL: Add Funds -->
          <div
            id="add-funds-action"
            class="btn"
            on:click={event => invoke('addFunds', event)}>
            {$t(ADD_FUNDS_LABEL)}
          </div>

          <div class="text-center" style="margin-top: 20px;">
            <!-- LABEL: Try different payment method -->
            <LinkButton
              id="choose-payment-method"
              on:click={event => invoke('chooseMethod', event)}>
              {$t(TRY_DIFFERENT_LABEL)}
            </LinkButton>
          </div>
        </div>
      {/if}

      <div id="otp-section">
        {#if $action}
          <!-- LABEL: Retry -->
          <div
            id="otp-action"
            class="btn"
            on:click={event => invoke('retry', event)}>
            {$t(RETRY_LABEL)}
          </div>
        {/if}

        <div
          id="otp-elem"
          style="width: {inputWidth};"
          class:compact
          class:hidden={!showInput}>
          <!-- LABEL: Please enter the OTP -->
          <div class="help">{$t(OTP_FIELD_HELP)}</div>
          <input
            bind:this={input}
            on:blur={trackInput}
            type="tel"
            class="input"
            name="otp"
            id="otp"
            bind:value={$otp}
            maxlength={$maxlength || 6}
            autocomplete={autoCompleteMethod}
            required />
        </div>
      </div>

      <div id="otp-sec-outer" class:compact>
        {#if showInput}
          {#if $allowResend}
            <!-- LABEL: Resend OTP -->
            <ResendButton
              id="otp-resend"
              resendTimeout={$resendTimeout}
              on:resend={event => invoke('resend', event)} />
          {/if}
          {#if $allowSkip}
            <LinkButton
              id="otp-sec"
              on:click={event => invoke('secondary', event)}>
              {$t(`otp.skip_text.${$skipTextLabel}`)}
            </LinkButton>
          {:else if $allowBack}
            <!-- LABEL: Go Back -->
            <LinkButton
              id="otp-sec"
              on:click={event => invoke('secondary', event)}>
              {$t(BACK_LABEL)}
            </LinkButton>
          {/if}
        {/if}
      </div>
    </div>
    {#if otpPromptVisible && $mode}
      <TermsAndConditions mode={$mode} />
    {/if}
    {#if otpPromptVisible && $ipAddress && $accessTime}
      <span class="security-text">
        {getOtpScreenMiscText('security_text', { ipAddress: $ipAddress, accessTime: getFormattedDateTime($accessTime) }, $locale)}
      </span>
    {/if}
  </div>
</div>
