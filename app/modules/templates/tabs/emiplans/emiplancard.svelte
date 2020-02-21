<script>
  // Util imports
  import Razorpay from 'common/Razorpay';
  import { getSession } from 'sessionmanager';
  import { roundUpToNearestMajor } from 'common/currency';

  // UI imports
  import ExpandableCard from 'templates/views/ui/ExpandableCard.svelte';

  // Props
  export let amount;
  export let plan;
  export let bank;
  export let provider;
  export let expanded;

  // Computed
  export let amountPerMonth;
  export let badge;
  export let formattedAmount;
  export let formattedAmountPerMonth;
  export let formattedFinalAmount;
  export let isCardEmi;
  export let noCostEmi;
  export let showInterest;

  const session = getSession();
  const HDFC_BANK_CODE = 'HDFC';

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

  $: noCostEmi =
    plan.subvention === 'merchant' ||
    (provider === 'zestmoney' && plan.duration === 3);
  $: badge = noCostEmi ? 'No cost EMI' : false;
  $: isCardEmi = !provider;
  $: showInterest =
    !isCardEmi || !_Arr.contains(['zestmoney', 'earlysalary'], provider);
  $: formattedAmount = session.formatAmountWithCurrency(amount);
  $: formattedAmountPerMonth = session.formatAmountWithCurrency(amountPerMonth);
  $: formattedFinalAmount = session.formatAmountWithCurrency(
    plan.duration * amountPerMonth
  );
</script>

<ExpandableCard showRadio="true" {badge} {expanded} on:click>
  <div slot="title">
    {plan.duration} Months ({formattedAmountPerMonth}/mo)
    {#if showInterest}&nbsp;@ {plan.interest}%{/if}
  </div>
  <div slot="detail">
    {#if plan.subvention !== 'merchant'}
      {#if isCardEmi}
        Full amount of {formattedAmount} will be deducted from your account,
        which will be converted into EMI by your bank in 3-4 days.
        {#if bank === HDFC_BANK_CODE}
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
        <p>
          Note: This excludes GST that will be charged by your bank on your
          interest component of the EMI
        </p>
      {/if}
    {/if}
  </div>

</ExpandableCard>
