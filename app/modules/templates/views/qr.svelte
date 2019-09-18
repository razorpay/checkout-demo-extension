<script>
  // Svelte imports
  import { onMount } from 'svelte';

  // UI imports
  import Callout from 'templates/views/ui/Callout.svelte';
  import AsyncLoading from 'templates/views/ui/AsyncLoading.svelte';
  import FeeBearer from 'templates/views/feebearer.svelte';

  // Utils imports
  import { RazorpayConfig } from 'common/Razorpay';
  import { processInstrument } from 'checkoutframe/personalization';
  import DowntimesStore from 'checkoutstore/downtimes';
  import { getSession } from 'sessionmanager';

  // Props
  export let view = 'qr';
  export let paymentData;
  export let loading = false;
  export let qrImage = null;
  export let error = null;
  export let down = false;
  export let onSuccess;

  const session = getSession();

  onMount(() => {
    init();
  });

  export function init() {
    paymentData = _Obj.extend(paymentData, {
      method: 'upi',
      '_[flow]': 'intent',
      '_[upiqr]': '1',
    });

    if (session.p13n) {
      processInstrument(paymentData);
    }

    if (session.preferences.fee_bearer) {
      view = 'fee';
    } else {
      createPayment();
    }

    const downtimes = DowntimesStore.get();
    if (downtimes.qr && downtimes.qr.length) {
      down = true;
    }
  }

  export function handleResponse({ data }) {
    qrImage = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(
      data.qr_code_url || data.intent_url
    )}&choe=UTF-8&chld=L|0`;
    loading = false;
    session.r.emit('payment.upi.intent_success_response');
  }

  export function checkStatus() {
    session.showLoadError('Checking payment status...');
  }

  export function onError(data) {
    view = 'error';
    error = data.error.description;
    loading = false;
  }

  export function createPaymentWithFees(bearer) {
    paymentData.amount = bearer.amount;
    paymentData.fee = bearer.fee;

    createPayment();
  }

  export function sessionBack() {
    session.switchTab('upi');
  }

  export function createPayment() {
    view = 'qr';
    loading = true;

    if (session.methodsList) {
      processInstrument(paymentData);
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
        optional: session.optional,
        paused: session.get().paused,
      })
      .on('payment.upi.coproto_response', _Func.bind(handleResponse, this))
      .on('payment.success', onSuccess)
      .on('payment.error', _Func.bind(onError, this));
  }
</script>

<style>
  :global(#body[tab='qr']) {
    height: 374px;
  }
  .loading {
    margin-top: 20px;
  }
  .container {
    text-align: center;
    padding: 15px 0;
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

<div class="container">
  {#if view === 'fee'}
    <FeeBearer {paymentData} on:continue={createPaymentWithFees} />
  {:else if view === 'qr'}
    {#if loading}
      <AsyncLoading>
        Generating QR Code...
      </AsyncLoading>
    {:else}
      <div
        class="message"
        style="background-image: url('{RazorpayConfig.cdn}checkout/upi-apps.png')">
        Scan the QR using any UPI app on your phone like BHIM, PhonePe, Google
        Pay etc.
      </div>
      {#if qrImage}
        <div class="qr-image">
          <img alt="QR" src={qrImage} on:load={() => (loading = false)} />
        </div>
      {/if}
    {/if}
  {:else if view === 'error'}
    <div class="error mchild">
      <div class="error-text">{error}</div>
      <br />
      <div class="btn" on:click={init}>Retry</div>
    </div>
  {/if}

  {#if down}
    <Callout showIcon={false} classes={['downtime-callout']}>
      <strong>UPI QR</strong>
      is experiencing low success rates.
    </Callout>
  {/if}
</div>
