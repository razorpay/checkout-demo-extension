<script>
  // Svelte imports
  import LinkButton from 'components/LinkButton.svelte';
  import { createEventDispatcher, onDestroy } from 'svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import { RESEND_LABEL } from 'ui/labels/otp';

  // store imports
  import { resendTimeout } from 'checkoutstore/screens/otp';

  // utils imports
  import { isOneClickCheckout } from 'razorpay';
  import { formatToMMSS } from 'utils/date';

  const dispatch = createEventDispatcher();

  export let id;

  // Local
  let interval;

  let secondsLeft;
  $: secondsLeft = Math.floor(($resendTimeout - Date.now()) / 1000);

  let secondsLeftText;
  $: secondsLeftText = secondsLeft > 0 ? `(${secondsLeft})` : '';

  let disabled = false;
  $: disabled = secondsLeft > 0 && isOneClickCheckout();

  function invokeResend(event) {
    if (!disabled) {
      dispatch('resend', event);
    }
  }

  function startTimer() {
    interval = setInterval(function () {
      secondsLeft--;
      if (secondsLeft > 0 && resendTimeout) {
        secondsLeftText = ` (${secondsLeft})`;
      } else {
        disabled = false;
        secondsLeftText = '';
        clearInterval(interval);
      }
    }, 1000);
  }

  // No need to call startTimer if the button is not disabled
  $: {
    if (disabled) {
      startTimer();
    }
  }

  onDestroy(function () {
    clearInterval(interval);
  });
</script>

{#if disabled}
  <div class="timer-container">
    <div class="spinner" />
    <span>{formatToMMSS(secondsLeft)}</span>
  </div>
{:else}
  <LinkButton
    {id}
    {disabled}
    on:click={(event) => invokeResend(event, 'resend')}
  >
    {$t(RESEND_LABEL)}
    {#if secondsLeftText}<span>{secondsLeftText}</span>{/if}
  </LinkButton>
{/if}

<style>
  .timer-container {
    display: flex;
    align-items: center;
  }
</style>
