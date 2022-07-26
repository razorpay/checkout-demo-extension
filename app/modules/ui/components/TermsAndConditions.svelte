<script lang="ts">
  // UI imports
  import * as TermsCurtain from 'checkoutframe/termscurtain';
  import { isDebitIssuer } from 'common/bank';
  import RazorpayConfig from 'common/RazorpayConfig';
  import Checkbox from 'ui/elements/Checkbox.svelte';
  import fetch from 'utils/fetch';
  // Props
  export let mode: string;

  function getTncUrl(bank: string, type: string) {
    const formattedBankName = bank.replace('_DC', '').toLowerCase();
    // Constants
    const cdnUrl = RazorpayConfig.cdn;
    const URL = {
      tnc: `${cdnUrl}static/assets/${formattedBankName}/debitemi/tnc.json`,
      schedule: `${cdnUrl}static/assets/${formattedBankName}/debitemi/schedule.json`,
    };
    return URL[type];
  }

  function showTerms(type: string, mode: string) {
    TermsCurtain.show({
      loading: true,
    });
    fetch({
      url: getTncUrl(mode, type),
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
  {#if isDebitIssuer(mode)}
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
        on:click={() => showTerms('tnc', mode)}
      >
        terms and conditions
      </span>
      which I fully understand and have gone through
      <span
        class="actionlink theme-highlight"
        on:click={() => showTerms('schedule', mode)}
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
