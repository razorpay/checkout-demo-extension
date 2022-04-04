<script lang="ts">
  import Overlay from './Overlay.svelte';

  export let isOverlay: boolean;
  export let backPressed: () => void;
</script>

{#if isOverlay}
  <Overlay {backPressed}>
    <slot />
  </Overlay>
{:else}
  <slot />
{/if}
