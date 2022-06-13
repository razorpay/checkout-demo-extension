<script lang="ts">
  import { overlays, overlaysRef } from './store';
  import Overlay from './Overlay.svelte';
  import { backPressed } from './helper';
</script>

<div id="overlay">
  {#each $overlays as overlay, i (overlay.component)}
    <Overlay {backPressed}>
      <svelte:component
        this={overlay.component}
        {...overlay.props || {}}
        bind:this={$overlaysRef[i]}
        navstack={{
          isOverlay: overlay.overlay,
        }}
      />
    </Overlay>
  {/each}
</div>
