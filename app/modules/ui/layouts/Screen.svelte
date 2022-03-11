<script>
  // Svelte imports
  import { onMount } from 'svelte';

  import AccountTab from 'one_click_checkout/account_modal/ui/AccountTab.svelte';
  // Props
  export let pad = true;
  export let threshold = 16;

  // Refs
  let contentRef;

  let topShadow = false;
  let bottomShadow = false;

  /**
   * Figure out if shadows need to be shown
   */
  function onScroll() {
    if (!contentRef) {
      return;
    }

    const {
      offsetHeight, // Visible height of the element
      scrollHeight, // Actual height of the element
      scrollTop, // How much has already been scrolled
    } = contentRef;

    const isContentOverflowing = scrollHeight > offsetHeight;

    if (isContentOverflowing) {
      if (scrollHeight - offsetHeight - scrollTop >= threshold) {
        // Content hidden on the bottom
        bottomShadow = true;
      } else {
        // We've scrolled to the bottom
        bottomShadow = false;
      }

      if (scrollTop >= threshold) {
        // Content hidden on the top
        topShadow = true;
      } else {
        // We've scrolled to the top
        topShadow = false;
      }
    } else {
      // Content doesn't overflow, no need for shadows
      topShadow = false;
      bottomShadow = false;
    }
  }

  onMount(() => {
    onScroll();
  });
</script>

<div
  class="screen screen-comp"
  class:bottomShadow
  class:pad
  bind:this={contentRef}
  on:scroll={onScroll}
>
  <slot />
  <AccountTab />
</div>
<div class="shadow shadow-top" />
<div class="shadow shadow-bottom" />

<style>
  .screen {
    flex: 1;
    box-sizing: border-box;
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
    position: relative;
  }

  /* @TODO */
  .screen-bottom:not(.noShadow) > :global([slot='bottom']:not(:empty)) {
    box-shadow: 0px -6px 26px -17px rgba(0, 0, 0, 0.75);
  }

  .shadow {
    position: absolute;
    transition: max-height 0.3s cubic-bezier(0.14, 1.12, 0.44, 0.93);
    height: 32px;
    max-height: 0px;
    left: 0;
    width: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .shadow-top {
    top: 0;
    /* background: linear-gradient(
      0deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(0, 0, 0, 0.2) 100%
    ); */
    background: linear-gradient(
      0deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.43881302521008403) 51%,
      rgba(255, 255, 255, 0.8309698879551821) 82%,
      rgba(255, 255, 255, 0.8477766106442577) 100%
    );
  }

  .shadow-bottom {
    bottom: 0;
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    /* background: linear-gradient(0deg, rgba(255,255,255,0.8477766106442577) 0%, rgba(255,255,255,0.8309698879551821) 51%, rgba(255,255,255,0.43881302521008403) 82%, rgba(255,255,255,0) 100%); */
  }

  .topShadow ~ .shadow-top {
    max-height: 24px;
  }

  .bottomShadow ~ .shadow-bottom {
    max-height: 24px;
  }
</style>
