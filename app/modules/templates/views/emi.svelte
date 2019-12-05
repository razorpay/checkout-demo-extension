<script>
  /* global hideEmi */

  // Svelte imports
  import Razorpay from 'common/Razorpay';

  // Util imports
  import { getSession } from 'sessionmanager';

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

  $: banksList = _Obj.entries(banks || {});

  $: {
    let _plans = (banks[selected] || {}).plans || {};
    _plans = _Obj.map(_plans, (plan, duration) => {
      const installment = Razorpay.emi.calculator(
        amount,
        duration,
        plan.interest
      );

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
    <div class="col">Select Bank:</div>
    <i class="i select-arrow">&#xe601;</i>
    <select id="emi-bank-select" bind:value={selected}>
      {#each banksList as [i, bank]}
        <option value={i}>{bank.name}</option>
      {/each}
    </select>
  </div>
  <strong class="row">
    <div class="col">EMI Tenure</div>
    <div class="col">Interest Rate</div>
    <div class="col">Monthly Installments</div>
    <div class="col">Total Money</div>
  </strong>
  <div />
  {#each plans as [duration, plan]}
    <div class="row emi-option">
      <div class="col">{plan.duration} Months</div>
      <div class="col">{plan.rate}%</div>
      <div class="col">{plan.monthly}</div>
      <div class="col">{plan.total}</div>
    </div>
  {/each}
  <div id="emi-close" class="close" on:click={hide}>×</div>
</div>
