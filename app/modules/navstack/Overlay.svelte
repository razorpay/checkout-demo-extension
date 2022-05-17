<script lang="ts">
  import { fade } from 'svelte/transition';
  import { isCtaShown } from 'checkoutstore/cta';
  import * as _El from 'utils/DOM';
  import { isOneClickCheckout } from 'razorpay';

  export let backPressed: () => void;
  const long = !isOneClickCheckout() && isCtaShown();

  function moveToPortal(node: HTMLDivElement) {
    const overlayParent = document.querySelector('#overlay') as HTMLDivElement;
    const backHandling = !overlayParent.children.length;

    // add back handler only once
    if (backHandling) {
      // it is sufficient to keep click listener on #overlay,
      // since backdrop in MainModal will handle click outside overlayParent
      overlayParent.addEventListener('click', hide);
    }

    overlayParent.appendChild(node);

    return {
      destroy() {
        if (backHandling) {
          overlayParent.removeEventListener('click', hide);
        }
        _El.detach(node);
      },
    };
  }

  // if clicked element is outside overlay children, try to go back
  function hide(event: MouseEvent) {
    // if #overlay > div was the target, i.e. e.target.parent is #overlay
    const outsideClick = event.target.parentNode === event.currentTarget;

    if (outsideClick && backPressed) {
      backPressed();
    }
  }
</script>

<div use:moveToPortal transition:fade={{ duration: 200 }} class:long>
  <slot />
</div>

<style lang="css">
  :global(#container:not(.mobile)) .long {
    height: calc(100% + 55px);
  }
</style>
