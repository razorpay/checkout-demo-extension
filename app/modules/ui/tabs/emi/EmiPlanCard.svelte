<script lang="ts">
  // Util imports
  import Razorpay from 'common/Razorpay';
  import { getSession } from 'sessionmanager';
  import { roundUpToNearestMajor } from 'common/currency';
  import { pushOverlay } from 'navstack';

  // Store imports
  import { appliedOffer } from 'offers/store';

  // UI imports
  import ExpandableCard from 'ui/elements/ExpandableCard.svelte';
  import NoCostExplainer from 'ui/components/offers/NoCostExplainer.svelte';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale, getShortBankName } from 'i18n';

  import {
    PLAN_TITLE,
    NO_COST_LABEL,
    INTEREST_CHARGED_LABEL,
    NO_COST_DISCOUNT_LABEL,
    NO_COST_EXPLAIN_ACTION,
    CREDIT_EMI_DESCRIPTION,
    AXIS_BANK_EMI,
    CITI_BANK_EMI,
    CITI_KNOW_MORE,
    SHOW_MORE,
    SHOW_LESS,
    CITI_URL,
    DESCRIPTION_MONTHLY_INSTALLMENT,
    PROCESSING_FEE,
    STAMP_DUTY,
    DESCRIPTION_TOTAL_AMOUNT,
    DEFAULT_PROCESSING_FEE_DISCLAIMER,
    SBIN_BANK_EMI,
    SBIN_DEBIT_DESCRIPTION_CONVENIENCE,
    ICICI_BANK_EMI,
    ICICI_DEBIT_DESCRIPTION_CONVENIENCE,
    KOTAK_CREDIT_DESCRIPTION_CONVENIENCE,
    DEBIT_DESCRIPTION_MIN_BALANCE,
    DEBIT_DESCRIPTION_INCLUDES_INTEREST,
    DEBIT_DESCRIPTION_CONVENIENCE,
  } from 'ui/labels/emi';
  import { formatAmountWithCurrency } from 'helper/currency';
  import { isDebitIssuer } from 'common/bank';

  // Props
  export let amount;
  export let plan;
  export let bank: string;
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
  let amountAfterDiscount;

  let processingFee, processingFeeDisclaimer, stampDuty;

  let interestChargedByBank;

  let zestMoneyForcedEmiOffer = null;

  const session = getSession();
  const AXIS_BANK_CODE = 'UTIB';
  const CITI_BANK_CODE = 'CITI';
  const HDFC_BANK_CODE = 'HDFC';
  const SBIN_BANK_CODE = 'SBIN';
  const KOTAK_BANK_CODE = 'KKBK';
  const ICICI_BANK_CODE = 'ICIC';
  const RBL_BANK_CODE = 'RATN';

  $: {
    zestMoneyForcedEmiOffer = provider === 'zestmoney' && plan.duration === 3;
  }

  $: {
    processingFee =
      plan.processing_fee && formatAmountWithCurrency(plan.processing_fee);
    stampDuty = plan.stamp_duty && formatAmountWithCurrency(plan.stamp_duty);
    processingFeeDisclaimer = plan.processing_fee_disclaimer;
  }

  // amountPerMonth
  $: {
    // Don't calculate if amount_per_month exists
    if (plan.amount_per_month) {
      amountPerMonth = plan.amount_per_month;
    } else {
      amountPerMonth = Razorpay.emi.calculator(
        amountAfterDiscount,
        plan.duration,
        plan.interest
      );
    }
  }

  // TODO: move this to a store and consume
  $: {
    if ($appliedOffer && $appliedOffer.amount) {
      amountAfterDiscount = $appliedOffer.amount;
    } else {
      amountAfterDiscount = amount;
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
    noCostEmi = plan.subvention === 'merchant' || zestMoneyForcedEmiOffer;
    if (noCostEmi && plan.merchant_payback) {
      interestChargedByBank = formatAmountWithCurrency(
        amount / (1 - plan.merchant_payback / 100) - amount
      );
    }
  }

  $: isCardEmi = !provider;
  $: showInterest =
    !isCardEmi || !['zestmoney', 'earlysalary'].includes(provider);
  $: formattedAmount = formatAmountWithCurrency(amountAfterDiscount);
  $: formattedAmountPerMonth = formatAmountWithCurrency(amountPerMonth);
  $: formattedFinalAmount = formatAmountWithCurrency(
    plan.duration * amountPerMonth
  );

  $: isBajajEmi = bank === 'BAJAJ';
  $: showEducation = !isBajajEmi;

  function explain() {
    pushOverlay({
      component: NoCostExplainer,
      props: {
        plan: plan,
        formatter: formatAmountWithCurrency,
      },
    });
  }

  let citiBankDetailsExpandedView = false;

  function toggleCitiBankCardDetails() {
    citiBankDetailsExpandedView = !citiBankDetailsExpandedView;
  }
</script>

<ExpandableCard showRadio {expanded} on:click>
  <div slot="title">
    <!-- LABEL: {duration} Months ({amount}/mo) -->
    {formatTemplateWithLocale(
      PLAN_TITLE,
      { duration: plan.duration, amount: formattedAmountPerMonth },
      $locale
    )}
    {#if showInterest}
      &nbsp;@
      {(noCostEmi && $t(NO_COST_LABEL)) || `${plan.interest}%`}
    {/if}
  </div>
  <div slot="detail">
    {#if showEducation}
      {#if noCostEmi && !zestMoneyForcedEmiOffer}
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
        {#if isDebitIssuer(bank)}
          <!-- TODO: Combine both labels and allow inline-block from within template -->
          <!-- LABEL: No minimum balance is required. There will be no amount blocked on your card. You will pay -->
          {$t(DEBIT_DESCRIPTION_MIN_BALANCE)}
          <span class="inline-block">{formattedAmountPerMonth}/mo</span>
          <!-- If the plan is a noCost emi PLAN_INTEREST, don't show interest applicable string -->
          {#if !noCostEmi}
            <!-- LABEL: (includes interest). -->
            {$t(DEBIT_DESCRIPTION_INCLUDES_INTEREST)}
          {:else}
            <!-- Adding full stop to end sentence -->
            <span>.</span>
          {/if}
        {:else if bank === CITI_BANK_CODE}
          <!-- LABEL: Full amount of {formattedAmount} will be deducted from your account. EMI processing may take upto 8 working days. -->
          {formatTemplateWithLocale(
            CITI_BANK_EMI,
            { amount: formattedAmount },
            $locale
          )}
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
              target="_blank"
            >
              <!--LABEL: In case the total amount due has not been paid in full, finance charges as applicable (currently, between 3.50%- 3.60% per month i.e. 42-43.2% annualized) on card balances may apply until the EMI is converted & posted to the card. Latest rates are available at https://www.online.citibank.co.in/portal/newgen/cards/tab/creditcards_tc.htm -->
              {$t(CITI_URL)}
            </a>
          {/if}
        {:else if bank === AXIS_BANK_CODE}
          <!--LABEL: Full amount of Rs {amount} would be deducted from your account, which will be converted into EMI by your bank in 3-4 days. Convenience fee of 1% of transaction amount or Rs 100 whichever is higher + GST applicable for EMI transactions on Axis bank cards.' -->
          {formatTemplateWithLocale(
            AXIS_BANK_EMI,
            { amount: formattedAmount },
            $locale
          )}
        {:else if bank === SBIN_BANK_CODE}
          <!--LABEL: Full amount of Rs {amount} would be deducted from your account, which will be converted into EMI by your bank in 3-4 days. Convenience fee of 1% of transaction amount or Rs 100 whichever is higher + GST applicable for EMI transactions on Axis bank cards.' -->
          {formatTemplateWithLocale(
            SBIN_BANK_EMI,
            { amount: formattedAmount },
            $locale
          )}
        {:else if bank === ICICI_BANK_CODE}
          <!--Full Amount of {amount} will be deducted from your card account, which will be converted into EMI by your issuer in 4-5 days.  -->
          {formatTemplateWithLocale(
            ICICI_BANK_EMI,
            { amount: formattedAmount },
            $locale
          )}
        {:else}
          <!-- LABEL: Full amount of {formattedAmount} will be deducted from your account, which will be converted into EMI by your bank in 3-4 days. -->
          {formatTemplateWithLocale(
            CREDIT_EMI_DESCRIPTION,
            { amount: formattedAmount },
            $locale
          )}
        {/if}
        {#if bank === HDFC_BANK_CODE || isDebitIssuer(bank) || bank === RBL_BANK_CODE}
          <!-- LABEL: Convenience Fee of ₹99 + GST applicable for EMI transactions on {bank} Cards. -->
          {formatTemplateWithLocale(
            DEBIT_DESCRIPTION_CONVENIENCE,
            { bank: getShortBankName(bank.replace('_DC', ''), $locale) },
            $locale
          )}
        {:else if bank === SBIN_BANK_CODE}
          <span style="display:block">
            {formatTemplateWithLocale(
              SBIN_DEBIT_DESCRIPTION_CONVENIENCE,
              $locale
            )}
          </span>
        {:else if bank === ICICI_BANK_CODE}
          <!-- A processing fee of ₹ 199 + taxes will be applicable for EMI transactions done on ICICI Credit Card -->
          <span style="display:block">
            {formatTemplateWithLocale(
              ICICI_DEBIT_DESCRIPTION_CONVENIENCE,
              $locale
            )}
          </span>
        {:else if bank === KOTAK_BANK_CODE}
          <!-- A processing fee of ₹ 199 + taxes will be applicable for EMI transactions done on Kotak Credit Card -->
          <span style="display:block">
            {formatTemplateWithLocale(
              KOTAK_CREDIT_DESCRIPTION_CONVENIENCE,
              $locale
            )}
          </span>
        {/if}
      {:else}
        <ul class="cardless-emi-plan-details">
          <!-- LABEL: Monthly Installment: {amount} -->
          <li>
            <div>
              <span>{$t(DESCRIPTION_MONTHLY_INSTALLMENT)}</span>
              <span>{formattedAmountPerMonth}</span>
            </div>
          </li>
          {#if processingFee}
            <li>
              <div>
                <!-- LABEL: Processing Fee: {amount} -->
                <span>{$t(PROCESSING_FEE)}</span>
                <span>{processingFee}</span>
              </div>
            </li>
          {/if}
          {#if stampDuty}
            <li>
              <div>
                <!-- LABEL: Stamp Duty: {amount} -->
                <span>{$t(STAMP_DUTY)}</span>
                <span>{stampDuty}</span>
              </div>
            </li>
          {/if}
          <!-- LABEL: Total Amount: {formattedFinalAmount} ({formattedAmountPerMonth} x {plan.duration}) -->
          <li>
            <div>
              <span>
                {$t(DESCRIPTION_TOTAL_AMOUNT)}
                ({formattedAmountPerMonth}
                x
                {plan.duration}
                )
              </span>
              <span>{formattedFinalAmount}</span>
            </div>
          </li>
        </ul>
        <!-- Zestmoney is unable to send us the processing fee disclaimer as of now
        For that specific provider, show a hardcoded string until it's present in BE
         -->
        {#if processingFee && (processingFeeDisclaimer || provider === 'zestmoney' || provider === 'earlysalary')}
          <div class="processing-fee-disclaimer">
            {processingFeeDisclaimer || $t(DEFAULT_PROCESSING_FEE_DISCLAIMER)}
          </div>
        {/if}
      {/if}
      {#if noCostEmi && !zestMoneyForcedEmiOffer}
        <!-- LABEL: + How does it work? -->
        <div class="theme-highlight how-it-works" on:click={explain}>
          {$t(NO_COST_EXPLAIN_ACTION)}
        </div>
      {/if}
    {/if}
  </div>
</ExpandableCard>

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
    margin: 0 0 6px !important;
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
    word-break: break-word;
  }
  .citi-url:hover {
    color: #0a47c1;
  }
</style>
