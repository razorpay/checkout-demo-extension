<script lang="ts">
  // UI imports
  import Field from 'ui/components/Field.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    GSTIN_LABEL,
    OPTIONAL,
    ADD_GSTIN,
    INVALID_GSTIN,
  } from 'one_click_checkout/gstin/i18n/labels';

  // store imports
  import { gstIn, isGstInValid } from 'one_click_checkout/gstin/store';

  // analytics imports
  import { Events } from 'analytics';
  import GSTINEvents from 'one_click_checkout/gstin/analytics';

  // utils imports
  import { checkPatternMatching } from 'one_click_checkout/common/utils';

  // constants imports
  import {
    GSTIN_REGEX_PATTERN,
    GSTIN,
  } from 'one_click_checkout/gstin/constants';

  import type { errorType } from 'one_click_checkout/gstin/types';

  let showGSTIN = !!$gstIn;
  let error: errorType = '';
  let inputField: Field;

  const handleGSTINToggle = () => {
    Events.TrackBehav(GSTINEvents.ADD_GSTIN_CLICKED);
    showGSTIN = true;
    Events.TrackRender(GSTINEvents.GSTIN_FIELD_SHOWN);
  };

  const handleInput = (evt: Event) => {
    const value = (<HTMLInputElement>evt.target)?.value;
    const isFieldValueValid = checkPatternMatching({
      value,
      pattern: GSTIN_REGEX_PATTERN,
    });
    error = !isFieldValueValid && value ? $t(INVALID_GSTIN) : '';
    $isGstInValid = !error;
    $gstIn = value;
  };

  const handleBlur = () => {
    Events.TrackBehav(GSTINEvents.GSTIN_ENTERED);
  };
</script>

{#if showGSTIN || !!$gstIn}
  <div class="gstin-field">
    <Field
      bind:this={inputField}
      on:mount={() => inputField.focus()}
      id={GSTIN}
      name={GSTIN}
      required
      validationText={error}
      pattern={GSTIN_REGEX_PATTERN}
      value={$gstIn}
      label={`${$t(GSTIN_LABEL)}`}
      on:blur={handleBlur}
      on:input={handleInput}
    />
  </div>
{:else}
  <span
    on:click={handleGSTINToggle}
    data-test-id="toggle-gstin-cta"
    class="gstin-label"
  >
    + {$t(ADD_GSTIN)}
    <span class="optional"> {$t(OPTIONAL)} </span>
  </span>
{/if}

<style>
  .gstin-field > :global(.elem-one-click-checkout) {
    width: 100%;
  }

  .gstin-label {
    display: block;
    margin: 0;
    color: var(--primary-color);
    cursor: pointer;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
  }

  .gstin-label .optional {
    color: var(--secondary-text-color);
    font-weight: var(--font-weight-regular);
  }
</style>
