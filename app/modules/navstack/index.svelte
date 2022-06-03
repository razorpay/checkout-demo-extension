<script lang="ts">
  import { lastOf } from 'utils/array';
  import { elements, overlays } from './store';
  import { popStack } from './helper';
  import Overlay from './Overlay.svelte';

  const overlayRefs: NavStack.ElementRef[] = [];
  let elementRef: NavStack.ElementRef;

  $: lastEl = lastOf($elements);
  $: overlayRefs.length = $overlays.length;

  function lastRef() {
    return lastOf(overlayRefs) || elementRef;
  }

  export function backPressed() {
    const last = lastRef();
    if (last) {
      if (!last.preventBack || !last.preventBack()) {
        popStack();
      }
    }
  }

  export function getPayload() {
    const last = lastRef();
    if (last && last.getPayload) {
      return last.getPayload();
    }
  }
</script>

{#if lastEl}
  <svelte:component
    this={lastEl.component}
    {...lastEl.props || {}}
    bind:this={elementRef}
  />
{/if}

{#each $overlays as overlay, i (overlay.component)}
  <Overlay {backPressed}>
    <svelte:component
      this={overlay.component}
      {...overlay.props || {}}
      bind:this={overlayRefs[i]}
      navstack={{
        isOverlay: overlay.overlay,
      }}
    />
  </Overlay>
{/each}
