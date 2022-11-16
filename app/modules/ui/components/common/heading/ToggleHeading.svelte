<script lang="ts">
  import Heading from 'ui/components/common/heading/Heading.svelte';

  export let expanded = false;
  let props = {};

  $: ({ expanded, ...props } = $$props);
</script>

<Heading on:click {...props}>
  <slot />
  <i class="arrow" class:arrow-up={expanded} class:arrow-down={!expanded} />
</Heading>

<style>
  .arrow {
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
    margin-left: 6px;
  }
  .arrow-up {
    transform: rotate(-135deg);
  }
  .arrow-down {
    transform: translateY(-4px) rotate(45deg);
  }
</style>
