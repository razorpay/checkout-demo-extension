<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { getThemeColor } from 'checkoutstore/theme';
  import { getMiscIcon } from 'checkoutframe/icons';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    BANK_VERIFICATION_ACTION_CONTINUE,
    BANK_VERIFICATION_DESCRIPTION,
    BANK_VERIFICATION_TITLE,
  } from 'ui/labels/card';

  const dispatch = createEventDispatcher();

  function onContinue() {
    dispatch('action', {
      action: 'continue',
    });
  }
</script>

<div class="auth-overlay">
  <div class="icon">
    <Icon icon={getMiscIcon('lock', getThemeColor())} />
  </div>
  <!-- LABEL: Bank verification required -->
  <b>{$t(BANK_VERIFICATION_TITLE)}</b>
  <span class="desc">
    <!-- LABEL: Click continue to complete the payment on the bank page -->
    {$t(BANK_VERIFICATION_DESCRIPTION)}
  </span>
  <button class="btn" on:click={onContinue}>
    <!-- LABEL: Continue -->
    {$t(BANK_VERIFICATION_ACTION_CONTINUE)}
  </button>
</div>

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
