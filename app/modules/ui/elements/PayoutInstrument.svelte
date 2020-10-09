<script>
  // UI imports
  import DeprecatedRadioOption from 'ui/elements/options/DeprecatedRadioOption.svelte';

  // Props
  export let account;
  export let selected = false;
</script>

<style>
  :global(.instrument-info) {
    color: #999;
    font-size: 12px;
  }
</style>

<DeprecatedRadioOption
  data={account}
  name="instrument"
  reverse={true}
  {selected}
  value={account.id}
  on:select>
  <slot />
</DeprecatedRadioOption>
