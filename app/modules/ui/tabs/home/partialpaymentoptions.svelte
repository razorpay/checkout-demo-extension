<script lang="ts">
  // UI Imports
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import PartialPaymentAmountField from 'ui/components/PartialPaymentAmountField.svelte';

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
  import { isRedesignV15 } from 'razorpay';

  // i18n
  import {
    PARTIAL_PAYMENT_TITLE,
    FULL_AMOUNT_LABEL,
    MIN_AMOUNT_LABEL,
    PARTIAL_AMOUNT_DESCRIPTION,
    PARTIAL_AMOUNT_LABEL,
    // PARTIAL_AMOUNT_LABEL_V15,
    PARTIAL_PAYMENT_TITLE_V15,
  } from 'ui/labels/home';

  import { t } from 'svelte-i18n';

  // Props
  export let order = {};

  const session = getSession();

  const amountPaid = Number(order.amount_paid);
  const isFirstPayment = amountPaid === 0;
  const maxAmount = order.amount_due;
  const minAmount = isFirstPayment && order.first_payment_min_amount;
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
  const isRedesignV15Enabled = isRedesignV15();

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
        setTimeout((_) => {
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

<!-- LABEL: Select a payment type -->
<h3 class="title" class:redesign-v15={isRedesignV15Enabled}>
  {isRedesignV15Enabled
    ? $t(PARTIAL_PAYMENT_TITLE_V15)
    : $t(PARTIAL_PAYMENT_TITLE)}
</h3>
<div class="border-list">
  <SlottedRadioOption
    name="payment_type"
    value="partial"
    selected={$partialPaymentOption === 'full'}
    reverse={!isRedesignV15Enabled}
    on:click={(_) => handleRadioSelection('full')}
  >
    <div slot="title">{fullAmountLabel || $t(FULL_AMOUNT_LABEL)}</div>
  </SlottedRadioOption>
  <SlottedRadioOption
    name="payment_type"
    value="full"
    align="top"
    reverse={!isRedesignV15Enabled}
    overflow
    selected={$partialPaymentOption === 'partial'}
    on:click={(_) => handleRadioSelection('partial')}
  >
    <div
      slot="title"
      class:slot-title-margin={$partialPaymentOption === 'partial' &&
        isRedesignV15Enabled}
    >
      {$t(PARTIAL_AMOUNT_LABEL)}
    </div>
    <div slot="subtitle" bind:this={partialPaymentRef}>
      {#if expanded}
        <PartialPaymentAmountField
          {maxAmount}
          {minAmount}
          {showPartialAmountLabel}
          minAmountLabel={minAmountLabel || $t(MIN_AMOUNT_LABEL)}
          partialDescription={partialDescription ||
            $t(PARTIAL_AMOUNT_DESCRIPTION)}
          on:check={handleCheckboxChecked}
          bind:value={$partialPaymentAmount}
          bind:this={partialAmountField}
        />
      {/if}
    </div>
  </SlottedRadioOption>
</div>

<style>
  .redesign-v15 {
    margin-left: 0 !important;
  }

  div[slot='subtitle']:not(:empty) {
    padding-bottom: 16px;
  }
  .slot-title-margin {
    margin-bottom: 15px;
  }
</style>
