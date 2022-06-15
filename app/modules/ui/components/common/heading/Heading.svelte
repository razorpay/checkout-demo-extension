<script>
  let props = $$props;
</script>

<h3 on:click {...props}>
  <slot />
</h3>

<style>
  h3 {
    cursor: pointer;
    user-select: none;
    pointer-events: all;
  }
</style>
