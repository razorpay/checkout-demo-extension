<script>
  // Utils imports
  import Razorpay from 'common/Razorpay';
  import { makeAuthUrl } from 'common/Razorpay';
  import { timeConverter } from 'common/formatDate';
  import { copyToClipboard } from 'common/clipboard';
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // UI imports
  import AsyncLoading from 'templates/views/ui/AsyncLoading.svelte';
  import Callout from 'templates/views/ui/Callout.svelte';
  import Tab from 'templates/tabs/Tab.svelte';

  // Props
  export let loading = true;
  export let data = null;
  export let error = null;

  // Refs
  export let neftDetails = null;

  const session = getSession();
  const footerButtons = {
    copyDetails: _Doc.querySelector('#footer .bank-transfer-copy-details'),
    pay: _Doc.querySelector('#footer .pay-btn'),
    body: _Doc.querySelector('#body'),
  };

  function init() {
    if (data !== null) {
      showCopyButton(true, 'COPY DETAILS');
      return;
    }

    loading = true;

    const submitData = session.getPayload();

    Analytics.track('submit', {
      data: submitData,
    });

    Razorpay.sendMessage({
      event: 'submit',
      data: submitData,
    });

    fetch.post({
      url: makeAuthUrl(
        session.r,
        `orders/${session.r.get('order_id')}/virtual_accounts`
      ),
      callback: getNEFTDetails,
    });
  }

  function getNEFTDetails(response) {
    if (response.error) {
      loading = false;
      error = response.error.description;

      return;
    }

    let receivers = response.receivers;

    if (receivers && receivers.length !== 0) {
      data = {
        receiver: receivers[0],
        amount:
          response.amount_expected &&
          session.formatAmountWithCurrency(response.amount_expected),
        close_by: response.close_by && timeConverter(response.close_by),
      };

      loading = false;
      showCopyButton(true, 'COPY DETAILS');
    }
  }

  export function onShown() {
    init();
  }

  export function onBack() {
    showCopyButton(false, '');
    return false;
  }

  export function shouldSubmit() {
    copyToClipboard('.neft-details', neftDetails.innerText);
    Analytics.track('bank_transfer:copy:click', {
      type: AnalyticsTypes.BEHAV,
    });
    showCopyButton(true, 'COPIED');
    return false;
  }

  function showCopyButton(show, text) {
    if (show) {
      _El.addClass(footerButtons.pay, 'invisible');
      _El.addClass(footerButtons.body, 'sub');
      _El.removeClass(footerButtons.copyDetails, 'invisible');
      _El.setContents(footerButtons.copyDetails, text);
    } else {
      _El.addClass(footerButtons.copyDetails, 'invisible');
      _El.removeClass(footerButtons.pay, 'invisible');
    }
  }
</script>

<style>
  .loading {
    text-align: center;
  }
  .bank_transfer-container {
    padding: 15px 0;
    font-size: 13px;
  }
  .bank_transfer-message {
    line-height: 18px;
    color: rgba(81, 89, 120, 0.7);
    text-align: left;
  }
  .neft-details {
    margin: 15px 0 0 -15px;
    padding: 10px 5px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.01);
    width: 110%;
  }
  .ct-tr {
    padding: 5px 10px;
    text-align: left;
  }
  .ct-th {
    width: 45%;
    display: inline-block;
    color: rgba(81, 89, 120, 0.7);
  }
  .ct-td {
    display: inline-block;
    width: 50%;
    vertical-align: text-top;
    text-align: left;
    color: #424242;
  }
  .ct-note {
    font-size: 12px;
    line-height: 16px;
  }
  .error {
    margin-top: 20px;
    text-align: center;
  }
  .btn {
    display: inline-block;
    margin-top: 20px;
  }
</style>

<Tab method="bank_transfer">
  <div class="bank_transfer-container">
    {#if loading}
      <AsyncLoading>Getting bank details...</AsyncLoading>
    {:else if data}
      <div class="bank_transfer-message">
        To complete the transaction, make NEFT / RTGS / IMPS transfer to
      </div>

      <div class="neft-details">
        <div bind:this={neftDetails}>
          <div class="ct-tr">
            <span class="ct-th">Account:</span>
            <span class="ct-td">{data.receiver.account_number}</span>
          </div>
          <div class="ct-tr">
            <span class="ct-th">IFSC:</span>
            <span class="ct-td">{data.receiver.ifsc}</span>
          </div>
          <div class="ct-tr">
            <span class="ct-th">Beneficiary Name:</span>
            <span class="ct-td">{data.receiver.name}</span>
          </div>
          <div class="ct-tr">
            <span class="ct-th">Amount Expected:</span>
            <span class="ct-td">{data.amount}</span>
          </div>
        </div>

        {#if data.close_by}
          <div class="ct-tr ct-note">
            Note: Please complete the transaction before {data.close_by}.
          </div>
        {/if}
      </div>

      <Callout>
        Do not round-off the amount. Transfer the exact amount for the payment
        to be successful.
      </Callout>
    {:else}
      <div class="error">
        <div class="error-text">{error || 'Error'}</div>
        <br />
        <div class="btn" on:click={init}>Retry</div>
      </div>
    {/if}
  </div>
</Tab>
