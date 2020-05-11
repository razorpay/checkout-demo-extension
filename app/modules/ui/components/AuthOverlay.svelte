<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { getThemeColor } from 'checkoutstore/theme';
  import { getMiscIcon } from 'checkoutframe/icons';

  const dispatch = createEventDispatcher();

  function onContinue() {
    dispatch('action', {
      action: 'continue',
    });
  }
</script>

<style>
  .auth-overlay {
    display: flex;
    flex-direction: column;
    white-space: normal;
  }
  b {
    margin-bottom: 12px;
  }
  .desc {
    font-size: 12px;
    color: #555;
  }
  .btn {
    font-size: 14px;
    margin-top: 16px;
  }
</style>

<div class="auth-overlay">
  <div class="icon">
    <Icon icon={getMiscIcon('lock', getThemeColor())} />
  </div>
  <b>Bank verification required</b>
  <span class="desc">
    Click continue to complete the payment on the bank page
  </span>
  <button class="btn" on:click={onContinue}>Continue</button>
</div>
