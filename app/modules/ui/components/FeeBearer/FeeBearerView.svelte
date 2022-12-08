<script lang="ts">
  // Svelte imports
  import { onDestroy, onMount } from 'svelte';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/coupons/icons/close.js';

  // Store imports
  import {
    getMerchantName,
    isCustomerFeeBearer,
    isDynamicFeeBearer,
  } from 'razorpay';
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
    FEE_TOOLTIP_MESSAGE,
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
  import info from 'ui/icons/payment-methods/info';
  import { clickOutside } from 'one_click_checkout/helper';
  import type { FeeBearerResponse } from './type';

  // Props
  export let loading = true;
  export let feeBreakup: FeeBearerResponse['display'] | null = null;
  export let bearer: FeeBearerResponse['input'] | null = null;
  export let paymentData: Partial<FeeBearerResponse['input']>;
  export let onContinue: (arg: typeof bearer) => void;
  export let navstack;

  let showToolTip = false;

  let merchantName =
    getMerchantName().length > 26
      ? `${getMerchantName().slice(0, 24)}...`
      : getMerchantName();

  /**
   * INR as default currency Symbol for Fees
   * If DCC is applied then show DCC currency symbol
   */
  let currency = 'INR';

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
  // TODO update DFB types
  const dynamic_fee_label = ($dynamicFeeObject as any)?.checkout_label || '';

  onMount(() => {
    hideCta();
    fetchFees(paymentData);
    trackShown();
  });

  let timer: ReturnType<typeof setTimeout>;
  let infoIcon: HTMLSpanElement;

  export function onSuccess(response: FeeBearerResponse) {
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

  // for ts casting extracted to variable
  $: selectedLocale = $locale as string;

  export function onError(response: Common.ErrorResponse) {
    const errorDescription = response?.error?.description;
    const errorMessage = errorDescription
      ? translateErrorDescription(errorDescription, selectedLocale)
      : '';
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

  export function fetchFees(paymentData: Partial<FeeBearerResponse['input']>) {
    paymentData.amount = session.getAppliedOffer()
      ? session.getAppliedOffer().amount
      : session.get('amount');
    paymentData.currency = session.get('currency');
    if (isDynamicFeeBearer()) {
      if ('convenience_fee' in $dynamicFeeObject) {
        // TODO update DFB types
        paymentData['convenience_fee'] = ($dynamicFeeObject as any)[
          'convenience_fee'
        ];
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

  function getDisplayLabel(type: string) {
    return $t(displayLabels[type as keyof typeof displayLabels]);
  }
</script>

<div
  class="fee-bearer"
  class:checkout-redesign={isRedesignV15Enabled}
  class:is-not-overlay={!isOverlay}
>
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
          <div
            on:mouseleave={() => {
              if (type === 'razorpay_fee') {
                if (timer) {
                  clearTimeout(timer);
                }
                // timer = setTimeout(() => (showToolTip = false), 2000);
              }
            }}
            use:clickOutside={type === 'razorpay_fee'}
            on:click_outside={() => {
              showToolTip = false;
            }}
            class="fee"
          >
            <div class="fee-title">
              {#if type === 'razorpay_fee'}
                <span>
                  {dynamic_fee_label || fee_label || $t(GATEWAY_CHARGES_LABEL)}
                </span>

                <span
                  bind:this={infoIcon}
                  class="info-icon"
                  on:click={() => {
                    if (timer) {
                      clearTimeout(timer);
                    }
                    showToolTip = true;
                  }}
                >
                  <Icon icon={info('#8d97a1')} />
                </span>
                {#if showToolTip}
                  <span class="fee-tooltip">
                    <span
                      class="pointer"
                      style={`left:${(infoIcon?.offsetLeft || 0) + 1}px;`}
                    />
                    <div>
                      {formatTemplateWithLocale(
                        FEE_TOOLTIP_MESSAGE,
                        {
                          merchantName,
                        },
                        selectedLocale
                      )}
                    </div>
                    <div
                      class="cross"
                      on:click={() => {
                        showToolTip = false;
                      }}
                    >
                      <Icon icon={close('#ffffffde')} />
                    </div>
                  </span>
                {/if}
              {:else if type === 'tax'}
                {formatTemplateWithLocale(
                  displayLabels[type],
                  {
                    label:
                      dynamic_fee_label ||
                      fee_label ||
                      $t(GATEWAY_CHARGES_LABEL),
                  },
                  selectedLocale
                )}
              {:else}
                {getDisplayLabel(type)}
              {/if}
            </div>
            <div class="fee-amount">
              {formatAmountWithSymbol(amount * 100, currency || 'INR', true)}
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
        position: relative;

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

        .info-icon {
          position: relative;
          top: 2px;
          cursor: pointer;
          margin-left: 6px;
        }

        .fee-tooltip {
          z-index: 1;
          font-weight: 500;
          font-size: 11px;
          line-height: 16px;
          color: rgba(255, 255, 255, 0.87);
          position: absolute;
          left: 0;
          width: calc(100% - 20px);
          bottom: -34px;
          align-items: center;
          background: #515461;
          border-radius: 4px;
          padding: 10px;
          display: flex;
          justify-content: space-between;

          .pointer {
            content: '';
            height: 10px;
            width: 10px;
            position: absolute;
            top: -4px;
            background: #525461;
            transform: rotate(45deg);
          }

          .cross {
            display: flex;
            cursor: pointer;
            :global(svg) {
              height: 8px;
              width: 8px;
            }
          }
        }

        .fee-amount {
          display: inline-block;
          text-align: right;
          width: calc(50% - 2px);
          vertical-align: top;
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
  :global(#modal.one-cc) .fee-bearer .btn {
    text-transform: capitalize;
  }

  // for UPI QR at L2 we show fee in content instead of modal
  .fee-bearer.is-not-overlay {
    padding: 5px;
    width: 100%;
  }
</style>
