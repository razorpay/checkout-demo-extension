<script>
  /* global hideEmi */

  // Svelte imports
  import Razorpay from 'common/Razorpay';

  // Util imports
  import { getSession } from 'sessionmanager';
  import { roundUpToNearestMajor } from 'common/currency';

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
  } from 'ui/labels/emi-modal';

  // Props
  export let banks;
  export let selected;

  // Computed
  export let amount;
  export let banksList;
  export let plans;

  const session = getSession();

  $: {
    let selectedBank = (banks[selected] || {}).code;
    if (selectedBank && session.isOfferApplicableOnIssuer(selectedBank)) {
      amount = session.getDiscountedAmount();
    } else {
      amount = session.get('amount');
    }
  }

  // Sort the list by bank names
  $: banksList = _Arr.sort(_Obj.values(banks || {}), (a, b) =>
    a.name.localeCompare(b.name)
  );

  $: {
    let _plans = (banks[selected] || {}).plans || {};
    _plans = _Obj.map(_plans, (plan, duration) => {
      let installment = Razorpay.emi.calculator(
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
        monthly: session.formatAmountWithCurrency(installment),
        total: session.formatAmountWithCurrency(installment * duration),
      };
    });

    plans = _Obj.entries(_plans);
  }

  function hide() {
    /* TODO: defined in session, update once session is ported to ES6 */
    hideEmi();
  }
</script>

<div id="emi-inner" class="mchild">
  <div class="row em select">
    <div class="col">
      <!-- LABEL: Select Bank: -->
      {$t(SELECT_BANK_LABEL)}
    </div>
    <i class="i select-arrow">&#xe601;</i>
    <select id="emi-bank-select" bind:value={selected}>
      {#each banksList as bank (bank.code)}
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
