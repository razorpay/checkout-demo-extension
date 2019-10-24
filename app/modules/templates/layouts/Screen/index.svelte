<script>
  export let pad = true;
</script>

<style>
  div {
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
  }

  .pad {
    padding: 0 12px 12px 12px;
  }
</style>

<div class:pad>
  <slot />
</div>
