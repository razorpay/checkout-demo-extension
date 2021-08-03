<script>
  export let type = 'button';
  export let disabled = false;
</script>

<button {type} {...$$props} on:click class="hc_border" {disabled}>
  <slot />
</button>

<style>
  button {
    padding: 3px 1px;
    font-size: 12px;
    border-bottom: 1px solid;
  }
  button:disabled {
    color: #ccc;
    cursor: default;
  }
</style>
