<script>
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';

  // Utils imports
  import { formatAmountWithSymbol } from 'common/currency';
  import { getSession } from 'sessionmanager';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    AMOUNT_LABEL,
    LOADING_MESSAGE,
    BREAKUP_TITLE,
    CONTINUE_ACTION,
    GATEWAY_CHARGES_LABEL,
    GST_LABEL,
    TOTAL_CHARGES_LABEL,
  } from 'ui/labels/fees';

  // Props
  export let loading = true;
  export let feeBreakup = null;
  export let bearer = null;
  export let paymentData;

  const entries = _Obj.entries;
  const contains = _Arr.contains;

  const dispatch = createEventDispatcher();
  const session = getSession();
  const fee_label = session.get('fee_label');

  const allowedKeys = ['original_amount', 'razorpay_fee', 'tax', 'amount'];
  const displayLabels = {
    original_amount: AMOUNT_LABEL,
    razorpay_fee: GATEWAY_CHARGES_LABEL,
    tax: GST_LABEL,
    amount: TOTAL_CHARGES_LABEL,
  };

  onMount(() => {
    fetchFees(paymentData);
  });

  export function onSuccess(response) {
    feeBreakup = response.display;
    loading = false;
    bearer = response.input;
  }

  export function onError(response) {
    session.showLoadError(response.error.description, response.error);
    dispatch('error', response.error.description);
  }

  export function fetchFees(paymentData) {
    paymentData.amount = session.getAppliedOffer()
      ? session.getAppliedOffer().amount
      : session.get('amount');
    paymentData.currency = session.get('currency');

    loading = true;

    session.r
      .calculateFees(paymentData)
      .then(onSuccess)
      .catch(onError);
  }
</script>

<div class="fee-bearer">
  {#if loading}
    <AsyncLoading>
      <!-- LABEL: Loading fees breakup... -->
      {$t(LOADING_MESSAGE)}
    </AsyncLoading>
  {:else if feeBreakup}
    <!-- LABEL: Fees Breakup -->
    <b>{$t(BREAKUP_TITLE)}</b>
    <br />
    <div class="fees-container">
      {#each entries(feeBreakup) as [type, amount] (type)}
        {#if contains(allowedKeys, type)}
          <div class="fee">
            <div class="fee-title">
              {#if type === 'razorpay_fee'}
                {fee_label || $t(GATEWAY_CHARGES_LABEL)}
              {:else if type === 'tax'}
                {formatTemplateWithLocale(displayLabels[type], { label: fee_label || $t(GATEWAY_CHARGES_LABEL) }, $locale)}
              {:else}{$t(displayLabels[type])}{/if}
            </div>
            <div class="fee-amount">
              {formatAmountWithSymbol(amount * 100, 'INR')}
            </div>
          </div>
        {/if}
      {/each}
    </div>
    <div class="btn" on:click={() => dispatch('continue', bearer)}>
      <!-- LABEL: Continue -->
      {$t(CONTINUE_ACTION)}
    </div>
  {/if}
</div>
