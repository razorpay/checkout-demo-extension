<script>
  import { digits, disableCTA } from 'checkoutstore/screens/otp';
  import { showFeeLabel } from 'checkoutstore/index.js';

  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import {
    isHeadless,
    isWalletPayment,
  } from 'one_click_checkout/otp/sessionInterface';
  import { Safari } from 'common/useragent';

  export let hidden;
  export let isError;
  export let onBlur;

  let otpContainer;
  let autoCompleteMethod = 'new-otp'; // random string for browser to ignore autocomplete

  if (Safari) {
    autoCompleteMethod = 'one-time-code';
  }

  /**
   * Method is used to send track event when otp entering is complete
   * @param index {number} index of otp input field which fired the event
   */
  function trackInput(index) {
    const otp = $digits.join('');

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
    }
  }

  /**
   * Method which handles input event. Enables CTA based on otp length and shifts focus to next input field
   * @param e {event} HTMLInputEvent which got fired
   * @param index {number} index of input which fired the event
   */
  function onOtpDigitInput(e, index) {
    const otp = $digits.join('');
    if (otp.length === $digits.length) {
      disableCTA.set(false);
    } else {
      disableCTA.set(true);
    }
    if (e.target.value && index < $digits.length - 1) {
      otpContainer.children[index + 1].focus();
    }
  }

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

    const nextActiveInput = currentInput + pastedData.length - 1;

    for (let pos = 0; pos < otpLength; ++pos) {
      if (pos >= currentInput && pastedData.length > 0) {
        $digits[pos] = pastedData.shift();
      }
    }

    onOtpDigitInput(e, nextActiveInput);
    otpContainer.children[nextActiveInput].focus();
  }
</script>

<!-- TODO: Figure out autofill. -->
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
      maxlength="1"
      bind:value={$digits[i]}
      on:focus={() => trackInput(i)}
      on:input={(e) => onOtpDigitInput(e, i)}
      on:keydown={(e) => onOtpDigitKeyDown(e, i)}
      autocomplete={autoCompleteMethod}
      on:paste={otpPaste}
      class:otp-error={isError}
      on:blur={onBlur}
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
