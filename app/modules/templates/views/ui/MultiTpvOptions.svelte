<script>
  export let bank;
  export let icons;

  let selectedOption = '';
</script>

<style>
  .multi-tpv {
    padding: 0 24px;
  }
</style>

<div class="multi-tpv input-radio centered">
  <div class="multi-tpv-header">Pay Using</div>
  <input
    checked
    type="radio"
    name="method"
    id="multitpv-netb"
    value="netbanking" />
  <label for="multitpv-netb">
    <i>
      <img src="https://cdn.razorpay.com/bank/{bank.code}.gif" />
    </i>
    <div class="radio-display" />
    <div class="label-content">A/C: {bank.account_number}</div>
    <span>{bank.name}</span>
  </label>
  <input type="radio" name="method" id="multitpv-upi" value="upi" />
  <label for="multitpv-upi">
    <i>
      {@html icons.upi}
    </i>
    <div class="radio-display" />
    <div class="label-content">UPI Payment</div>
    <span>{bank.name} Account {bank.account_number}</span>
  </label>
</div>
