<script lang="ts">
  import { fade } from 'svelte/transition';
  import { isCtaShown } from 'checkoutstore/cta';

  export let backPressed: () => void;
  const long = isCtaShown();
  let respondOutsideClick = false;

  function moveToPortal(node: HTMLDivElement) {
    const overlayParent = document.querySelector('#overlay') as HTMLDivElement;

    const backHandling = !overlayParent.children.length;
    // add back handler only once
    if (backHandling) {
      window.addEventListener('click', hide);

      // wait a bit before responding to outside clicks
      // avoids closing overlay in same click which opened it due to bubbling
      setTimeout(() => {
        respondOutsideClick = true;
      });
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
      respondOutsideClick &&
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
