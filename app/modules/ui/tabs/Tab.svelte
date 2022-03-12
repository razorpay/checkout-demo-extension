<script>
  // Utils imports
  import { isMethodEnabled } from 'checkoutstore/methods';
  import { isOneClickCheckout } from 'razorpay';

  // Props
  export let method;
  export let overrideMethodCheck = false;
  export let pad = true;
  export let shown = false;
  export let hasMessage = false;
  export let resetMargin = false;

  // Computed
  export let methodSupported;

  $: methodSupported = overrideMethodCheck || isMethodEnabled(method);
</script>

{#if methodSupported}
  <div
    id="form-{method}"
    class="tab-content showable screen"
    class:drishy={shown}
    class:pad
    class:hasMessage
    class:resetMargin
    class:tab-content-one-cc={isOneClickCheckout()}
  >
    <slot />
  </div>
{/if}

<style>
  .resetMargin {
    margin-top: 0;
  }

  .tab-content-one-cc {
    margin-top: 0px;
  }
</style>
