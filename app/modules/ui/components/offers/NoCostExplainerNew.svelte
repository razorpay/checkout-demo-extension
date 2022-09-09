<script lang="ts">
  import { getAmount, isRedesignV15 } from 'razorpay';
  import { locale, t } from 'svelte-i18n';
  import Icon from 'ui/elements/Icon.svelte';
  import {
    NO_COST_EMI_DESCRIPTION,
    NO_COST_HEADER,
    NO_COST_OFFER_DESCRIPTION,
  } from 'ui/labels/emi-details';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';
  import { popStack } from 'navstack';
  import { formatTemplateWithLocale } from 'i18n';

  function onClose() {
    popStack();
  }

  export let formatter;
  export let plan;

  const amount = getAmount();
  const totalAmountNormal = amount / (1 - plan.merchant_payback / 100);
  let totalAmountDiscount = totalAmountNormal - amount;
  totalAmountDiscount = formatter(totalAmountDiscount);
  const totalAmountNoCost = formatter(amount);

  const { merchant_payback, duration } = plan;
  const rate = (
    (merchant_payback * 12) /
    duration /
    (1 - plan.merchant_payback / 100)
  ).toFixed(2);
</script>

<div id="no-cost-overlay" class:no-cost-overlay-onecc={isRedesignV15()}>
  <div class="no-cost-explainer-header">
    <!-- LABEL: How does No Cost EMI work? -->
    <header>{$t(NO_COST_HEADER)}</header>
    <div class="no-cost-close" on:click={onClose}>
      <Icon icon={close()} />
    </div>
  </div>
  <div class="no-cost-body">
    <p class="no-cost-desc">
      {formatTemplateWithLocale(
        NO_COST_OFFER_DESCRIPTION,
        { amount: totalAmountNoCost },
        $locale
      )}
    </p>
    <p class="no-cost-desc">
      {$t(NO_COST_EMI_DESCRIPTION)}
    </p>
    <div class="no-cost-explainer">
      <div class="row">
        <p>Interest</p>
        <b>{totalAmountDiscount} ({rate}%)</b>
      </div>
      <div class="row">
        <p>EMI Discount</p>
        <b>-{totalAmountDiscount}</b>
      </div>
      <div class="row">
        <p>Effective Interest</p>
        <b>{formatter(0)}</b>
      </div>
    </div>
  </div>
</div>

<style>
  #no-cost-overlay {
    padding: 20px 16px;
    bottom: -55px;
  }

  .no-cost-overlay-onecc {
    bottom: 0 !important;
  }

  .no-cost-explainer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }
  .no-cost-close {
    cursor: pointer;
  }
  header {
    font-size: 16px;
    font-weight: 600;
    color: #424242;
  }
  .no-cost-body {
    padding: 10px 5px;
    border-top: 1px solid #ebedf0;
    padding-bottom: 0;
  }
  .no-cost-desc {
    margin: 0;
    font-size: 12px;
    line-height: 18px;
    color: #424242;
    text-align: left;
    margin-bottom: 10px;
  }
  .no-cost-explainer {
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: #fcfcfc;
    padding: 14px 12px;
  }
  .row {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .row:nth-last-child(1) {
    border-top: 1px dashed #ebedf0;
    margin-bottom: 0;
    padding-top: 12px;
  }
  .row p {
    margin: 0;
    font-size: 12px;
    color: #757575;
    font-weight: 400;
  }
  .row b {
    font-weight: 700;
    font-size: 14px;
    color: #424242;
  }
  .row:nth-child(2) b {
    color: #55ab68;
  }
</style>
