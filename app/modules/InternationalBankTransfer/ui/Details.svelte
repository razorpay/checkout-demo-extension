<script lang="ts">
  import { onMount } from 'svelte';

  // analytics
  import {
    trackCopyDetails,
    trackDetailsShow,
    trackFetchDetailsError,
    trackFetchDetailsSuccess,
    trackSubmit,
    trackUpdateAmountInHeader,
  } from '../events';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    ACCOUNT_LABEL,
    AMOUNT_LABEL,
    BENEFICIARY_LABEL,
    RETRY_BUTTON_LABEL,
    ROUND_OFF_CALLOUT,
  } from 'ui/labels/bank-transfer';
  import { COPY_DETAILS, COPIED } from 'ui/labels/cta';

  // components
  import Callout from 'ui/elements/Callout.svelte';
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';

  // utils
  import { getSession } from 'sessionmanager';
  import { copyToClipboard } from 'common/clipboard';
  import { getOption } from 'razorpay';

  // helpers
  import { getVAs } from '../helpers';

  // constants
  import { HELP_TEXT_MAPPING, MEHTOD_CURRENCY_MAPPING } from '../constants';

  // types
  import type { VA_RESPONSE_TYPE } from '../types';

  // variables
  let copied = false;
  let loading = false;
  let data: VA_RESPONSE_TYPE | null = null;
  let error: string | null = null;
  const session = getSession();

  // refs
  let accountDetails: HTMLDivElement | null = null;

  // props
  export let method: string;

  function copyAccountDetails(evt: Event) {
    evt.preventDefault();
    copyToClipboard('.intl-bt-detail__container', accountDetails?.innerText);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 3000);
    trackCopyDetails(method);
  }

  function setAmountInHeader(amount: string) {
    session.setRawAmountInHeader(amount);
    trackUpdateAmountInHeader(method, amount);
  }

  function init() {
    loading = true;

    const submitData = session.getPayload();

    trackSubmit(submitData, method);

    const params = {
      vaCurrency: MEHTOD_CURRENCY_MAPPING[method],
      amount: getOption('amount'),
      baseCurrency: getOption('currency'),
    };

    getVAs(params)
      .then((response) => {
        if (response.error) {
          error = response.error.description;
          trackFetchDetailsError(method, params);
        } else {
          data = response;
          setAmountInHeader(`${data.symbol} ${data.amount}`);
          trackFetchDetailsSuccess(method);
        }
      })
      .finally(() => {
        loading = false;
      });
  }

  onMount(() => {
    init();
    trackDetailsShow(method);
  });
</script>

<div class="intl-bt-detail">
  {#if loading}
    <AsyncLoading>{$t(HELP_TEXT_MAPPING.loading)}</AsyncLoading>
  {:else if data}
    <h5>{$t(HELP_TEXT_MAPPING.heading)}</h5>
    <p>{$t(HELP_TEXT_MAPPING.content1)}</p>
    <div class="intl-bt-detail__container">
      <div bind:this={accountDetails}>
        <div class="intl-bt-detail__row">
          <div class="intl-bt-detail__col text-light">
            {$t(ACCOUNT_LABEL)}:
          </div>
          <div class="intl-bt-detail__col text-heavy">
            {data.account?.account_number}
          </div>
        </div>
        <div class="intl-bt-detail__row">
          <div class="intl-bt-detail__col text-light">
            {$t(HELP_TEXT_MAPPING.routingCode)}:
          </div>
          <div class="intl-bt-detail__col text-heavy">
            {data.account?.routing_code}
          </div>
        </div>
        <div class="intl-bt-detail__row">
          <div class="intl-bt-detail__col text-light">
            {$t(HELP_TEXT_MAPPING.routingType)}:
          </div>
          <div class="intl-bt-detail__col text-heavy">
            {data.account?.routing_type}
          </div>
        </div>
        <div class="intl-bt-detail__row">
          <div class="intl-bt-detail__col text-light">
            {$t(BENEFICIARY_LABEL)}:
          </div>
          <div class="intl-bt-detail__col text-heavy">
            {data.account?.beneficiary_name}
          </div>
        </div>
        <div class="intl-bt-detail__row">
          <div class="intl-bt-detail__col text-light">
            {$t(AMOUNT_LABEL)}:
          </div>
          <div class="intl-bt-detail__col text-heavy">
            {data.symbol}
            {data.amount}
          </div>
        </div>
      </div>
      <div class="intl-bt-detail__row">
        <div class="intl-bt-detail__col" />
        <div class="intl-bt-detail__col text-heavy">
          <button class="intl-bt-detail__copy" on:click={copyAccountDetails}
            >{$t(copied ? COPIED : COPY_DETAILS)}</button
          >
        </div>
      </div>
      <Callout classes={['intl-bt-detail__callout']} allClasses="">
        {$t(ROUND_OFF_CALLOUT)}
      </Callout>
    </div>

    <div class="intl-bt-detail__note">
      {$t(HELP_TEXT_MAPPING.note)}
    </div>
  {:else}
    <div class="error">
      <div class="error-text">{error || 'Error'}</div>
      <br />
      <div class="btn" on:click={init}>{$t(RETRY_BUTTON_LABEL)}</div>
    </div>
  {/if}
</div>

<style lang="css">
  .intl-bt-detail__container {
    margin: 16px 0;
    border: 1px solid #e6e7e8;
    font-size: 13px;
    padding-top: 14px;
  }

  .intl-bt-detail__row {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 8px;
    padding-left: 14px;
    padding-right: 14px;
  }

  .intl-bt-detail__col {
    flex: 0 0 50%;
    max-width: 50%;
    min-height: 1px;
  }

  .intl-bt-detail h5 {
    font-size: 14px;
    font-weight: 700;
    margin-top: 10px;
    margin-bottom: 3px;
    color: #757575;
  }

  .intl-bt-detail p {
    font-size: 12px;
    margin-top: 6px;
    color: #757575;
  }

  .intl-bt-detail .text-light {
    color: #7d7d7d;
  }

  .intl-bt-detail .text-heavy {
    font-weight: 600;
  }

  .intl-bt-detail__copy {
    font-size: 13px;
    background: none;
    outline: none;
    user-select: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: 0;
    border-bottom: 1px solid var(--primary-color);
  }

  .intl-bt-detail__note {
    padding-bottom: 16px;
    color: #757575;
    font-size: 12px;
  }

  .error {
    margin-top: 20px;
    text-align: center;
  }
  .btn {
    display: inline-block;
    margin-top: 20px;
  }

  :global(.intl-bt-detail__callout) {
    font-size: 12px;
    padding: 10px 12px;
    line-height: 1.2;
    margin-top: 16px;
  }
</style>
