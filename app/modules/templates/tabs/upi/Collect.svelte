<script>
  // Svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import Field from 'templates/views/ui/Field.svelte';
  import Card from 'templates/views/ui/Card.svelte';

  // Util imports
  import { VPA_REGEX } from 'common/constants';

  // Props
  export let appId;
  export let selected = true;
  export let selectedApp;
  export let vpa;
  export let pspHandle;
  export let focusOnCreate = false;

  // Refs
  export let vpaField;

  // Computed
  export let pattern;

  function isVpaValid(vpa) {
    return VPA_REGEX.test(vpa);
  }

  const PATTERN_WITH_HANDLE = '.+@.+';
  const PATTERN_WITHOUT_HANDLE = '.+';

  onMount(() => {
    if (focusOnCreate) {
      focus();
    }
  });

  export function handleCardClick(event) {
    const target = event && event.target;

    vpaField.focus();
  }

  export function getVpa() {
    const vpa = vpaField.getValue();
    if (isVpaValid(vpa)) {
      return vpa;
    }
    return `${vpaField.getValue()}@${pspHandle}`;
  }

  export function blur() {
    vpaField.blur();
  }

  export function focus() {
    vpaField.focus();
  }

  $: pattern = appId ? PATTERN_WITHOUT_HANDLE : PATTERN_WITH_HANDLE;
</script>

<style>
  .ref-pspName {
    color: #424242;
    position: absolute;
    top: 12px;
    right: 12px;
    line-height: 40px;
    z-index: 1;
  }
</style>

<div class="legend left" style="margin-top: 18px">Enter your UPI ID</div>
<Card {selected} on:click={handleCardClick}>
  <div id="vpa-wrap" class={appId}>
    <!-- TODO: use formatter for validation once all fields
      are moved to `Field` -->
    <Field
      formatter={{ type: 'vpa' }}
      helpText="Please enter a valid VPA of theform username@bank"
      id="vpa"
      name="vpa"
      {pattern}
      placeholder={selectedApp ? '' : 'Enter your UPI Address'}
      required={true}
      type="text"
      value={selectedApp === null ? vpa : ''}
      on:blur
      bind:this={vpaField} />
    {#if pspHandle}
      <div class="ref-pspName">@{pspHandle}</div>
    {/if}
  </div>
</Card>
