<script lang="ts">
  // Util imports
  import Razorpay from 'common/Razorpay';

  // UI imports
  import ExpandableCard from 'ui/elements/ExpandableCard.svelte';
  import { formatAmountWithCurrency } from 'helper/currency';

  // Store imports
  import { appliedOffer } from 'offers/store';
  import { formatTemplateWithLocale } from 'i18n';
  import {
    DESCRIPTION_MONTHLY_INSTALLMENT,
    DESCRIPTION_TOTAL_AMOUNT,
    NO_COST_EXPLAIN,
    NO_INTEREST_APPLICABLE,
    PLAN_INTEREST,
    PLAN_TITLE_V2,
    PROCESSING_FEE,
    STAMP_DUTY,
  } from 'ui/labels/emi';
  import { locale, t } from 'svelte-i18n';
  import { pushOverlay } from 'navstack';
  import NoCostExplainer from 'ui/components/offers/NoCostExplainerNew.svelte';
  import type { EmiPlan } from 'emiV2/types';
  import {
    handlePlanDescription,
    isCardlessPlanNoCost,
  } from 'emiV2/helper/plans';
  import NoCostLabel from 'components/Label/NoCostLabel.svelte';
  import { NO_COST_EMI } from 'ui/labels/offers';
  import { trackEmiPlansSelected } from 'emiV2/events/tracker';
  import { selectedTab } from 'components/Tabs/tabStore';
  import { emiViaCards, selectedBank } from 'emiV2/store';
  import { isCardlessTab } from 'emiV2/helper/tabs';
  import { getOption } from 'razorpay';

  // Props
  export let plan: EmiPlan;
  export let bank: string;
  export let provider: string;
  export let expanded: boolean;

  // Computed
  let amount: number = getOption('amount');
  let amountPerMonth: number;
  let formattedAmount: string;
  let formattedAmountPerMonth: string;
  let formattedFinalAmount: string;
  let isCardEmi: boolean;
  let noCostEmi: boolean;
  let showInterest;
  let isBajajEmi: boolean;
  let showEducation: boolean;
  let amountAfterDiscount: number;

  let interestChargedByBank: string;
  let zestMoneyForcedEmiOffer = null;

  let descriptionText: string[] = [];

  let processingFee = '';
  let processingFeeDisclaimer;
  let stampDuty = '';

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

  $: {
    if ($appliedOffer && $appliedOffer.amount) {
      amountAfterDiscount = $appliedOffer.amount;
    } else {
      amountAfterDiscount = amount;
    }
  }

  $: isCardEmi = !isCardlessTab();
  $: showInterest =
    !isCardEmi || !['zestmoney', 'earlysalary'].includes(provider);
  $: formattedAmount = formatAmountWithCurrency(amountAfterDiscount);
  $: formattedAmountPerMonth = formatAmountWithCurrency(amountPerMonth);

  $: {
    noCostEmi = plan.subvention === 'merchant' || zestMoneyForcedEmiOffer;
    if (plan.merchant_payback) {
      interestChargedByBank = formatAmountWithCurrency(
        amount / (1 - Number(plan.merchant_payback) / 100) - amount
      );
    } else {
      // TODO Need to get actual API response for merchant payback in case of cardless emi plans
      const totalAmount = amountPerMonth * plan.duration;
      interestChargedByBank = formatAmountWithCurrency(totalAmount - amount);
    }
  }

  $: isBajajEmi = bank === 'BAJAJ';
  $: showEducation = !isBajajEmi;

  $: {
    descriptionText = handlePlanDescription(
      $selectedTab === 'debit' ? `${bank}_DC` : bank,
      formattedAmount,
      formattedAmountPerMonth,
      $locale
    );
  }

  $: {
    processingFee = plan.processing_fee
      ? formatAmountWithCurrency(plan.processing_fee)
      : '';
    stampDuty = plan.stamp_duty
      ? formatAmountWithCurrency(plan.stamp_duty)
      : '';
    processingFeeDisclaimer = plan.processing_fee_disclaimer;
  }

  $: formattedFinalAmount = formatAmountWithCurrency(
    plan.duration * amountPerMonth
  );

  function explain() {
    // Track How does No Cost EMI works click
    trackEmiPlansSelected(
      {
        provider_name: $selectedBank?.name || 'NA',
        tab_name: $selectedTab,
        emi_plan: {
          nc_emi_tag: plan.subvention === 'merchant',
          tenure: plan.duration,
        },
        emi_via_cards_screen: $emiViaCards,
      },
      'nc_emi'
    );

    pushOverlay({
      component: NoCostExplainer,
      props: {
        plan: plan,
        formatter: formatAmountWithCurrency,
      },
    });
  }
</script>

<ExpandableCard showRadio {expanded} on:click>
  <div slot="title">
    <div class="title-label">
      <div class="plan-amount">
        {formatTemplateWithLocale(
          PLAN_TITLE_V2,
          { duration: plan.duration, amount: formattedAmountPerMonth },
          $locale
        )}
      </div>
      {#if noCostEmi || isCardlessPlanNoCost(plan)}
        <NoCostLabel text={NO_COST_EMI} expanded={false} />
      {/if}
    </div>
    <p class="interest-label">
      {#if noCostEmi || isCardlessPlanNoCost(plan)}
        {$t(NO_INTEREST_APPLICABLE)}
      {:else}
        {formatTemplateWithLocale(
          PLAN_INTEREST,
          { interest: interestChargedByBank, rate: plan.interest },
          $locale
        )}
      {/if}
    </p>
  </div>
  <div slot="detail">
    <!-- TODO: Temporarily not allowing expansion of cardless emi plans -->
    {#if showEducation && !isCardlessTab()}
      {#if isCardEmi}
        <ul class="details-points">
          {#each descriptionText as text}
            <li>
              {$t(text)}
            </li>
          {/each}
        </ul>
      {:else}
        <ul class="details-points">
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
      {/if}
      {#if noCostEmi}
        <div class="theme-highlight how-it-works" on:click={explain}>
          {$t(NO_COST_EXPLAIN)}
        </div>
      {/if}
    {/if}
  </div>
</ExpandableCard>

<style>
  .title-label {
    display: flex;
    margin-left: -4px;
  }

  .plan-amount {
    white-space: nowrap;
  }
  .interest-label {
    margin: 0;
    color: #8d97a1;
    font-size: 10px;
    font-weight: 400;
    margin-top: 4px;
    line-height: 12.1px;
  }

  .details-points {
    padding-left: 10px;
  }

  .details-points li {
    color: #828282;
    font-size: 11px;
  }

  .how-it-works {
    margin-top: 16px;
    color: #3684d6;
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
  }
  :global(.title-label .badge) {
    margin-left: 8px;
    line-height: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 75px;
  }
  :global(.input-radio label .radio-display) {
    position: unset;
    top: unset;
  }
</style>
