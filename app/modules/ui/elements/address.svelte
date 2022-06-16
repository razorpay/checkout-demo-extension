<script>
  // UI Imports
  import AddressField from 'ui/elements/fields/AddressField.svelte';
  import PinCodeField from 'ui/elements/fields/PinCodeField.svelte';
  import StateField from 'ui/elements/fields/StateField.svelte';

  // Props
  export let states;

  export let address;
  export let pincode;
  export let state;
</script>

<div class="wrap">
  <div class="elem-wrap" id="elem-wrap-address">
    <AddressField bind:value={address} />
  </div>
  <div class="elem-wrap">
    <PinCodeField bind:value={pincode} />
  </div>
  <div class="elem-wrap">
    <StateField {states} bind:value={state} />
  </div>
</div>

<style>
  div.wrap {
    padding: 0 24px;
    margin-top: 24px;
  }

  #elem-wrap-address {
    height: 52px;
  }
</style>
