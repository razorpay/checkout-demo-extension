<script>
  export let type = 'button';
</script>

<style>
  button {
    padding: 3px 1px;
    font-size: 12px;
    border-bottom: 1px solid;
    border-color: #528ff0;
  }
</style>

<button {type} {...$$props} on:click>
  <slot />
</button>
