<script>
  // Utils imports
  import { getSession } from 'sessionmanager';
  import { GOOGLE_PAY_PACKAGE_NAME } from 'common/upi';

  // UI imports
  import RadioOption from 'templates/views/ui/options/RadioOption.svelte';
  import NextOption from 'templates/views/ui/options/NextOption.svelte';
  import OptionIcon from 'templates/views/ui/options/OptionIcon.svelte';
  import Field from 'templates/views/ui/Field.svelte';

  // Props
  export let apps;
  export let showAll = false;
  export let selected = null;
  export let showRecommendedUPIApp;
  export let selectedApp;

  // Computed
  export let showableApps;

  // Refs
  export let vpaField;

  const session = getSession();
  let otherAppsIcon = session.themeMeta.icons.othermethods;

  $: {
    /* selectedApp is passed by parent for preselecting app */
    if (selectedApp === 'gpay') {
      onAppSelect({
        data: { package_name: GOOGLE_PAY_PACKAGE_NAME },
      });
    }
  }

  $: {
    if (apps.length <= 5 || showAll) {
      showableApps = apps;
    } else {
      showableApps = _Arr.slice(apps, 0, 4);
    }
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

  export function onAppSelect({ data }) {
    const packageName = data.package_name;

    if (packageName === 'directpay') {
      vpaField.focus();
    }

    session.onUpiAppSelect(packageName);
    selected = packageName;
  }

  export function showAllApps({ apps }) {
    showAll = true;
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
</style>

<div id="upi-apps">
  <div id="svelte-upi-apps-list" class="options">
    {#each showableApps as app, i}
      <RadioOption
        data={app}
        icon={app.app_icon}
        iconPlaceholder=".placeholder"
        selected={app.package_name === selected}
        on:select={onAppSelect}
        name="upi_app"
        value={app.package_name}>
        <div class="ref-title">
          {app.app_name}
          {#if i === 0 && showRecommendedUPIApp}
            <span>
              <em>(Recommended)</em>
            </span>
          {/if}
        </div>
      </RadioOption>
    {/each}

    {#if apps.length > 5 && !showAll}
      <NextOption on:select={() => showAllApps(apps)} icon={otherAppsIcon}>
        Show other UPI apps
      </NextOption>
    {/if}
  </div>

  <div id="svelte-collect-in-intent" class="options ref-collect">
    <RadioOption
      data={{ package_name: 'directpay' }}
      icon={'&#xe70e;'}
      name="upi_app"
      value="directpay"
      selected={selected === 'directpay'}
      on:select={onAppSelect}>
      <div class="ref-title">UPI Address</div>
      <div class="ref-submessage">
        You will receive a payment request in your UPI app
      </div>
      <Field
        type="text"
        name="vpa"
        bind:this={vpaField}
        placeholder="Enter your UPI Address"
        required={true}
        helpText="Please enter a valid VPA of the form username@bank"
        pattern=".+@.+"
        formatter={{ type: 'vpa' }} />
    </RadioOption>
  </div>
</div>
