<script>
  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';

  // Props
  export let className = '';
  export let disabled = false;
  export let id;
  export let defaultStyles = true;
  export let attributes = {};
  export let withRow = false;

  /**
   * since the Stack component already uses display: flex
   * this can be used to display elements that we want at the
   * horizontal end of the Option end instead of just after the
   * div containing the title, subtitle and error slots
   */
  export let flexGrow = false;

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
  {#if !withRow}
    <Stack horizontal>
      <slot name="icon" />
      <div class:grow={flexGrow}>
        <slot name="title" />
        <slot name="subtitle" />
        <slot name="error" />
      </div>
      <slot name="extra" />
    </Stack>
  {:else}
    <Stack vertical>
      <Stack horizontal>
        <slot name="icon" />
        <div class:grow={flexGrow}>
          <slot name="title" />
          <slot name="subtitle" />
          <slot name="error" />
        </div>
        <slot name="extra" />
      </Stack>
      <slot name="row" />
    </Stack>
  {/if}
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
    cursor: not-allowed;
  }

  button:disabled > :global(.stack > [slot='icon']) {
    opacity: 0.4;
  }

  div {
    overflow: hidden;
  }

  .grow {
    flex-grow: 1;
  }
</style>
