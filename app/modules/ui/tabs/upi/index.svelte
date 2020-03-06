<script>
  // Svelte imports
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  // Util imports
  import { getSession } from 'sessionmanager';
  import * as GPay from 'gpay';
  import * as Bridge from 'bridge';
  import Preferences from 'checkoutstore/preferences';
  import DowntimesStore from 'checkoutstore/downtimes';
  import { isVpaValid } from 'common/upi';
  import {
    doesAppExist,
    GOOGLE_PAY_PACKAGE_NAME,
    otherAppsIcon,
    getUPIAppLogoFromHandle,
  } from 'common/upi';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { Formatter } from 'formatter';
  import { hideCta, showCtaWithDefaultText, showCta } from 'checkoutstore/cta';
  import { filterUPITokens } from 'common/token';

  // UI imports
  import UpiIntent from './UpiIntent.svelte';
  import Tab from 'ui/tabs/Tab.svelte';
  import Grid from 'ui/layouts/grid/index.svelte';
  import Card from 'ui/elements/Card.svelte';
  import ListHeader from 'ui/elements/ListHeader.svelte';
  import Field from 'ui/components/Field.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import DowntimeCallout from 'ui/elements/DowntimeCallout.svelte';
  import Collect from './Collect.svelte';
  import GooglePayCollect from './GooglePayCollect.svelte';
  import GooglePayOmnichannel from './GooglePayOmnichannel.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import OffersPortal from 'ui/components/OffersPortal.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import AddANewVpa from './AddANewVpa.svelte';
  import { getMiscIcon } from 'icons/misc';

  // Store
  import { contact } from 'checkoutstore/screens/home';

  // Props
  export let selectedApp = undefined;
  export let preferIntent = true;
  export let useWebPaymentsApi = false;
  export let qrEnabled = false;
  export let down = false;
  export let useOmnichannel = false;
  export let retryOmnichannel = false;
  export let isFirst = true;
  export let vpa = '';
  export let qrIcon;

  // Refs
  export let intentView = null;
  export let omnichannelField = null;
  export let vpaField = null;

  // Computed
  export let selectedAppData = null;
  export let intent = false;
  export let isGPaySelected;
  export let pspHandle;
  export let shouldShowQr;

  let disabled = false;
  let tokens = [];
  let selectedToken = null;
  let isANewVpa = false;
  let rememberVpaCheckbox;
  let intentAppSelected = null;
  let customer;
  let collectEnabled = false;

  const session = getSession();
  const preferences = Preferences.get();

  const {
    all_upi_intents_data: allIntentApps,
    upi_intents_data: intentApps,
    isPayout,
    showRecommendedUPIApp,
  } = session;

  const checkGPay = session => {
    /* disable Web payments API for fee_bearer for now */
    if (session.preferences.fee_bearer) {
      return Promise.reject();
    }

    // We're not using Web Payments API for Payouts
    if (session.isPayout) {
      return Promise.reject();
    }

    /* disable Web payments API for Android SDK as we have intent there */
    if (Bridge.checkout.exists()) {
      return Promise.reject();
    }

    return session.r.checkPaymentAdapter('gpay');
  };

  const checkOmnichannel = session =>
    _Obj.getSafely(session, 'methods.upi.omnichannel');

  $: intent = preferIntent && _Obj.getSafely(session, 'methods.upi.intent');
  $: isGPaySelected = selectedApp === 'gpay' && useWebPaymentsApi;
  $: pspHandle = selectedAppData ? selectedAppData.psp : '';
  $: shouldShowQr = qrEnabled && !selectedApp && selectedApp !== null;

  $: {
    /**
     * If there are no tokens, select "new" as the default option.
     * But only do that if intent flow is not available.
     */
    if (!tokens.length && !intent) {
      selectedToken = 'new';
    }
  }

  $: {
    if (selectedToken && session.tab === 'upi') {
      determineCtaVisibility();
    }
  }

  function setWebPaymentsApiUsage(to) {
    useWebPaymentsApi = to;

    /**
     * If web payments API is available,
     * do not select Add New VPA by default
     */
    if (to) {
      selectedToken = null;
    }
  }

  function determineCtaVisibility() {
    if (selectedToken) {
      showCta();
    } else {
      hideCta();
    }
  }

  onMount(() => {
    updateCustomer();

    checkGPay(session)
      /* Use Google Pay */
      .then(() => {
        setWebPaymentsApiUsage(true);
      })
      /* Don't use Google Pay */
      .catch(e => {
        setWebPaymentsApiUsage(false);
      });

    useOmnichannel = checkOmnichannel(session);

    /* TODO: improve handling of `prefill.vpa` */
    if (session.get('prefill.vpa')) {
      selectedApp = null;
      vpa = session.get('prefill.vpa');
    }

    const downtimes = DowntimesStore.get();

    down = _Arr.contains(downtimes.low.methods, 'upi');
    disabled = _Arr.contains(downtimes.high.methods, 'upi');

    qrEnabled = _Obj.getSafely(session, 'methods.upi.qr');
    qrIcon = session.themeMeta.icons.qr;

    collectEnabled = _Obj.getSafely(session, 'methods.upi.collect');
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

  export function updateCustomer() {
    customer = session.getCustomer($contact);

    tokens = filterUPITokens(_Obj.getSafely(customer, 'tokens.items', []));
  }

  export function onShown() {
    updateCustomer();
    determineCtaVisibility();
  }

  export function getPayload() {
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
      case 'gpay':
        data = {
          '_[flow]': 'gpay',
        };
        break;

      default:
        _token = _Arr.find(
          session.customer.tokens.items,
          token => token.id === selectedToken
        );
        data = { token: _token.token };
        break;
    }

    /**
     * default to directpay for collect requests
     */
    if (!data['_[flow]']) {
      data['_[flow]'] = 'directpay';
    }

    data.method = 'upi';
    return data;
  }

  export function onBack() {
    // User has gone back, set isFirst as false
    isFirst = false;

    if (!intent) {
      if (isGPaySelected) {
        selectedApp = undefined;
        return false;
      }

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
          gpay: 'gpay web payments',
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
</script>

<style>
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

  span :global(img) {
    height: 20px;
    width: 20px;
  }
</style>

<Tab method="upi" {down} pad={false}>
  <Screen>
    <div slot="main">

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

      {#if useWebPaymentsApi}
        <div class="legend left">Pay using Gpay App</div>
        <div class="border-list">
          <SlottedRadioOption
            name="google_pay_web"
            selected={selectedToken === 'gpay'}
            on:click={() => {
              selectedToken = 'gpay';
              session.preSubmit();
            }}>
            <div slot="title">Google Pay</div>
            <i slot="icon">
              <Icon icon={session.themeMeta.icons.gpay} />
            </i>
          </SlottedRadioOption>
        </div>
      {/if}

      {#if collectEnabled}
        <div class="legend left">Pay using UPI ID</div>
        <div class="border-list">
          {#if intent}
            <ListHeader>
              <i slot="icon">
                <Icon icon={getMiscIcon('recieve')} />
              </i>
              <div slot="subtitle">
                You will receive a payment request on your UPI app
              </div>
            </ListHeader>
          {/if}

          {#each tokens as app, i}
            <SlottedRadioOption
              name="payment_type"
              ellipsis
              selected={selectedToken === app.id}
              on:click={() => {
                onUpiAppSelection({ detail: { id: app.id } });
              }}>
              <div slot="title">{app.vpa.username + '@' + app.vpa.handle}</div>
              <i slot="icon">
                <Icon
                  icon={getUPIAppLogoFromHandle(app.vpa.handle) || session.themeMeta.icons.upi} />
              </i>
            </SlottedRadioOption>
          {/each}
          <AddANewVpa
            on:click={() => {
              onUpiAppSelection({ detail: { id: 'new' } });
            }}
            {customer}
            on:blur={trackVpaEntry}
            selected={selectedToken === 'new'}
            bind:this={vpaField} />
        </div>
      {/if}

      {#if useOmnichannel}
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
        <div class="legend left">Pay using QR Code</div>
        <div class="options" id="showQr">
          <NextOption
            icon={qrIcon}
            tabindex="0"
            attributes={{ role: 'button', 'aria-label': 'Show QR Code - Scan the QR code using your UPI app' }}
            on:select={selectQrMethod}>
            <div>Show QR Code</div>
            <div class="desc">Scan the QR code using your UPI app</div>
          </NextOption>
        </div>
      {/if}
    </div>

    <div slot="bottom">
      {#if down || disabled}
        <DowntimeCallout severe={disabled}>
          <strong>UPI</strong>
          is experiencing low success rates.
        </DowntimeCallout>
      {/if}

      <DowntimeCallout>
        UPI payments via Yesbank accounts are temporarily disabled. Please pay
        via another method.
      </DowntimeCallout>

      <OffersPortal />
    </div>
  </Screen>
</Tab>
