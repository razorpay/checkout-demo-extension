<script lang="ts">
  import type * as EmiProviders from 'emiV2/types';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import NoCostLabel from 'components/Label/NoCostLabel.svelte';
  import StartingFromLabel from 'components/Label/StartingFromLabel.svelte';

  export let item: EmiProviders.EMIBANKS;
</script>

<div class="search-item-container">
  <div class="search-item-row">
    <div class="search-bank-name">
      <img alt={item.code} src={item.icon} />
      {item.name}
    </div>
    <div class="search-bank-label">
      {#if item.isNoCostEMI}
        <NoCostLabel />
      {:else if item.startingFrom}
        <StartingFromLabel startingAt={item.startingFrom} />
      {/if}
      <span class="arrow-right">&#xe604;</span>
    </div>
  </div>
  {#if item.downtimeConfig && item.downtimeConfig.severe}
    <div class="downtime-container">
      <DowntimeCallout
        severe={item.downtimeConfig?.severe}
        showIcon={true}
        downtimeInstrument={item.downtimeConfig?.downtimeInstrument}
      />
    </div>
  {/if}
</div>

<style>
  .search-item-container {
    width: 100%;
  }
  .search-bank-name {
    display: flex;
    align-items: center;
    width: 55%;
  }
  .search-bank-name img {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
  .search-item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .downtime-container {
    margin: -14px;
    margin-top: 16px;
  }
  .arrow-right {
    transform: rotate(180deg);
    color: rgba(0, 0, 0, 0.54);
  }
  .search-bank-label {
    display: flex;
    align-items: center;
  }
</style>
