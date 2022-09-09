<script lang="ts">
  import close from 'one_click_checkout/coupons/icons/close';
  import { popStack } from 'navstack';

  import { t } from 'svelte-i18n';
  import Icon from 'ui/elements/Icon.svelte';
  import { CONFIRM_AND_PAY } from 'ui/labels/confirm';
  import {
    EMI_CONFIRM_MESSAGE,
    EMI_CONFIRM_PAYMENT_HEADING,
  } from 'ui/labels/emi';
  import { payInFull } from 'emiV2/payment/prePaymentHandler';
  import { currentCardType } from 'checkoutstore/screens/card';
  import { trackPayFullAmount } from 'emiV2/events/tracker';
  import { selectedBank } from 'checkoutstore/screens/emi';
  import { selectedTab } from 'components/Tabs/tabStore';
  import { selectedPlan } from 'checkoutstore/emi';
  import { isRedesignV15 } from 'razorpay';

  function onClose() {
    popStack();
  }

  const handlePayFullAmount = () => {
    // Track Pay Full Amount Click
    trackPayFullAmount(
      {
        provider_name: $selectedBank?.name,
        tab_name: $selectedTab,
        card_type: $currentCardType,
        emi_plan: {
          nc_emi_tag: $selectedPlan.subvention === 'merchant',
          tenure: $selectedPlan.duration,
        },
      },
      'confirm'
    );
    payInFull();
  };
</script>

<div
  id="confirm-payment-overlay"
  class:confirm-payment-overlay-onecc={isRedesignV15()}
>
  <div class="confirm-payment-header">
    <header>{$t(EMI_CONFIRM_PAYMENT_HEADING)}</header>
    <div class="no-cost-close" on:click={onClose}>
      <Icon icon={close()} />
    </div>
  </div>
  <div class="confirm-body">
    <p>{$t(EMI_CONFIRM_MESSAGE)}</p>
    <div
      role="button"
      class="button confirm-btn"
      on:click={handlePayFullAmount}
    >
      {$t(CONFIRM_AND_PAY)}
    </div>
  </div>
</div>

<style>
  .no-cost-close {
    cursor: pointer;
  }
  #confirm-payment-overlay {
    padding: 20px 16px;
    bottom: -55px;
  }

  .confirm-payment-overlay-onecc {
    bottom: 0 !important;
  }
  .confirm-payment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  header {
    color: #3f71d7;
    font-size: 14px;
    font-weight: 600;
  }
  .confirm-body {
    font-size: 14px;
    color: #8d97a1;
    text-align: left;
  }
  .confirm-btn {
    border-radius: 0 0 3px 3px;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }
</style>
