<script lang="ts">
  import { afterUpdate, onMount, onDestroy } from 'svelte';
  import autotest from 'autotest';
  import {
    digits,
    disableCTA,
    errorMessage,
    loading,
  } from 'checkoutstore/screens/otp';
  import { showFeeLabel } from 'checkoutstore/fee';

  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { isHeadless, isWalletPayment } from 'otp/sessionInterface';
  import { Safari } from 'common/useragent';
  import type { OtpType } from 'emiV2/types';
  import { isEmiV2 } from 'razorpay';
  import { trackOtpEntered } from 'emiV2/events/tracker';
  import { getSession } from 'sessionmanager';
  import { showAccountTab } from 'checkoutstore';
  import { trackCardOTPEntered } from 'card/helper/cards';

  export let hidden;
  export let isError;
  export let onBlur;
  export let otpReason: string;

  let otpContainer;
  let focused = false;
  let autoCompleteMethod = 'new-otp'; // random string for browser to ignore autocomplete

  if (Safari) {
    autoCompleteMethod = 'one-time-code';
  }

  const isNewEmiFlow = isEmiV2();

  /**
   * Method is used to send track event when otp entering is complete
   * @param index {number} index of otp input field which fired the event
   */
  function trackInput(index) {
    const otp = $digits.join('');
    const session = getSession();

    if (!otp) {
      $showFeeLabel = false;
    }

    if (index === $digits.length - 1) {
      Analytics.track('otp:input', {
        type: AnalyticsTypes.BEHAV,
        data: {
          wallet: isWalletPayment(),
          headless: isHeadless(),
        },
      });

      trackCardOTPEntered(otpReason);

      // Track Razorpay otp entered for new emi flow
      if (isNewEmiFlow && session.tab === 'emi') {
        const otpType: OtpType = 'login';
        const showTimer = document.querySelector('#timeout');
        trackOtpEntered(!!showTimer, otpType);
      }
    }
  }

  /**
   * Method which handles input event. Enables CTA based on otp length and shifts focus to next input field
   * @param e {event} HTMLInputEvent which got fired
   * @param index {number} index of input which fired the event
   */
  function onOtpDigitInput(e, index) {
    // if invalid otp and user changes input
    if ($errorMessage) {
      $errorMessage = '';
    }

    // If user is trying to override the existing value
    if (e?.target?.value && e?.data) {
      $digits[index] = e.data;
    }

    // If user is pasting from keyboard suggestion
    if (e?.data?.length > 1) {
      const input = e.data.split('');
      for (const [i, digit] of input.entries()) {
        $digits[i] = digit;
      }
      otpContainer.children[input.length - 1].focus();
    } else if (e.target.value && index < $digits.length - 1) {
      otpContainer.children[index + 1].focus();
    }

    const otp = $digits.join('');
    if (otp.length === $digits.length) {
      disableCTA.set(false);
    } else {
      disableCTA.set(true);
    }
  }

  onMount(() => {
    const otp = $digits.join('');
    if (!otp.length) {
      disableCTA.set(true);
    }
  });

  onDestroy(() => {
    $disableCTA = false;
  });

  /**
   * Method which handles backspace/delete. To shift focus and update store
   * @param e {event} HTMLInputEvent which got fired
   * @param index {number} index of input which fired the event
   */
  function onOtpDigitKeyDown(e, index) {
    if (
      ['Backspace', 'Delete'].includes(e.key) &&
      !e.target.value &&
      index > 0
    ) {
      otpContainer.children[index - 1].focus();
      $digits[index - 1] = '';
    }
  }

  // Method to handle paste functionality in OTP
  function otpPaste(e) {
    e.preventDefault();
    const otpLength = $digits.length;
    /* Currently we are getting position of OTP Input as otp|[position]
    in id. Added a split function to identify the actual position */
    const currentInput = Number(e?.target?.id?.split('|')[1]);
    // In case we are not getting current
    if (isNaN(currentInput)) {
      return;
    }

    const pastedData = e.clipboardData
      .getData('text/plain')
      .replace(/[^\d]/g, '')
      .slice(0, otpLength - currentInput)
      .split('');

    // pasteData value will be empty if we paste the alphabets on the field.
    if (pastedData.length) {
      const nextActiveInput = currentInput + pastedData.length - 1;

      for (let pos = 0; pos < otpLength; ++pos) {
        if (pos >= currentInput && pastedData.length > 0) {
          $digits[pos] = pastedData.shift();
        }
      }

      onOtpDigitInput(e, nextActiveInput);
      otpContainer.children[nextActiveInput].focus();
    }
  }

  afterUpdate(() => {
    if (otpContainer && !focused && otpContainer.children.length) {
      otpContainer.children[0].focus();
      focused = true;
    }

    focused = !$loading;
  });
</script>

<div class="otp-container" bind:this={otpContainer} class:hidden id="otp-input">
  {#each $digits as _, i}
    <input
      data-testid={`otp[${i}]`}
      id={`otp|${i}`}
      name="otp"
      type="tel"
      pattern="[0-9]"
      class="otp-input theme-border"
      class:otp-input-small={$digits.length > 6}
      bind:value={$digits[i]}
      on:focus={() => {
        $showAccountTab = false;
        trackInput(i);
      }}
      on:input={(e) => onOtpDigitInput(e, i)}
      on:keydown={(e) => onOtpDigitKeyDown(e, i)}
      autocomplete={autoCompleteMethod}
      on:paste={otpPaste}
      class:otp-error={isError}
      on:blur={onBlur}
      on:blur={() => {
        $showAccountTab = true;
      }}
      {...autotest(`otpDigit${i + 1}`)}
    />
  {/each}
</div>

<style>
  .otp-container {
    display: flex;
    justify-content: center;
  }

  .otp-input {
    width: 44px;
    font-size: 16px;
    padding: 14px 4px;
    margin: 0px 5px;
    border: 1px solid;
    box-shadow: 0px 4px 4px rgba(166, 158, 158, 0.08);
    border-radius: 5px;
    box-sizing: border-box;
    text-align: center;
  }

  #otp-input .otp-error {
    border-color: #b21528;
  }

  .otp-input-small {
    width: 18px;
    font-size: 16px;
    line-height: 21px;
    padding: 8px 4px;
  }
</style>
