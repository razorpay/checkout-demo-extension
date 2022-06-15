<script lang="ts">
  // Svelte imports
  import { onMount } from 'svelte';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';

  // Store imports
  import { isDynamicFeeBearer } from 'razorpay';
  import { showFeeLabel } from 'checkoutstore/index.js';
  import { dynamicFeeObject, showFeesIncl } from 'checkoutstore/dynamicfee';

  // Utils imports
  import { formatAmountWithSymbol } from 'common/currency';
  import { getSession } from 'sessionmanager';
  import { isOneClickCheckout } from 'razorpay';
  import { popStack } from 'navstack';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale, translateErrorDescription } from 'i18n';
  import {
    AMOUNT_LABEL,
    LOADING_MESSAGE,
    BREAKUP_TITLE,
    CONTINUE_ACTION,
    GATEWAY_CHARGES_LABEL,
    GST_LABEL,
    TOTAL_CHARGES_LABEL,
    CLOSE_ACTION,
  } from 'ui/labels/fees';

  // Props
  export let loading = true;
  export let feeBreakup = null;
  export let bearer = null;
  export let paymentData;
  export let onContinue;
  export let navstack;

  // Remove the space between Amount and symbol on Magic Checkout Flow
  const spaceAmountWithSymbol = !isOneClickCheckout();
  const entries = _Obj.entries;

  const isOverlay = navstack?.isOverlay;
  const session = getSession();
  const fee_label = session.get('fee_label');
  const allowedKeys = ['original_amount', 'razorpay_fee', 'tax', 'amount'];
  const displayLabels = {
    original_amount: AMOUNT_LABEL,
    razorpay_fee: GATEWAY_CHARGES_LABEL,
    tax: GST_LABEL,
    amount: TOTAL_CHARGES_LABEL,
  };
  const dynamic_fee_label = $dynamicFeeObject?.checkout_label || '';

  onMount(() => {
    fetchFees(paymentData);
  });

  export function onSuccess(response) {
    feeBreakup = response.display;
    showFeesIncl.update((obj) =>
      Object.assign({}, obj, {
        ['show']: true,
      })
    );

    loading = false;
    bearer = response.input;
    $showFeeLabel = Boolean(isDynamicFeeBearer());
    const offer = session.getAppliedOffer();
    if (!offer || !offer.amount) {
      session.updateAmountInHeader(feeBreakup.amount * 100, false);
      return;
    }
    if (offer) {
      session.updateAmountInHeaderForOffer(feeBreakup.amount * 100, true);
    }
  }

  export function onError(response) {
    const errorMessage = translateErrorDescription(
      response.error.description,
      $locale
    );
    if (isOverlay) {
      popStack(); // @TODO future - replaceStack(ErrorScreen);
      session.showLoadError(errorMessage, response.error);
    }
  }

  export function fetchFees(paymentData) {
    paymentData.amount = session.getAppliedOffer()
      ? session.getAppliedOffer().amount
      : session.get('amount');
    paymentData.currency = session.get('currency');
    if (isDynamicFeeBearer()) {
      if ('convenience_fee' in $dynamicFeeObject) {
        paymentData['convenience_fee'] = $dynamicFeeObject['convenience_fee'];
      }
    }
    loading = true;
    session.r.calculateFees(paymentData).then(onSuccess).catch(onError);
  }

  function handleCTA() {
    if (isOverlay) {
      popStack();
    }
    onContinue?.(bearer);
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
        {#if allowedKeys.includes(type)}
          <div class="fee">
            <div class="fee-title">
              {#if type === 'razorpay_fee'}
                {dynamic_fee_label || fee_label || $t(GATEWAY_CHARGES_LABEL)}
              {:else if type === 'tax'}
                {formatTemplateWithLocale(
                  displayLabels[type],
                  {
                    label:
                      dynamic_fee_label ||
                      fee_label ||
                      $t(GATEWAY_CHARGES_LABEL),
                  },
                  $locale
                )}
              {:else}{$t(displayLabels[type])}{/if}
            </div>
            <div class="fee-amount">
              {formatAmountWithSymbol(
                amount * 100,
                'INR',
                spaceAmountWithSymbol
              )}
            </div>
          </div>
        {/if}
      {/each}
    </div>
    <div class="btn" on:click={handleCTA}>
      <!-- LABEL: Continue -->
      <!-- LABEL: Close -->
      {$t(onContinue ? CONTINUE_ACTION : CLOSE_ACTION)}
    </div>
  {/if}
</div>

<style>
  .fee-bearer {
    padding: 20px;
  }
</style>
