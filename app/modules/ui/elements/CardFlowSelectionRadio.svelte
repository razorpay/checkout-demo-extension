<script>
  import { t } from 'svelte-i18n';
  import {
    AUTH_TYPE_HEADER,
    AUTH_TYPE_OTP,
    AUTH_TYPE_PIN,
  } from 'ui/labels/card';

  export let value;
</script>

<div class="flow-selection-container">
  <!-- LABEL: Complete Payment Using -->
  <div class="label">{$t(AUTH_TYPE_HEADER)}</div>
  <div class="flow input-radio">
    <input
      type="radio"
      name="auth_type"
      id="flow-3ds"
      value="c3ds"
      bind:group={value}
    />
    <label for="flow-3ds">
      <div class="radio-display" />
      <!-- LABEL: OTP / Password -->
      <div class="label-content">{$t(AUTH_TYPE_OTP)}</div>
    </label>
  </div>
  <div class="flow input-radio">
    <input
      type="radio"
      name="auth_type"
      id="flow-pin"
      value="pin"
      bind:group={value}
    />
    <label for="flow-pin">
      <div class="radio-display" />
      <!-- LABEL: ATM PIN -->
      <div class="label-content">{$t(AUTH_TYPE_PIN)}</div>
    </label>
  </div>
</div>

<style lang="css">
  .flow-selection-container {
    margin: 16px 0 8px 0;
    display: flex;
    flex-wrap: wrap;
  }

  .flow-selection-container > * {
    flex-grow: 1;
  }

  .label {
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.64);
    font-size: 12px;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
</style>
