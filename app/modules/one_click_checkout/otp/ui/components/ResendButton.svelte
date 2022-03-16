<script>
  // Svelte imports
  import { createEventDispatcher, onDestroy } from 'svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import { RESEND_BTN, RESEND_LABEL } from 'ui/labels/otp';

  // store imports
  import { resendTimeout } from 'checkoutstore/screens/otp';

  // ui imports
  import LinkButton from 'components/LinkButton.svelte';
  import CountdownTimer from 'one_click_checkout/otp/ui/components/CountdownTimer.svelte';

  const dispatch = createEventDispatcher();

  export let id;

  // Local
  let interval;

  let initialSeconds;
  $: initialSeconds = Math.floor(($resendTimeout - Date.now()) / 1000);

  let countdownEnabled = false;
  $: countdownEnabled = initialSeconds > 0;

  function invokeResend(event) {
    dispatch('resend', event);
  }

  function handleTimerUpdate(ev) {
    let secondsLeft = ev.detail;
    if (secondsLeft <= 0 || !resendTimeout) {
      countdownEnabled = false;
    }
  }

  onDestroy(function () {
    clearInterval(interval);
  });
</script>

{#if countdownEnabled}
  <CountdownTimer
    countdown={initialSeconds}
    on:timerUpdate={handleTimerUpdate}
    width={50}
    height={50}
  />
{:else}
  <div class="resend-container">
    <span class="resend-label">{$t(RESEND_LABEL)}</span>
    <LinkButton {id} on:click={(event) => invokeResend(event, 'resend')}>
      {$t(RESEND_BTN)}
    </LinkButton>
  </div>
{/if}

<style>
  .resend-container {
    padding: 40px 0px 32px;
  }
  .resend-label {
    font-size: 16px;
  }
</style>
