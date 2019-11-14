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
    text-align: start;
    transition: border-color 0.15s linear;
  }

  div {
    flex-grow: 1;
  }

  button :global(.input-radio.slotted .radio-display) {
    position: unset;
    top: unset;
  }
</style>

<button class={className} class:selected on:click type="button">
  <Stack horizontal {reverse}>
    <slot name="icon" />
    <div>
      <slot name="title" />
      <slot name="subtitle" />
    </div>
    <Radio {name} {value} checked={selected} classes={radioClasses} />
    <slot name="extra" />
  </Stack>
</button>
