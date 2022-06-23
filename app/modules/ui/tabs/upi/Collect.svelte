<script lang="ts">
  // Svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import Field from 'ui/components/Field.svelte';
  import Card from 'ui/elements/Card.svelte';

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
  export let vpaField = null;

  // Computed
  export let pattern;
  let vpaValue;

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

  export function getVpa() {
    const vpa = vpaValue;
    if (isVpaValid(vpa) || !pspHandle) {
      return vpa;
    }
    return `${vpa}@${pspHandle}`;
  }

  export function blur() {
    vpaField.blur();
  }

  export function focus() {
    vpaField.focus();
  }

  $: pattern = appId ? PATTERN_WITHOUT_HANDLE : PATTERN_WITH_HANDLE;
</script>

<div class="legend left" style="margin-top: 18px">Enter your UPI ID</div>
<Card {selected} on:click={focus}>
  <div id="vpa-wrap" class={appId}>
    <!-- TODO: use formatter for validation once all fields
      are moved to `Field` -->
    <Field
      formatter={{ type: 'vpa' }}
      helpText="Please enter a valid VPA of the form username@bank"
      id="vpa"
      name="vpa"
      {pattern}
      placeholder={selectedApp ? '' : 'Enter your UPI Address'}
      required={true}
      type="text"
      value={selectedApp === null ? vpa : ''}
      on:blur
      bind:this={vpaField}
      bind:readonlyValue={vpaValue}
    />
    {#if pspHandle}
      <div class="ref-pspName">@{pspHandle}</div>
    {/if}
  </div>
</Card>

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
