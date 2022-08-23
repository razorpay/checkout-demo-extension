<script lang="ts">
  import { fade } from 'svelte/transition';
  import * as _El from 'utils/DOM';
  import { isRedesignV15 } from 'razorpay';

  export let backPressed: () => void;
  const long = !isRedesignV15() && _El.hasClass(document.body, 'sub');

  // this function is invoked only within modal area
  // backdrop element inside MainModal will handle click outside the modal area
  function hide(event: MouseEvent) {
    // if `#overlay > div` was the target
    const outsideClick = event.target === event.currentTarget;

    if (outsideClick && backPressed) {
      backPressed();
    }
  }
</script>

<div transition:fade={{ duration: 200 }} class:long on:click={hide}>
  <slot />
</div>

<style lang="css">
  :global(#container:not(.mobile)) .long {
    height: calc(100% + 55px);
  }
</style>
