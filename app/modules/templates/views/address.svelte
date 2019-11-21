<script>
  // UI Imports
  import AddressField from 'templates/views/ui/fields/AddressField.svelte';
  import PinCodeField from 'templates/views/ui/fields/PinCodeField.svelte';
  import StateField from 'templates/views/ui/fields/StateField.svelte';

  // Props
  export let states;

  export let address;
  export let pincode;
  export let state;
</script>

<style>
  div.wrap {
    padding: 0 24px;
  }
</style>

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
