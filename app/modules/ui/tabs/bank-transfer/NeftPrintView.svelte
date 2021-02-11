<script>
  //store
  import { getOption, getAmount } from 'checkoutstore';
  import { phone, email } from 'checkoutstore/screens/home';

  // svelte imports
  import { onMount } from 'svelte';
  // utils
  import { getSession } from 'sessionmanager';

  import { labels, rzpLogo, hdfcLogo } from './challanConstants';

  const {
    HEADER,
    ROW_HEADERS,
    OFFICE_USE,
    DISCLAIMERS,
    NON_HDFC_DISCLAIMERS,
    DISCLAIMER_LABEL,
    DIPOSITOR_SIGN_LABEL,
    AUTH_SIGN_LABEL,
    BRANCH_LABEL,
  } = labels;

  let neftView;
  export let neftDetails;
  export let expiry;
  const description = getOption('description');
  let merchant_logo = getOption('image');
  const merchantName = getOption('name');
  let orgLogoLoaded = false;
  let merchantLogoLoaded = false;
  let isHDFC = false;
  let disclaimers = NON_HDFC_DISCLAIMERS;
  let orgName = 'Razorpay';

  const name = getOption('prefill.name');

  const { account_number, ifsc, branch, bank_name } = neftDetails;
  let org_logo = rzpLogo;

  onMount(() => {
    if (bank_name?.startsWith('HDFC') || ifsc?.startsWith('HDFC')) {
      isHDFC = true;
      org_logo = hdfcLogo;
      disclaimers = DISCLAIMERS;
      orgName = 'HDFC';
    }
    if (!merchant_logo) {
      merchantLogoLoaded = true;
    }
  });

  const session = getSession();
  const amount = session.formatAmountWithCurrency(getAmount());

  // TODO: move it to utils or use any currently existing methods for formatting
  function formatDate(d) {
    let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    return [day, month, year].join('-');
  }

  function printIfLoaded() {
    if (orgLogoLoaded && merchantLogoLoaded) {
      const currentWindow = neftView.ownerDocument.defaultView;
      currentWindow.print();
      currentWindow.close();
    }
  }
  const setOrgLogoLoaded = () => {
    orgLogoLoaded = true;
    printIfLoaded();
  };
  const setMerchantLogoLoaded = () => {
    merchantLogoLoaded = true;
    printIfLoaded();
  };
  const tableDetails = {
    [ROW_HEADERS.row1]: neftDetails.name,
    [ROW_HEADERS.row2]: account_number,
    [ROW_HEADERS.row3]: ifsc,
    [ROW_HEADERS.row4]: bank_name,
    [ROW_HEADERS.row5]: branch,
    [ROW_HEADERS.row6]: amount,
    [ROW_HEADERS.row7]: name,
    [ROW_HEADERS.row8]: $email,
    [ROW_HEADERS.row9]: $phone,
    [ROW_HEADERS.row10]: isHDFC ? description : '',
    [ROW_HEADERS.row11]: expiry,
  };
  if (!neftDetails.branch) {
    delete tableDetails.Branch;
  }
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
    .print-view-logos {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .print-view-logos img {
      max-height: 50px;
    }
  </style>
  <div class="print-view-logos">
    <img on:load={setOrgLogoLoaded} src={org_logo} alt={orgName} />
    {#if merchant_logo}
      <img
        on:load={setMerchantLogoLoaded}
        src={merchant_logo}
        alt={merchantName} />
    {/if}
  </div>
  <table class="bank-transfer-table">
    <tr>
      <td colspan="2" class="text-center">{HEADER}</td>
    </tr>
    <tr>
      <td colspan="2" class="text-left">Date: {formatDate(new Date())}</td>
    </tr>
    {#each Object.keys(tableDetails) as key}
      {#if tableDetails[key]}
        <tr>
          <th class="text-left" width="30%">{key}</th>
          <td class="text-left">{tableDetails[key]}</td>
        </tr>
      {/if}
    {/each}
    <tr>
      <th colspan="2" class="text-left">{DISCLAIMER_LABEL}:</th>
    </tr>
    <tr>
      <td colspan="2">&nbsp;</td>
    </tr>
    {#each disclaimers as dis, ind}
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
</div>
