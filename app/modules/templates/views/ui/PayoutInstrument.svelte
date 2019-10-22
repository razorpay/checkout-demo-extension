<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import RadioOption from 'templates/views/ui/options/RadioOption.svelte';

  // Props
  export let account;
  export let reverse = true;
  export let selected = false;
  export let icon;

  const dispatch = createEventDispatcher();
</script>

<style>
  :global(.instrument-info) {
    color: #999;
    font-size: 12px;
  }
</style>

<RadioOption
  data={account}
  name="instrument"
  {reverse}
  {selected}
  value={account.id}
  {icon}
  on:select>
  <slot />
</RadioOption>
