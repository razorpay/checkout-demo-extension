<script>
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    CUSTOM_TAG_CTA_LABEL,
    CUSTOM_TAG_LABEL,
  } from 'one_click_checkout/address/i18n/labels';

  // UI Imports
  import Field from 'ui/components/Field.svelte';
  import Tag from 'one_click_checkout/address/ui/elements/Tag.svelte';

  // Constant imports
  import { tagLabels } from 'one_click_checkout/address/constants';

  export let selectedTag;

  let inputRef;
  let showTagInput = false;

  const dispatch = createEventDispatcher();

  $: showTagInput = !['Home', 'Office'].includes(selectedTag);
  $: {
    if (showTagInput) {
      inputRef?.focus();
    }
  }

  function onCancel() {
    selectedTag = 'Home';
  }
</script>

<div class="tag-selector-container">
  {#each tagLabels as label}
    <Tag
      onSelect={() => dispatch('select', { label })}
      {label}
      selected={label === 'Others' && showTagInput
        ? true
        : selectedTag === label}
    />
  {/each}
</div>
{#if showTagInput}
  <Field
    id="custom-tag"
    name="custom-tag"
    labelClasses="address-label"
    elemClasses="address-elem"
    bind:this={inputRef}
    label={$t(CUSTOM_TAG_LABEL)}
    on:input={(e) => dispatch('select', { label: e.target.value })}
  />
{/if}

<style>
  .tag-selector-container {
    display: flex;
    flex-direction: row;
    padding: 8px 0;
  }
</style>
