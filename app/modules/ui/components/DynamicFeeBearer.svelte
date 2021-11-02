<script>
  import { onMount, onDestroy, tick } from 'svelte';

  //UI imports
  import Tooltip from 'ui/elements/Tooltip.svelte';
  //Store imports
  import { isDynamicFeeBearer } from 'checkoutstore/index.js';

  import {
    merchantMessage,
    dynamicFeeObject,
    setMerchantMessage,
    showFeesIncl,
  } from 'checkoutstore/dynamicfee';
  //Util imports
  import { getSession } from 'sessionmanager';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getAmount, getCurrency } from 'checkoutstore';

  const session = getSession();
  const DYNAMIC_FEE_BEARER_VIEW_TIME = 6000;

  let label;
  let showFeeDetails = false;
  let timeout;
  const triggerToolTip = () => {
    timeout ? clearTimeout(timeout) : null;
    showFeeDetails = true;
    timeout = setTimeout(() => {
      showFeeDetails = false;
    }, DYNAMIC_FEE_BEARER_VIEW_TIME);
  };
  onMount(() => {
    if (isDynamicFeeBearer()) {
      setMerchantMessage();
      triggerToolTip();
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

<div class="dynamic-label">
  <span class="fee-helper has-tooltip">
    {#if 'convenience_fee' in $dynamicFeeObject || 'show' in $showFeesIncl}
      <img alt="" src="https://cdn.razorpay.com/rtb/ticks_filled.svg" />
    {:else}
      <span class="fee">+</span>
    {/if}
    <span class="fee">Fee</span>
    <Tooltip
      className="dynamic-fee-tooltip"
      align={['bottom', 'left']}
      shown={showFeeDetails}
    >
      <div>
        {#if 'convenience_fee' in $dynamicFeeObject}
          <div class="dynamic-fee-breakup-block">
            <div class="dynamic-fee-breakup">
              <span>Amount</span>
              <span>{formatAmountWithSymbol(getAmount(), getCurrency())}</span>
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
                  getCurrency()
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
  .fee {
    font-size: 0.6em;
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
  :global(.dynamic-fee-tooltip.tooltip::before) {
    border-right: 6px solid #363636;
  }
</style>
