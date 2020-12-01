<script>
  import { getAmount } from 'checkoutstore';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  import {
    NO_COST_HEADER,
    NO_COST_DESCRIPTION,
    NORMAL_EMI_LABEL,
    NO_COST_LABEL,
    TOTAL_AMOUNT_LABEL,
    EFFECTIVE_INTEREST_INFO,
    YOU_SAVE_INFO,
  } from 'ui/labels/emi-details';

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

<!-- LABEL: How does No Cost EMI work? -->
<header>{$t(NO_COST_HEADER)}</header>
<p>
  <!-- LABEL: You are buying a product worth
  <b>{totalAmountNoCost} on a {duration}-month EMI period.</b>
  The bank used charges
  <b>{rate}% interest</b>
  per annum. -->
  <FormattedText
    text={formatTemplateWithLocale(NO_COST_DESCRIPTION, { amount: totalAmountNoCost, duration, rate }, $locale)} />
</p>
<table>
  <tr>
    <td />
    <td>
      <!-- LABEL: Normal EMI -->
      <b>{$t(NORMAL_EMI_LABEL)}</b>
    </td>
    <td>
      <!-- LABEL: No Cost EMI -->
      <b>{$t(NO_COST_LABEL)}</b>
    </td>
  </tr>
  <tr>
    <td><b>EMI Amount</b></td>
    <td>{monthAmountNoCost} + {rate}% <br /> <b>{monthAmountNormal}</b></td>
    <td><b>{monthAmountNoCost}</b></td>
  </tr>
  <tr>
    <td>
      <!-- LABEL: Total Amount -->
      <b>{$t(TOTAL_AMOUNT_LABEL)}</b>
    </td>
    <td><b>{totalAmountNormal}</b></td>
    <td><b>{totalAmountNoCost}</b></td>
  </tr>
</table>
<p>
  <!-- LABEL: <b>Zero effective interest:</b>
  you get upfront discount equal to interest charged by the bank. -->
  <FormattedText text={$t(EFFECTIVE_INTEREST_INFO)} />
  <br />
  <!-- LABEL: You save {amount} -->
  <span>
    {formatTemplateWithLocale(YOU_SAVE_INFO, { amount: youSave }, $locale)}
  </span>
</p>
