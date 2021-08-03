<script>
  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';

  // Props
  export let className = '';
  export let disabled = false;
  export let id;
  export let defaultStyles = true;
  export let attributes = {};

  $: {
    disabled = disabled ? true : undefined;
  }
</script>

<button
  type="button"
  class={className}
  class:slotted-option={defaultStyles}
  role="listitem"
  {disabled}
  {id}
  {...attributes}
  on:click
>
  <Stack horizontal>
    <slot name="icon" />
    <div>
      <slot name="title" />
      <slot name="subtitle" />
    </div>
    <slot name="extra" />
  </Stack>
  <slot name="banner" />
</button>

<style>
  button {
    background: #ffffff;
    border: 1px solid #e6e7e8;
    display: block;
    width: 100%;

    /* Fallback for IE */
    text-align: left;
    text-align: start;

    transition-duration: 0.15s;
    transition-property: border, background;
    transition-timing-function: linear;
  }

  button:disabled {
    background-color: #f7f7f7;
    cursor: not-allowed;
  }

  button:disabled > :global(.stack > [slot='icon']) {
    opacity: 0.3;
  }

  div {
    overflow: hidden;
  }
</style>
