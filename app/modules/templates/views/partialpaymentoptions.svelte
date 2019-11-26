<script>
  import SlottedRadioOption from 'templates/views/ui/options/Slotted/RadioOption.svelte';
  import PartialPaymentAmountField from 'templates/views/ui/PartialPaymentAmountField.svelte';

  // Props
  export let selected = null;
  export let order = {};

  const maxAmount = order.amount_due;
  const minAmount = order.first_payment_min_amount;
  const amountPaid = Number(order.amount_paid);

  // Computed
  let expanded = false;
  let partialAmount = null;

  // Refs
  let partialAmountField = null;

  $: expanded = selected === 'full';

  function handleRadioSelection(type) {
    if (selected !== type && type === 'full') {
      setTimeout(_ => {
        partialAmountField.focus();
      }, 200); // TODO: Fix this
    }
    selected = type;
  }
</script>

<style>
  .legend {
    margin: 0 !important;
    padding-left: 12px;
    padding-bottom: 20px;
  }
</style>

<div class="legend">Select a payment type</div>
<div class="border-list">
  <SlottedRadioOption
    name="payment_type"
    value="partial"
    selected={selected === 'partial'}
    reverse
    on:click={_ => handleRadioSelection('partial')}>
    <div slot="title">Pay full amount</div>
  </SlottedRadioOption>
  <SlottedRadioOption
    name="payment_type"
    value="full"
    reverse
    selected={selected === 'full'}
    on:click={_ => handleRadioSelection('full')}>
    <div slot="title">Make payment in parts</div>
    <div slot="subtitle">
      {#if expanded}
        <PartialPaymentAmountField
          {maxAmount}
          {minAmount}
          {amountPaid}
          bind:value={partialAmount}
          bind:this={partialAmountField} />
      {/if}
    </div>
  </SlottedRadioOption>
</div>
