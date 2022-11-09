<script lang="ts">
  // Svelte imports
  import { onMount } from 'svelte';

  import AccountTab from 'account_modal/ui/AccountTab.svelte';
  import { isRedesignV15 } from 'razorpay';
  import { onScrollToggleHeader } from 'one_click_checkout/header/helper';
  import { screenStore } from 'checkoutstore';

  // Props
  export let pad = true;
  export let threshold = 16;
  export let removeAccountTab = false;
  // Refs
  export let contentRef: HTMLDivElement;

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

    if (isContentOverflowing && !isRedesignV15()) {
      if (scrollHeight - offsetHeight - scrollTop >= threshold) {
        // Content hidden on the bottom
        bottomShadow = true;
      } else {
        // We've scrolled to the bottom
        bottomShadow = false;
      }
    } else {
      // Content doesn't overflow, no need for shadows
      bottomShadow = false;
    }

    onScrollToggleHeader(contentRef);
  }

  onMount(() => {
    onScroll();
  });
</script>

<div
  class="screen screen-comp"
  class:one-cc={isRedesignV15()}
  class:bottomShadow
  class:pad
  bind:this={contentRef}
  on:scroll={onScroll}
  class:show-scroll={$screenStore === 'upi'}
>
  <slot />
  {#if !removeAccountTab}
    <AccountTab />
  {/if}
</div>
<div class="shadow shadow-top" />
<div class="shadow shadow-bottom" />

<style lang="scss">
  .screen {
    flex: 1;
    box-sizing: border-box;
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
    position: relative;

    &.show-scroll {
      height: auto;
      min-height: 100%;
      justify-content: space-between;
      display: flex;

      :global(.account-tab) {
        transform: translate(0, 100%);
      }
    }
  }

  .one-cc {
    scroll-behavior: smooth;
    display: block;
  }

  /* @TODO */
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
  }

  .bottomShadow ~ .shadow-bottom {
    max-height: 24px;
  }
  .screen.screen-comp {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
  }

  .screen.screen-comp::-webkit-scrollbar {
    /* WebKit */
    width: 0;
    height: 0;
  }
</style>
