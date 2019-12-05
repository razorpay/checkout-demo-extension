<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import NextOption from 'templates/views/ui/options/NextOption.svelte';
  import Tooltip from 'templates/views/ui/Tooltip.svelte';

  // Props
  export let method;
  export let down;
  export let icon;
  export let title;
  export let downMessage;

  // Computed
  export let classes;

  const dispatch = createEventDispatcher();

  $: {
    const _classes = [];

    if (down) {
      _classes.push('has-tooltip');
    }

    classes = _classes;
  }

  export function selectMethod() {
    dispatch('select', {
      down,
      method,
    });
  }
</script>

<NextOption
  attributes={{ down, tab: method }}
  data={method}
  {icon}
  {classes}
  on:select={selectMethod}>
  <span class="title">{title}</span>
  {#if down}
    <span class="downtime">
      <Tooltip
        bindTo="#list-options"
        className="downtime-tooltip"
        align={['top', 'right']}>
        {downMessage}
      </Tooltip>
    </span>
  {/if}
</NextOption>
