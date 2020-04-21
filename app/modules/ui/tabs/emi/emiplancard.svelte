<script>
  // Util imports
  import Razorpay from 'common/Razorpay';
  import { getSession } from 'sessionmanager';
  import { roundUpToNearestMajor } from 'common/currency';

  // UI imports
  import ExpandableCard from 'ui/elements/ExpandableCard.svelte';

  // Props
  export let amount;
  export let plan;
  export let bank;
  export let provider;
  export let expanded;

  // Computed
  export let amountPerMonth;
  export let formattedAmount;
  export let formattedAmountPerMonth;
  export let formattedFinalAmount;
  export let isCardEmi;
  export let noCostEmi;
  export let showInterest;

  let interestChargedByBank;

  const session = getSession();
  const HDFC_BANK_CODE = 'HDFC';
  const HDFC_BANK_DEBIT_CODE = 'HDFC_DC';

  // amountPerMonth
  $: {
    // Don't calculate if amount_per_month exists
    if (plan.amount_per_month) {
      amountPerMonth = plan.amount_per_month;
    } else {
      amountPerMonth = Razorpay.emi.calculator(
        amount,
        plan.duration,
        plan.interest
      );
    }
  }

  $: {
    if (bank === 'BAJAJ' && amountPerMonth) {
      amountPerMonth = roundUpToNearestMajor(
        amountPerMonth,
        session.get('currency')
      );
    }
  }

  $: {
    noCostEmi =
      plan.subvention === 'merchant' ||
      (provider === 'zestmoney' && plan.duration === 3);
    if (noCostEmi && plan.merchant_payback) {
      interestChargedByBank = session.formatAmountWithCurrency(
        amount / (1 - plan.merchant_payback / 100) - amount
      );
    }
  }
  $: isCardEmi = !provider;
  $: showInterest =
    !isCardEmi || !_Arr.contains(['zestmoney', 'earlysalary'], provider);
  $: formattedAmount = session.formatAmountWithCurrency(amount);
  $: formattedAmountPerMonth = session.formatAmountWithCurrency(amountPerMonth);
  $: formattedFinalAmount = session.formatAmountWithCurrency(
    plan.duration * amountPerMonth
  );

  function explain() {
    session.showNoCostExplainer(plan);
  }
</script>

<style>
  span.inline-block {
    display: inline-block;
  }
  .how-it-works {
    margin-top: 6px;
  }
  .right {
    float: right;
  }
  .nocost {
    line-height: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    margin: -10px 0 6px !important;
    padding-bottom: 6px;
  }
</style>

<ExpandableCard showRadio {expanded} on:click>
  <div slot="title">
    {plan.duration} Months ({formattedAmountPerMonth}/mo)
    {#if showInterest}
      &nbsp;@ {(noCostEmi && 'No Cost') || `${plan.interest}%`}
    {/if}
  </div>
  <div slot="detail">
    {#if noCostEmi}
      <ul class="nocost">
        <li>
          Interest charged by the bank
          <span class="right">{interestChargedByBank}</span>
        </li>
        <li class="theme-highlight">
          No Cost EMI offer discount
          <span class="right">- {interestChargedByBank}</span>
        </li>
      </ul>
    {/if}
    {#if isCardEmi}
      {#if bank === HDFC_BANK_DEBIT_CODE}
        No minimum balance is required. There will be no amount blocked on your
        card. You will pay
        <span class="inline-block">{formattedAmountPerMonth}/mo</span>
        (includes interest).
      {:else}
        Full amount of {formattedAmount} will be deducted from your account,
        which will be converted into EMI by your bank in 3-4 days.
      {/if}
      {#if bank === HDFC_BANK_CODE || bank === HDFC_BANK_DEBIT_CODE}
        Convenience Fee of ₹99 + GST applicable for EMI transactions on HDFC
        Bank Cards.
      {/if}
    {:else}
      <ul>
        <li>Monthly Installment: {formattedAmountPerMonth}</li>
        <li>
          Total Amount: {formattedFinalAmount} ({formattedAmountPerMonth} x {plan.duration})
        </li>
      </ul>
    {/if}
    {#if noCostEmi}
      <div class="theme-highlight how-it-works" on:click={explain}>
        + How does it work?
      </div>
    {/if}
  </div>

</ExpandableCard>
