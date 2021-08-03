<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let visible = false;

  export let component;
  export let props = {};

  export function show() {
    visible = true;
    dispatch('shown');
  }

  export function hide() {
    visible = false;
    dispatch('hidden');
  }
</script>

<div id="overlay-wrap" class="overlay showable mfix" class:drishy={visible}>
  <svelte:component this={component} on:action {...props} />
</div>

<style>
  #overlay-wrap.drishy {
    display: block;
  }
</style>
