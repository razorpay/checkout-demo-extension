<script>
  export let pad = true;
</script>

<style>
  .screen {
    height: 100%;
    overflow: auto;
    box-sizing: border-box;

    padding: 0;

    display: flex;
    flex-direction: column;
  }

  .screen-main {
    flex-grow: 1;
    overflow: auto;
  }

  .screen-main.pad {
    padding: 0 12px 12px;
  }

  .screen-bottom {
    flex-shrink: 0;
  }
</style>

<div class="screen">
  <div class="screen-main" class:pad>
    <slot name="main" />
  </div>

  <div class="screen-bottom">
    <slot name="bottom" />
  </div>
</div>
