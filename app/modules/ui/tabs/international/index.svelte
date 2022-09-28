<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { get } from 'svelte/store';

  // Store
  import { getInternationalProviders } from 'checkoutstore/methods';
  import CTA, {
    showCta,
    hideCta,
    showAmount,
    showCtaWithDefaultText,
  } from 'cta';
  import {
    selectedInternationalProvider,
    updateSelectedProvider,
    setIsNVSFormHomeScreenView,
    NVSFormData,
    setNVSFormData,
  } from 'checkoutstore/screens/international';
  import { AVSDccPayload } from 'checkoutstore/screens/card';
  import { isPartialPayment, getAmount } from 'razorpay';

  // i18n
  import { getAppProviderName, getAppProviderSubtext } from 'i18n';
  import { t, locale } from 'svelte-i18n';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { Events } from 'analytics';
  import EVENTS from 'ui/tabs/international/events';
  import * as AnalyticsTypes from 'analytics-types';
  import { isRedesignV15 } from 'razorpay';

  //UI Imports
  import Bottom from 'ui/layouts/Bottom.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';
  import {
    BillingAddressVerificationForm,
    FORM_TYPE,
  } from 'ui/components/BillingAddressVerificationForm';
  import Info from 'ui/elements/Info.svelte';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';

  // Constants
  import { VIEWS_MAP, NVS_COUNTRY_MAP } from 'ui/tabs/international/constants';
  import {
    AVS_HEADING,
    AVS_INFO_TITLE,
    AVS_INFO_MESSAGE_1,
    AVS_INFO_MESSAGE_2,
    AVS_INFO_MESSAGE_3,
  } from 'ui/labels/card';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { pushOverlay } from 'navstack';
  import { CTA_PROCEED, PAY_NOW_CTA_LABEL } from 'cta/i18n';
  import { getInstrumentsWithOrder } from 'common/helper';
  import { MiscTracker } from 'misc/analytics/events';
  import { AnalyticsV2State } from 'analytics-v2';

  const session = getSession();
  const themeMeta = getThemeMeta();
  const icons = themeMeta.icons;

  const providers = getInternationalProviders();

  const ua = navigator.userAgent;
  const ua_iPhone = /iPhone/.test(ua);
  const isRedesignV15Enabled = isRedesignV15();

  export let directlyToNVS = false;

  let filteredProviders = providers;

  let providerRefs = {};

  // Used on NVS screen to show selected provider details
  let selectedProvider = null;

  let currentView = VIEWS_MAP.SELECT_PROVIDERS;

  let lastView;

  let NVSInfo = [];

  let tabVisible = false;
  let checkFormErrors: () => void;

  let CTAState: {
    show: boolean;
    showAmount: boolean;
    label: string;
    onSubmit?: () => void;
  } = {
    show: true,
    showAmount: false,
    label: CTA_PROCEED,
    onSubmit: undefined,
  };

  const handleProviderSelect = (provider) => {
    directlyToNVS = false;
    onProviderSelection(provider.code);
    if ($NVSFormData) {
      setNVSFormData(null);
    }
  };

  export const onProviderSelection = (providerCode) => {
    if (ua_iPhone) {
      window.Razorpay.sendMessage({ event: 'blur' });
    }

    if (providerCode) {
      updateSelectedProvider(providerCode);
      if (!directlyToNVS) {
        showCta();
        CTAState.show = true;
      }
    }

    Events.Track(EVENTS.PROVIDER_SELECT, {
      type: AnalyticsTypes.BEHAV,
      data: {
        provider: $selectedInternationalProvider,
        directlyToNVS,
      },
    });
  };

  const setView = (view) => {
    lastView = currentView;
    currentView = view;
    if (view === VIEWS_MAP.NVS_FORM) {
      CTAState.label = PAY_NOW_CTA_LABEL;
      CTAState.onSubmit = () => {
        checkFormErrors();
        tick().then(() => {
          session.preSubmit();
        });
      };
    } else {
      CTAState.onSubmit = undefined;
      CTAState.label = CTA_PROCEED;
    }
    Events.Track(EVENTS.SWITCH_VIEW, {
      lastView,
      currentView,
    });
  };

  $: setIsNVSFormHomeScreenView(directlyToNVS);

  $: {
    // If a provider was selected and has been filtered out, deselect it
    if (
      $selectedInternationalProvider &&
      !filteredProviders.some(
        (provider) => provider.code === $selectedInternationalProvider
      )
    ) {
      updateSelectedProvider(null);
    }

    /**
     * If there's only one provider available,
     * select it automatically to reduce a user click.
     * Of course, do this only when there's nothing preselected.
     */
    if (
      !directlyToNVS &&
      !$selectedInternationalProvider &&
      filteredProviders.length
    ) {
      onProviderSelection(filteredProviders[0].code);
    }
  }

  $: selectedProvider = filteredProviders.find(
    (provider) => provider.code === $selectedInternationalProvider
  );

  $: {
    NVSInfo = [
      {
        icon: icons.user_protect,
        label: $t(AVS_INFO_MESSAGE_2),
      },
      {
        icon: icons.message,
        label: $t(AVS_INFO_MESSAGE_1),
      },
      {
        icon: icons.lock,
        label: $t(AVS_INFO_MESSAGE_3),
      },
    ];
  }

  function showNVSInfo() {
    pushOverlay({
      component: Info,
      props: {
        title: $t(AVS_INFO_TITLE),
        data: NVSInfo,
      },
    });
  }

  function filterCountries(countries) {
    const countryCodeMap = NVS_COUNTRY_MAP[$selectedInternationalProvider];
    return countries.filter((country) => countryCodeMap.includes(country.key));
  }

  function handleAVSFormInput(evt) {
    setNVSFormData(evt.detail);
  }

  export function onShown() {
    if ($selectedInternationalProvider) {
      tabVisible = true;
      showCta();
      CTAState.show = true;
      CTAState.showAmount = true;
    } else {
      hideCta();
      CTAState.show = false;
    }
  }

  export function showNVSForm(direct) {
    tabVisible = false;
    const AVSData = get(AVSDccPayload);
    if (AVSData && !isRedesignV15Enabled) {
      if (AVSData.header) {
        session.setRawAmountInHeader(AVSData.header);
        showAmount(AVSData.cta);
      } else if (!isPartialPayment()) {
        showCtaWithDefaultText();
        session.updateAmountInHeader(getAmount());
      }
    }
    directlyToNVS = direct;
    setView(VIEWS_MAP.NVS_FORM);

    if ($NVSFormData) {
      setNVSFormData(null);
    }

    Events.Track(EVENTS.NVS_SHOW);
    Events.Track(EVENTS.DIRECT_NVS, {
      directlyToNVS,
    });
  }

  export function isOnNVSForm() {
    return currentView === VIEWS_MAP.NVS_FORM;
  }

  /**
   * Session calls this to ask if tab will handle back
   *
   * @returns {boolean} will tab handle back
   */
  export function onBack() {
    Events.Track(EVENTS.ON_BACK, {
      lastView,
      currentView,
      isOnNVSForm: isOnNVSForm(),
    });

    if (isOnNVSForm()) {
      if (lastView) {
        tabVisible = true;
      }
      setView(VIEWS_MAP.SELECT_PROVIDERS);
      return true;
    }
    tabVisible = false;
    session.dccPayload = {};
    return false;
  }

  onMount(() => {
    Events.Track(EVENTS.SCREEN_LOAD);
    try {
      MiscTracker.INSTRUMENTATION_SELECTION_SCREEN({
        block: AnalyticsV2State.selectedBlock,
        method: {
          name: 'international',
        },
        instruments: getInstrumentsWithOrder(
          filteredProviders,
          'international'
        ),
      });
    } catch {}
  });
</script>

<Tab method="international" pad={false} overrideMethodCheck>
  <div
    class="international-wrapper"
    class:international-one-cc={isRedesignV15Enabled}
  >
    {#if currentView === VIEWS_MAP.SELECT_PROVIDERS}
      <div
        class="border-list collapsable"
        class:screen-one-cc={isRedesignV15Enabled}
      >
        {#each filteredProviders as provider, i (provider.code)}
          <SlottedRadioOption
            name={provider.code}
            selected={$selectedInternationalProvider === provider.code}
            align="top"
            on:click={() => handleProviderSelect(provider)}
          >
            <div
              class="title-container"
              slot="title"
              bind:this={providerRefs[provider.code]}
              id={`international-radio-${provider.code}`}
            >
              <span class="title"
                >{getAppProviderName(provider.code, $locale)}</span
              >
              <span class="subtitle"
                >{getAppProviderSubtext(provider.code, $locale)}</span
              >
            </div>
            <i slot="icon" class="top">
              <Icon icon={provider.logo} />
            </i>
          </SlottedRadioOption>
        {/each}
      </div>
    {:else if currentView === VIEWS_MAP.NVS_FORM}
      <div id="nvsContainer" class:screen-one-cc={isRedesignV15Enabled}>
        {#if selectedProvider}
          <div class="nvs-provider-info">
            <Icon icon={selectedProvider.logo} />
            <span class="provider-name">
              {getAppProviderName(selectedProvider.code, $locale)}
            </span>
          </div>
        {/if}
        <div class="nvs-title">
          {$t(AVS_HEADING)}
          <span
            on:click={() => {
              showNVSInfo();
            }}><Icon icon={icons.question} /></span
          >
        </div>
        <BillingAddressVerificationForm
          {filterCountries}
          formType={FORM_TYPE.N_AVS}
          value={$NVSFormData}
          bind:checkFormErrors
          on:input={handleAVSFormInput}
          on:blur={handleAVSFormInput}
        />
      </div>
    {/if}
    <CTA
      screen="international"
      tab="international"
      disabled={tabVisible && !$selectedInternationalProvider}
      show={CTAState.show}
      label={CTAState.label}
      onSubmit={CTAState.onSubmit}
    />
    <Bottom tab="international">
      {#if $selectedInternationalProvider}
        <DynamicCurrencyView
          {tabVisible}
          view={$selectedInternationalProvider}
          isAVS={currentView === VIEWS_MAP.NVS_FORM}
        />
      {/if}
    </Bottom>
  </div>
  <AccountTab />
</Tab>

<style lang="scss">
  .border-list {
    padding: 12px;
  }

  [slot='icon'].top {
    align-self: flex-start;
  }

  .title-container {
    display: flex;
    flex-direction: column;
  }

  .subtitle {
    font-size: 10px;
  }

  .subtitle:empty {
    display: none;
  }

  #nvsContainer {
    position: relative;
    line-height: 46px;
    padding-bottom: 20px;
  }

  .nvs-provider-info {
    height: 46px;
    display: flex;
    align-items: center;
    padding: 0 1rem;
    background-color: rgba(102, 174, 255, 0.06);
  }

  .nvs-title {
    margin: 1rem 1rem 0;
    line-height: 1;
    display: flex;
  }

  .nvs-title :global(svg) {
    height: 14px;
    width: 14px;
    cursor: pointer;
    margin-left: 4px;
  }

  .nvs-provider-info span.provider-name {
    margin-left: 12px;
    font-size: 13px;
    color: #707070;
  }

  .international-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :global(.redesign) .international-wrapper {
    min-height: 100%;
    height: auto;
  }

  .international-one-cc {
    overflow: auto;
  }
  .screen-one-cc {
    min-height: 100%;
  }

  :global(.redesign) {
    .nvs-title {
      margin: 1.5rem 1rem;
    }

    .border-list {
      padding: 1.5rem 1rem;
    }
  }
</style>
