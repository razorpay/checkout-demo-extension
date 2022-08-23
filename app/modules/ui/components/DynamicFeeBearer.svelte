<script lang="ts">
  import { clickOutside } from 'one_click_checkout/helper';
  import { onMount, onDestroy, tick } from 'svelte';

  //UI imports
  import Tooltip from 'ui/elements/Tooltip.svelte';
  //Store imports
  import { isDynamicFeeBearer } from 'razorpay';
  import { showFeeBearerToolTip } from 'store/feebearer';

  import {
    merchantMessage,
    dynamicFeeObject,
    setMerchantMessage,
    showFeesIncl,
  } from 'checkoutstore/dynamicfee';
  //Util imports
  import { getSession } from 'sessionmanager';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getCurrency, getAmount, isRedesignV15 } from 'razorpay';

  const session = getSession();
  const DYNAMIC_FEE_BEARER_VIEW_TIME = 6000;
  const isRedesignV15Enabled = isRedesignV15();
  // Remove the space between Amount and symbol on Magic Checkout Flow
  const spaceAmountWithSymbol = isRedesignV15Enabled;

  let label;
  let showFeeDetails = false;
  let timeout;

  const handleHideTooltip = () => {
    timeout ? clearTimeout(timeout) : null;
    showFeeDetails = false;
  };

  const triggerToolTip = () => {
    timeout ? clearTimeout(timeout) : null;
    showFeeDetails = true;
    timeout = setTimeout(() => {
      showFeeDetails = false;
    }, DYNAMIC_FEE_BEARER_VIEW_TIME);
  };
  onMount(() => {
    if (isDynamicFeeBearer() && !$showFeeBearerToolTip) {
      setMerchantMessage();
      triggerToolTip();
      $showFeeBearerToolTip = true;
    }
  });

  const showBreakUpTooltip = () => {
    tick().then(() => {
      if ('convenience_fee' in $dynamicFeeObject) {
        triggerToolTip();
        const offer = session.getAppliedOffer();
        if (!offer || !offer.amount) {
          session.updateAmountInHeader(
            getAmount() + $dynamicFeeObject.convenience_fee,
            false
          );
          return;
        }
        if (offer) {
          session.updateAmountInHeaderForOffer(getAmount(), true);
        }
      }
    });
  };
  const unSub = dynamicFeeObject.subscribe((_val) => {
    showBreakUpTooltip();
    label = _val['checkout_label'];
  });

  onDestroy(unSub);
</script>

<div
  class="dynamic-label"
  class:checkout-redesign={isRedesignV15Enabled}
  use:clickOutside
  on:click_outside={handleHideTooltip}
>
  <span class="fee-helper has-tooltip">
    {#if 'convenience_fee' in $dynamicFeeObject || 'show' in $showFeesIncl}
      <img alt="" src="https://cdn.razorpay.com/rtb/ticks_filled.svg" />
      {#if isRedesignV15Enabled}
        <span class="fee">Fee Included</span>
      {/if}
    {:else}
      <span class="fee">
        {#if isRedesignV15Enabled}
          {'+Fee'}
        {:else}
          {'+'}
        {/if}
      </span>
    {/if}
    {#if !isRedesignV15Enabled}
      <span class="fee">Fee</span>
    {/if}
    <Tooltip
      className={`dynamic-fee-tooltip ${
        isRedesignV15Enabled ? 'checkout-redesign' : ''
      }`}
      align={isRedesignV15Enabled ? ['top', 'right'] : ['bottom', 'left']}
      shown={showFeeDetails}
    >
      <div>
        {#if 'convenience_fee' in $dynamicFeeObject}
          <div class="dynamic-fee-breakup-block">
            <div class="dynamic-fee-breakup">
              <span>Amount</span>
              <span
                >{formatAmountWithSymbol(
                  getAmount(),
                  getCurrency(),
                  spaceAmountWithSymbol
                )}</span
              >
            </div>
            <div class="dynamic-fee-breakup">
              <span
                >{label && label.trim() !== ''
                  ? label
                  : 'Additional Fees'}</span
              >
              <span
                >{formatAmountWithSymbol(
                  $dynamicFeeObject['convenience_fee'],
                  getCurrency(),
                  spaceAmountWithSymbol
                )}</span
              >
            </div>
          </div>
        {:else}
          <p>
            A convenience fee will be charged depending on your choice of
            payment method.
          </p>
        {/if}
        {#if $merchantMessage && $merchantMessage.trim() !== ''}
          <div class="dynamic-divider" />
          <p class="dynamic-optional-message">{$merchantMessage}</p>
        {/if}
      </div>
    </Tooltip>
  </span>
</div>

<style>
  .dynamic-label {
    float: right;
  }
  .checkout-redesign {
    float: left;
  }
  .fee {
    font-size: 0.6em;
  }

  :global(.redesign) .fee {
    font-size: 10px;
    color: #8d97a1;
  }
  .fee-helper {
    cursor: pointer;
  }
  .dynamic-divider {
    border: 1px solid rgba(255, 255, 255, 0.5);
    width: 217px;
    height: 0px;
  }
  .dynamic-optional-message {
    color: rgba(255, 255, 255, 0.7);
  }

  .dynamic-fee-breakup-block {
    margin-bottom: 14px;
  }
  .dynamic-fee-breakup {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 7px 7px 7px 0px;
  }
  :global(.dynamic-fee-tooltip.tooltip.tooltip-bottom.tooltip-left) {
    font-size: 11px;
    position: fixed;
    white-space: normal;
    text-align: left;
    margin: 0;
    transform: translateX(-88%) translateY(10px);
    left: unset;
    right: unset;
    width: 225px;
    background-color: #363636;
  }

  :global(.checkout-redesign.tooltip.tooltip-top.tooltip-right) {
    font-size: 11px;
    position: absolute;
    white-space: normal;
    text-align: left;
    margin: 0;
    left: unset;
    right: unset;
    width: 225px;
    background-color: #363636;
    top: -30px;
  }

  :global(.dynamic-fee-tooltip.tooltip::before) {
    border-right: 6px solid #363636;
  }
</style>
