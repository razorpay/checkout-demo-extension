<div class="netb-bank item radio-item">
  <input
    class="bank-radio"
    id="bank-radio-{code}"
    type="radio"
    name="bank"
    value={code}

    bind:group
  >
  <label for="bank-radio-{code}" class="radio-label mfix">
    <div class="mchild item-inner">
      <img src="https://cdn.razorpay.com/bank/{code}.gif">
      <div>{name}</div>
    </div>
  </label>
</div>
