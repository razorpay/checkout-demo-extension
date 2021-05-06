<script>
  // Svelte imports
  import { onMount } from 'svelte';
  // UI imports
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';
  import { DOWNTIME_CALLOUT, DOWNTIME_CALLOUT_CARDS } from 'ui/labels/callouts';
  import { locale } from 'svelte-i18n';
  import { formatTemplateWithLocale, getLongBankName } from 'i18n';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import { selectedInstrument } from 'checkoutstore/screens/home';
  // Props
  export let severe;
  export let showIcon = false;
  export let downtimeInstrument;

  onMount(() => {
    Analytics.setMeta('downtime.calloutShown', true);
    Analytics.track('downtime:callout:show', {
      type: AnalyticsTypes.RENDER,
      data: {
        instrument: downtimeInstrument,
        downtimeSeverity: severe,
        downtimeMethod: $selectedInstrument?.method
      }
    });
    if($selectedInstrument?.method === 'netbanking') {
      downtimeInstrument = getLongBankName(downtimeInstrument, $locale)
    }
  });
</script>

<style>
  .downtime-callout {
    margin: auto;
    padding: 10px;
    background: rgba(255, 219, 92, 0.4);
    color: #f99d27;
    display: flex;
    align-items: center;
    font-size: 12px;
    line-height: 14px;
  }
  .downtime-high {
    color: #e95555;
  }
  .downtime-icon {
    margin-right: 10px;
  }
  .downtime-callout div {
    white-space: normal;
  }
</style>

<div class={`downtime-callout downtime-${severe}`}>
  {#if showIcon}
    <div class="downtime-icon">
      <DowntimeIcon {severe} />
    </div>
  {/if}
  <div>
    {#if $selectedInstrument?.method === 'card'}
      <FormattedText
        text={formatTemplateWithLocale(DOWNTIME_CALLOUT_CARDS, { instrument: downtimeInstrument }, $locale)} />
    {:else}
      <FormattedText
        text={formatTemplateWithLocale(DOWNTIME_CALLOUT, { instrument: downtimeInstrument }, $locale)} />
    {/if}
  </div>
</div>
