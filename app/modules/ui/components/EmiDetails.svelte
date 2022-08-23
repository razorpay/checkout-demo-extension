<script lang="ts">
  // Store
  import { selectedPlan } from 'checkoutstore/emi';

  import Razorpay from 'common/Razorpay';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    INSTALLMENT_LABEL,
    INTEREST_LABEL,
    TENURE,
    TENURE_LABEL,
  } from 'ui/labels/emi-details';

  // Util imports
  import { getCurrency, getAmount, isRedesignV15 } from 'razorpay';
  import { formatAmountWithSymbol } from 'common/currency';

  // Remove the space between Amount and symbol on Magic Checkout Flow
  const spaceAmountWithSymbol = !isRedesignV15();

  let plan;
  let duration;
  let interest;
  let installment;
  let formattedInstallmentAmount;

  $: {
    if ($selectedPlan) {
      plan = $selectedPlan;
      interest = plan.interest;
      duration = plan.duration;
      installment = Razorpay.emi.calculator(getAmount(), duration, interest);
      formattedInstallmentAmount = formatAmountWithSymbol(
        installment,
        getCurrency(),
        spaceAmountWithSymbol
      );
    }
  }
</script>

<div class="transaction-details pad">
  <div class="detail">
    <!-- LABEL: EMI -->
    <div>{$t(INSTALLMENT_LABEL)}</div>
    <div>{formattedInstallmentAmount}</div>
  </div>
  <div class="detail">
    <!-- LABEL: Tenure -->
    <div>{$t(TENURE_LABEL)}</div>
    <!-- LABEL: {duration} Months -->
    <div>{formatTemplateWithLocale(TENURE, { duration }, $locale)}</div>
  </div>
  <div class="detail">
    <!-- LABEL: Interest -->
    <div>{$t(INTEREST_LABEL)}</div>
    <div>{interest}%</div>
  </div>
</div>

<style>
  .transaction-details {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
  }

  .detail {
    display: flex;
    flex-direction: column;
    flex-basis: 33%;
    text-align: center;
    padding: 6px 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background-color: #fcfcfc;
    min-width: 64px;

    div:nth-of-type(1) {
      font-size: 11px;
      color: #757575;
      margin-bottom: 4px;
    }

    div:nth-of-type(2) {
      font-size: 13px;
      color: #363636;
    }
  }
</style>
