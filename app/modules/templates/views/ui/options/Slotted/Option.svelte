<script>
  // UI imports
  import Stack from 'templates/layouts/Stack.svelte';

  // Props
  export let className = '';
</script>

<style>
  button {
    background: #ffffff;
    border: 1px solid #e6e7e8;
    display: block;
    width: 100%;
    text-align: start;
    transition: border-color 0.15s linear;
  }

  div {
    flex-grow: 1;
    overflow: hidden;
  }
</style>

<button
  type="button"
  class={className}
  class:hoverbg={true}
  role="listitem"
  on:click>
  <Stack horizontal>
    <slot name="icon" />
    <div>
      <slot name="title" />
      <slot name="subtitle" />
    </div>
    <slot name="extra" />
  </Stack>
</button>
