<div class="qr-container">
  {#if loading}
    Generating QR Code...
    <div class="loading">
      <div class="spin"><div></div></div>
      <div class="spin spin2"><div></div></div>
    </div>
  {:else}
    <div class="qr-message">
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
.loading {
  margin-top: 20px;
}
.qr-container {
  text-align: center;
  padding: 15px 0;
}
.qr-message + .qr-image {
  display: block;
}
.qr-image {
  display: none;
  position: relative;
  overflow: hidden;
  width: 160px;
  margin: 10px auto 0;
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
  border: 1px solid;
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
</style>
<script>
  export default {
    oncreate() {
      const { r, paymentData, onSuccess } = this.get();
      paymentData.method = 'upi';
      paymentData['_[flow]'] = 'intent';
      this.r = r.createPayment(paymentData)
        .on('payment.upi.coproto_response', _Func.bind(this.handleResponse, this))
        .on('payment.success', onSuccess)
    },

    ondestroy() {
      // this.payment.
    },

    data() {
      return {
        loading: true,
        qrImage: null
      }
    },

    methods: {
      handleResponse({data}) {
        const qrImage = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(
          data.qr_code_url || data.intent_url
        )}&choe=UTF-8&chld=L|0`;
        this.set({ qrImage });
        this.r.emit('payment.upi.intent_success_response');
      }
    }
  }
</script>
