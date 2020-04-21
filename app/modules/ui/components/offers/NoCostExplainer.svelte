<script>
  import { getAmount } from 'checkoutstore';
  export let formatter;
  export let plan;

  const { merchant_payback, duration } = plan;
  const amount = getAmount();
  const rate = (
    (merchant_payback * 12) /
    duration /
    (1 - plan.merchant_payback / 100)
  ).toFixed(2);
  const monthAmountNoCost = formatter(amount / duration);
  let totalAmountNormal = amount / (1 - plan.merchant_payback / 100);
  const youSave = formatter(totalAmountNormal - amount);
  const monthAmountNormal = formatter(totalAmountNormal / duration);
  totalAmountNormal = formatter(totalAmountNormal);
  const totalAmountNoCost = formatter(amount);
</script>

<style>
  td {
    border: 1px solid #ccc;
    background: #fcfcfc;
    padding: 10px 4px;
    line-height: 1.4;
  }
  td:last-child {
    background: #fafff5;
  }
  td:nth-child(2) {
    background: #fffcfc;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  span {
    color: #70c692;
  }
  b {
    font-weight: normal;
    color: #333;
  }
  :global(#nocost-overlay) {
    padding: 0 16px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    position: absolute;
    z-index: 101;
    background: #fff;
    top: 80px;
    left: 10px;
    right: 10px;
    font-size: 12px;
    color: #757575;
    width: auto;
  }
  header {
    padding: 16px 0;
    border-bottom: 1px solid #ddd;
    font-size: 16px;
    color: #333;
  }
</style>

<header>How does No Cost EMI work?</header>
<p>
  You are buying a product worth
  <b>{totalAmountNoCost} on a {duration}-month EMI period.</b>
  The bank used charges
  <b>{rate}% interest</b>
  per annum.
</p>
<table>
  <tr>
    <td />
    <td>
      <b>Normal EMI</b>
    </td>
    <td>
      <b>No Cost EMI</b>
    </td>
  </tr>
  <tr>
    <td>
      <b>EMI Amount</b>
    </td>
    <td>
      {monthAmountNoCost} + {rate}%
      <br />
      <b>{monthAmountNormal}</b>
    </td>
    <td>
      <b>{monthAmountNoCost}</b>
    </td>
  </tr>
  <tr>
    <td>
      <b>Total Amount</b>
    </td>
    <td>
      <b>{totalAmountNormal}</b>
    </td>
    <td>
      <b>{totalAmountNoCost}</b>
    </td>
  </tr>
</table>
<p>
  <b>Zero effective interest:</b>
  you get upfront discount equal to interest charged by the bank.
  <br />
  <span>You save {youSave}</span>
</p>
