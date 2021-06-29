<script>
  // UI imports
  import { Track } from 'analytics';
  import Stack from 'ui/layouts/Stack.svelte';

  // Props
  export let checked;
  export let id = `id_${Track.makeUid()}`; // Generate a random ID if one isn't provided
  export let required = false;
  export let helpText = '';

  // `for` attrib for the label should be same as the ID
  const htmlFor = id;

  function handleInputFocus(event) {
    focused = true;
  }

  function handleInputBlur(event) {
    focused = false;
  }

  let focused = false;
</script>

<label
  for={htmlFor}
  class="sv-checkbox"
  class:checked
  class:focused
  class:invalid={required && !checked}
>
  <Stack inline horizontal>
    <input
      {id}
      type="checkbox"
      on:change
      bind:checked
      {required}
      on:focus={handleInputFocus}
      on:blur={handleInputBlur}
    />
    <slot />
  </Stack>
  {#if helpText}
    <div class="help">{helpText}</div>
  {/if}
</label>

<style>
  label {
    cursor: pointer;
    min-height: 24px;
    white-space: normal;
  }

  /* Hide <input> */
  input {
    display: block;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    position: relative;
    margin: 0;
    margin-right: 6px;

    z-index: 0;
  }

  /* Square */
  input::before {
    content: '';

    background: #fff;
    transition: 0.2s;

    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;

    z-index: 1;
  }

  /* Tick mark */
  input::after {
    content: '';

    width: 4px;
    height: 9px;

    border: 1px solid #fff;
    border-left: 0;
    border-top: 0;

    transition: 0.2s;
    transform: rotate(40deg) translate(5px, -2px);

    position: absolute;
    top: 0;
    left: 0;

    cursor: pointer;
    z-index: 1;
  }
</style>
