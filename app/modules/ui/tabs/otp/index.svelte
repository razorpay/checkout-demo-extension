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

  // Utils imports
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getSession } from 'sessionmanager';

  // UI imports
  import LinkButton from 'components/LinkButton.svelte';
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';

  // Props
  export let on = {};

  // Refs
  export let input = null;

  // Computed
  export let inputWidth;
  export let showInput;

  const session = getSession();

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

<style>
  .otp-screen-contents {
    display: flex;
    flex-direction: column;
  }
  /* If otp controls is the first thing in the screen, then push it down by 40px */
  .otp-screen-contents .otp-controls:first-child {
    margin-top: 40px;
  }
  /* If otp controls is not the first thing in the screen, avoid unnecessary padding */
  .otp-screen-contents:first-child {
    margin-top: 12px;
  }
</style>

<div id="form-otp" class="tab-content showable screen" class:loading={$loading}>
  <!-- The only reason "div.otp-screen-contents" exists is because we want to use "display: flex;" -->
  <!-- But since we have legacy code using "makeVisible()", it does "display: block;" -->
  <div class="otp-screen-contents">
    <div class="otp-controls">
      <div id="otp-prompt">
        {#if $loading}
          <AsyncLoading>
            {@html $text}
          </AsyncLoading>
        {:else}
          {@html $text}
        {/if}
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
            <LinkButton
              id="choose-payment-method"
              on:click={event => invoke('chooseMethod', event)}>
              Try different payment method
            </LinkButton>
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

        <div
          id="otp-elem"
          style="width: {inputWidth};"
          class:hidden={!showInput}>
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

      <div id="otp-sec-outer">
        {#if showInput}
          {#if $allowResend}
            <LinkButton
              id="otp-resend"
              on:click={event => invoke('resend', event)}>
              Resend OTP
            </LinkButton>
          {/if}
          {#if $allowSkip}
            <LinkButton
              id="otp-sec"
              on:click={event => invoke('secondary', event)}>
              {$skipText}
            </LinkButton>
          {:else if $allowBack}
            <LinkButton
              id="otp-sec"
              on:click={event => invoke('secondary', event)}>
              Go Back
            </LinkButton>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>
