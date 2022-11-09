<script lang="ts">
  // Svelte imports
  import { onMount } from 'svelte';
  // UI imports
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';
  import { DOWNTIME_CALLOUT, DOWNTIME_CALLOUT_CARDS } from 'ui/labels/callouts';
  import { locale } from 'svelte-i18n';
  import { formatTemplateWithLocale, getLongBankName } from 'i18n';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import { selectedInstrument } from 'checkoutstore/screens/home';
  import { Events, DowntimeEvents, MetaProperties } from 'analytics/index';
  import { sanitizeHTML } from 'utils/security';
  // helper imports
  import { isRedesignV15 } from 'razorpay';

  // Props
  export let severe;
  export let showIcon = false;
  export let downtimeInstrument;
  export let avoidTrackers = false;
  export let customMessage = undefined;

  onMount(() => {
    if (!avoidTrackers) {
      Events.setMeta(MetaProperties.DOWNTIME_CALLOUTSHOWN, true);
      Events.TrackRender(DowntimeEvents.CALLOUT_SHOW, {
        instrument: downtimeInstrument,
        downtimeSeverity: severe,
        downtimeMethod: $selectedInstrument?.method,
      });

      if ($selectedInstrument?.method === 'netbanking') {
        downtimeInstrument = getLongBankName(downtimeInstrument, $locale);
      }
    }
  });
</script>

<div
  class={`downtime-callout downtime-${severe}`}
  class:downtime-callout-one-cc={isRedesignV15()}
>
  {#if showIcon}
    <div class="downtime-icon">
      <DowntimeIcon {severe} />
    </div>
  {/if}
  <div>
    {#if customMessage}
      {@html sanitizeHTML(customMessage)}
    {:else if ['card', 'emi'].includes($selectedInstrument?.method)}
      <FormattedText
        text={formatTemplateWithLocale(
          DOWNTIME_CALLOUT_CARDS,
          { instrument: downtimeInstrument },
          $locale
        )}
      />
    {:else}
      <FormattedText
        text={formatTemplateWithLocale(
          DOWNTIME_CALLOUT,
          { instrument: downtimeInstrument },
          $locale
        )}
      />
    {/if}
  </div>
</div>

<style>
  .downtime-callout {
    margin: auto;
    padding: 10px;
    background-color: #fef7e2;
    color: #f99d27;
    display: flex;
    align-items: center;
    font-size: 12px;
    line-height: 14px;
  }
  .downtime-high {
    background-color: rgba(246, 215, 219, 0.7);
  }
  .downtime-icon {
    margin-right: 10px;
    align-self: flex-start;
  }
  .downtime-callout div {
    white-space: normal;
  }

  .downtime-callout-one-cc {
    color: #263238;
    border-radius: 4px;
  }
</style>
