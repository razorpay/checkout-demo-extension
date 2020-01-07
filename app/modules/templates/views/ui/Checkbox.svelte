<script>
  import Track from 'tracker';
  import Stack from 'templates/layouts/Stack.svelte';

  export let className = '';
  export let checked;
  export let id = `id_${Track.makeUid()}`;

  const htmlFor = id;
</script>

<style>
  div {
    position: relative;
  }

  label {
    cursor: pointer;
    display: block;
    min-height: 24px;
    white-space: normal;
  }

  /* Hide <input> */
  input {
    display: block;
    width: 16px;
    height: 16px;
    flex-shrink: 0;

    z-index: 0;
  }

  /* Square */
  input::before {
    content: '';

    width: 16px;
    height: 16px;
    background: #fff;
    transition: 0.2s;

    position: absolute;
    left: 0;
    top: 2px;

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
    top: 3px;
    left: 1px;

    z-index: 1;
  }
</style>

<div class={className}>
  <label for={htmlFor} class="sv-checkbox" class:checked>
    <Stack horizontal>
      <input {id} type="checkbox" on:change bind:checked />
      <slot />
    </Stack>
  </label>
</div>
