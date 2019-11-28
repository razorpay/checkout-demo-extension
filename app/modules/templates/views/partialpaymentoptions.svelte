<script>
  // UI Imports
  import SlottedRadioOption from 'templates/views/ui/options/Slotted/RadioOption.svelte';
  import PartialPaymentAmountField from 'templates/views/ui/fields/PartialPaymentAmountField.svelte';

  // Store
  import {
    partialPaymentOption,
    partialPaymentAmount,
  } from 'checkoutstore/screens/home';

  import { getSession } from 'sessionmanager';

  // Props
  export let order = {};

  const session = getSession();

  const maxAmount = order.amount_due;
  const minAmount = order.first_payment_min_amount;
  const amountPaid = Number(order.amount_paid);
  const minAmountLabel = session.get('min_amount_label');

  // Computed
  let expanded = false;

  // Refs
  let partialAmountField = null;

  $: expanded = $partialPaymentOption === 'partial';

  function handleRadioSelection(type) {
    if ($partialPaymentOption !== type) {
      if (type === 'partial') {
        setTimeout(_ => {
          partialAmountField && partialAmountField.focus();
        }, 200); // TODO: Fix this
      } else {
        // The user selected full amount, update the header to full amount.
        session.setAmount(maxAmount);
      }
    }
    $partialPaymentOption = type;
  }

  let partialPaymentRef;

  $: {
    if ($partialPaymentOption === 'partial') {
      setTimeout(() => {
        if (partialPaymentRef) {
          partialPaymentRef.scrollIntoView();
        }
      });
    }
  }
</script>

<style>
  .legend {
    margin: 0 !important;
    padding-left: 12px;
    padding-bottom: 20px;
  }

  div[slot='subtitle']:not(:empty) {
    padding-bottom: 16px;
  }
</style>

<h3 class="title">Select a payment type</h3>
<div class="border-list">
  <SlottedRadioOption
    name="payment_type"
    value="partial"
    selected={$partialPaymentOption === 'full'}
    reverse
    on:click={_ => handleRadioSelection('full')}>
    <div slot="title">Pay full amount</div>
  </SlottedRadioOption>
  <SlottedRadioOption
    name="payment_type"
    value="full"
    align="top"
    reverse
    selected={$partialPaymentOption === 'partial'}
    on:click={_ => handleRadioSelection('partial')}>
    <div slot="title">Make payment in parts</div>
    <div slot="subtitle" bind:this={partialPaymentRef}>
      {#if expanded}
        <PartialPaymentAmountField
          {maxAmount}
          {minAmount}
          {amountPaid}
          {minAmountLabel}
          bind:value={$partialPaymentAmount}
          bind:this={partialAmountField} />
      {/if}
    </div>
  </SlottedRadioOption>
</div>
