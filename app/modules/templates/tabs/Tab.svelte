<script>
  // Utils imports
  import { getSession } from 'sessionmanager';

  // Props
  export let method;
  export let overrideMethodCheck = false;
  export let down = false;
  export let pad = true;

  // Computed
  export let methodSupported;

  const session = getSession();

  $: methodSupported = overrideMethodCheck || session.methods[method];
</script>

{#if methodSupported}
  <div class="tab-content showable screen" id="form-{method}" class:pad {down}>
    <slot />
  </div>
{/if}
