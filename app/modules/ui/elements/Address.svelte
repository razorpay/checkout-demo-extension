<script lang="ts">
  import { isRedesignV15 } from 'razorpay';

  // UI Imports
  import AddressField from 'ui/elements/fields/AddressField.svelte';
  import PinCodeField from 'ui/elements/fields/PinCodeField.svelte';
  import StateField from 'ui/elements/fields/StateField.svelte';

  // Props
  export let states;

  export let address;
  export let pincode;
  export let state;

  let addressInvalid = false;
</script>

<div class="wrap">
  <div
    class="elem-wrap"
    id="elem-wrap-address"
    class:invalid-input={addressInvalid}
  >
    <AddressField bind:showValidations={addressInvalid} bind:value={address} />
  </div>
  {#if !isRedesignV15()}
    <div class="elem-wrap">
      <PinCodeField bind:value={pincode} />
    </div>
    <div class="elem-wrap">
      <StateField {states} bind:value={state} />
    </div>
  {:else}
    <div class="row">
      <StateField {states} bind:value={state} />
      <PinCodeField bind:value={pincode} />
    </div>
  {/if}
</div>

<style lang="scss">
  div.wrap {
    padding: 0 24px;
    margin-top: 24px;
  }

  #elem-wrap-address {
    height: 52px;
  }

  :global(.redesign) {
    .wrap {
      padding: 0;
      margin-top: 16px;
    }

    #elem-wrap-address.invalid-input {
      margin-bottom: 28px;
    }

    .row {
      display: flex;
      flex-wrap: nowrap;
      margin-top: 16px;
      justify-content: space-between;

      & > :global(*) {
        width: calc(50% - 6px);
      }
    }
  }
</style>
