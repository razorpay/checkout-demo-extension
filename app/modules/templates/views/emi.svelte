<div id="emi-inner" class="mchild">
  <div class="row em select">
    <div class="col">Select Bank:</div>
    <i class="i select-arrow">&#xe601;</i>
    <select id="emi-bank-select" bind:value='selected'>
      {#each Object.entries(banks) as [i, bank]}
        <option value="{i}">{bank.name}</option>
      {/each}
    </select>
  </div>
  <strong class="row">
    <div class="col">EMI Tenure</div>
    <div class="col">Interest Rate</div>
    <div class="col">Monthly Installments</div>
    <div class="col">Total Money</div>
  </strong>
  <div>
  </div>
  {#each Object.entries(plans) as [duration, plan]}
  <div class="row emi-option">
    <div class="col">{plan.duration} Months</div>
    <div class="col">{plan.rate}%</div>
    <div class="col">₹ {plan.monthly}</div>
    <div class="col">₹ {plan.total}</div>
  </div>
  {/each}
  <div id="emi-close" class="close" on:click="hide()">×</div>
</div>

<script>
  import Razorpay from 'common/Razorpay';
  /* global hideEmi */

  export default {
    computed: {
      amount: data => {
        let session = data.session;
        let selectedBank = (data.banks[data.selected] || {}).code;
        if (selectedBank && session.isOfferApplicableOnIssuer(selectedBank)) {
          return session.getDiscountedAmount();
        } else {
          return session.get('amount');
        }
      },
      plans: data => {
        let plans = (data.banks[data.selected] || {}).plans || {};
        return _Obj.map(plans, (plan, duration) => {
          let installment = Razorpay.emi.calculator(
            data.amount,
            duration,
            plan.interest
          );
          return {
            duration: duration,
            rate: plan.interest,
            monthly: (installment / 100).toFixed(2),
            total: (installment * duration / 100).toFixed(2),
          };
        });
      },
    },
    methods: {
      hide: _ => {
        /* TODO: defined in session, update once session is ported to ES6 */
        hideEmi();
      },
    },
  };
</script>