<script>
  // Svelte imports
  import { onMount, tick } from 'svelte';
  import { _ as t } from 'svelte-i18n';

  // Util imports
  import { getSession } from 'sessionmanager';
  import { isPayout, shouldRememberCustomer } from 'checkoutstore';
  import { getPrefilledVPA, hasFeature, isOneClickCheckout } from 'razorpay';
  import {
    isMethodEnabled,
    isUPIFlowEnabled,
    isUPIOtmFlowEnabled,
  } from 'checkoutstore/methods';
  import {
    isVpaValid,
    OTHER_INTENT_APPS,
    getUPIAppDataFromHandle,
    isOtherIntentApp,
  } from 'common/upi';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { Formatter } from 'formatter';
  import { hideCta, showCta } from 'checkoutstore/cta';
  import { filterUPITokens } from 'common/token';
  import { getUPIIntentApps } from 'checkoutstore/native';
  import {
    intentVpaPrefill,
    intentVpaPrefilledFromPreferences,
  } from 'checkoutstore/screens/upi';
  import { getDowntimes, checkDowntime } from 'checkoutframe/downtimes';
  import { getTrustedBadgeAnaltyicsPayload } from 'trusted-badge/helper';
  import { getName, isASubscription } from 'checkoutstore';

  // UI imports
  import UpiIntent from './UpiIntent.svelte';
  import UpiBottom from './Bottom.svelte';
  import BankSelection from './BankSelection.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import ListHeader from 'ui/elements/ListHeader.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import GooglePayOmnichannel from './GooglePayOmnichannel.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import AddANewVpa from './AddANewVpa.svelte';
  import { getMiscIcon } from 'checkoutframe/icons';
  import CTAOneCC from 'one_click_checkout/cta/index.svelte';

  import updateScore from 'analytics/checkoutScore';

  // Store
  import { customer } from 'checkoutstore/customer';
  import { methodInstrument } from 'checkoutstore/screens/home';
  import { isRecurring, getMerchantOrder, getSubscription } from 'razorpay';

  import {
    UPI_COLLECT_BLOCK_HEADING,
    UPI_COLLECT_BLOCK_SUBHEADING,
    QR_BLOCK_HEADING,
    SHOW_QR_CODE,
    SCAN_QR_CODE,
    UPI_RECURRING_CAW_CALLOUT_ALL_DATA,
    UPI_RECURRING_CAW_CALLOUT_NO_NAME,
    UPI_RECURRING_CAW_CALLOUT_NO_NAME_NO_FREQUENCY,
    UPI_RECURRING_CAW_CALLOUT_NO_FREQUENCY,
    UPI_RECURRING_CAW_CALLOUT_AS_PRESENTED,
    ID_LINKED_TO_BANK,
  } from 'ui/labels/upi';
  import UPI_EVENTS from 'ui/tabs/upi/events';

  import { oneClickUPIIntent } from 'upi/helper';
  import { getComponentProps } from 'utils/svelteUtils';

  // Constant imports
  import { PAY_NOW_CTA_LABEL } from 'one_click_checkout/cta/i18n';

  // Props
  export let selectedApp = undefined;
  export let preferIntent = true;
  export let retryOmnichannel = false;
  export let isFirst = true;
  export let vpa = '';
  export let qrIcon;
  export let method = 'upi';

  // Refs
  export let vpaField = null;

  // Computed
  export let selectedAppData = null;
  export let intent = false;
  export let pspHandle;
  export let shouldShowQr;
  let shouldShowCollect;
  let shouldShowOmnichannel;
  let vpaEntered;
  let rememberVpa = shouldRememberCustomer('upi');
  let omnichannelPhone = '';

  let tokens = [];
  let selectedToken = null;
  let isANewVpa = false;
  let rememberVpaCheckbox;
  let intentAppSelected = null;
  const isOtm = method === 'upi_otm';
  let otmStartDate = new Date();
  let upiIntent;
  let renderCtaOneCC = false;

  const merchantName = getName();

  const session = getSession();

  const merchantOrder = getMerchantOrder();
  const merchantSubscription = getSubscription();

  const isUpiRecurringCAW = isRecurring() && merchantOrder;
  const isUpiRecurringSubscription = isRecurring() && isASubscription('upi');
  const upiDowntimes = getDowntimes().upi;
  let downtimeSeverity;
  let downtimeInstrument;

  let helpTextToDisplay;

  const banksThatSupportRecurring = [
    {
      name: 'ICICI Bank',
      id: 'icic',
      img: 'ICIC',
    },
    {
      name: 'SBI Bank',
      id: 'sbi',
      img: 'SBIN',
    },
  ];
  const steps = {
    upi: 'upi',
    preUpiPspBankSelection: 'pre-upi-bank-selection',
  };

  /**
   * bankselection is disabled for UPI recurring
   * https://jira.corp.razorpay.com/browse/CE-4110
   */
  let requiresBankSelection = false;
  let upiFlowStep = steps.upi;
  let selectedBankForRecurring = null;

  const currentScreen = 'upi';

  let startDate,
    endDate,
    orderAmount,
    recurringFrequency,
    recurring_type,
    maxRecurringAmount,
    tokenObject,
    recurring_callout;

  if (isUpiRecurringCAW) {
    tokenObject = merchantOrder;
  } else if (isUpiRecurringSubscription) {
    tokenObject = merchantSubscription;
  }

  if (isUpiRecurringCAW || isUpiRecurringSubscription) {
    orderAmount = tokenObject.amount;
    startDate = tokenObject.token.start_time;
    endDate = tokenObject.token.end_time;
    recurringFrequency = tokenObject.token.frequency;
    maxRecurringAmount = tokenObject.token.max_amount;
    recurring_type = tokenObject.token.recurringType;
    if (merchantName && recurringFrequency !== 'as_presented') {
      recurring_callout = UPI_RECURRING_CAW_CALLOUT_ALL_DATA;
    } else if (recurringFrequency === 'as_presented') {
      recurring_callout = UPI_RECURRING_CAW_CALLOUT_AS_PRESENTED;
    } else if (merchantName) {
      recurring_callout = UPI_RECURRING_CAW_CALLOUT_NO_FREQUENCY;
    } else if (recurringFrequency !== 'as_presented') {
      recurring_callout = UPI_RECURRING_CAW_CALLOUT_NO_NAME;
    } else {
      recurring_callout = UPI_RECURRING_CAW_CALLOUT_NO_NAME_NO_FREQUENCY;
    }
  }

  const getAllowedPSPs = {
    upi: (tokens) => tokens,
    upi_otm: (tokens) => {
      const allowedPSPs = ['upi', 'hdfcbank'];

      return tokens.filter((token) => {
        return allowedPSPs.some((psp) => token.vpa.handle === psp);
      });
    },
  };

  const addDaysToDate = function (date, days) {
    return new Date(date.getTime() + days * 1000 * 24 * 3600);
  };

  const { showRecommendedUPIApp } = session;

  /**
   * An instrument might has for some flows to be available
   * @param {Instrument | undefined} instrument
   *
   * @returns {Object}
   */
  function getAvailableFlowsFromInstrument(instrument) {
    const isFlowEnabled = isOtm ? isUPIOtmFlowEnabled : isUPIFlowEnabled;

    let availableFlows = {
      omnichannel: isFlowEnabled('omnichannel'),
      collect: isFlowEnabled('collect'),
      intent: isFlowEnabled('intent'),
      intentUrl: isFlowEnabled('intentUrl'),
      qr: isFlowEnabled('qr'),
    };

    if (!instrument || instrument.method !== 'upi') {
      return availableFlows;
    }

    if (instrument.flows) {
      // Disable all flows
      _Obj.loop(availableFlows, (val, key) => {
        availableFlows[key] = false;
      });

      // Enable ones that are asked for
      instrument.flows.forEach((flow) => {
        availableFlows[flow] = true;
      });
    }

    return availableFlows;
  }

  let availableFlows = getAvailableFlowsFromInstrument();
  $: {
    availableFlows = getAvailableFlowsFromInstrument($methodInstrument);
  }

  // Set default token value when the available flows change
  $: availableFlows, setDefaultTokenValue();

  /**
   * An instrument might has only for some apps to be shown
   * @param {Instrument | undefined} instrument
   *
   * @returns {Array<Object>}
   */
  function getUPIIntentAppsFromInstrument(instrument) {
    const apps = getUPIIntentApps().filtered;
    if (!instrument || instrument.method !== 'upi') {
      return apps;
    }

    if (
      !instrument.flows ||
      !instrument.apps ||
      !instrument.flows.includes('intent')
    ) {
      return getUPIIntentApps().filtered;
    }

    const allApps = getUPIIntentApps().all;

    return instrument.apps
      .map((app) => allApps.find((deviceApp) => deviceApp.package_name === app))
      .filter(Boolean);
  }

  let intentApps = getUPIIntentApps().filtered;
  $: intentApps = getUPIIntentAppsFromInstrument($methodInstrument);

  let otmEndDate = addDaysToDate(otmStartDate, 90);

  $: intent =
    (availableFlows.intent || availableFlows.intentUrl) && preferIntent;
  $: pspHandle = selectedAppData ? selectedAppData.psp : '';
  $: shouldShowQr =
    availableFlows.qr &&
    isMethodEnabled('qr') &&
    !selectedApp &&
    selectedApp !== null;
  $: shouldShowCollect = availableFlows.collect;
  $: shouldShowOmnichannel = availableFlows.omnichannel;

  // Determine CTA visilibty when selectedToken changes, but only if session.tab is a upi based method
  $: selectedToken,
    selectedBankForRecurring,
    ['upi', 'upi_otm'].includes(session.tab) && determineCtaVisibility();

  function setDefaultTokenValue() {
    const hasIntentFlow = availableFlows.intent || availableFlows.intentUrl;
    const hasTokens = tokens && tokens.length;

    /**
     * If there are no tokens, select "new" as the default option.
     * But only do that if intent flow is not available.
     */
    if (hasIntentFlow) {
      selectedToken = null;
    } else if (availableFlows.collect) {
      if (hasTokens) {
        selectedToken = null;
      } else {
        selectedToken = 'new';
      }
    }
  }

  $: {
    // BE does not support saved vpa tokens for recurring payments
    // conditional support might be added later
    if (!isRecurring()) {
      tokens = _Obj
        .getSafely($customer, 'tokens.items', [])
        .filter((token) => token.method === 'upi');
      tokens = getAllowedPSPs[method](tokens);
      addDowntime();

      setDefaultTokenValue();
    }
  }

  function determineCtaVisibility() {
    if (requiresBankSelection) {
      hideCta();
      if (selectedBankForRecurring) {
        showCta();
      }
    } else if (selectedToken) {
      showCta();
    } else {
      hideCta();
    }
  }

  function prefillVpaFromIntentInstrument() {
    if ($intentVpaPrefill) {
      tick()
        .then(() => {
          onUpiAppSelection({ detail: { id: 'new' } });
          vpaEntered = $intentVpaPrefill;
          $intentVpaPrefill = '';
          $intentVpaPrefilledFromPreferences = true;
        })
        .then(() => {
          if (vpaField) {
            vpaField.focus();
            vpaField.setSelectionRange(0, 0);
          }
        });
    } else {
      $intentVpaPrefilledFromPreferences = false;
    }
  }

  let oneClickUPIIntentFlow = false;

  onMount(() => {
    Analytics.track(UPI_EVENTS.SCREEN_LOAD);
    /* TODO: improve handling of `prefill.vpa` */
    if (getPrefilledVPA()) {
      selectedApp = undefined;
      vpaEntered = getPrefilledVPA();
      updateScore('vpaPrefilled');
    }

    prefillVpaFromIntentInstrument();

    qrIcon = session.themeMeta.icons.qr;
  });

  $: {
    if (intent) {
      oneClickUPIIntentFlow = oneClickUPIIntent();
    }
  }

  function addDowntime() {
    tokens.map((item) => {
      const currentDowntime = checkDowntime(
        upiDowntimes,
        'vpa_handle',
        item.vpa.handle
      );
      if (currentDowntime) {
        item.downtimeSeverity = currentDowntime;
        item.downtimeInstrument = item.vpa.handle;
      }
    });
  }

  export function selectQrMethod() {
    Analytics.track('payment_method:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        method: 'qr',
        ...getTrustedBadgeAnaltyicsPayload(),
      },
    });

    session.switchTab('qr');
  }

  export function shouldSubmit() {
    return upiFlowStep === steps.upi;
  }

  export function onShown() {
    renderCtaOneCC = true;
    setDefaultTokenValue();
    determineCtaVisibility();
    sendIntentEvents();
    if (requiresBankSelection) {
      upiFlowStep = steps.preUpiPspBankSelection;
    }
  }

  export function onHide() {
    renderCtaOneCC = false;
  }

  export function updateStep() {
    if (selectedBankForRecurring && requiresBankSelection) {
      if (upiFlowStep === steps.preUpiPspBankSelection) {
        upiFlowStep = steps.upi;
      }
    }
  }

  export function getPayload() {
    if (!shouldSubmit()) {
      return {};
    }
    /**
     * getPayload is called when the users presses Pay.
     *
     * "blur" is not fired on vpaField input element
     * if the form is submitted directly by pressing Enter.
     *
     * Hence, we try to force a blur in order to perform
     * analytics tracking.
     *
     * "blur" is not fired in case the element is not
     * already focused on, so this would be fine if the
     * user decides to manually press the pay button.
     */
    try {
      vpaField.blur();
    } catch (err) {}

    let data = {};
    let _token = [];
    switch (selectedToken) {
      case 'new':
        // added it for downtime check
        _token = vpaField;
        data = {
          vpa: getFullVpa(),
          save: shouldRememberVpa(),
        };
        break;
      case 'intent':
        data = getPayloadForUpiIntentView();
        break;
      case 'gpay-omni':
        data = {
          '_[flow]': 'intent',
          contact: omnichannelPhone,
          upi_provider: 'google_pay',
        };
        break;

      default:
        // `selectedToken` can be null if nothing is to be selected by default
        if (selectedToken) {
          _token = _Obj
            .getSafely(session.getCurrentCustomer(), 'tokens.items', [])
            .find((token) => token.id === selectedToken);

          Analytics.track('upi:token:switch:default', {
            data: {
              selectedToken,
              _token,
            },
            immediately: true,
          });

          data = { token: _token.token };
          updateScore('paidViaSavedVpa');
        }

        break;
    }

    // The UPI Block is given priority over the rest of the data.
    // Migrating to have all upi related data in the upi block.
    data.upi = {};
    if (_token) {
      const { downtimeSeverity, downtimeInstrument } = _token;
      if (downtimeSeverity || getComponentProps(_token, 'downtimeSeverity')) {
        data.downtimeSeverity =
          downtimeSeverity || getComponentProps(_token, 'downtimeSeverity');
        data.downtimeInstrument =
          downtimeInstrument || getComponentProps(_token, 'downtimeInstrument');
      }
    }
    /**
     * default to directpay for collect requests
     */
    if (!data['_[flow]']) {
      data['_[flow]'] = 'directpay';
      data.upi.flow = 'collect';
    }

    if (isOtm) {
      data.upi.type = 'otm';
    }

    if (isUpiRecurringCAW || isUpiRecurringSubscription) {
      data.upi.type = 'recurring';
      data.recurring = 1;
    }

    if (isOtm || isUpiRecurringCAW || isUpiRecurringSubscription) {
      if (data.vpa) {
        data.upi.vpa = data.vpa;
      }
    }

    if (data.save) {
      updateScore('saveThisVpa');
    }

    data.method = 'upi';
    return data;
  }

  export function onBack() {
    updateScore('wentBack');
    // User has gone back, set isFirst as false
    isFirst = false;

    if (!intent) {
      if (selectedApp !== undefined) {
        selectedApp = undefined;
        return true;
      } else {
        return false;
      }
    }

    return false;
  }

  export function onUpiAppSelection(event) {
    const { severity, instrument, id } = event.detail;
    if (severity) {
      downtimeSeverity = severity;
      downtimeInstrument = instrument;
    } else {
      downtimeSeverity = false;
    }
    const getEventValueForFeature = (feature) => {
      return (
        {
          'gpay-omni': 'gpay omnichannel',
          new: 'add new',
          intent: 'intent',
        }[feature] || 'saved vpa'
      );
    };

    Analytics.track('vpa:option:click', {
      type: AnalyticsTypes.BEHAV,
      data: {
        app: event.detail.app,
        value: getEventValueForFeature(id),
      },
    });

    selectedToken = id;
    intentAppSelected = event.detail.app || null;
  }

  export function getFullVpa() {
    if (vpaEntered) {
      return vpaEntered;
    }
    return '';
  }

  export function trackVpaEntry() {
    const vpa = getFullVpa();
    if (!vpa) {
      return;
    }

    const valid = isVpaValid(vpa);
    if (!valid) {
      updateScore('invalidVpaBlur');
    }
    Analytics.track('vpa:fill', {
      type: AnalyticsTypes.BEHAV,
      data: {
        app: selectedApp,
        value: vpa,
        valid,
      },
    });
  }

  export function shouldRememberVpa() {
    return _Obj.getSafely($customer, 'logged') &&
      hasFeature('save_vpa') &&
      rememberVpa
      ? 1
      : 0;
  }

  export function trackHandleSelection(event) {
    const handle = event.detail;

    const vpa = vpaEntered;

    const valid = vpa ? isVpaValid(vpa) : false;

    Analytics.track('vpa:handle:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        app: selectedApp,
        value: vpa,
        valid,
        handle,
      },
    });
  }

  export function trackOmnichannelEntry() {
    const contact = omnichannelPhone;
    let valid = false;

    if (contact) {
      valid = Formatter.rules.phone.isValid(contact);
    }

    Analytics.track('omnichannel:fill', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid,
        value: omnichannelPhone,
      },
    });
  }

  export function getPayloadForUpiIntentView() {
    let data;
    if (intentAppSelected === 'directpay') {
      data = {
        '_[flow]': 'directpay',
        vpa: vpaEntered,
      };
    } else {
      const upi_app = isOtherIntentApp(intentAppSelected)
        ? null
        : intentAppSelected;

      data = {
        '_[flow]': 'intent',
        upi_app,
        downtimeSeverity,
        downtimeInstrument,
      };
    }

    return data;
  }

  function sendIntentEvents() {
    if (!intent) {
      return;
    }

    let apps = getUPIIntentApps();

    if (availableFlows.intentUrl) {
      apps = {
        filtered: apps.filtered.concat(OTHER_INTENT_APPS),
        all: apps.all.concat(OTHER_INTENT_APPS),
      };
    }

    Analytics.track('upi:intent', {
      type: AnalyticsTypes.RENDER,
      data: {
        count: {
          eligible: apps.filtered.length,
          all: apps.all.length,
        },
        list: {
          eligible: apps.filtered.map((app) => app.package_name).join(','),
          all: apps.all.map((app) => app.package_name).join(','),
        },
      },
    });
  }

  export const processIntentOnMWeb = (intentUrl) => {
    upiIntent.processIntentOnMWeb(intentUrl);
  };
</script>

<Tab {method} pad={false} shown={isPayout()}>
  <Screen pad={!isOneClickCheckout()}>
    <div class="upi-container" class:screen-one-cc={isOneClickCheckout()}>
      {#if upiFlowStep === steps.preUpiPspBankSelection}
        <BankSelection bind:value={selectedBankForRecurring} />
      {:else if upiFlowStep === steps.upi}
        {#if selectedBankForRecurring}
          <div class="legend left">{$t(ID_LINKED_TO_BANK)}</div>
          <div class="border-list">
            <SlottedOption className="upi-selected-bank" id="user-details">
              <i slot="icon">
                <Icon
                  icon={`https://cdn.razorpay.com/bank/${selectedBankForRecurring.img}.gif`}
                />
              </i>
              <div slot="title">
                <span>{selectedBankForRecurring.name}</span>
              </div>
              <div
                slot="extra"
                on:click={() => {
                  upiFlowStep = steps.preUpiPspBankSelection;
                }}
              >
                <!-- LABEL: Edit -->
                <span>Change Bank</span>
                <span class="downward-arrow">&#xe604;</span>
              </div>
            </SlottedOption>
          </div>
        {/if}

        <div>
          {#if intent}
            <UpiIntent
              apps={intentApps || []}
              selected={intentAppSelected}
              skipCTA={oneClickUPIIntentFlow}
              payUsingApps={availableFlows.intentUrl}
              bind:this={upiIntent}
              on:select={(e) => {
                const { downtimeInstrument, downtimeSeverity, packageName } =
                  e.detail;
                onUpiAppSelection({
                  detail: {
                    id: 'intent',
                    app: packageName,
                    severity: downtimeSeverity,
                    instrument: downtimeInstrument,
                  },
                });
                if (oneClickUPIIntentFlow) {
                  session.preSubmit();
                }
              }}
              {showRecommendedUPIApp}
            />
          {/if}

          {#if shouldShowCollect}
            <!-- LABEL: Pay using UPI ID -->
            <div class="legend left">{$t(UPI_COLLECT_BLOCK_HEADING)}</div>
            <div class="border-list" id="upi-collect-list">
              {#if intent}
                <ListHeader>
                  <i slot="icon">
                    <Icon icon={getMiscIcon('receive')} />
                  </i>
                  <!-- LABEL: You will receive a payment request on your UPI app -->
                  <div slot="subtitle">{$t(UPI_COLLECT_BLOCK_SUBHEADING)}</div>
                </ListHeader>
              {/if}

              {#each tokens as app, i (app.id)}
                <SlottedRadioOption
                  name="payment_type"
                  ellipsis
                  selected={selectedToken === app.id}
                  on:click={() => {
                    const { downtimeSeverity, downtimeInstrument } = app;
                    onUpiAppSelection({
                      detail: {
                        id: app.id,
                        severity: downtimeSeverity,
                        instrument: downtimeInstrument,
                      },
                    });
                  }}
                >
                  <div slot="title">
                    {app.vpa.username + '@' + app.vpa.handle}
                  </div>
                  <i slot="icon">
                    <Icon
                      icon={getUPIAppDataFromHandle(app.vpa.handle).app_icon ||
                        session.themeMeta.icons.upi}
                    />
                  </i>
                  <div slot="downtime" class="downtime-saved-vpa">
                    {#if !!downtimeSeverity}
                      <DowntimeCallout
                        showIcon={true}
                        severe={downtimeSeverity}
                        {downtimeInstrument}
                      />
                    {/if}
                  </div>
                </SlottedRadioOption>
              {/each}
              <AddANewVpa
                recurring={isUpiRecurringCAW || isUpiRecurringSubscription}
                paymentMethod={method}
                on:click={() => {
                  onUpiAppSelection({ detail: { id: 'new' } });
                }}
                customer={$customer}
                on:blur={trackVpaEntry}
                selected={selectedToken === 'new'}
                bind:value={vpaEntered}
                bind:rememberVpa
                bind:this={vpaField}
                bind:helpTextToDisplay
              />
            </div>
          {/if}

          {#if shouldShowOmnichannel}
            <GooglePayOmnichannel
              error={retryOmnichannel}
              focusOnCreate={true}
              {isFirst}
              retry={retryOmnichannel}
              selected={selectedToken === 'gpay-omni'}
              on:blur={trackOmnichannelEntry}
              on:select={() => {
                onUpiAppSelection({ detail: { id: 'gpay-omni' } });
              }}
              bind:value={omnichannelPhone}
            />
          {/if}

          {#if shouldShowQr}
            <!-- LABEL: Pay using QR Code -->
            <div class="legend left">{$t(QR_BLOCK_HEADING)}</div>
            <div class="options" id="showQr">
              <NextOption
                icon={qrIcon}
                tabindex="0"
                attributes={{
                  role: 'button',
                  'aria-label':
                    'Show QR Code - Scan the QR code using your UPI app',
                }}
                on:select={selectQrMethod}
              >
                <!-- LABEL: Show QR Code -->
                <div>{$t(SHOW_QR_CODE)}</div>
                <!-- LABEL: Scan the QR code using your UPI app -->
                <div class="desc">{$t(SCAN_QR_CODE)}</div>
              </NextOption>
            </div>
          {/if}
        </div>
      {/if}

      <UpiBottom
        {isOtm}
        {isUpiRecurringCAW}
        {isUpiRecurringSubscription}
        {otmStartDate}
        {otmEndDate}
        {recurring_callout}
        {endDate}
        {maxRecurringAmount}
        {recurringFrequency}
      />
    </div>
    {#if renderCtaOneCC}
      <CTAOneCC
        disabled={Boolean(helpTextToDisplay) && selectedToken === 'new'}
        on:click={() => session.preSubmit()}
      >
        {$t(PAY_NOW_CTA_LABEL)}
      </CTAOneCC>
    {/if}
  </Screen>
</Tab>

<style>
  .legend {
    margin-top: 10px;
    padding: 12px 0 8px 12px;
  }

  div :global(.input) {
    padding-top: 6px !important;
  }

  span {
    display: inline-block;
    vertical-align: middle;
    margin-right: 4px;
  }

  span :global(img) {
    height: 20px;
    width: 20px;
  }

  :global(.upi-selected-bank [slot='extra']) {
    margin-left: auto;
    font-size: 12px;
    color: rgba(123, 127, 148, 1);
  }

  :global(.upi-selected-bank [slot='extra']:hover) {
    color: rgba(82, 143, 240, 1);
  }

  :global(.border-list > *.upi-selected-bank:hover) {
    border-color: #e6e7e8 !important;
    background-color: #fff !important;
    cursor: default !important;
  }

  :global(.border-list > *.upi-selected-bank:hover [slot='extra']) {
    cursor: pointer !important;
  }

  :global(.upi-selected-bank .downward-arrow) {
    transform: rotate(-90deg);
    font-size: 10px;
  }
  .downtime-saved-vpa {
    margin-top: 4px;
  }

  .upi-container {
    padding: 0px 12px 12px;
  }
  .screen-one-cc {
    min-height: 120%;
  }

  :global(#content.one-cc) .upi-container {
    padding: 0px 16px 12px;
  }
</style>
