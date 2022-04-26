<script>
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';
  import { t, locale } from 'svelte-i18n';

  import { getUpiIntentAppName } from 'i18n';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getDowntimes, checkDowntime } from 'checkoutframe/downtimes';
  import Analytics from 'analytics';

  // UI imports
  import DeprecatedRadioOption from 'ui/elements/options/DeprecatedRadioOption.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import ListHeader from 'ui/elements/ListHeader.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';

  import { getMiscIcon } from 'checkoutframe/icons';

  import {
    UPI_INTENT_BLOCK_HEADING,
    UPI_REDIRECT_TO_APP,
    UPI_RECOMMENDED,
    UPI_SHOW_OTHER_APPS,
  } from 'ui/labels/upi';

  import UPI_EVENTS from 'ui/tabs/upi/events';
  import { OTHER_INTENT_APPS, getOtherAppsLabel } from 'common/upi';
  import { tryOpeningIntentUrl } from 'upi/helper';
  import { Events } from 'analytics';
  import { getThemeMeta } from 'checkoutstore/theme';

  // Props
  export let apps;
  export let showAll = false;
  export let selected = null;
  export let showRecommendedUPIApp;
  export let skipCTA = false;
  export let payUsingApps = true;

  // Computed
  export let showableApps;

  let downtimeSeverity = false;
  let downtimeInstrument;

  let upiDowntimes = getDowntimes().upi;

  const session = getSession();
  const themeMeta = getThemeMeta();
  let otherAppsIcon = themeMeta.icons.othermethods;

  $: {
    if (apps.length <= 5 || showAll) {
      showableApps = apps;
    } else {
      showableApps = apps.slice(0, 4);
    }
  }

  const dispatch = createEventDispatcher();
  function isDowntime(pspHandle) {
    if (pspHandle) {
      const currentDowntime = checkDowntime(upiDowntimes, 'psp', pspHandle);
      if (currentDowntime) {
        downtimeSeverity = currentDowntime;
        downtimeInstrument = pspHandle;
      } else {
        downtimeSeverity = false;
      }
    } else {
      downtimeSeverity = false;
    }
  }

  export function onAppSelect({ detail }, index) {
    Analytics.track(UPI_EVENTS.INTENT_APP_SELECTED, {
      app_name: detail.app_name,
      index,
    });
    const packageName = detail.package_name;
    const psp = detail.shortcode;
    const params = {
      packageName,
      psp,
    };
    isDowntime(psp);
    if (downtimeSeverity) {
      params.downtimeInstrument = psp;
      params.downtimeSeverity = downtimeSeverity;
    }

    session.onUpiAppSelect(packageName);
    dispatch('select', params);
  }

  export const processIntentOnMWeb = (intentUrl) => {
    tryOpeningIntentUrl(intentUrl).then((canProceed) => {
      if (canProceed) {
        // emit success response and trigger polling
        session.r.emit('payment.upi.intent_success_response');
      } else {
        const metaParam = { upiNoApp: true };
        // clear the payment and dispatch no upi apps message
        session.clearRequest(metaParam);
      }
    });
  };

  onMount(() => {
    Analytics.track(UPI_EVENTS.INTENT_APPS_LOAD);
    Events.TrackRender(UPI_EVENTS.INTENT_APPS_LOAD_V2);
  });
</script>

<!-- LABEL: PAY USING APPS -->
<div class="legend left">{$t(UPI_INTENT_BLOCK_HEADING)}</div>
<div id="upi-apps">
  <div id="svelte-upi-apps-list" class="options options-no-margin border-list">
    <ListHeader>
      <i slot="icon">
        <Icon icon={getMiscIcon('redirect')} />
      </i>
      <!-- LABEL: You will be redirected to your UPI app -->
      <div slot="subtitle">{$t(UPI_REDIRECT_TO_APP)}</div>
    </ListHeader>

    {#each showableApps as app, i (app.package_name)}
      <DeprecatedRadioOption
        data={app}
        icon={app.app_icon}
        iconPlaceholder=".placeholder"
        selected={app.package_name === selected}
        on:select={(e) => onAppSelect(e, i)}
        name="upi_app"
        value={app.package_name}
        showRadio={!skipCTA}
        showArrow={skipCTA}
      >
        <div class="ref-title" data-name={app.shortcode}>
          {getUpiIntentAppName(app.shortcode, $locale, app.app_name)}
          {#if i === 0 && showRecommendedUPIApp}
            <span>
              <!-- LABEL: Recommended -->
              <em>({$t(UPI_RECOMMENDED)})</em>
            </span>
          {/if}
        </div>
        {#if !!downtimeSeverity && app.package_name === selected}
          <div class="downtime-upi-intent-wrapper">
            <div class="downtime-upi-intent">
              <DowntimeCallout
                showIcon={true}
                severe={downtimeSeverity}
                {downtimeInstrument}
              />
            </div>
          </div>
        {/if}
      </DeprecatedRadioOption>
    {/each}
    {#if payUsingApps}
      <DeprecatedRadioOption
        data={OTHER_INTENT_APPS}
        icon={OTHER_INTENT_APPS.app_icon}
        iconPlaceholder=".placeholder"
        name="upi_app"
        value={OTHER_INTENT_APPS.package_name}
        selected={OTHER_INTENT_APPS.package_name === selected}
        showRadio={!skipCTA}
        showArrow={skipCTA}
        on:select={(e) => onAppSelect(e, showableApps.length || 0)}
      >
        <div class="ref-title" data-name={OTHER_INTENT_APPS.package_name}>
          {getUpiIntentAppName(getOtherAppsLabel(showableApps), $locale)}
        </div>
      </DeprecatedRadioOption>
    {/if}

    {#if apps.length > 5 && !showAll}
      <NextOption on:select={() => (showAll = true)} icon={otherAppsIcon}>
        <!-- LABEL: Show other UPI apps -->
        {$t(UPI_SHOW_OTHER_APPS)}
      </NextOption>
    {/if}
  </div>
</div>

<style lang="scss">
  /**
   * TODO: sit with designers and enforce a standard design for all
   * the lists
   */

  #upi-apps {
    :global(.radio-option),
    :global(.next-option) {
      padding: 18px 40px 18px 72px;
      box-sizing: border-box;
    }

    :global(.placeholder) {
      margin: 0;
      width: 24px;
      height: 24px;
      transform: scale(1.1);
    }

    :global(.options) {
      overflow: initial;
      max-height: unset;
    }

    :global(.options .option-icon) {
      top: 16px;
      width: 24px;
      margin-top: 0;
    }

    :global(.option-icon svg) {
      width: 24px;
      height: 24px;
      top: 0;
    }

    :global(.option-icon img) {
      height: 24px;
    }

    :global(.input-radio) {
      position: absolute;
      float: clear;
      top: 18px;
      right: 12px;
      transform: scale(0.9);
    }

    :global(.option-title) {
      width: 100%;
    }

    :global(.next-option::after) {
      top: 16px;
      right: 23px;
      transform: rotate(-90deg);
    }
  }

  .options {
    box-shadow: 4px 4px 4px 0 rgba(0, 0, 0, 0.04);
  }

  em {
    color: rgba(81, 89, 120, 0.54);
  }

  .ref-title {
    color: #333333;
    line-height: 17px;
    text-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.75);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .legend {
    padding: 12px 0 8px 12px;
    margin-top: 10px;
  }
  .downtime-upi-intent {
    position: absolute;
    left: 16px;
    right: 16px;
    top: 46%;
  }
  .downtime-upi-intent-wrapper {
    margin-bottom: 54px;
  }
</style>
