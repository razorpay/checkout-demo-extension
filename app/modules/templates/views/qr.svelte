<div class="container">
  {#if loading}
    Generating QR Code...
    <div class="loading">
      <div class="spin"><div></div></div>
      <div class="spin spin2"><div></div></div>
    </div>
  {:elseif error}
    <div class="error">
      {error}
      <br />
      <div class="btn" on:click="session.back()">Retry</div>
    </div>
  {:else}
    <div class="message" style="background-image: url('{RazorpayConfig.cdn}checkout/upi-apps.png')">
    Scan the QR using any UPI app on your phone like BHIM, PhonePe, Google Pay etc.
    </div>
  {/if}
  {#if qrImage}
    <div class="qr-image">
      <img alt="QR" src="{qrImage}" on:load="set({ loading: false })" />
    </div>
  {/if}
</div>
<style>
:global(#body[tab=qr]) {
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
<script>
  import { RazorpayConfig } from 'common/Razorpay';

  export default {
    oncreate() {
      const { session, paymentData, onSuccess } = this.get();
      this.session = session;
      paymentData.method = 'upi';
      paymentData['_[flow]'] = 'intent';
      paymentData['_[upiqr]'] = '1';
      session.r.createPayment(paymentData)
        .on('payment.upi.coproto_response', _Func.bind(this.handleResponse, this))
        .on('payment.success', onSuccess)
        .on('payment.error', _Func.bind(this.onError, this))
    },

    data() {
      return {
        RazorpayConfig,
        loading: true,
        qrImage: null,
        error: null
      }
    },

    methods: {
      handleResponse({data}) {
        const qrImage = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(
          data.qr_code_url || data.intent_url
        )}&choe=UTF-8&chld=L|0`;
        this.set({ qrImage });
        this.session.r.emit('payment.upi.intent_success_response');
      },

      checkStatus() {
        this.session.showLoadError('Checking payment status...');
      },

      onError(data) {
        this.set({ error: data.error.description, loading: false });
      }
    }
  }
</script>
