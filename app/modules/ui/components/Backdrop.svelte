<script lang="ts">
  import {
    showBackdrop,
    hideBackdrop,
    backdropVisible,
    backdropClick,
  } from 'checkoutstore/backdrop';
  import { isCtaShown } from 'checkoutstore/cta';
  import { showFeeLabel } from 'checkoutstore/index.js';

  import { fade } from 'svelte/transition';

  export let onClick = Boolean;

  let sub = false;

  export function show() {
    showBackdrop();
    if (isCtaShown()) {
      sub = !sub;
    }
  }

  export function hide() {
    hideBackdrop();
    $showFeeLabel = true;
    if (isCtaShown()) {
      sub = !sub;
    }
  }

  export function isVisible() {
    return $backdropVisible;
  }
  function handleOnClick(event) {
    if (!$backdropClick) {
      return;
    }
    onClick(event);
  }
</script>

{#if $backdropVisible}
  <div
    id="frame-backdrop"
    class="backdrop"
    class:sub
    on:click={handleOnClick}
    transition:fade={{ duration: 200 }}
  />
{/if}

<style>
  .backdrop {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.3);
  }

  .backdrop.sub {
    bottom: -55px;
  }

  :global(.one-cc) .backdrop {
    border-radius: 0px;
  }
</style>
