<script lang="ts">
  // Svelte imports
  import { onMount } from 'svelte';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import FeeBearer from 'ui/components/FeeBearer/index.svelte';
  import Tab from 'ui/tabs/Tab.svelte';

  // Utils imports
  import RazorpayConfig from 'common/RazorpayConfig';
  import { processInstrument } from 'checkoutframe/personalization';
  import {
    getMerchantOrder,
    isCustomerFeeBearer,
    getOptionalObject,
    isOneClickCheckout,
    getCurrency,
  } from 'razorpay';
  import { amount } from 'one_click_checkout/charges/store';
  import { formatAmountWithSymbol } from 'common/currency';
  import { showSummaryModal } from 'one_click_checkout/summary_modal';

  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // i18n
  import { t } from 'svelte-i18n';

  import {
    QR_GENERATING_LABEL,
    PAYMENT_CHECKING_STATUS,
    QR_RETRY,
    QR_SCAN_ON_PHONE,
    VIEW_AMOUNT_DETAILS,
  } from 'ui/labels/qr';

  import UPI_EVENTS from 'ui/tabs/upi/events';
  import { isQRPaymentActive, isQRPaymentCancellable } from 'upi/helper';

  // Props
  export let view = 'qr';
  export let paymentData;
  export let loading = false;
  export let qrImage = null;
  export let error = null;
  export let onSuccess;

  const session = getSession();
  const currency = getCurrency();

  onMount(() => {
    init();
  });

  function init() {
    paymentData = _Obj.extend(paymentData, {
      method: 'upi',
      '_[flow]': 'intent',
      '_[upiqr]': '1',
    });

    // Add bank in payload for TPV orders
    const order = getMerchantOrder();
    if (order && order.bank) {
      paymentData.bank = order.bank;
    }

    if (isCustomerFeeBearer()) {
      view = 'fee';
    } else {
      createPayment();
    }
  }

  function handleResponse({ data }) {
    qrImage = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(
      data.qr_code_url || data.intent_url
    )}&choe=UTF-8&chld=L|0`;
    loading = false;
    session.r.emit('payment.upi.intent_success_response');
  }

  function checkStatus() {
    session.showLoadError($t(PAYMENT_CHECKING_STATUS));
  }

  function onError(data) {
    Analytics.track(UPI_EVENTS.QR_GENERATION_FAIL, {
      reason: data.error.description,
    });
    view = 'error';
    error = data.error.description;
    loading = false;
    getSession().errorHandler(data);
  }

  function createPaymentWithFees(bearer) {
    paymentData = {
      ...paymentData,
      amount: bearer.amount,
      fee: bearer.fee,
    };
    createPayment();
  }

  function qrLoaded() {
    loading = false;

    Analytics.track('upi:qr', {
      type: AnalyticsTypes.RENDER,
    });
  }

  function createPayment() {
    view = 'qr';
    loading = true;
    /**
     * L0 QR is active then we need to cancel
     * as L2 & L0 QR logic are different.
     */
    if (isQRPaymentActive()) {
      isQRPaymentCancellable({}, true, true);
      // on cancel create QR payment for L2 again
      session.r.once('payment.silent_error', () => {
        setTimeout(createPayment);
      });
      return;
    }
    session.preferredInstrument = processInstrument(paymentData);
    const offer = session.getAppliedOffer();
    // UPI offer applicable to QR also
    if (offer && offer.payment_method === 'upi') {
      paymentData.offer_id = offer.id;
    }
    /**
     * TODO:
     * We should call session.submit from here
     * and let it handle fees and other eventing stuff
     */
    global.Razorpay.sendMessage({
      event: 'submit',
      data: paymentData,
    });
    session.r
      .createPayment(paymentData, {
        upiqr: true,
        optional: getOptionalObject(),
        paused: session.get().paused,
      })
      .on('payment.upi.coproto_response', handleResponse.bind(this))
      .on('payment.success', onSuccess)
      .on('payment.error', onError.bind(this));
  }
</script>

<Tab method="qr">
  {#if view === 'fee'}
    <FeeBearer {paymentData} onContinue={createPaymentWithFees} />
  {:else if view === 'qr'}
    {#if loading}
      <!-- LABEL: Generating QR Code... -->
      <AsyncLoading>{$t(QR_GENERATING_LABEL)}</AsyncLoading>
    {:else}
      <div
        class="message"
        style="background-image: url('{RazorpayConfig.cdn}checkout/upi-apps.png')"
      >
        <!-- LABEL: Scan the QR using any UPI app on your phone like BHIM, PhonePe, Google Pay etc. -->
        {$t(QR_SCAN_ON_PHONE)}
      </div>
      {#if qrImage}
        <div class="qr-image">
          <img alt="QR" src={qrImage} on:load={qrLoaded} />
        </div>
      {/if}
      {#if isOneClickCheckout()}
        <div class="active-bg-color qr-one-cc-cta">
          <span class="price-label"
            >{formatAmountWithSymbol($amount, currency, false)}</span
          >
          <button
            class="cta-view-details"
            on:click={() => showSummaryModal({ withCta: false })}
            >{$t(VIEW_AMOUNT_DETAILS)}</button
          >
        </div>
      {/if}
    {/if}
  {:else if view === 'error'}
    <div class="error mchild">
      <div class="error-text">{error}</div>
      <br />
      <!-- LABEL: Retry -->
      <div class="btn" on:click={init}>{$t(QR_RETRY)}</div>
    </div>
  {/if}
</Tab>

<style>
  :global(#form-qr) {
    text-align: center;
    padding-top: 12px;
  }
  .message {
    background: no-repeat center bottom;
    background-size: 116px;
    padding-bottom: 32px;
    line-height: 1.6;
  }
  .message + .qr-image {
    display: block;
  }
  .qr-image {
    display: none;
    position: relative;
    overflow: hidden;
    width: 160px;
    margin: 10px auto;
  }
  .qr-image:after {
    position: absolute;
    width: 120%;
    height: 120%;
    left: -10%;
    top: -10%;
    transform: rotateZ(45deg);
    content: '';
    background: #fff;
  }
  .qr-image:before {
    position: absolute;
    left: 1px;
    right: 1px;
    top: 1px;
    bottom: 1px;
    border-width: 1px;
    border-style: solid;
    content: '';
  }
  img {
    z-index: 1;
    width: 150px;
    height: 150px;
    margin: 5px;
    display: block;
    position: relative;
  }
  .error {
    margin-top: 20px;
  }
  .btn {
    display: inline-block;
    margin-top: 20px;
  }

  .qr-one-cc-cta {
    padding: 10px 14px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 28px;
  }

  .price-label {
    color: #263a4a;
    font-size: 22px;
    font-weight: 600;
  }

  .cta-view-details {
    cursor: pointer;
    font-size: 10px;
    font-weight: 400;
    color: #8d97a1;
  }

  :global(#content.one-cc #form-qr) {
    padding-top: 26px;
  }

  :global(#content.one-cc) .message {
    padding-bottom: 50px;
  }
</style>
