<script>
  // Props
  export let selected = false;
  export let error = false;
</script>

<div class:theme-border={selected} class:error-border={error} on:click>
  <slot />
</div>

<style>
  div {
    display: block;
    background: #fcfcfc;
    border: 1px solid #ebedf0;
    border-radius: 1px;
    box-shadow: 4px 4px 4px 0 rgba(0, 0, 0, 0.04);
    padding: 12px;
    position: relative;
  }
</style>
