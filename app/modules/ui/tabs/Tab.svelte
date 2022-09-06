<script lang="ts">
  // Utils imports
  import { isMethodEnabled } from 'checkoutstore/methods';
  import { isRedesignV15 } from 'razorpay';
  import { isTopBarHidden } from 'topbar';

  // Props
  export let method;
  export let overrideMethodCheck = false;
  export let pad = true;
  export let shown = false;
  export let hasMessage = false;
  export let resetMargin = false;

  // Computed
  export let methodSupported;
  export let pageCenter = false;

  $: methodSupported = overrideMethodCheck || isMethodEnabled(method);
</script>

{#if methodSupported}
  <div
    id="form-{method}"
    class="tab-content showable screen"
    class:drishy={shown}
    class:pageCenter
    class:pad
    class:hasMessage
    class:resetMargin
    class:tab-content-one-cc={isRedesignV15()}
    class:no-top-bar={isTopBarHidden()}
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

  .no-top-bar{
    padding-top: 0px !important;
  }

  .pageCenter {
    display: flex !important;
    align-items: center;
    justify-content: center;
  }
</style>
