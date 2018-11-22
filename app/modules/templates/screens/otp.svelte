<div
  id="form-otp"
  class="tab-content showable screen"
  class:loading="$screenData[SCREEN].loading"
  class:active="$screenData[SCREEN].active"
>
  <div id='otp-prompt'>{@html $screenData[SCREEN].text}</div>
  <div
    id="add-funds"
    class="add-funds"
    class:show="$screenData[SCREEN].addFunds"
  >
    <div id="add-funds-action" class="btn" on:click="addFunds(event)">Add Funds</div>

    <div class="text-center" style="margin-top: 20px;">
      <a id="choose-payment-method" class="link" on:click="chooseMethod(event)">Try different payment method</a>
    </div>
  </div>

  <div id="otp-section">
    <div id="otp-action" class="btn" on:click="retry(event)">Retry</div>
    <div
      id="otp-elem"
      class:fourdigit="$screenData[SCREEN].fourdigit"
    >
      <div class="help">Please enter the OTP</div>
      <input type="tel" class="input" name="otp" id="otp" bind:value=$screenData[SCREEN].otp maxlength={$screenData[SCREEN].maxlength || 6} autocomplete="off" required>
    </div>
  </div>

  <div class="spin"><div></div></div>
  <div class="spin spin2"><div></div></div>
  <div id="otp-sec-outer">
    <a id="otp-resend" class="link" on:click="resend(event)">Resend OTP</a>
    {#if $screenData[SCREEN].allowSkip}
      <a id="otp-sec" class="link" on:click="secondary(event)">{$screenData[SCREEN].skipText || 'Skip Saved Cards'}</a>
    {:elseif $screenData[SCREEN].allowBack}
      <a id="otp-sec" class="link" on:click="secondary(event)">Go Back</a>
    {/if}
  </div>
</div>

<script>

  export default {
    data: function () {
      return {
        SCREEN: 'otp',

        on: {}
      };
    },

    methods: {
      chooseMethod: function (event) {
        const {
          chooseMethod
        } = this.get().on;

        chooseMethod(event);
      },

      addFunds: function (event) {
        const {
          addFunds
        } = this.get().on;

        addFunds(event);
      },

      resend: function (event) {
        const {
          resend
        } = this.get().on;

        resend(event);
      },

      retry: function (event) {
        const {
          retry
        } = this.get().on;

        retry(event);
      },

      secondary: function (event) {
        const {
          secondary
        } = this.get().on;

        secondary(event);
      }
    }
  }
</script>
