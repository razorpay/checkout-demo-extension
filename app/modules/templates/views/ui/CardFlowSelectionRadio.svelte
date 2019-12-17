<script>
  export let value = null;

  function handleRadioChanged(event) {
    value = event.target.value;
  }
</script>

<style>
  .flow-selection-container {
    margin: 16px 0 8px 0;
    display: flex;
    flex-wrap: wrap;
  }

  .flow-selection-container > * {
    flex-grow: 1;
  }

  .flow-selection-container > label {
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.64);
    font-size: 12px;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
</style>

<div class="flow-selection-container">
  <label>Complete Payment Using</label>
  <div class="flow input-radio">
    <input
      type="radio"
      name="auth_type"
      id="flow-3ds"
      value="c3ds"
      checked={value === 'c3ds'}
      on:change={handleRadioChanged} />
    <label for="flow-3ds">
      <div class="radio-display" />
      <div class="label-content">OTP / Password</div>
    </label>
  </div>
  <div class="flow input-radio">
    <input
      type="radio"
      name="auth_type"
      id="flow-pin"
      value="pin"
      checked={value === 'pin'}
      on:change={handleRadioChanged} />
    <label for="flow-pin">
      <div class="radio-display" />
      <div class="label-content">ATM PIN</div>
    </label>
  </div>
</div>
