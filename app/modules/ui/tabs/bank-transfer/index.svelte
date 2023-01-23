<script lang="ts">
  // Svelte imports
  import { onDestroy, afterUpdate } from 'svelte';

  //Store imports
  import { showFeeLabel } from 'checkoutstore/fee';

  import {
    getAmount,
    getOption,
    getOrderId,
    isCustomerFeeBearer,
    isRedesignV15,
  } from 'razorpay';

  // Utils imports
  import Razorpay from 'common/Razorpay';
  import { timeConverter } from 'common/formatDate';
  import { copyToClipboard } from 'common/clipboard';
  import { getSession } from 'sessionmanager';
  import Analytics, { Events, MetaProperties } from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import fetch from 'utils/fetch';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import OldCTA from 'ui/elements/CTA.svelte';
  import NeftPrintView from './NeftPrintView.svelte';
  import showFeeBearer from 'ui/components/FeeBearer';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';

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
    PRINT_DETAILS,
    DOWNLOAD_CHALLAN,
    FEE_BREAKUP,
    WAIT_TEXT,
  } from 'ui/labels/bank-transfer';

  import { jsPdfUrl } from './challanConstants';

  import { COPY_DETAILS, COPIED } from 'ui/labels/cta';

  import { t, locale } from 'svelte-i18n';

  import { formatTemplateWithLocale, getRawMethodTitle } from 'i18n';
  import { getBankTransferUrl, setCustomChallanMetaProp } from './helper';
  import {
    BANK_TRANSFER_CHALLAN_PRINT,
    BANK_TRANSFER_COPY_DETAILS,
    BANK_TRANSFER_SUBMIT,
    VIRTUAL_ACCOUNT_FAILURE,
    VIRTUAL_ACCOUNT_SUCCESS,
    BANK_TRANSFER_PDF_INIT_FAILURE,
  } from './events';
  import { formatAmount, formatAmountWithCurrency } from 'helper/currency';
  import CTA from 'cta';
  import { getElementOpacity } from 'account_modal/utility';

  const isRedesign = isRedesignV15();

  // adding 3rd party script for printing, adding here to not increase unnecessary bundle size
  function addScript(url, content) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      document.head.appendChild(script);
      script.type = 'application/javascript';
      script.src = url;
      script.onload = resolve;
    });
  }

  // Props
  export let loading = true;
  export let data = null;
  export let error = null;

  // Refs
  export let neftDetails = null;

  let copied = false;
  const session = getSession();
  const order_id = getOrderId();
  const customerFeeBearerFlag = isCustomerFeeBearer();

  function getPayloadForVirtualAccounts() {
    /**
     * Customer email and mobile are not required as per
     * SI-4597
     * CE-4559
     */
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

    Analytics.track(BANK_TRANSFER_SUBMIT, {
      data: submitData,
    });
    if (setCustomChallanMetaProp()) {
      Events.setMeta(MetaProperties.CUSTOM_CHALLAN, true);
    }
    Razorpay.sendMessage({
      event: 'submit',
      data: submitData,
    });

    fetch.post({
      url: getBankTransferUrl(session.r, order_id),
      data,
      callback: getNEFTDetails,
    });
  }

  function getNEFTDetails(response) {
    if (response.error) {
      Analytics.track(VIRTUAL_ACCOUNT_FAILURE, {
        data: {
          error: response.error.description,
        },
      });
      loading = false;
      error = response.error.description;
      return;
    }

    Analytics.track(VIRTUAL_ACCOUNT_SUCCESS);

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
          formatAmountWithCurrency(response.amount_expected),
        close_by: response.close_by && timeConverter(response.close_by),
        amount_expected:
          response.amount_expected && formatAmount(response.amount_expected),
      };

      loading = false;
    }
  }

  const amount = getAmount();

  onDestroy(() => {
    if (data) {
      data.amount = session.setAmount(amount);
    }
  });

  export function copyDetails() {
    copyToClipboard('.neft-details', neftDetails.innerText);
    Analytics.track(BANK_TRANSFER_COPY_DETAILS, {
      type: AnalyticsTypes.BEHAV,
    });
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 3000);
  }

  export function handlePrint() {
    const html2pdfUrl = jsPdfUrl;
    const scriptPromise = addScript(html2pdfUrl);
    session.showLoadError($t(WAIT_TEXT));
    scriptPromise
      .then(() => {
        const neftPrintView = new NeftPrintView({
          data: {
            documentTitle: document.title,
          },
          props: {
            neftDetails: data.receiver,
            expiry: data.close_by,
            amount: data.amount_expected,
          },
          target: document.getElementById('challan-wrapper'),
        });
        Analytics.track(BANK_TRANSFER_CHALLAN_PRINT, {
          type: AnalyticsTypes.BEHAV,
        });
      })
      .catch((err) => {
        Analytics.track(BANK_TRANSFER_PDF_INIT_FAILURE, {
          data: {
            error: err,
          },
        });
      });
  }

  init();

  const fetchFees = () => {
    showFeeBearer({
      paymentData: {
        currency: getOption('currency') || 'INR',
        method: 'bank_transfer',
        order_id,
        amount: data.amount,
      },
    });
  };
  let onScreenContainerElement: HTMLDivElement;
  let onScreenContentElement: HTMLDivElement;
  let onScreenContainerOpacity;
  afterUpdate(() => {
    onScreenContainerOpacity = getElementOpacity(onScreenContainerElement);
  });
</script>

<Tab
  method="bank_transfer"
  shown={true}
  pad={!isRedesign}
  bind:onScreenContainerElement
>
  <div class="bank_transfer-container" class:one-cc={isRedesign}>
    <div bind:this={onScreenContentElement}>
      {#if loading}
        <!-- LABEL: Getting bank details... -->
        <AsyncLoading>{$t(LOADING_MESSAGE)}</AsyncLoading>
      {:else if data}
        {#if isRedesign}
          <span class="one-cc-title"
            >{getRawMethodTitle('bank_transfer', $locale)}</span
          >
        {/if}
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
              <div class="ct-td">
                {data.amount}
                {#if customerFeeBearerFlag}
                  <div class="fee-breakup" on:click={fetchFees}>
                    {$t(FEE_BREAKUP)}
                  </div>
                {/if}
              </div>
            </div>
          </div>

          {#if data.close_by}
            <!-- LABEL: Note: Please complete the transaction before {date} -->
            <div class="ct-tr ct-note">
              {formatTemplateWithLocale(
                DUE_DATE_NOTE,
                { date: data.close_by },
                $locale
              )}
            </div>
          {/if}
        </div>
        <div on:click={copyDetails} class="print">
          <!-- LABEL: Copy Details or Copied -->
          {$t(copied ? COPIED : COPY_DETAILS)}
        </div>
        <Bottom>
          <!-- LABEL: Do not round-off the amount. Transfer the exact amount for the payment to be successful. -->
          <Callout>{$t(ROUND_OFF_CALLOUT)}</Callout>
        </Bottom>
        <!-- LABEL: Print Details -->
        {#if isRedesignV15()}
          <CTA
            screen="bank_transfer"
            tab="bank_transfer"
            disabled={false}
            show
            onSubmit={handlePrint}
            label={DOWNLOAD_CHALLAN}
          />
        {:else}
          <OldCTA on:click={handlePrint}>{$t(PRINT_DETAILS)}</OldCTA>
        {/if}
      {:else}
        <div class="error">
          <div class="error-text">{error || 'Error'}</div>
          <br />
          <!-- LABEL: Retry -->
          <div class="btn" on:click={init}>{$t(RETRY_BUTTON_LABEL)}</div>
        </div>
      {/if}
    </div>
    <div id="challan-wrapper" />
  </div>
  <AccountTab
    {onScreenContainerOpacity}
    {onScreenContentElement}
    {onScreenContainerElement}
  />
</Tab>

<style>
  .bank_transfer-container {
    padding: 15px 0;
    font-size: 13px;
  }
  .bank_transfer-message {
    line-height: 18px;
    color: rgba(81, 89, 120, 0.7);
    text-align: left;
  }
  .one-cc .bank_transfer-message {
    color: var(--primary-text-color);
    margin-top: 16px;
  }
  .neft-details {
    margin: 16px -12px 0 -12px;
    padding: 10px 5px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.01);
  }
  .one-cc .neft-details {
    border-color: var(--light-dark-color);
    margin: 16px 0 0;
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
  .one-cc .ct-th {
    color: var(--tertiary-text-color);
  }
  .one-cc .ct-td {
    color: var(--secondary-text-color);
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
  .print {
    margin-top: 14px;
    text-align: left;
    color: rgba(57, 100, 168, 1);
    cursor: pointer;
  }
  .one-cc .print {
    color: var(--primary-color);
  }
  .fee-breakup {
    margin-top: 6px;
    text-align: left;
    color: rgba(57, 100, 168, 1);
    cursor: pointer;
  }
  .one-cc .fee-breakup {
    color: var(--primary-color);
  }
  .one-cc {
    min-height: 110%;
    padding: 16px;
  }
  .one-cc-title {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-body);
  }
</style>
