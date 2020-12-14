<script>
  // import store from '../store';
  // import NeftPrintDetails from './NeftPrintDetails.svelte';
  import { getOption, getAmount, showFeeLabel } from 'checkoutstore';
  import { getCustomerDetails } from 'checkoutstore/screens/home';
  import { onMount } from 'svelte';

  import { t } from 'svelte-i18n';

  const HEADER = 'For RTGS/NEFT/Funds Transfer';
  const ROW_HEADERS = {
    row1: 'Beneficiary Name',
    row2: 'Account No.',
    row3: 'IFSC Code',
    row4: 'Bank',
    row5: 'Branch',
    row6: 'Amount',
    row7: 'Customer Name',
    row8: 'Customer Email ID',
    row9: 'Customer Mobile No',
    row10: 'Description',
    row11: 'Merchant Order ID',
    row12: 'Disclaimers',
  };
  const OFFICE_USE = {
    header: '(FOR BANK USE ONLY)',
    list: ['Amount (Rs.)', 'Debit A/C No.', 'UTR No.'],
  };
  const DISCLAIMERS = [
    'This challan can be used only for electronic funds transfer to provided account no. fromHDFC Bank and Other Banks through intra bank Funds Transfer or RTGS / NEFT.',
    "It is remitter's responsibility to remit the funds to correct account no. with correctamount as provided above. Incase of any mismatch in account no or amount, the transaction willbe rejected and funds will be refunded back to remitter account by next working day.",
    'IMPS transactions are not allowed into provided account no. Bank shall not be liable incaseof IMPS transactions are not updated successfully or not refunded back to remitter. (This isrequired as solution for refund of IMPS rejections is yet to be finalized)',
    'This challan is valid for only one transaction hence Remitter has to generate new challanfor every payment.',
  ];
  const DISCLAIMER_LABEL = 'Disclaimer';
  const DIPOSITOR_SIGN_LABEL = 'Signature of Depositor';
  const AUTH_SIGN_LABEL = 'Authorised Signatory';
  const BRANCH_LABEL = 'Branch Stamp';

  let neftView;
  export let customerDetails = getCustomerDetails();
  export let neftDetails;
  const { contact, email, name } = customerDetails;
  let description = getOption('description');
  let orderId = getOption('order_id');

  onMount(() => {
    const currentWindow = neftView.ownerDocument.defaultView;
    // currentWindow.print();
    // currentWindow.close();
  });
  const tableDetails = {
    [ROW_HEADERS.row1]: neftDetails.name,
    [ROW_HEADERS.row2]: neftDetails.account_number,
    [ROW_HEADERS.row3]: neftDetails.ifsc,
    [ROW_HEADERS.row4]: neftDetails.bank_name,
    [ROW_HEADERS.row5]: neftDetails.branch,
    [ROW_HEADERS.row6]: getAmount(),
    [ROW_HEADERS.row7]: name,
    [ROW_HEADERS.row8]: email,
    [ROW_HEADERS.row9]: contact,
    [ROW_HEADERS.row10]: description,
    [ROW_HEADERS.row11]: orderId,
  };
</script>

<div class="neft-print-view" bind:this={neftView}>
  <style>
    .neft-print-view,
    div,
    p,
    table {
      font-family: 'PT Mono', 'Monospace', 'Consolas', 'sans-serif';
      font-size: 14px;
    }
    .text-center {
      text-align: center;
    }
    .text-left {
      text-align: left;
    }
    .text-right {
      text-align: right;
    }
    .bank-transfer-table {
      width: 100%;
      border-collapse: collapse;
    }
    td,
    th {
      padding: 5px;
      border: 1px solid;
    }
    .footer-logo {
      margin-top: 5px;
    }
  </style>
  <!-- <img /> Logo -->
  <table class="bank-transfer-table">
    <tr>
      <td colspan="2" class="text-center">{HEADER}</td>
    </tr>
    <tr>
      <td colspan="2" class="text-left">Date: 12/12/2020</td>
    </tr>
    {#each Object.keys(tableDetails) as key}
      <tr>
        <th class="text-left" width="30%">{key}:</th>
        <td class="text-left">{tableDetails[key] || ''}</td>
      </tr>
    {/each}
    <tr>
      <th colspan="2" class="text-left">{DISCLAIMER_LABEL}:</th>
    </tr>
    <tr>
      <td colspan="2">&nbsp;</td>
    </tr>
    {#each DISCLAIMERS as dis, ind}
      <tr>
        <td colspan="2">{`${ind + 1}.) ${dis}`}</td>
      </tr>
    {/each}
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <th colspan="2" class="text-right">
        <br /><br /><br />{DIPOSITOR_SIGN_LABEL}
      </th>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td colspan="2">{OFFICE_USE.header}</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    {#each OFFICE_USE.list as off}
      <tr>
        <th class="text-left">{off}</th>
        <td>&nbsp;</td>
      </tr>
    {/each}
    <tr>
      <th class="text-right" colspan="2">{AUTH_SIGN_LABEL}</th>
    </tr>
    <tr>
      <th class="text-right" colspan="2">{BRANCH_LABEL}</th>
    </tr>
  </table>
  <div class="text-right footer-logo">
    <img src="https://cdn.razorpay.com/static/assets/secured_by_razorpay.svg" />
  </div>
</div>
