<script lang="ts">
  // Props
  export let horizontal = false;
  export let vertical = false;
  export let reverse = false;
  export let inline = false;
</script>

<div class="stack" class:horizontal class:vertical class:reverse class:inline>
  <slot />
</div>

<style>
  .stack {
    display: flex;
  }

  .stack.inline {
    display: inline-flex;
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
