<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Option from 'templates/views/ui/options/Option.svelte';
  import OptionIcon from 'templates/views/ui/options/OptionIcon.svelte';

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

<Option
  {data}
  {attributes}
  {classes}
  {tabindex}
  type="next-option {type}"
  on:select={select}>
  {#if icon}
    <OptionIcon {icon} />
  {/if}
  <div class="option-title">
    <slot />
  </div>
  {#if arrowText}
    <div class="option-arrow-text theme-highlight">{arrowText}</div>
  {/if}
</Option>
