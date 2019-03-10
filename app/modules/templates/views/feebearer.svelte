<div class="fee-bearer">
  {#if loading}
    <AsyncLoading message="Loading fees breakup..."/>
  {:elseif feeBreakup}
    <b>Fees Breakup</b>
    <br/>
    <div class="fees-container">
    {#each feeBreakup as fee}
      <div class="fee">
        <div class="fee-title">{fee[0]}</div>
        <div class="fee-amount">{fee[1]}</div>
      </div>
    {/each}
    </div>
    <div class="btn" on:click="fire('continue', bearer)">Continue</div>
  {/if}
</div>

<script>
  import { createFees } from 'payment';
  import { formatAmountWithSymbol } from 'common/currency';

  export default {
    oncreate() {
      const { session, paymentData } = this.get();
      this.fetchFees(paymentData, session);
    },

    components: {
      AsyncLoading: 'templates/views/ui/AsyncLoading.svelte',
    },

    data() {
      return {
        feeBreakup: null,
        loading: true,
        error: null,
        bearer: null,
        on: {}
      }
    },

    methods: {
      onSuccess(response) {
        const feeBreakup = this.makeFeesTable(response);
        this.set({
          loading: false,
          bearer: response.input,
          feeBreakup
        });
      },

      onError(response) {
        const { session } = this.get();
        session.showLoadError(response.error.description, response.error);
      },

      fetchFees(paymentData, session) {

        paymentData.amount = session.get('amount');
        paymentData.currency = session.get('currency');

        const onSuccess = _Func.bind(this.onSuccess, this);
        const onError = _Func.bind(this.onError, this);

        this.set({ loading: true });

        createFees(paymentData, session.r, onSuccess, onError);
      },

      makeFeesTable(response) {
        const displayFees = response.display;
        const array = [];
        const fees = Object.keys(displayFees);

        for (let i = 0; i < fees.length; i++) {
          const fee = fees[i];
          let title = '';
          switch (fee) {
            case 'original_amount':
              title = 'Amount';
              break;
            case 'razorpay_fee':
              title = 'Gateway Charges';
              break;
            case 'tax':
              title = 'GST on Gateway Charges';
              break;
          }
          if (title) {
            array.push([title, formatAmountWithSymbol(displayFees[fee] * 100, 'INR')]);
          }
        }

        array.push([ 'Total Charges', formatAmountWithSymbol(displayFees.amount * 100, 'INR') ]);

        return array;
      }
    }
  }
</script>
