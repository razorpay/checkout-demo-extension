<script>
  // Utils imports
  import { getSession } from 'sessionmanager';

  // Props
  export let method;
  export let overrideMethodCheck = false;
  export let down = false;
  export let pad = true;
  export let hasMessage = false;

  // Computed
  export let methodSupported;

  const session = getSession();

  $: methodSupported = overrideMethodCheck || session.methods[method];
</script>

{#if methodSupported}
  <div
    {down}
    id="form-{method}"
    class="tab-content showable screen"
    class:pad
    class:hasMessage>
    <slot />
  </div>
{/if}
