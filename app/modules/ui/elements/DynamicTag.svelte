<script lang="ts">
  export let as = 'button';
</script>

{#if as === 'button'}
  <button on:keydown on:click {...$$restProps}>
    <slot />
  </button>
{/if}

{#if as === 'div'}
  <div on:keydown on:click {...$$props}>
    <slot />
  </div>
{/if}
