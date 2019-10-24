<script>
  export let pad = true;
</script>

<style>
  .screen-primary {
    flex-grow: 1;
    overflow: auto;
  }

  .screen-primary.pad {
    padding: 0 12px 12px;
  }
</style>

<div class="screen-primary" class:pad>
  <slot />
</div>
