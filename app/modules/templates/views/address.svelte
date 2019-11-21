<script>
  export let states;

  export let address;
  export let pincode;
  export let state;

  const ADDRESS_PATTERN = '[\\s\\S]{10}';
  const PINCODE_PATTERN = '^\\\\d{6}$';
</script>

<style>
  div.wrap {
    padding: 0 24px;
  }
</style>

<div class="wrap">
  <div class="elem-wrap" id="elem-wrap-address">
    <div class="elem elem-address">
      <div class="help">Address should be at least 10 characters long</div>
      <label>Address</label>
      <textarea
        class="input"
        name="address"
        type="text"
        id="address"
        required
        pattern={ADDRESS_PATTERN}
        maxlength="200"
        rows="2"
        bind:value={address} />
    </div>
  </div>
  <div class="elem-wrap">
    <div class="elem">
      <div class="help">Enter 6 digit pincode</div>
      <label>PIN Code</label>
      <input
        class="input"
        required
        pattern={PINCODE_PATTERN}
        maxlength="6"
        id="pincode"
        bind:value={pincode} />
    </div>
  </div>
  <div class="elem-wrap">
    <div class="elem select elem-state">
      <div class="help">Select a value from list of states</div>
      <i class="select-arrow">&#xe601;</i>
      <select class="input" required id="state" bind:value={state}>
        <option value="">Select State</option>
        {#each states as [code, text] (code)}
          <option value={code}>{text}</option>
        {/each}
      </select>
    </div>
  </div>
</div>
