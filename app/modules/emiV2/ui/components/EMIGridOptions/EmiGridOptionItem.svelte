<script lang="ts">
  import { getCommonBankName } from 'common/bank';
  import RazorpayConfig from 'common/RazorpayConfig';

  import { getCardlessEmiProviderName } from 'i18n';
  import { NO_COST_EMI } from 'ui/labels/offers';
  import { locale } from 'svelte-i18n';
  import NoCostLabel from 'components/Label/NoCostLabel.svelte';
  import StartingFromLabel from 'components/Label/StartingFromLabel.svelte';
  import type { EMIBANKS } from 'emiV2/types';

  export let emi: EMIBANKS;
  export let type: string;
  export let selected: boolean;

  let code: string;
  $: code = emi.code;
  $: isNoCost = emi.isNoCostEMI;
  $: startingAt = emi.startingFrom;
  const src = emi.icon || `${RazorpayConfig.cdn}/bank/${code}.gif`;
</script>

<div
  class="emi-bank item has-tooltip"
  id="bank-item-{code}"
  class:selected
  on:click
>
  <div class="emi-bank-item">
    <img class="bank-img" alt="" {src} />
    <div>
      {#if type === 'other'}
        {getCardlessEmiProviderName(code, $locale)}
      {:else}
        {getCommonBankName(code)}
      {/if}
    </div>
    <div class="emi-label">
      {#if isNoCost}
        <NoCostLabel text={NO_COST_EMI} expanded={true} />
      {:else if startingAt}
        <StartingFromLabel {startingAt} expanded={true} />
      {/if}
    </div>
  </div>
</div>

<style>
  .emi-bank {
    overflow: hidden;
    border: 1px solid #ebedf0;
    margin-top: -1px;
    margin-left: -1px;
    height: auto;
    min-height: 94px;
    display: flex;
    justify-content: center;
    position: relative;
    padding: 8px 6px;
  }

  .emi-bank-item {
    width: 100%;
  }
  .emi-bank.selected {
    border: 1px solid var(--highlight-color);
    z-index: 1;
  }
  .emi-label {
    margin-top: 8px;
    min-height: 16px;
  }
  .emi-label:empty {
    min-height: 8px;
  }

  .emi-bank-item .bank-img {
    margin-top: 4px;
  }
</style>
