<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';
  import { t, locale } from 'svelte-i18n';

  import { getUpiIntentAppName } from 'i18n';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { GOOGLE_PAY_PACKAGE_NAME, isVpaValid } from 'common/upi';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // UI imports
  import DeprecatedRadioOption from 'ui/elements/options/DeprecatedRadioOption.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import OptionIcon from 'ui/elements/options/OptionIcon.svelte';
  import Field from 'ui/components/Field.svelte';
  import ListHeader from 'ui/elements/ListHeader.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  import { getMiscIcon } from 'checkoutframe/icons';

  import {
    UPI_INTENT_BLOCK_HEADING,
    UPI_REDIRECT_TO_APP,
    UPI_RECOMMENDED,
    UPI_SHOW_OTHER_APPS,
  } from 'ui/labels/upi';

  // Props
  export let apps;
  export let showAll = false;
  export let selected = null;
  export let showRecommendedUPIApp;
  export let selectedApp;

  // Computed
  export let showableApps;

  // Refs
  export let vpaField = null;

  const session = getSession();
  let otherAppsIcon = session.themeMeta.icons.othermethods;

  $: {
    if (apps.length <= 5 || showAll) {
      showableApps = apps;
    } else {
      showableApps = _Arr.slice(apps, 0, 4);
    }
  }

  function getVpa() {
    if (vpaField) {
      return vpaField.getValue();
    }
    return '';
  }

  function trackVpaEntry() {
    const vpa = getVpa();

    if (!vpa) {
      return;
    }

    const valid = isVpaValid(vpa);

    Analytics.track('vpa:fill', {
      type: AnalyticsTypes.BEHAV,
      data: {
        app: selectedApp,
        value: vpa,
        valid,
      },
    });
  }

  export function getPayload() {
    let data = {};

    if (selected === 'directpay') {
      data = {
        '_[flow]': 'directpay',
        vpa: vpaField.getValue(),
      };
    } else {
      data = {
        '_[flow]': 'intent',
        upi_app: selected,
      };
    }

    return data;
  }

  const dispatch = createEventDispatcher();

  export function onAppSelect({ detail }) {
    const packageName = detail.package_name;

    session.onUpiAppSelect(packageName);
    dispatch('select', { packageName });
  }
</script>

<style>
  /**
   * TODO: sit with designers and enforce a standard design for all
   * the lists
   */

  #upi-apps {
    :global(.radio-option),
    :global(.next-option) {
      padding: 18px 40px 18px 60px;
    }

    :global(.placeholder) {
      margin: 0;
      width: 24px;
      height: @width;
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

  #upi-apps .ref-collect {
    :global(.option-icon) {
      left: 20px;
      top: 20px;
    }

    :global(.option-icon i) {
      font-size: 22px;
    }
  }

  .options {
    box-shadow: 4px 4px 4px 0 rgba(0, 0, 0, 0.04);
  }

  em {
    color: rgba(81, 89, 120, 0.54);
  }

  .ref-collect {
    margin-top: 12px;
  }

  .ref-title {
    color: #333333;
    line-height: 17px;
    text-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.75);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ref-submessage {
    color: rgba(81, 89, 120, 0.54);
    font-size: 12px;
    line-height: 15px;
    margin-top: 4px;
  }

  .legend {
    padding: 12px 0 8px 12px;
  }
</style>

<!-- LABEL: PAY USING APPS -->
<div class="legend left">{$t(UPI_INTENT_BLOCK_HEADING)}</div>
<div id="upi-apps">
  <div id="svelte-upi-apps-list" class="options options-no-margin">
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
        on:select={onAppSelect}
        name="upi_app"
        value={app.package_name}>
        <div class="ref-title">
          {getUpiIntentAppName(app.shortcode, $locale, app.app_name)}
          {#if i === 0 && showRecommendedUPIApp}
            <span>
              <!-- LABEL: Recommended -->
              <em>({$t(UPI_RECOMMENDED)})</em>
            </span>
          {/if}
        </div>
      </DeprecatedRadioOption>
    {/each}

    {#if apps.length > 5 && !showAll}
      <NextOption on:select={() => (showAll = true)} icon={otherAppsIcon}>
        <!-- LABEL: Show other UPI apps -->
        {$t(UPI_SHOW_OTHER_APPS)}
      </NextOption>
    {/if}
  </div>

</div>
