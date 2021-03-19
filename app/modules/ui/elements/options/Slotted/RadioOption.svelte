<script>
  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';
  import Radio from 'ui/elements/Radio.svelte';
  import DynamicTag from 'ui/elements/DynamicTag.svelte';

  // Transitions
  import { fade } from 'svelte/transition';
  import { getAnimationOptions } from 'svelte-utils';

  // Props
  export let className = '';
  export let name;
  export let value;
  export let selected = false;
  export let reverse = false;
  export let radio = true;
  export let align = 'center';
  export let defaultStyles = true;
  export let ellipsis = false; // Should we truncate the text?
  export let attributes = {};
  export let overflow = false;
  export let expandOnSelect = false;
  export let as = 'button';

  let radioClasses;
  $: {
    const _classes = ['slotted'];

    if (!radio) {
      _classes.push('hidden');
    }

    radioClasses = _classes.join(' ');
  }

  let elementClass = `${className} radio-option`;

  $: {
    if(ellipsis) {
      elementClass += ' ellipsis';
    }
    if(defaultStyles) {
      elementClass += ' slotted-radio';
    }
    if(selected) {
      elementClass += ' selected';
    }
    if(overflow) {
      elementClass += ' overflow';
    }
    if(as === 'div') {
      elementClass += ' div-element';
    }
  }
</script>

<style>
  :global(.radio-option) {
    background: #ffffff;
    border: 1px solid #e6e7e8;
    width: 100%;
    display: block;
    transition-duration: 0.15s;
    transition-property: border, background;
    transition-timing-function: linear;
    cursor: pointer;
  }

  :global(.div-element) {
    width: auto;
  }

  div {
    flex-grow: 1;
  }

  :global(.radio-option .input-radio.slotted .radio-display) {
    position: static;
    top: 0;

    position: unset;
    top: unset;
  }

  .radio {
    flex-grow: 0;
  }

  .radio.top {
    align-self: start;
  }

  .radio.reverse {
    margin-right: 12px;
  }
  :global(.radio-option.overflow) {
    overflow: visible;
  }
</style>

<DynamicTag
  class={elementClass}
  as={as}
  on:click
  on:keydown
  type="button"
  role="listitem"
  {...attributes}>
  <Stack horizontal {reverse}>
    <slot name="icon" />
    <div>
      <slot name="title" />
      <slot name="subtitle" />
      {#if expandOnSelect}
        {#if selected}
          <div in:fade|local={getAnimationOptions({ duration: 100, y: 100 })}>
            <slot name="body" />
          </div>
        {/if}
      {:else}
        <slot name="body" />
      {/if}
    </div>
    <div class="radio" class:reverse class:top={align === 'top'}>
      <Radio
        {name}
        {value}
        checked={selected}
        classes={radioClasses}
        tabindex={-1} />
    </div>
    <slot name="extra" />
  </Stack>
</DynamicTag>
