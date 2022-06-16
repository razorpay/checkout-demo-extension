<script>
  // UI imports
  import * as TermsCurtain from 'checkoutframe/termscurtain';
  import Checkbox from 'ui/elements/Checkbox.svelte';
  import fetch from 'utils/fetch';
  // Props
  export let mode;

  // Constants
  const URL = {
    hdfc_debit_tnc:
      'https://cdn.razorpay.com/static/assets/hdfc/debitemi/tnc.json',
    hdfc_debit_schedule:
      'https://cdn.razorpay.com/static/assets/hdfc/debitemi/schedule.json',
  };

  function showTerms(type) {
    TermsCurtain.show({
      loading: true,
    });
    fetch({
      url: URL[type],
      callback: function (response) {
        TermsCurtain.show({
          loading: false,
          heading: response.title,
          termsText: response.content,
        });
      },
    });
  }
</script>

<div class="pad">
  {#if mode === 'HDFC_DC'}
    <div class="agreement-checkbox">
      <Checkbox
        id="emi-tnc"
        required
        helpText="Please agree to terms and conditions"
      />
      <b>Terms of agreement</b>
    </div>
    <div class="agreement-text">
      I expressly acknowledge that I agree to all the
      <span
        class="actionlink theme-highlight"
        on:click={(event) => showTerms('hdfc_debit_tnc')}
      >
        terms and conditions
      </span>
      which I fully understand and have gone through
      <span
        class="actionlink theme-highlight"
        on:click={(event) => showTerms('hdfc_debit_schedule')}
      >
        schedule of charges
      </span>
      and hereby record my agreement and consent. I authorise bank to debit my A/c
      for EMI under Standing Instruction Mode.
    </div>
  {/if}
</div>

<style>
  .agreement-text {
    font-size: 12px;
    padding-bottom: 16px;
  }

  .agreement-checkbox {
    display: flex;
    font-size: 13px;
    position: relative;
  }
</style>
