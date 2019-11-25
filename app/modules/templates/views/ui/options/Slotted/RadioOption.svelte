<script>
  // UI imports
  import Stack from 'templates/layouts/Stack.svelte';
  import Radio from 'templates/views/ui/Radio.svelte';

  // Props
  export let className = '';
  export let name;
  export let value;
  export let selected = false;
  export let reverse = false;
  export let radio = true;
  export let defaultStyles = true;

  let radioClasses;
  $: {
    const _classes = ['slotted'];

    if (!radio) {
      _classes.push('hidden');
    }

    radioClasses = _classes.join(' ');
  }
</script>

<style>
  button {
    background: #ffffff;
    border: 1px solid #e6e7e8;
    display: block;
    width: 100%;
    transition-duration: 0.15s;
    transition-property: border, background;
    transition-timing-function: linear;
  }

  div {
    flex-grow: 1;
  }

  button :global(.input-radio.slotted .radio-display) {
    position: unset;
    top: unset;
  }

  .radio {
    flex-grow: 0;
    align-self: start;
  }

  .radio.reverse {
    margin-right: 12px;
  }
</style>

<button
  class={className}
  class:slotted-radio={defaultStyles}
  class:selected
  on:click
  type="button"
  role="listitem">
  <Stack horizontal {reverse}>
    <slot name="icon" />
    <div>
      <slot name="title" />
      <slot name="subtitle" />
    </div>
    <div class="radio" class:reverse>
      <Radio {name} {value} checked={selected} classes={radioClasses} />
    </div>
    <slot name="extra" />
  </Stack>
</button>
