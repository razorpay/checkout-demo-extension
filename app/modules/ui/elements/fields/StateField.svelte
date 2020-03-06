<script>
  export let value;
  export let states;
</script>

<div class="elem select elem-state">
  <div class="help">Select a value from list of states</div>
  <i class="select-arrow">&#xe601;</i>
  <select class="input" required id="state" bind:value>
    <option value="">Select State</option>
    {#each states as [code, text] (code)}
      <option value={code}>{text}</option>
    {/each}
  </select>
</div>
