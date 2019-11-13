<script>
  import RadioOption from 'templates/views/ui/options/RadioOption.svelte';
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
<div class="options flex options-no-margin">
  <RadioOption
    reverse={true}
    selected={selected === 'partial'}
    on:select={_ => handleRadioSelection('partial')}>
    Pay full amount
  </RadioOption>
  <RadioOption
    reverse={true}
    selected={selected === 'full'}
    on:select={_ => handleRadioSelection('full')}>
    Make payment in parts
    {#if expanded}
      <PartialPaymentAmountField
        maxAmount={100}
        bind:this={partialAmountField} />
    {/if}
  </RadioOption>
</div>
