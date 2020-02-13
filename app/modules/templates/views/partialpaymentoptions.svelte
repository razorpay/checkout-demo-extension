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

  // Utils
  import { scrollIntoView } from 'lib/utils';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // Props
  export let order = {};

  const session = getSession();

  const maxAmount = order.amount_due;
  const minAmount = order.first_payment_min_amount;
  const amountPaid = Number(order.amount_paid);
  const isFirstPayment = amountPaid === 0;
  const showPartialAmountLabel = minAmount && isFirstPayment; // Show label and checkbox if order.first_payment_min_amount is set and is first payment
  const minAmountLabel =
    session.get('min_amount_label') ||
    session.get('partial_payment.min_amount_label');
  const fullAmountLabel = session.get('partial_payment.full_amount_label');
  const partialAmountLabel = session.get(
    'partial_payment.partial_amount_label'
  );
  const partialDescription = session.get(
    'partial_payment.partial_amount_description'
  );

  // Only set the value in store if nothing has already been set
  if (!$partialPaymentOption) {
    $partialPaymentOption = session.get('partial_payment.select_partial')
      ? 'partial'
      : 'full';
  }

  // Computed
  let expanded = false;

  // Refs
  let partialAmountField = null;

  $: expanded = $partialPaymentOption === 'partial';

  function trackPartialPaymentOptionClicked(data) {
    Analytics.track('partial_payment:select', {
      type: AnalyticsTypes.BEHAV,
      data,
    });
  }

  $: {
    if ($partialPaymentOption) {
      trackPartialPaymentOptionClicked({ type: $partialPaymentOption });
    }
  }

  function handleCheckboxChecked() {
    Analytics.track('partial_payment:min_amount_due:select', {
      type: AnalyticsTypes.BEHAV,
    });
  }

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
          scrollIntoView(partialPaymentRef);
        }
      });
    }
  }
</script>

<style>
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
    <div slot="title">{fullAmountLabel}</div>
  </SlottedRadioOption>
  <SlottedRadioOption
    name="payment_type"
    value="full"
    align="top"
    reverse
    selected={$partialPaymentOption === 'partial'}
    on:click={_ => handleRadioSelection('partial')}>
    <div slot="title">{partialAmountLabel}</div>
    <div slot="subtitle" bind:this={partialPaymentRef}>
      {#if expanded}
        <PartialPaymentAmountField
          {maxAmount}
          {minAmount}
          {showPartialAmountLabel}
          {minAmountLabel}
          {partialDescription}
          on:check={handleCheckboxChecked}
          bind:value={$partialPaymentAmount}
          bind:this={partialAmountField} />
      {/if}
    </div>
  </SlottedRadioOption>
</div>
