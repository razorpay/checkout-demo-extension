<script lang="ts">
  import { stack } from './store';
  import { popStack } from './helper';
  import Element from './Element.svelte';
  import Analytics from 'analytics';

  $: elements = $stack.filter((el, idx, array) => {
    // it's the last element, or next element is overlay, or element is overlay
    const next = array[idx + 1];
    return !next || next.overlay || el.overlay;
  });

  let ref: NavStack.ElementRef;

  export function isActive() {
    return Boolean(ref);
  }

  export function backPressed() {
    if (!ref) {
      Analytics.track('ref_not_defined_in_backpressed', {
        data: {
          stackLength: $stack.length,
        },
      });
      return;
    }
    if (!ref.preventBack?.()) {
      popStack();
    }
  }

  export function getPayload() {
    return ref.getPayload?.();
  }
</script>

{#each elements as element, i (element.component)}
  <Element isOverlay={element.overlay || false} {backPressed}>
    {#if i === elements.length - 1}
      <svelte:component
        this={element.component}
        {...element.props || {}}
        bind:this={ref}
        navstack={{
          isOverlay: element.overlay,
        }}
      />
    {:else}
      <svelte:component this={element.component} {...element.props || {}} />
    {/if}
  </Element>
{/each}
