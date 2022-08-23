<script lang="ts">
  // Svelte imports
  import { onDestroy, onMount } from 'svelte';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/coupons/icons/close.js';

  // Store imports
  import { isCustomerFeeBearer, isDynamicFeeBearer } from 'razorpay';
  import { showFeeLabel } from 'checkoutstore/fee';
  import { dynamicFeeObject, showFeesIncl } from 'checkoutstore/dynamicfee';

  // Utils imports
  import {
    formatAmountWithSymbol,
    formatAmountWithSymbolRawHtml,
  } from 'common/currency';
  import { getSession } from 'sessionmanager';
  import { isRedesignV15 } from 'razorpay';
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
    CONFIRM_AND_PAY,
  } from 'ui/labels/fees';

  // analytics
  import {
    trackShown,
    trackContinueClick,
    trackFeeError,
    trackFeeSuccess,
  } from './events';
  import { hideCta, showCta } from 'cta';
  import { cfbAmount } from 'checkoutstore/screens/upi';

  // Props
  export let loading = true;
  export let feeBreakup = null;
  export let bearer = null;
  export let paymentData;
  export let onContinue;
  export let navstack;

  /**
   * INR as default currency Symbol for Fees
   * If DCC is applied then show DCC currency symbol
   */
  let currency = 'INR';

  // Remove the space between Amount and symbol on Magic Checkout Flow
  const spaceAmountWithSymbol = !isRedesignV15();
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
    hideCta();
    fetchFees(paymentData);
    trackShown();
  });

  export function onSuccess(response) {
    feeBreakup = response.display;
    showFeesIncl.update((obj) =>
      Object.assign({}, obj, {
        ['show']: true,
      })
    );

    if (feeBreakup?.currency) {
      currency = feeBreakup?.currency;
    }

    loading = false;
    bearer = response.input;
    if (isRedesignV15()) {
      $showFeeLabel =
        Boolean(isDynamicFeeBearer()) || Boolean(isCustomerFeeBearer());
    } else {
      $showFeeLabel = Boolean(isDynamicFeeBearer());
    }
    if (!isRedesignV15()) {
      const offer = session.getAppliedOffer();
      if (!offer || !offer.amount) {
        if (feeBreakup.currency) {
          session.setRawAmountInHeader(
            formatAmountWithSymbolRawHtml(
              feeBreakup.amount * 100,
              feeBreakup.currency
            )
          );
        } else {
          session.updateAmountInHeader(feeBreakup.amount * 100, false);
        }
        return;
      }
      if (offer) {
        session.updateAmountInHeaderForOffer(feeBreakup.amount * 100, true);
      }
    } else {
      cfbAmount.set(
        formatAmountWithSymbolRawHtml(
          feeBreakup.amount * 100,
          feeBreakup.currency || 'INR'
        )
      );
    }
    trackFeeSuccess({
      amount: feeBreakup.amount,
      currency: feeBreakup.currency,
      dcc_currency: bearer.dcc_currency,
    });
  }

  onDestroy(() => {
    showCta();
  });

  export function onError(response) {
    const errorMessage = translateErrorDescription(
      response.error.description,
      $locale
    );
    if (isOverlay) {
      popStack(); // @TODO future - replaceStack(ErrorScreen);
      session.showLoadError(errorMessage, response.error);
    }

    trackFeeError({
      error: response.error,
      currency: paymentData.currency,
      dcc_currency: paymentData.dcc_currency,
    });
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

  function onClose() {
    popStack();
  }

  function handleCTA() {
    if (isOverlay) {
      popStack();
    }
    onContinue?.(bearer);
    trackContinueClick();
  }
  const isRedesignV15Enabled = isRedesignV15();
  const continueAction = isRedesignV15Enabled
    ? CONFIRM_AND_PAY
    : CONTINUE_ACTION;
</script>

<div class="fee-bearer" class:checkout-redesign={isRedesignV15Enabled}>
  {#if isRedesignV15Enabled && isOverlay}
    <span class="fee-bearer-close" on:click={onClose}>
      <Icon icon={close('#757575')} />
    </span>
  {/if}
  {#if loading}
    <AsyncLoading>
      <!-- LABEL: Loading fees breakup... -->
      {$t(LOADING_MESSAGE)}
    </AsyncLoading>
  {:else if feeBreakup}
    <!-- LABEL: Fees Breakup -->
    <b>{$t(BREAKUP_TITLE)}</b>

    <div class="fees-container">
      {#each Object.entries(feeBreakup) as [type, amount] (type)}
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
                currency || 'INR',
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
      {$t(onContinue ? continueAction : CLOSE_ACTION)}
    </div>
  {/if}
</div>

<style lang="scss">
  .fee-bearer {
    padding: 20px;
    .fees-container {
      margin: 0 auto;
      margin-bottom: 16px;

      .fee {
        padding: 8px 0;
        width: 100%;

        &:last-of-type {
          border-top: 1px solid #ebedf0;
          font-weight: bold;
          margin-top: 12px;
          padding-top: 12px;
        }

        .fee-title {
          display: inline-block;
          text-align: left;
          width: calc(50% - 2px);
        }

        .fee-amount {
          display: inline-block;
          text-align: right;
          width: calc(50% - 2px);
        }

        // .fee-discount {
        //   display: inline-block;
        //   text-align: right;
        //   width: calc(50% - 2px);
        //   color: #079f0d;
        // }
      }
    }
  }
  .checkout-redesign {
    b {
      color: #3f71d7;
      display: flex;
      font-size: 14px;
    }
    .fees-container {
      margin-top: 15px;
      font-size: 12px;
      .fee {
        color: #8d97a1;
        &:last-child {
          color: #000;
        }
      }
    }
    .btn {
      line-height: 45px;
      border-radius: 5px;
      text-transform: none;
    }

    .fee-bearer-close {
      position: absolute;
      right: 20px;
      top: 20px;
      cursor: pointer;
    }
  }
  :global(.irctc) .fee-bearer {
    bottom: -30px !important; // irctc has special callout impacting height of checkout
  }
</style>
