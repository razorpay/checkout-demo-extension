<script>
  // Props
  export let horizontal = false;
  export let vertical = false;
  export let reverse = false;
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

  .stack.reverse.horizontal {
    flex-direction: row-reverse;
  }

  .stack.reverse.vertical {
    flex-direction: column-reverse;
  }
</style>

<div class="stack" class:horizontal class:vertical class:reverse>
  <slot />
</div>
