<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // Props
  export let type;
  export let classes = [];
  export let reverse = false;
  export let tabindex = -1;
  export let attributes = {};
  export let data = {};

  // Computed
  export let optionClasses;

  // Refs
  export let container = null;

  const dispatch = createEventDispatcher();

  $: {
    const defaultClasses = ['option'];

    if (type) {
      defaultClasses.push(type);
    }

    if (reverse) {
      defaultClasses.push('reverse');
    }

    optionClasses = defaultClasses.concat(classes).join(' ');
  }

  /**
   * When the element is focused on,
   * and the user wants to select it,
   * the user will press Space or Enter.
   *
   * Simulate a "select" event when this happens.
   */
  function selectOnKeydown(event) {
    /**
     * If the element has more focusable elements
     * inside it, pressing space on them will also
     * invoke this function.
     * So, make sure that the element that currently
     * has focus is the same as the container.
     */
    if (container !== document.activeElement) {
      return;
    }

    const key = _.getKeyFromEvent(event);

    // 13 = Return, 32 = Space
    if (key === 13 || key === 32) {
      select();
    }
  }

  export function select() {
    dispatch('select', data);
  }
</script>

<div
  class={optionClasses}
  {tabindex}
  {...attributes}
  on:click={select}
  on:keydown={selectOnKeydown}
  bind:this={container}
>
  <slot />
</div>
