<script>
  // Svelte imports
  import LinkButton from 'components/LinkButton.svelte';
  import { createEventDispatcher, onDestroy } from 'svelte';

  // i18n
  import { t, locale } from 'svelte-i18n';

  import { RESEND_LABEL } from 'ui/labels/otp';

  const dispatch = createEventDispatcher();

  export let id;
  export let resendTimeout = 0;

  // Local
  let interval;
  let secondsLeft = Math.floor((resendTimeout - Date.now()) / 1000);
  let secondsLeftText = secondsLeft > 0 ? `(${secondsLeft})` : '';
  let disabled = secondsLeft > 0;

  function invokeResend(event) {
    if (!disabled) {
      dispatch('resend', event);
    }
  }

  function startTimer() {
    interval = setInterval(function() {
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

  startTimer();

  onDestroy(function() {
    clearInterval(interval);
  });
</script>

<style>
  span {
    color: #000;
  }
</style>

<LinkButton {id} {disabled} on:click={event => invokeResend(event, 'resend')}>
  {$t(RESEND_LABEL)}
  {#if secondsLeftText}
    <span>{secondsLeftText}</span>
  {/if}
</LinkButton>
