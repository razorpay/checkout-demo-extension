<script>
  // Util imports
  import Razorpay from 'common/Razorpay';
  import { getSession } from 'sessionmanager';
  import { roundUpToNearestMajor } from 'common/currency';

  // Store imports
  import { appliedOffer } from 'checkoutstore/offers';

  // UI imports
  import ExpandableCard from 'ui/elements/ExpandableCard.svelte';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    PLAN_TITLE,
    NO_COST_LABEL,
    INTEREST_CHARGED_LABEL,
    NO_COST_DISCOUNT_LABEL,
    NO_COST_EXPLAIN_ACTION,
    CREDIT_EMI_DESCRIPTION,
    CITI_BANK_EMI,
    CITI_KNOW_MORE,
    SHOW_MORE,
    SHOW_LESS,
    CITI_URL,
    HDFC_DEBIT_DESCRIPTION_MIN_BALANCE,
    HDFC_DEBIT_DESCRIPTION_INCLUDES_INTEREST,
    HDFC_DEBIT_DESCRIPTION_CONVENIENCE,
    DESCRIPTION_MONTHLY_INSTALLMENT,
    PROCESSING_FEE,
    STAMP_DUTY,
    DESCRIPTION_TOTAL_AMOUNT,
  } from 'ui/labels/emi';

  // Props
  export let amount;
  export let plan;
  export let bank;
  export let provider;
  export let expanded;

  // Computed
  let amountPerMonth;
  let formattedAmount;
  let formattedAmountPerMonth;
  let formattedFinalAmount;
  let isCardEmi;
  let noCostEmi;
  let showInterest;
  let isBajajEmi;
  let showEducation;

  let processingFee, processingFeeDisclaimer, stampDuty;

  let interestChargedByBank;

  const session = getSession();
  const CITI_BANK_CODE = 'CITI';
  const HDFC_BANK_CODE = 'HDFC';
  const HDFC_BANK_DEBIT_CODE = 'HDFC_DC';

  $: {
    processingFee =
      plan.processing_fee &&
      session.formatAmountWithCurrency(plan.processing_fee);
    stampDuty =
      plan.stamp_duty && session.formatAmountWithCurrency(plan.stamp_duty);
    processingFeeDisclaimer = plan.processing_fee_disclaimer;
  }

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
    if (isBajajEmi && amountPerMonth) {
      amountPerMonth = roundUpToNearestMajor(
        amountPerMonth,
        session.get('currency')
      );
    }
  }

  $: {
    //Do not auto apply No-Cost EMI offer if no offer is selected by the customer.
    if (!$appliedOffer) {
      noCostEmi = false;
    } else if ($appliedOffer && $appliedOffer.emi_subvention) {
      /* No-Cost EMI offers have emi_subvention property which is not present for other offers.
    Only select No-Cost EMI offer if that is selected by the customer. */
      noCostEmi =
        plan.subvention === 'merchant' ||
        (provider === 'zestmoney' && plan.duration === 3);
      if (noCostEmi && plan.merchant_payback) {
        interestChargedByBank = session.formatAmountWithCurrency(
          amount / (1 - plan.merchant_payback / 100) - amount
        );
      }
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

  $: isBajajEmi = bank === 'BAJAJ';
  $: showEducation = !isBajajEmi;

  function explain() {
    session.showNoCostExplainer(plan);
  }

  let citiBankDetailsExpandedView = false;

  function toggleCitiBankCardDetails() {
    citiBankDetailsExpandedView = !citiBankDetailsExpandedView;
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

  .processing-fee-disclaimer {
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px solid #e6e7e8;
  }
  .citi-link {
    text-decoration: underline;
  }
  .citi-link:hover {
    font-weight: bold;
    color: #626a74;
  }
  .citi-url {
    color: #528ff0;
  }
  .citi-url:hover {
    color: #0a47c1;
  }
</style>

<ExpandableCard showRadio {expanded} on:click>
  <div slot="title">
    <!-- LABEL: {duration} Months ({amount}/mo) -->
    {formatTemplateWithLocale(PLAN_TITLE, { duration: plan.duration, amount: formattedAmountPerMonth }, $locale)}
    {#if showInterest}
      &nbsp;@ {(noCostEmi && $t(NO_COST_LABEL)) || `${plan.interest}%`}
    {/if}
  </div>
  <div slot="detail">
    {#if showEducation}
      {#if noCostEmi}
        <ul class="nocost">
          <li>
            <!-- LABEL: Interest charged by the bank -->
            {$t(INTEREST_CHARGED_LABEL)}
            <span class="right">{interestChargedByBank}</span>
          </li>
          <li class="theme-highlight">
            <!-- LABEL: No Cost EMI offer discount -->
            {$t(NO_COST_DISCOUNT_LABEL)}
            <span class="right">- {interestChargedByBank}</span>
          </li>
        </ul>
      {/if}
      {#if isCardEmi}
        {#if bank === HDFC_BANK_DEBIT_CODE}
          <!-- TODO: Combine both labels and allow inline-block from within template -->
          <!-- LABEL: No minimum balance is required. There will be no amount blocked on your
        card. You will pay -->
          {$t(HDFC_DEBIT_DESCRIPTION_MIN_BALANCE)}
          <span class="inline-block">{formattedAmountPerMonth}/mo</span>
          <!-- LABEL: (includes interest). -->
          {$t(HDFC_DEBIT_DESCRIPTION_INCLUDES_INTEREST)}
        {:else if bank === CITI_BANK_CODE}
          <!-- LABEL: Full amount of {formattedAmount} will be deducted from your account.
          EMI processing may take upto 8 working days. -->
          {formatTemplateWithLocale(CITI_BANK_EMI, { amount: formattedAmount }, $locale)}
          <div class="citi-link" on:click={toggleCitiBankCardDetails}>
            {#if citiBankDetailsExpandedView}
              {$t(SHOW_LESS)}
            {:else}{$t(SHOW_MORE)}{/if}
          </div>
          {#if citiBankDetailsExpandedView}
            {$t(CITI_KNOW_MORE)}
            <a
              class="citi-url"
              href="https://www.online.citibank.co.in/portal/newgen/cards/tab/creditcards_tc.htm"
              target="_blank">
              <!-- In case the total amount due has not been paid in full, finance charges as applicable (currently, between 3.50%- 3.60% per month i.e. 42-43.2% annualized) on card balances may apply until the EMI is converted & posted to the card. 
              Latest rates are available at https://www.online.citibank.co.in/portal/newgen/cards/tab/creditcards_tc.htm -->
              {$t(CITI_URL)}
            </a>
          {/if}
        {:else}
          <!-- LABEL: Full amount of {formattedAmount} will be deducted from your account,
        which will be converted into EMI by your bank in 3-4 days. -->
          {formatTemplateWithLocale(CREDIT_EMI_DESCRIPTION, { amount: formattedAmount }, $locale)}
        {/if}
        {#if bank === HDFC_BANK_CODE || bank === HDFC_BANK_DEBIT_CODE}
          <!-- LABEL: Convenience Fee of ₹99 + GST applicable for EMI transactions on HDFC
        Bank Cards. -->
          {$t(HDFC_DEBIT_DESCRIPTION_CONVENIENCE)}
        {/if}
      {:else}
        <ul>
          <!-- LABEL: Monthly Installment: {amount} -->
          <li>
            <span>{$t(DESCRIPTION_MONTHLY_INSTALLMENT)}</span>
            <span>{formattedAmountPerMonth}</span>
          </li>
          {#if processingFee}
            <li>
              <span>{$t(PROCESSING_FEE)}</span>
              <span>{processingFee}</span>
              <!-- TODO: Add label comments -->
            </li>
          {/if}
          {#if stampDuty}
            <li>
              <span>{$t(STAMP_DUTY)}</span>
              <span>{stampDuty}</span>
            </li>
          {/if}
          <!-- LABEL: Total Amount: {formattedFinalAmount} ({formattedAmountPerMonth} x {plan.duration}) -->
          <li>
            <span>{$t(DESCRIPTION_TOTAL_AMOUNT)} {provider}</span>
            <span>{formattedFinalAmount}</span>
          </li>
        </ul>
        <!-- Zestmoney is unable to send us the processing fee disclaimer as of now
        For that specific provider, show a hardcoded string until it's present in BE
         -->
        {#if processingFee && (processingFeeDisclaimer || provider === 'zestmoney')}
          <div class="processing-fee-disclaimer">
            {processingFeeDisclaimer || 'Processing Fee will be charged on the 1st month of EMI'}
          </div>
        {/if}
      {/if}
      {#if noCostEmi}
        <!-- LABEL: + How does it work? -->
        <div class="theme-highlight how-it-works" on:click={explain}>
          {$t(NO_COST_EXPLAIN_ACTION)}
        </div>
      {/if}
    {/if}
  </div>

</ExpandableCard>
