<script lang="ts">
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import DeprecatedOption from 'ui/elements/options/DeprecatedOption.svelte';
  import OptionIcon from 'ui/elements/options/OptionIcon.svelte';

  // Props
  export let data = {};
  export let attributes = {};
  export let classes = [];
  export let tabindex = -1;
  export let type = '';
  export let icon = null;
  export let arrowText = null;

  const dispatch = createEventDispatcher();

  export function select() {
    dispatch('select', data);
  }
</script>

<DeprecatedOption
  {data}
  {attributes}
  {classes}
  {tabindex}
  type="next-option {type}"
  on:select={select}
>
  {#if icon}
    <OptionIcon {icon} />
  {/if}
  <div class="option-title">
    <slot />
  </div>
  {#if arrowText}
    <div class="option-arrow-text theme-highlight">{arrowText}</div>
  {/if}
</DeprecatedOption>
