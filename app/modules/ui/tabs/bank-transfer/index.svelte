<script>
  // Svelte imports
  import { onDestroy } from 'svelte';

  //Store imports
  import { getOption, getAmount, showFeeLabel } from 'checkoutstore';

  // Utils imports
  import Razorpay from 'common/Razorpay';
  import { makeAuthUrl } from 'common/Razorpay';
  import { timeConverter } from 'common/formatDate';
  import { copyToClipboard } from 'common/clipboard';
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import CTA from 'ui/elements/CTA.svelte';

  // i18n
  import {
    ACCOUNT_LABEL,
    AMOUNT_LABEL,
    BENEFICIARY_LABEL,
    DUE_DATE_NOTE,
    HEADER,
    IFSC_LABEL,
    LOADING_MESSAGE,
    RETRY_BUTTON_LABEL,
    ROUND_OFF_CALLOUT,
  } from 'ui/labels/bank-transfer';
  import { COPY_DETAILS, COPIED } from 'ui/labels/cta';

  import { t, locale } from 'svelte-i18n';

  import { formatTemplateWithLocale } from 'i18n';

  // Props
  export let loading = true;
  export let data = null;
  export let error = null;

  // Refs
  export let neftDetails = null;

  let copied = false;
  const session = getSession();

  function getPayloadForVirtualAccounts() {
    const payload = {};
    const customer_id = getOption('customer_id');
    if (customer_id) {
      payload.customer_id = customer_id;
    }
    return payload;
  }

  function init() {
    loading = true;

    const submitData = session.getPayload();
    const data = getPayloadForVirtualAccounts();

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
      data,
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

    if (response.amount_expected) {
      session.updateAmountInHeader(response.amount_expected);
      $showFeeLabel = false;
    }

    if (receivers && receivers.length !== 0) {
      data = {
        receiver: receivers[0],
        amount:
          response.amount_expected &&
          session.formatAmountWithCurrency(response.amount_expected),
        close_by: response.close_by && timeConverter(response.close_by),
      };

      loading = false;
    }
  }

  const amount = getAmount();

  onDestroy(() => {
    data.amount = session.setAmount(amount);
  });

  export function copyDetails() {
    copyToClipboard('.neft-details', neftDetails.innerText);
    Analytics.track('bank_transfer:copy:click', {
      type: AnalyticsTypes.BEHAV,
    });
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 3000);
  }

  init();
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
    margin: 16px -12px 0 -12px;
    padding: 10px 5px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.01);
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

<Tab method="bank_transfer" shown={true}>
  <div class="bank_transfer-container">
    {#if loading}
      <!-- LABEL: Getting bank details... -->
      <AsyncLoading>{$t(LOADING_MESSAGE)}</AsyncLoading>
    {:else if data}
      <!-- LABEL: To complete the transaction, make NEFT / RTGS / IMPS transfer to -->
      <div class="bank_transfer-message">{$t(HEADER)}</div>
      <div class="neft-details">
        <div bind:this={neftDetails}>
          <div class="ct-tr">
            <!-- LABEL: Account -->
            <span class="ct-th">{$t(ACCOUNT_LABEL)}:</span>
            <span class="ct-td">{data.receiver.account_number}</span>
          </div>
          <div class="ct-tr">
            <!-- LABEL: IFSC -->
            <span class="ct-th">{$t(IFSC_LABEL)}:</span>
            <span class="ct-td">{data.receiver.ifsc}</span>
          </div>
          <div class="ct-tr">
            <!-- LABEL: Beneficiary Name -->
            <span class="ct-th">{$t(BENEFICIARY_LABEL)}:</span>
            <span class="ct-td">{data.receiver.name}</span>
          </div>
          <div class="ct-tr">
            <!-- LABEL: Amount Expected -->
            <span class="ct-th">{$t(AMOUNT_LABEL)}:</span>
            <span class="ct-td">{data.amount}</span>
          </div>
        </div>

        {#if data.close_by}
          <!-- LABEL: Note: Please complete the transaction before {date} -->
          <div class="ct-tr ct-note">
            {formatTemplateWithLocale(DUE_DATE_NOTE, { date: data.close_by }, $locale)}
          </div>
        {/if}
      </div>

      <Bottom>
        <!-- LABEL: Do not round-off the amount. Transfer the exact amount for the payment to be successful. -->
        <Callout>{$t(ROUND_OFF_CALLOUT)}</Callout>
      </Bottom>
      <CTA on:click={copyDetails}>{$t(copied ? COPIED : COPY_DETAILS)}</CTA>
    {:else}
      <div class="error">
        <div class="error-text">{error || 'Error'}</div>
        <br />
        <!-- LABEL: Retry -->
        <div class="btn" on:click={init}>{$t(RETRY_BUTTON_LABEL)}</div>
      </div>
    {/if}
  </div>
</Tab>
