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
    skipText,
    text,
  } from 'checkoutstore/screens/otp';

  // UI imports
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getSession } from 'sessionmanager';

  // Props
  export let on = {};

  // Refs
  export let input;

  // Computed
  export let inputWidth;
  export let showInput;

  const session = getSession();

  $: {
    /**
     * Base width (Mandatory): 19px
     * Each dash: 14px
     * Each space between two dashes: 10px
     *
     * There are maxlength-1 spaces and maxlength dashes.
     */

    inputWidth = `${19 + ($maxlength - 1) * 10 + $maxlength * 14}px`;
  }

  $: {
    const prevShowInput = showInput;

    showInput = !($action || $loading);

    if (showInput && !prevShowInput) {
      input.focus();
    }
  }

  export function invoke(type, event) {
    const method = on[type];

    if (method) {
      method(event);
    }
  }

  export function trackInput(event) {
    if ($otp) {
      Analytics.track('otp:input', {
        type: AnalyticsTypes.BEHAV,
        data: {
          wallet: session.tab === 'wallet',
          headless: session.headless,
        },
      });
    }
  }
</script>

<div id="form-otp" class="tab-content showable screen" class:loading={$loading}>
  <div id="otp-prompt">
    {@html $text}
  </div>

  {#if $addFunds}
    <div id="add-funds" class="add-funds">
      <div
        id="add-funds-action"
        class="btn"
        on:click={event => invoke('addFunds', event)}>
        Add Funds
      </div>

      <div class="text-center" style="margin-top: 20px;">
        <a
          id="choose-payment-method"
          class="link"
          on:click={event => invoke('chooseMethod', event)}>
          Try different payment method
        </a>
      </div>
    </div>
  {/if}

  <div id="otp-section">
    {#if $action}
      <div
        id="otp-action"
        class="btn"
        on:click={event => invoke('retry', event)}>
        Retry
      </div>
    {/if}

    <div id="otp-elem" style="width: {inputWidth};" class:hidden={!showInput}>
      <div class="help">Please enter the OTP</div>
      <input
        bind:this={input}
        on:blur={trackInput}
        type="tel"
        class="input"
        name="otp"
        id="otp"
        bind:value={$otp}
        maxlength={$maxlength || 6}
        autocomplete="one-time-code"
        required />
    </div>
  </div>

  <div class="spin">
    <div />
  </div>
  <div class="spin spin2">
    <div />
  </div>
  <div id="otp-sec-outer" class:hidden={!showInput}>
    {#if $allowResend}
      <a
        id="otp-resend"
        class="link"
        on:click={event => invoke('resend', event)}>
        Resend OTP
      </a>
    {/if}
    {#if $allowSkip}
      <a
        id="otp-sec"
        class="link"
        on:click={event => invoke('secondary', event)}>
        {$skipText}
      </a>
    {:else if $allowBack}
      <a
        id="otp-sec"
        class="link"
        on:click={event => invoke('secondary', event)}>
        Go Back
      </a>
    {/if}
  </div>
</div>
