<script>
  // Props
  export let horizontal = false;
  export let vertical = false;
</script>

<style>
  .stack {
    display: flex;
  }

  .stack.horizontal {
    flex-direction: row;
  }

  .stack.vertical {
    flex-direction: column;
  }
</style>

<div class="stack" class:horizontal class:vertical>
  <slot />
</div>
