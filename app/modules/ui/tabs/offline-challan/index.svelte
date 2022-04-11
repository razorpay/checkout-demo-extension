<script>
  // Svelte imports
  import { onDestroy, onMount } from 'svelte';

  // Store imports
  import { showFeeLabel } from 'checkoutstore';

  import { getAmount, getOption } from 'razorpay';
  import { Events, OfflineChallanEvents } from 'analytics';

  // Utils imports
  import { timeConverter } from 'common/formatDate';
  import { getSession } from 'sessionmanager';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import CTA from 'ui/elements/CTA.svelte';
  import ChallanPrintView from 'ui/tabs/offline-challan/ChallanPrintView.svelte';

  // i18n
  import {
    AMOUNT_LABEL,
    BENEFICIARY_LABEL,
    DUE_DATE_NOTE,
    LOADING_MESSAGE,
    RETRY_BUTTON_LABEL,
    ROUND_OFF_CALLOUT,
    WAIT_TEXT,
  } from 'ui/labels/bank-transfer';
  import {
    HEADER,
    DOWNLOAD_CHALLAN,
    CHALLAN_NUMBER,
  } from 'ui/labels/offline-challan';
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  // constants
  import { COPY_DETAILS, COPIED } from 'ui/labels/cta';

  // Helpers
  import {
    createVirtualAccount,
    loadJsPdf,
    copyDetailsToClipboard,
  } from 'ui/tabs/offline-challan/helper';

  // Props
  export let loading = true;
  export let data = null;
  export let error = null;

  // Refs
  export let challanDetails = null;

  let copied = false;
  const session = getSession();
  const order_id = getOption('order_id');
  const amount = getAmount();

  const fetchVA = () => {
    loading = true;
    createVirtualAccount(session, order_id)
      .then((response) => {
        if (response.error) {
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
            name: response.name,
            customerId: response.customer_id,
            receiver: receivers[0],
            amount:
              response.amount_expected &&
              session.formatAmountWithCurrency(response.amount_expected),
            closeBy: response.close_by && timeConverter(response.close_by),
            amountExpected:
              response.amount_expected &&
              session.formatAmount(response.amount_expected),
            customerAdditionalInfo: response.order?.customer_additional_info,
          };

          loading = false;
        }
      })
      .finally(() => {
        loading = false;
      });
  };

  onDestroy(() => {
    if (data) {
      data.amount = session.setAmount(amount);
    }
  });

  onMount(() => {
    fetchVA();
  });

  export function copyDetails() {
    copied = true;
    copyDetailsToClipboard(
      '.challan-details',
      challanDetails.textContent
    ).finally(() => {
      copied = false;
    });
    Events.TrackBehav(OfflineChallanEvents.COPY_CLICK);
  }

  export function handlePrint() {
    session.showLoadError($t(WAIT_TEXT));
    loadJsPdf().then(
      () =>
        new ChallanPrintView({
          data: {
            documentTitle: document.title,
          },
          props: {
            challanDetails: {
              ...data.receiver,
              customerAdditionalInfo: data.customerAdditionalInfo,
              customerId: data.customerId,
              name: data.name,
            },
            expiry: data.closeBy,
            amount: data.amountExpected,
          },
          target: document.getElementById('challan-wrapper'),
        })
    );
    Events.TrackBehav(OfflineChallanEvents.PRINT_CLICK);
  }
</script>

<Tab method="offline_challan" shown={true}>
  <div class="offline-container">
    {#if loading}
      <!-- LABEL: Getting bank details... -->
      <AsyncLoading>{$t(LOADING_MESSAGE)}</AsyncLoading>
    {:else if data}
      <!-- LABEL: To complete the transaction, make NEFT / RTGS / IMPS transfer to -->
      <div class="offline-message">{$t(HEADER)}</div>
      <div class="challan-details">
        <div bind:this={challanDetails}>
          <div class="ct-tr">
            <!-- LABEL: Beneficiary Name -->
            <span class="ct-th">{$t(BENEFICIARY_LABEL)}:</span>
            <span class="ct-td">{data.name}</span>
          </div>
          {#if data.receiver}
            <div class="ct-tr">
              <!-- LABEL: Challan Number -->
              <span class="ct-th">{$t(CHALLAN_NUMBER)}:</span>
              <span class="ct-td">{data.receiver.challan_number}</span>
            </div>
          {/if}
          <div class="ct-tr">
            <!-- LABEL: Amount Expected -->
            <span class="ct-th">{$t(AMOUNT_LABEL)}:</span>
            <div class="ct-td">
              {data.amount}
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
      <CTA on:click={handlePrint}>{$t(DOWNLOAD_CHALLAN)}</CTA>
    {:else}
      <div class="error">
        <div class="error-text">{error || 'Error'}</div>
        <br />
        <!-- LABEL: Retry -->
        <div class="btn" on:click={fetchVA}>{$t(RETRY_BUTTON_LABEL)}</div>
      </div>
    {/if}
    <div id="challan-wrapper" />
  </div>
</Tab>

<style lang="css">
  .offline-container {
    padding: 15px 0;
    font-size: 13px;
  }
  .offline-message {
    line-height: 18px;
    color: rgba(81, 89, 120, 0.7);
    text-align: left;
  }
  .challan-details {
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
  .print {
    margin-top: 14px;
    text-align: left;
    color: rgba(57, 100, 168, 1);
    cursor: pointer;
  }
</style>
