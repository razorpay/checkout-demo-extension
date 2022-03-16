<script>
  // Store imports
  import {
    action,
    addFunds,
    allowBack,
    allowResend,
    allowSkip,
    loading,
    skipTextLabel,
    textView,
    headingText,
    templateData,
    mode,
    resendTimeout,
    ipAddress,
    accessTime,
    errorMessage,
    disableCTA,
    renderCtaOneCC,
  } from 'checkoutstore/screens/otp';
  import { isOneClickCheckout } from 'razorpay';
  import { cardNumber, selectedCard } from 'checkoutstore/screens/card';
  import { selectedInstrument } from 'checkoutstore/screens/home';
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
  } from 'ui/labels/otp';
  import { otpClasses } from 'one_click_checkout/otp/constants';

  // UI imports
  import LinkButton from 'components/LinkButton.svelte';
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import EmiDetails from 'ui/components/EmiDetails.svelte';
  import TermsAndConditions from 'ui/components/TermsAndConditions.svelte';
  import ResendButton from 'one_click_checkout/otp/ui/components/ResendButton.svelte';
  import CardBox from 'ui/elements/CardBox.svelte';
  import OTPInput from 'one_click_checkout/otp/ui/OTPInput.svelte';
  import CTA from 'one_click_checkout/cta/index.svelte';
  import {
    stopResendCountdown,
    getTheme,
  } from 'one_click_checkout/otp/sessionInterface';
  import Icon from 'ui/elements/Icon.svelte';
  import { handleEditContact } from 'one_click_checkout/sessionInterface';

  import otpEvents from 'ui/tabs/otp/analytics';
  import { Events } from 'analytics';
  import { screensHistory } from 'one_click_checkout/routing/History';

  const { edit_paper } = getTheme().icons;

  const { otpReason } = screensHistory.config[views.OTP].props;

  // Props
  export let on = {};
  export let addShowableClass;
  export let newCta;
  export let onSubmit;
  export let skipOTPHandle;
  export let resendOTPHandle;
  // Computed
  export let showInput;
  let otpPromptVisible;
  let compact;
  // This flag indicates whether or not the OTP input field will be visible.
  // We don't want to show EMI details on loading state or error state.
  $: otpPromptVisible = !$action && !$loading;
  $: compact = $mode === 'HDFC_DC' || ($ipAddress && $accessTime);
  $: showInput = !($action || $loading);
  $: newCta = $renderCtaOneCC && newCta;

  export function invoke(type, event) {
    const method = on[type];
    if (type === 'secondary') {
      stopResendCountdown();
    }
    if (method) {
      method(event);
    }
  }
  export function onBack() {
    $mode = '';
    $resendTimeout = null;
    $ipAddress = '';
    $accessTime = '';
    errorMessage.set('');
  }

  function onSkip(event) {
    Events.TrackBehav(otpEvents.OTP_SKIP_CLICK, { otpReason });
    if (skipOTPHandle) {
      skipOTPHandle();
    } else {
      invoke('secondary', event);
    }
  }

  function onResend(event) {
    Events.TrackBehav(otpEvents.OTP_RESEND_CLICK, { otpReason });
    if (resendOTPHandle) {
      resendOTPHandle();
    } else {
      invoke('resend', event);
    }
  }
</script>

<!-- // TODO: showable logic -->
<div
  id="form-otp"
  class="tab-content screen"
  class:loading={$loading}
  class:showable={addShowableClass}
  class:tab-mg-1cc={isOneClickCheckout()}
  class:resetMargin={!addShowableClass}
  class:tab-content-one-cc={isOneClickCheckout()}
>
  <!-- <div id="form-otp" class="tab-content screen" class:loading={$loading}> -->
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
    <div class="otp-controls">
      <div id="otp-prompt">
        {#if $headingText}
          <p class="otp-heading" class:heading-1cc={isOneClickCheckout()}>
            {getOtpScreenHeading($headingText, $templateData, $locale)}
          </p>
        {/if}
        <!-- Align text to start only if in address context -->
        {#if $loading}
          <AsyncLoading>
            {@html getOtpScreenTitle($textView, $templateData, $locale)}
          </AsyncLoading>
        {:else}
          <div
            class="otp-title"
            class:mg-tp-20={isOneClickCheckout() && !$headingText}
          >
            {@html getOtpScreenTitle($textView, $templateData, $locale)}
            {#if otpClasses.includes($textView)}
              <span
                class="edit-contact-btn"
                on:click={() => handleEditContact()}
              >
                <Icon icon={edit_paper} />
              </span>
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
        <OTPInput hidden={!showInput} isError={$errorMessage} />
      </div>

      <div class="error-message" class:hidden={!showInput}>
        {$t($errorMessage)}
      </div>

      <div id="otp-sec-outer" class:compact>
        <div class="otp-action-container">
          {#if showInput}
            {#if $allowResend}
              <!-- LABEL: Resend OTP -->
              <ResendButton id="otp-resend" on:resend={onResend} />
            {/if}
            {#if $allowSkip}
              <LinkButton id="otp-sec" on:click={onSkip}>
                {$t(`otp.skip_text.${$skipTextLabel}`)}
              </LinkButton>
            {:else if $allowBack}
              <!-- LABEL: Go Back -->
              <LinkButton
                id="otp-sec"
                on:click={(event) => invoke('secondary', event)}
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
  {#if newCta && !$loading}
    <CTA disabled={$disableCTA} on:click={onSubmit} showAmount={false} />
  {/if}
</div>

<style>
  h3 {
    margin: 10px 0;
  }
  .otp-title {
    color: #263a4a;
    text-align: center;
    padding: 0px 20px;
  }
  .otp-screen-contents {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .otp-controls {
    flex-grow: 1;
    padding: 0px 16px 0px;
  }
  /* If otp controls is the first thing in the screen, then push it down by 40px */
  .otp-screen-contents .otp-controls:first-child {
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
  .error-message {
    color: #d64052;
    margin: 12px 0px;
    font-size: 12px;
  }
  .otp-heading {
    margin: 34px 0 26px;
    text-align: center;
    color: #263a4a;
    text-transform: capitalize;
    font-weight: bold;
  }

  #form-otp .heading-1cc {
    margin-top: 0px;
  }

  .tab-mg-1cc {
    margin-top: 20px;
  }
  :global(.resetMargin) {
    margin-top: 0;
  }
  .mg-tp-20 {
    margin-top: 20px;
  }

  .otp-action-cancel {
    margin-top: 12px;
  }

  .text-initial {
    text-transform: initial;
  }
  .edit-contact-btn {
    margin-left: 4px;
    cursor: pointer;
  }

  .otp-action-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex: 1;
  }

  .tab-content-one-cc {
    margin-top: 0px;
  }
  #otp-prompt {
    margin-bottom: 24px;
  }
</style>
