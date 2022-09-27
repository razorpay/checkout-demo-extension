<script>
  // svelte imports
  import { t } from 'svelte-i18n';

  // i18n imports
  import { CHECKBOX_LABEL } from 'one_click_checkout/customer/i18n';

  // UI Imports
  import Checkbox from 'ui/elements/Checkbox.svelte';

  // store imports
  import {
    shouldShowConsentCheckbox,
    customerConsentCheckboxState,
  } from 'one_click_checkout/customer/store';
</script>

{#if $shouldShowConsentCheckbox}
  <div class="consent-row">
    <Checkbox bind:checked={$customerConsentCheckboxState} />
    <span class="checkbox-label">{$t(CHECKBOX_LABEL)}</span>
  </div>
{/if}

<style>
  .consent-row > :global(label) {
    min-height: 0;
    max-height: 16px;
  }

  .consent-row {
    display: flex;
    margin-top: 10px;
    align-items: center;
  }

  .checkbox-label {
    color: var(--primary-text-color);
    font-size: var(--font-size-small);
  }
</style>
