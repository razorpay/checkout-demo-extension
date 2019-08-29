<Tab method="bank_transfer">
  <div class="bank_transfer-container">
    {#if loading}
      <AsyncLoading message="Getting bank details..." />
    {:elseif data}
      <div class="bank_transfer-message">
        To complete the transaction, make NEFT / RTGS / IMPS transfer to
      </div>

      <div class="neft-details">
        <div ref:neftDetails>
          <div class="ct-tr">
            <span class="ct-th">Account:</span>
            <span class="ct-td">{data.receiver.account_number}</span>
          </div>
          <div class="ct-tr">
            <span class="ct-th">IFSC:</span>
            <span class="ct-td">{data.receiver.ifsc}</span>
          </div>
          <div class="ct-tr">
            <span class="ct-th">Beneficiary Name:</span>
            <span class="ct-td">{data.receiver.name}</span>
          </div>
          <div class="ct-tr">
            <span class="ct-th">Amount Expected:</span>
            <span class="ct-td">{data.amount}</span>
          </div>
        </div>

        {#if data.close_by}
        <div class="ct-tr ct-note">
          Note : Please complete the transaction before {data.close_by}.
        </div>
        {/if}
      </div>

      <Callout>
        Do not round-off the amount. Transfer the exact amount for the payment to be
        successful.
      </Callout>
    {:else}
      <div class="error">
        <div class="error-text">{error || 'Error'}</div>
        <br />
        <div class="btn" on:click="init()">Retry</div>
      </div>
    {/if}
  </div>
</Tab>
<style>
  .loading {
    text-align: center;
  }
  .bank_transfer-container {
    padding: 15px 0;
    font-size: 13px;
  }
  .bank_transfer-message {
    line-height: 18px;
    color: rgba(81, 89, 120, 0.7);
    text-align: left;
  }
  .neft-details {
    margin: 15px 0 0 -15px;
    padding: 10px 5px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.01);
    width: 110%;
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
</style>

<script>
  import { makeAuthUrl } from 'common/Razorpay';
  import { timeConverter } from 'common/formatDate';

  export default {
    components: {
      AsyncLoading: 'templates/views/ui/AsyncLoading.svelte',
      Callout: 'templates/views/ui/Callout.svelte',
      Tab: 'templates/tabs/Tab.svelte'
    },
    data() {
      return {
        loading: true,
        data: null,
        error: null,
        session: null
      };
    },
    oncreate() {
      this.init();
    },
    methods: {
      init() {
        this.set({
          loading: true
        })
        const { session } = this.get();
        fetch.post({
          url: makeAuthUrl(
            session.r,
            `orders/${session.r.get('order_id')}/virtual_accounts`
          ),
          callback: this.getNEFTDetails.bind(this),
        });
      },
      getNEFTDetails(response) {
        if (response.error) {
          return this.set({
            loading: false,
            error: response.error.description
          })
        }
        const { session } = this.get();
        let receivers = response.receivers;
        if (receivers && receivers.length !== 0) {
          const data = {
            receiver: receivers[0],
            amount:
              response.amount_expected &&
              session.formatAmountWithCurrency(response.amount_expected),
            close_by: response.close_by && timeConverter(response.close_by),
          }
          this.set({
            loading: false,
            data
          });
        }
      }
    },
  };
</script>
