<script lang="ts">
  import { popStack } from 'navstack';

  // Svelte imports
  import { onMount } from 'svelte';

  import Razorpay from 'common/Razorpay';

  // Store imports
  import { methodInstrument } from 'checkoutstore/screens/home';

  import { getEMIBanks } from 'checkoutstore/methods';

  // Util imports
  import { getSession } from 'sessionmanager';
  import { roundUpToNearestMajor } from 'common/currency';
  import { filterBanksAgainstInstrument, useBankOverrides } from './helper';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale, getEmiIssuerName } from 'i18n';
  import {
    EMI_TENURE,
    EMI_TENURE_LABEL,
    INSTALLMENTS_LABEL,
    INTEREST_RATE_LABEL,
    SELECT_BANK_LABEL,
    TOTAL_LABEL,
  } from './label.18n';
  import { formatAmountWithCurrency } from 'helper/currency';
  import { getAmount } from 'razorpay';

  const session = getSession();
  let banks: EMIPlanView.EMIPlanData;
  let selected: string;
  let amount: number;
  let banksList: EMIPlanView.EMIPlan[] = [];
  let plans: any = [];
  let filteredBankList: EMIPlanView.EMIPlan[] = [];

  onMount(() => {
    const discountedAmount = session.getDiscountedAmount();
    const bankData: any = getEMIBanks(discountedAmount);
    if (
      !(
        bankData.AMEX &&
        (!session.isOfferApplicableOnIssuer('amex') ||
          discountedAmount > bankData.AMEX.min_amount)
      )
    ) {
      delete bankData.AMEX;
    }
    banks = useBankOverrides(bankData);
    // select default first bank
    selected = Object.keys(banks)?.[0];
  });

  $: {
    if (banks && selected) {
      let selectedBank = (banks[selected] || {}).code;
      if (selectedBank && session.isOfferApplicableOnIssuer(selectedBank)) {
        amount = session.getDiscountedAmount();
      } else {
        amount = getAmount();
      }
    }
  }

  // Sort the list by bank names
  $: banksList = _Obj
    .values(banks || {})
    .sort((a: EMIPlanView.EMIPlan, b: EMIPlanView.EMIPlan) =>
      a.name.localeCompare(b.name)
    );

  $: filteredBankList = filterBanksAgainstInstrument(
    banksList,
    $methodInstrument
  );

  $: {
    if (banks && selected) {
      let _plans = (banks[selected] || {}).plans || {};
      _plans = _Obj.map(
        _plans,
        (plan: EMIPlanView.EMIPlanDurationData, duration: number) => {
          let { installment, total } = Razorpay.emi.calculatePlan(
            amount,
            duration,
            plan.interest
          );

          if (selected === 'BAJAJ') {
            installment = roundUpToNearestMajor(
              installment,
              session.get('currency')
            );
          }

          return {
            duration: duration,
            rate: plan.interest,
            monthly: formatAmountWithCurrency(installment),
            total: formatAmountWithCurrency(total),
          };
        }
      );

      plans = _Obj.entries(_plans);
    }
  }

  function hide() {
    popStack();
  }
</script>

<div id="emi-inner">
  <div class="row em select">
    <div class="col">
      <!-- LABEL: Select Bank: -->
      {$t(SELECT_BANK_LABEL)}
    </div>
    <i class="i select-arrow">&#xe601;</i>
    <select id="emi-bank-select" bind:value={selected}>
      {#each filteredBankList as bank (bank.code)}
        <option value={bank.code}>
          {getEmiIssuerName(bank.code, $locale, bank.name)}
        </option>
      {/each}
    </select>
  </div>
  <strong class="row">
    <div class="col">
      <!-- LABEL: EMI Tenure -->
      {$t(EMI_TENURE_LABEL)}
    </div>
    <div class="col">
      <!-- LABEL: Interest Rate -->
      {$t(INTEREST_RATE_LABEL)}
    </div>
    <div class="col">
      <!-- LABEL: Monthly Installments -->
      {$t(INSTALLMENTS_LABEL)}
    </div>
    <div class="col">
      <!-- LABEL: Total Money -->
      {$t(TOTAL_LABEL)}
    </div>
  </strong>
  <div />
  {#each plans as [duration, plan] (duration)}
    <div class="row emi-option">
      <div class="col">
        <!-- LABEL: {duration} Months -->
        {formatTemplateWithLocale(EMI_TENURE, { duration }, $locale)}
      </div>
      <div class="col">{plan.rate}%</div>
      <div class="col">{plan.monthly}</div>
      <div class="col">{plan.total}</div>
    </div>
  {/each}
  <div id="emi-close" class="close" on:click={hide}>×</div>
</div>

<style lang="scss">
  #emi-inner {
    width: 500px;
    top: 50%;
    bottom: auto !important; /** override overlay style */
    transform: translate(-50%, -50%);
    left: 50%;
    border-radius: 3px;
    max-width: 100vw;
  }

  .row {
    padding: 16px 0;

    &:not(:first-child) {
      height: 16px;
      border-top: 1px solid #e9e9e9;
    }
  }

  strong {
    display: block;
  }

  select {
    background: white;
    padding: 6px 8px;
    float: left;
    width: 200px;
  }

  .col {
    width: 25%;
    float: left;
    white-space: nowrap;
  }

  .em {
    line-height: 32px;
    font-size: 18px;
    text-align: left;
    position: relative;
    margin-left: 26px;
  }

  i {
    position: relative;
    top: -1px;
    left: -18px;
    font-size: 22px;
  }

  :global(#container.mobile) #emi-inner {
    bottom: 0 !important;
    top: auto;
    transform: initial;
    border-radius: 0;
    left: 0;
    width: 100%;

    .col {
      white-space: normal;
    }

    .em {
      font-size: 14px;
      margin-left: 10px;
    }
  }
</style>
