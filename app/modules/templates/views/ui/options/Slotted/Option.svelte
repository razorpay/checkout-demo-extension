<script>
  // UI imports
  import Stack from 'templates/layouts/Stack.svelte';

  // Props
  export let className = '';
  export let disabled = false;
  export let attributes = {}; // Extra attributes for the HTML element
</script>

<style>
  button {
    background: #ffffff;
    border: 1px solid #e6e7e8;
    display: block;
    width: 100%;
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
    flex-grow: 1;
    overflow: hidden;
  }
</style>

<button
  type="button"
  class={className}
  role="listitem"
  {disabled}
  on:click
  {...attributes}>
  <Stack horizontal>
    <slot name="icon" />
    <div>
      <slot name="title" />
      <slot name="subtitle" />
    </div>
    <slot name="extra" />
  </Stack>
</button>
