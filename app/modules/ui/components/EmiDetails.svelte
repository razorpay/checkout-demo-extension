<script>
  // Store
  import {
    newCardEmiDuration,
    savedCardEmiDuration,
    selectedPlan,
  } from 'checkoutstore/emi';
  import Razorpay from 'common/Razorpay';

  // Util imports
  import { getAmount, getCurrency } from 'checkoutstore';
  import { formatAmountWithSymbol } from 'common/currency';

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
        getCurrency()
      );
    }
  }
</script>

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

<div class="transaction-details pad">
  <div class="detail">
    <div>EMI</div>
    <div>{formattedInstallmentAmount}</div>
  </div>
  <div class="detail">
    <div>Tenure</div>
    <div>{duration} Months</div>
  </div>
  <div class="detail">
    <div>Interest</div>
    <div>{interest}%</div>
  </div>
</div>
