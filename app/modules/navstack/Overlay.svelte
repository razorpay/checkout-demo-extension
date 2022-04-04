<script lang="ts">
  import { fade } from 'svelte/transition';
  import { isCtaShown } from 'checkoutstore/cta';

  export let backPressed: () => void;
  const long = isCtaShown();

  function moveToPortal(node: HTMLDivElement) {
    const overlayParent = document.querySelector('#overlay') as HTMLDivElement;

    // add back handler only once
    const backHandling = !overlayParent.children.length;
    if (backHandling) {
      window.addEventListener('click', hide);
    }

    overlayParent.appendChild(node);

    return {
      destroy() {
        if (backHandling) {
          window.removeEventListener('click', hide);
        }
        // @ts-ignore
        _El.detach(node);
      },
    };
  }

  function hide(event: MouseEvent) {
    // if clicked element is outside overlay children, try to go back
    // using .matches instead of .closest to support IE11
    if (
      !(event.target as HTMLElement)?.matches('#overlay > div *') &&
      backPressed
    ) {
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
