<script>
  import SlottedRadioOption from 'templates/views/ui/options/Slotted/RadioOption.svelte';
  import PartialPaymentAmountField from 'templates/views/ui/PartialPaymentAmountField.svelte';

  // Props
  export let selected = null;

  // Computed
  let expanded = false;

  // Refs
  let partialAmountField = null;

  $: expanded = selected === 'full';

  function handleRadioSelection(type) {
    selected = type;
    if (type === 'full') {
      setTimeout(_ => {
        partialAmountField.focus();
      }, 200); // TODO: Fix this
    }
  }
</script>

<style>
  .legend {
    margin: 0 !important; /* TODO: fix this */
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
          maxAmount={100}
          bind:this={partialAmountField} />
      {/if}
    </div>
  </SlottedRadioOption>
</div>
