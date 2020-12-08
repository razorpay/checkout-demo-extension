<script>
  // Svelte imports
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { _ as t, locale } from 'svelte-i18n';

  // Util imports
  import { getSession } from 'sessionmanager';
  import {
    isPayout,
    getDowntimes,
    hasFeature,
    isCustomerFeeBearer,
    getMerchantOrder,
  } from 'checkoutstore';
  import {
    isMethodEnabled,
    isUPIFlowEnabled,
    isUPIOtmFlowEnabled,
  } from 'checkoutstore/methods';
  import { isVpaValid } from 'common/upi';
  import {
    doesAppExist,
    GOOGLE_PAY_PACKAGE_NAME,
    otherAppsIcon,
    getUPIAppDataFromHandle,
  } from 'common/upi';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { Formatter } from 'formatter';
  import { hideCta, showCtaWithDefaultText, showCta } from 'checkoutstore/cta';
  import { filterUPITokens } from 'common/token';
  import { getUPIIntentApps } from 'checkoutstore/native';

  import {
    getAmount,
    getName,
    getCurrency,
    isASubscription,
    getSubscription,
  } from 'checkoutstore';

  // UI imports
  import UpiIntent from './UpiIntent.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import Grid from 'ui/layouts/grid/index.svelte';
  import Card from 'ui/elements/Card.svelte';
  import ListHeader from 'ui/elements/ListHeader.svelte';
  import Field from 'ui/components/Field.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import DowntimeCallout from 'ui/elements/DowntimeCallout.svelte';
  import Collect from './Collect.svelte';
  import GooglePayCollect from './GooglePayCollect.svelte';
  import GooglePayOmnichannel from './GooglePayOmnichannel.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import AddANewVpa from './AddANewVpa.svelte';
  import { getMiscIcon } from 'checkoutframe/icons';
  import Callout from 'ui/elements/Callout.svelte';

  // Store
  import { contact } from 'checkoutstore/screens/home';
  import { customer } from 'checkoutstore/customer';
  import { methodInstrument } from 'checkoutstore/screens/home';
  import { isRecurring } from 'checkoutstore';

  import {
    UPI_COLLECT_BLOCK_HEADING,
    UPI_COLLECT_BLOCK_SUBHEADING,
    UPI_COLLECT_NEW_VPA_HELP,
    UPI_COLLECT_ENTER_ID,
    UPI_COLLECT_SAVE,
    QR_BLOCK_HEADING,
    SHOW_QR_CODE,
    SCAN_QR_CODE,
    UPI_DOWNTIME_TEXT,
    UPI_OTM_CALLOUT,
    UPI_RECURRING_CAW_CALLOUT_ALL_DATA,
    UPI_RECURRING_CAW_CALLOUT_NO_NAME,
    UPI_RECURRING_CAW_CALLOUT_NO_NAME_NO_FREQUENCY,
    UPI_RECURRING_CAW_CALLOUT_NO_FREQUENCY,
    UPI_RECURRING_SUBSCRIPTION_CALLOUT,
    UPI_SELECT_BANK,
  } from 'ui/labels/upi';

  import { formatTemplateWithLocale } from 'i18n';

  // Props
  export let selectedApp = undefined;
  export let preferIntent = true;
  export let down = false;
  export let retryOmnichannel = false;
  export let isFirst = true;
  export let vpa = '';
  export let qrIcon;
  export let method = 'upi';

  // Refs
  export let intentView = null;
  export let omnichannelField = null;
  export let vpaField = null;

  // Computed
  export let selectedAppData = null;
  export let intent = false;
  export let pspHandle;
  export let shouldShowQr;
  let shouldShowCollect;
  let shouldShowOmnichannel;

  let disabled = false;
  let tokens = [];
  let selectedToken = null;
  let isANewVpa = false;
  let rememberVpaCheckbox;
  let intentAppSelected = null;
  const isOtm = method === 'upi_otm';
  let otmStartDate = new Date();

  const merchantName = getName();

  const session = getSession();

  const merchantOrder = getMerchantOrder();
  const merchantSubscription = getSubscription();

  const isUpiRecurringCAW = isRecurring() && merchantOrder;
  const isUpiRecurringSubscription = isRecurring() && isASubscription('upi');

  const banksThatSupportRecurring = [
    {
      name: 'ICICI Bank',
      id: 'icic',
    },
    {
      name: 'SBI Bank',
      id: 'sbi',
    },
  ];
  let requiresBankSelection = !!(
    isUpiRecurringCAW || isUpiRecurringSubscription
  );
  let selectedBankForRecurring = null;

  const screens = {
    upi: 'upi',
    preUpiPspBankSelection: 'pre-upi-bank-selection',
  };

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
    } else if (merchantName) {
      recurring_callout = UPI_RECURRING_CAW_CALLOUT_NO_FREQUENCY;
    } else if (recurringFrequency !== 'as_presented') {
      recurring_callout = UPI_RECURRING_CAW_CALLOUT_NO_NAME;
    } else {
      recurring_callout = UPI_RECURRING_CAW_CALLOUT_NO_NAME_NO_FREQUENCY;
    }
  }

  const getAllowedPSPs = {
    upi: tokens => tokens,
    upi_otm: tokens => {
      const allowedPSPs = ['upi', 'hdfcbank'];

      return tokens.filter(token => {
        return allowedPSPs.some(psp => token.vpa.handle === psp);
      });
    },
  };

  let toShortFormat = function(date, delimter = ' ') {
    let month_names = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    let day = date.getDate();
    let month_index = date.getMonth();
    let year = date.getFullYear();

    return '' + day + delimter + month_names[month_index] + delimter + year;
  };

  const addDaysToDate = function(date, days) {
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
      _Arr.loop(instrument.flows, flow => {
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
      !_Arr.contains(instrument.flows, 'intent')
    ) {
      return getUPIIntentApps().filtered;
    }

    const allApps = getUPIIntentApps().all;

    return _Arr.filter(
      _Arr.map(instrument.apps, app =>
        _Arr.find(allApps, deviceApp => deviceApp.package_name === app)
      ),
      Boolean
    );
  }

  let intentApps = getUPIIntentApps().filtered;
  $: intentApps = getUPIIntentAppsFromInstrument($methodInstrument);

  let otmEndDate = addDaysToDate(otmStartDate, 90);

  $: intent = availableFlows.intent && preferIntent;
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
    _Arr.contains(['upi', 'upi_otm'], session.tab) && determineCtaVisibility();

  function setDefaultTokenValue() {
    const hasIntentFlow = availableFlows.intent;
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
      tokens = filterUPITokens(_Obj.getSafely($customer, 'tokens.items', []));
      tokens = getAllowedPSPs[method](tokens);

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

  onMount(() => {
    /* TODO: improve handling of `prefill.vpa` */
    if (session.get('prefill.vpa')) {
      selectedApp = undefined;
      vpa = session.get('prefill.vpa');
    }

    const downtimes = getDowntimes();

    down = _Arr.contains(downtimes.low.methods, method);
    disabled = _Arr.contains(downtimes.high.methods, method);
    qrIcon = session.themeMeta.icons.qr;
  });

  export function selectQrMethod() {
    Analytics.track('payment_method:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        method: 'qr',
      },
    });

    session.switchTab('qr');
  }

  function checkBankSelection() {
    return requiresBankSelection;
  }

  export function shouldSubmit() {
    return !checkBankSelection();
  }

  export function onShown() {
    setDefaultTokenValue();
    determineCtaVisibility();
    sendIntentEvents();
  }

  export function updateStep() {
    if (selectedBankForRecurring && requiresBankSelection) {
      requiresBankSelection = false;
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
        data = {
          vpa: getFullVpa(),
          save: vpaField.shouldRememberVpa(),
        };
        break;
      case 'intent':
        data = intentView.getPayload();
        break;
      case 'gpay-omni':
        data = {
          '_[flow]': 'intent',
          contact: omnichannelField.getPhone(),
          upi_provider: 'google_pay',
        };
        break;

      default:
        // `selectedToken` can be null if nothing is to be selected by default
        if (selectedToken) {
          _token = _Arr.find(
            _Obj.getSafely(session.getCurrentCustomer(), 'tokens.items', []),
            token => token.id === selectedToken
          );

          Analytics.track('upi:token:switch:default', {
            data: {
              selectedToken,
              _token,
            },
            immediately: true,
          });

          data = { token: _token.token };
        }

        break;
    }

    // The UPI Block is given priority over the rest of the data.
    // Migrating to have all upi related data in the upi block.
    data.upi = {};

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

    data.method = 'upi';
    return data;
  }

  export function onBack() {
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
    const getEventValueForFeature = feature => {
      return (
        {
          'gpay-omni': 'gpay omnichannel',
          new: 'add new',
          intent: 'intent',
        }[feature] || 'saved vpa'
      );
    };

    const id = event.detail.id;

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
    if (vpaField) {
      return vpaField.getVpa();
    }
    return '';
  }

  export function trackVpaEntry() {
    const vpa = getFullVpa();
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

  export function trackHandleSelection(event) {
    const handle = event.detail;

    const vpa = vpaField.getVpa();

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
    const contact = omnichannelField.getPhone();
    let valid = false;

    if (contact) {
      valid = Formatter.rules.phone.isValid(contact);
    }

    Analytics.track('omnichannel:fill', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid,
        value: omnichannelField.getPhone(),
      },
    });
  }

  function sendIntentEvents() {
    if (!intent) {
      return;
    }

    const apps = getUPIIntentApps();

    Analytics.track('upi:intent', {
      type: AnalyticsTypes.RENDER,
      data: {
        count: {
          eligible: apps.filtered.length,
          all: apps.all.length,
        },
        list: {
          eligible: _Arr.join(
            _Arr.map(apps.filtered, function(app) {
              return app.package_name;
            }),
            ','
          ),
          all: _Arr.join(
            _Arr.map(apps.all, function(app) {
              return app.package_name;
            }),
            ','
          ),
        },
      },
    });
  }
</script>

<style>
  strong {
    font-weight: bolder;
  }

  .legend {
    margin-top: 10px;
    padding: 12px 0 8px 12px;
  }

  #vpa-wrap {
    &.phonepe :global(.elem) {
      padding-right: 44px;
    }

    &.bhim :global(.elem) {
      padding-right: 45px;
    }

    &.whatsapp :global(.elem) {
      padding-right: 50px;
    }

    &.paytm :global(.elem) {
      padding-right: 64px;
    }
  }

  div :global(.input) {
    padding-top: 6px !important;
  }

  span {
    display: inline-block;
    vertical-align: middle;
    margin-right: 4px;
  }

  .ref-iconwrap {
    width: 20px;
    height: @width;
  }

  .recurring-supported-apps-note {
    padding: 10px;
    border: 1px solid #e6e7e8;
    background: #fcfcfc;
  }

  span :global(img) {
    height: 20px;
    width: 20px;
  }
</style>

<Tab {method} {down} pad={false} shown={isPayout()}>
  {#if requiresBankSelection}
    <Screen>
      <div class="legend left">{$t(UPI_SELECT_BANK)}</div>
      <div class="border-list" id="upi-recurring-bank-list">
        {#each banksThatSupportRecurring as bank}
          <SlottedRadioOption
            name="upi_recurring_psp_bank"
            ellipsis
            selected={selectedBankForRecurring === bank.id}
            on:click={() => {
              selectedBankForRecurring = bank.id;
            }}>
            <div slot="title">{bank.name}</div>
            <i slot="icon">
              <Icon icon={'https://cdn.razorpay.com/checkout/gpay.png'} />
            </i>
          </SlottedRadioOption>
        {/each}
      </div>

    </Screen>
  {:else}
    <Screen>
      <div>
        {#if intent}
          <UpiIntent
            bind:this={intentView}
            apps={intentApps || []}
            selected={intentAppSelected}
            on:select={e => {
              onUpiAppSelection({
                detail: { id: 'intent', app: e.detail.packageName },
              });
            }}
            {showRecommendedUPIApp} />
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
                  onUpiAppSelection({ detail: { id: app.id } });
                }}>
                <div slot="title">
                  {app.vpa.username + '@' + app.vpa.handle}
                </div>
                <i slot="icon">
                  <Icon
                    icon={getUPIAppDataFromHandle(app.vpa.handle).app_icon || session.themeMeta.icons.upi} />
                </i>
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
              bind:this={vpaField} />
          </div>
          {#if isUpiRecurringCAW || isUpiRecurringSubscription}
            <div class="recurring-supported-apps-note">
              Please note, you need to have BHIM App or PayTM for this payment.
            </div>
          {/if}
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
            bind:this={omnichannelField} />
        {/if}

        {#if shouldShowQr}
          <!-- LABEL: Pay using QR Code -->
          <div class="legend left">{$t(QR_BLOCK_HEADING)}</div>
          <div class="options" id="showQr">
            <NextOption
              icon={qrIcon}
              tabindex="0"
              attributes={{ role: 'button', 'aria-label': 'Show QR Code - Scan the QR code using your UPI app' }}
              on:select={selectQrMethod}>
              <!-- LABEL: Show QR Code -->
              <div>{$t(SHOW_QR_CODE)}</div>
              <!-- LABEL: Scan the QR code using your UPI app -->
              <div class="desc">{$t(SCAN_QR_CODE)}</div>
            </NextOption>
          </div>
        {/if}
      </div>

      <Bottom>
        {#if down || disabled}
          <DowntimeCallout severe={disabled}>
            <!-- LABEL: UPI is experiencing low success rates. -->
            <FormattedText text={$t(UPI_DOWNTIME_TEXT)} />
          </DowntimeCallout>
        {/if}
        {#if isOtm}
          <Callout classes={['downtime-callout']} showIcon={true}>
            <FormattedText
              text={formatTemplateWithLocale(UPI_OTM_CALLOUT, {
                amount: session.formatAmountWithCurrency(getAmount()),
                nameString: merchantName ? 'by ' + merchantName : '',
                startDate: toShortFormat(otmStartDate),
                endDate: toShortFormat(otmEndDate),
              })} />
          </Callout>
        {/if}
        <!-- Both CAW and subscriptions show the same callout with the same information -->
        {#if isUpiRecurringCAW || isUpiRecurringSubscription}
          <Callout classes={['downtime-callout']} showIcon={true}>
            <!-- This is a recurring payment and {maxAmount} will be charged now. After this, {merchantName} can charge upto {amount} {recurringFrequency} till {endDate}. -->
            <!-- This is a recurring payment and {maxAmount} will be charged now. You will be charged upto {amount} on a {recurringFrequency} basis till {endDate}. -->
            <!-- This is a recurring payment and {maxAmount} will be charged now. You will be charged upto {amount} anytime till {endDate}. -->
            <!-- This is a recurring payment and {maxAmount} will be charged now. {merchantName} can charge upto {amount} anytime till {endDate}. -->
            {formatTemplateWithLocale(recurring_callout, { maxAmount: session.formatAmountWithCurrency(getAmount()), merchantName: !merchantName ? '' : merchantName, amount: session.formatAmountWithCurrency(maxRecurringAmount), recurringFrequency, endDate: toShortFormat(new Date(endDate * 1000)) }, $locale)}
          </Callout>
        {/if}
      </Bottom>
    </Screen>
  {/if}
</Tab>
