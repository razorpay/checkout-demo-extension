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

  .screen-bottom:not(:empty) {
    box-shadow: 0px -6px 26px -17px rgba(0, 0, 0, 0.75);
  }
</style>

<div class:pad>
  <slot />
</div>
