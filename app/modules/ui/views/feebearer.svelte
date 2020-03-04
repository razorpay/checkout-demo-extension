<script>
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  // UI imports
  import AsyncLoading from 'ui/views/ui/AsyncLoading.svelte';

  // Utils imports
  import { formatAmountWithSymbol } from 'common/currency';
  import { getSession } from 'sessionmanager';

  // Props
  export let loading = true;
  export let feeBreakup = null;
  export let bearer = null;
  export let paymentData;

  const dispatch = createEventDispatcher();
  const session = getSession();

  onMount(() => {
    fetchFees(paymentData);
  });

  export function onSuccess(response) {
    feeBreakup = makeFeesTable(response);
    loading = false;
    bearer = response.input;
  }

  export function onError(response) {
    session.showLoadError(response.error.description, response.error);
    dispatch('error', response.error.description);
  }

  export function fetchFees(paymentData) {
    paymentData.amount = session.get('amount');
    paymentData.currency = session.get('currency');

    loading = true;

    session.r
      .calculateFees(paymentData)
      .then(onSuccess)
      .catch(onError);
  }

  export function makeFeesTable(response) {
    const displayFees = response.display;
    const array = [];
    const fees = Object.keys(displayFees);

    const fee_label = session.get('fee_label');

    for (let i = 0; i < fees.length; i++) {
      const fee = fees[i];
      let title = '';
      switch (fee) {
        case 'original_amount':
          title = 'Amount';
          break;
        case 'razorpay_fee':
          title = fee_label;
          break;
        case 'tax':
          title = `GST on ${fee_label}`;
          break;
      }
      if (title) {
        array.push([
          title,
          formatAmountWithSymbol(displayFees[fee] * 100, 'INR'),
        ]);
      }
    }

    array.push([
      'Total Charges',
      formatAmountWithSymbol(displayFees.amount * 100, 'INR'),
    ]);

    return array;
  }
</script>

<div class="fee-bearer">
  {#if loading}
    <AsyncLoading>Loading fees breakup...</AsyncLoading>
  {:else if feeBreakup}
    <b>Fees Breakup</b>
    <br />
    <div class="fees-container">
      {#each feeBreakup as fee}
        <div class="fee">
          <div class="fee-title">{fee[0]}</div>
          <div class="fee-amount">{fee[1]}</div>
        </div>
      {/each}
    </div>
    <div class="btn" on:click={() => dispatch('continue', bearer)}>
      Continue
    </div>
  {/if}
</div>
