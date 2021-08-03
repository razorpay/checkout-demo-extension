<script>
  // Utils imports
  import { isMethodEnabled } from 'checkoutstore/methods';

  // Props
  export let method;
  export let overrideMethodCheck = false;
  export let pad = true;
  export let shown = false;
  export let hasMessage = false;

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
  >
    <slot />
  </div>
{/if}
