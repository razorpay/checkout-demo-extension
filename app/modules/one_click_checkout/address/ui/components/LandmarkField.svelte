<script lang="ts">
  // UI imports
  import AutoCompleteInput from 'one_click_checkout/address/ui/components/AutoCompleteInput.svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    ADD_LANDMARK,
    OPTIONAL,
    LANDMARK_OPTIONAL_LABEL,
  } from 'one_click_checkout/address/i18n/labels';

  // utils imports
  import { showOptimisedAddr } from 'razorpay';

  export let id;
  export let label = '';
  export let value = '';
  export let suggestionsResource;
  export let validationText = '';
  export let onSelect;
  export let onInput;
  export let onBlur;
  export let autofocus;
  export let handleValidation;
  export let showValidations = false;
  let enabledOptimisedAddr = showOptimisedAddr();
  let showLandmark = !!value;

  const handleLandmarkToggle = () => {
    showLandmark = true;
  };
</script>

{#if showLandmark || value || enabledOptimisedAddr}
  <AutoCompleteInput
    {id}
    label={enabledOptimisedAddr ? LANDMARK_OPTIONAL_LABEL : label}
    {value}
    {suggestionsResource}
    {validationText}
    on:blur={onBlur}
    on:input={onInput}
    on:select={onSelect}
    {autofocus}
    {handleValidation}
    {showValidations}
  />
{:else}
  <span
    on:click={handleLandmarkToggle}
    data-test-id="toggle-landmark-cta"
    class="show-landmark-label"
  >
    + {$t(ADD_LANDMARK)}
    <span class="optional"> {$t(OPTIONAL)} </span>
  </span>
{/if}

<style>
  .show-landmark-label {
    margin: 8px 0px;
    color: var(--highlight-color);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
  }

  .show-landmark-label .optional {
    color: #79747e;
  }
</style>
