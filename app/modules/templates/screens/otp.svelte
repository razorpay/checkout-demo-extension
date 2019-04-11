<div
  id="form-otp"
  class="tab-content showable screen"
  class:loading="$loading"
>
  <div id='otp-prompt'>{@html $text}</div>

  {#if $addFunds}
    <div
      id="add-funds"
      class="add-funds"
    >
      <div id="add-funds-action" class="btn" on:click="invoke('addFunds', event)">Add Funds</div>

      <div class="text-center" style="margin-top: 20px;">
        <a id="choose-payment-method" class="link" on:click="invoke('chooseMethod', event)">Try different payment method</a>
      </div>
    </div>
  {/if}

  <div id="otp-section">
    {#if $action}
      <div id="otp-action" class="btn" on:click="invoke('retry', event)">Retry</div>
    {/if}

    <div
      id="otp-elem"
      style="width: {inputWidth};"

      class:hidden="!showInput"
    >
      <div class="help">Please enter the OTP</div>
      <input ref:input type="tel" class="input" name="otp" id="otp" bind:value=$otp maxlength={$maxlength || 6} autocomplete="one-time-code" required>
    </div>
  </div>

  <div class="spin"><div></div></div>
  <div class="spin spin2"><div></div></div>
    <div
      id="otp-sec-outer"

      class:hidden="!showInput"
    >
      {#if $allowResend}
        <a id="otp-resend" class="link" on:click="invoke('resend', event)">Resend OTP</a>
      {/if}
      {#if $allowSkip}
        <a id="otp-sec" class="link" on:click="invoke('secondary', event)">{$skipText || 'Skip Saved Cards'}</a>
      {:elseif $allowBack}
        <a id="otp-sec" class="link" on:click="invoke('secondary', event)">Go Back</a>
      {/if}
    </div>
</div>

<script>
  import OtpScreenStore from 'checkoutstore/screens/otp';

  export default {
    store: () => OtpScreenStore,

    computed: {
      inputWidth: function ({ $maxlength }) {
        /**
         * Base width (Mandatory): 19px
         * Each dash: 14px
         * Each space between two dashes: 10px
         *
         * There are maxlength-1 spaces and maxlength dashes.
         */

        return `${19 + ($maxlength - 1) * 10 + $maxlength * 14}px`;
      },

      showInput: function ({ $action, $loading }) {
        return !($action || $loading);
      },
    },

    data: function () {
      return {
        on: {}
      };
    },

    onupdate ({ changed, current, previous }) {
      if (changed.showInput === true) {
        this.refs.input.focus();
      }
    },

    methods: {
      invoke: function (type, event) {
        const {
          on
        } = this.get();

        const method = on[type];

        if (method) {
          method(event);
        }
      },
    },
  }
</script>
