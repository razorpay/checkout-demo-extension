<script>
  import { isOneClickCheckout } from 'razorpay';
  import { fade } from 'svelte/transition';

  export let visible;
</script>

<div
  class="backdrop"
  class:backdrop-one-cc={isOneClickCheckout()}
  class:visible
  on:click
  transition:fade={{ duration: 200 }}
>
  <slot />
</div>

<style>
  .backdrop {
    position: absolute;
    display: none;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.3);
  }

  .backdrop-one-cc {
    background: rgba(7, 38, 84, 0.4);
  }
  .visible {
    display: block;
  }
</style>
