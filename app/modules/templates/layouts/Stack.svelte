<div class="stack" class:stack-horizontal="horizontal" class:stack-vertical="vertical">
  <slot></slot>
</div>

<style>
  .stack {
    display: flex;
  }

  .stack.stack-horizontal {
    flex-direction: row;
  }

  .stack.stack-vertical {
    flex-direction: column;
  }
</style>

<script>
  export default {
    data: () => ({
      horizontal: false,
      vertical: false,
    })
  }
</script>
