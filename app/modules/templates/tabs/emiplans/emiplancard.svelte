<ExpandableCard
  badge={badge}
  expanded={expanded}

  on:click="fire('click', event)"
>
  <div slot="title">
    {plan.duration} Months ({formattedAmountPerMonth}/mo)
    {#if showInterest}
      &nbsp;@ {plan.interest}%
    {/if}
  </div>
  <div slot="detail">
    {#if isCardEmi}
      Full amount of {formattedAmount} will be deducted from your account, which will be converted into EMI by your bank in 3-4 days.
    {:else}
      <ul>
        <li>Monthly Installment: {formattedAmountPerMonth}</li>
        <li>Total Amount: {formattedFinalAmount} ({formattedAmountPerMonth} x {plan.duration})</li>
      </ul>
    {/if}

    {#if noCostEmi}
      <p>
        Note: This excludes GST that will be charged by your bank on your interest component of the EMI
      </p>
    {/if}
  </div>
</ExpandableCard>

<script>
  import Razorpay from 'common/Razorpay';
  export default {
    components: {
      ExpandableCard: 'templates/views/ui/ExpandableCard.svelte',
    },

    computed: {
      amountPerMonth: ({ amount, plan }) => Razorpay.emi.calculator(
        amount,
        plan.duration,
        plan.interest
      ),
      noCostEmi: ({ plan }) => plan.subvention === 'merchant',
      badge: ({ noCostEmi }) => noCostEmi ? 'No cost EMI' : false,
      isCardEmi: ({ provider }) => !provider,
      showInterest: ({ provider, isCardEmi }) => !isCardEmi || !_Arr.contains(['zestmoney', 'earlysalary'], provider),

      formattedAmount: ({ amount, session }) => session.formatAmountWithCurrency(amount),
      formattedAmountPerMonth: ({ amountPerMonth, session }) => session.formatAmountWithCurrency(amountPerMonth),
      formattedFinalAmount: ({ plan, amountPerMonth, session }) => session.formatAmountWithCurrency(plan.duration * amountPerMonth),
    },
  }
</script>
