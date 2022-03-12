<script>
  // Svelte imports
  import { onMount } from 'svelte';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import FeeBearer from 'ui/components/feebearer.svelte';
  import Tab from 'ui/tabs/Tab.svelte';

  // Utils imports
  import RazorpayConfig from 'common/RazorpayConfig';
  import { processInstrument } from 'checkoutframe/personalization';
  import {
    getMerchantOrder,
    isCustomerFeeBearer,
    getOptionalObject,
  } from 'razorpay';
  import { setTabTitle } from 'one_click_checkout/topbar/helper';

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
  } from 'ui/labels/qr';

  import UPI_EVENTS from 'ui/tabs/upi/events';

  // Constant imports
  import { TAB_TITLE } from 'one_click_checkout/topbar/constants';

  // Props
  export let view = 'qr';
  export let paymentData;
  export let loading = false;
  export let qrImage = null;
  export let error = null;
  export let down = false;
  export let onSuccess;
  let disabled = false;

  const session = getSession();

  onMount(() => {
    setTabTitle(TAB_TITLE.QR);
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

  function createPaymentWithFees(event) {
    const bearer = event.detail;

    paymentData.amount = bearer.amount;
    paymentData.fee = bearer.fee;

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
    <FeeBearer {paymentData} on:continue={createPaymentWithFees} />
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
  .refresh {
    color: #999;
    line-height: 22px;
  }
  .error {
    margin-top: 20px;
  }
  .error + .refresh {
    display: none;
  }
  .btn {
    display: inline-block;
    margin-top: 20px;
  }
</style>
