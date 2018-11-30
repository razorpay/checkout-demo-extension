<div class="qr-container">
  {#if loading}
    Generating QR Code...
  {:else}
    Scan the QR using any UPI app on your phone like BHIM, PhonePe, Google Pay etc.
  {/if}
  {#if qrImage}
    <img alt="QR" src="{qrImage}" on:load="set({ loading: false })" />
  {/if}
</div>
<style>
.qr-container {
  text-align: center;
  padding: 15px 0;
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
        const qrImage = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(
          data.qr_code_url || data.intent_url
        )}&choe=UTF-8`;
        this.set({ qrImage });
        this.r.emit('payment.upi.intent_success_response');
      }
    }
  }
</script>
