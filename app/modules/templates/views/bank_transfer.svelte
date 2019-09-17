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
        Note: Please complete the transaction before {data.close_by}.
      </div>
      {/if}
    </div>

    <Callout>
      Do not round-off the amount. Transfer the exact amount for the payment to be successful.
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
</style>

<script>
  import Razorpay from 'common/Razorpay';
  import { makeAuthUrl } from 'common/Razorpay';
  import { timeConverter } from 'common/formatDate';
  import { copyToClipboard } from 'common/clipboard';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  export default {
    components: {
      AsyncLoading: 'templates/views/ui/AsyncLoading.svelte',
      Callout: 'templates/views/ui/Callout.svelte',
      Tab: 'templates/tabs/Tab.svelte',
    },
    data() {
      return {
        loading: true,
        data: null,
        error: null,
        session: null,
      };
    },
    methods: {
      init() {
        if (this.get().data !== null) {
          this.showCopyButton(true, 'COPY DETAILS');
          return;
        }
        this.set({
          loading: true,
        });
        const { session } = this.get();

        Razorpay.sendMessage({
          event: 'submit',
          data: {
            method: 'bank_transfer'
          },
        });

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
            error: response.error.description,
          });
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
          };
          this.set({
            loading: false,
            data,
          });
          this.showCopyButton(true, 'COPY DETAILS');
        }
      },
      /**
       * Session calls this method when it switches to "bank_transfer" tab
       */
      onShown: function() {
        this.init();
      },

      /**
       * Session calls this to ask if tab will handle back
       *
       * @returns {boolean} will tab handle back
       */
      onBack: function() {
        this.showCopyButton(false, '');
        return false;
      },

      /**
       * Session calls this to determine if it should submit
       *
       * @returns {Boolean} Should session submit?
       */
      shouldSubmit: function() {
        const footerButtons = {
          copyDetails: _Doc.querySelector(
            '#footer .bank-transfer-copy-details'
          ),
        };
        copyToClipboard('.neft-details', this.refs.neftDetails.innerText);
        Analytics.track('bank_transfer:copy:click', {
          type: AnalyticsTypes.BEHAV,
        });
        this.showCopyButton(true, 'COPIED');
        return false;
      },
      showCopyButton: function(show, text) {
        const footerButtons = {
          copyDetails: _Doc.querySelector(
            '#footer .bank-transfer-copy-details'
          ),
          pay: _Doc.querySelector('#footer .pay-btn'),
          body: _Doc.querySelector('#body'),
        };
        if (show) {
          _El.addClass(footerButtons.pay, 'invisible');
          _El.addClass(footerButtons.body, 'sub');
          _El.removeClass(footerButtons.copyDetails, 'invisible');
          _El.setContents(footerButtons.copyDetails, text);
        } else {
          _El.addClass(footerButtons.copyDetails, 'invisible');
          _El.removeClass(footerButtons.pay, 'invisible');
        }
      },
    },
  };
</script>
