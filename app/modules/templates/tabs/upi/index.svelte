<script>
  // Svelte imports
  import { onMount } from 'svelte';

  // Util imports
  import { getSession } from 'sessionmanager';
  import * as GPay from 'gpay';
  import * as Bridge from 'bridge';
  import DowntimesStore from 'checkoutstore/downtimes';
  import { VPA_REGEX } from 'common/constants';
  import {
    doesAppExist,
    GOOGLE_PAY_PACKAGE_NAME,
    topUpiApps,
    otherAppsIcon,
  } from 'common/upi';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { Formatter } from 'formatter';

  // UI imports
  import UpiIntent from './UpiIntent.svelte';
  import Tab from 'templates/tabs/Tab.svelte';
  import Grid from 'templates/views/ui/grid/Base.svelte';
  import Card from 'templates/views/ui/Card.svelte';
  import Field from 'templates/views/ui/Field.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';
  import Callout from 'templates/views/ui/Callout.svelte';
  import Collect from './Collect.svelte';
  import GooglePayCollect from './GooglePayCollect.svelte';
  import GooglePayOmnichannel from './GooglePayOmnichannel.svelte';
  import NextOption from 'templates/views/ui/options/NextOption.svelte';
  import Screen from 'templates/layouts/Screen.svelte';

  // Props
  export let selectedApp;
  export let preferIntent = true;
  export let useWebPaymentsApi = false;
  export let qrEnabled = false;
  export let down = false;
  export let useOmnichannel = false;
  export let retryOmnichannel = false;
  export let isFirst = true;
  export let omnichannelType = 'phone';
  export let vpa = '';
  export let qrIcon;
  export let tab = 'upi';
  export let pattern = '.+';
  export let focused;

  // Refs
  export let intentView = null;
  export let omnichannelField = null;
  export let vpaField = null;

  // Computed
  export let selectedAppData;
  export let intent;
  export let isGPaySelected;
  export let pspHandle;
  export let shouldShowQr;

  const session = getSession();
  const {
    all_upi_intents_data: allIntentApps,
    upi_intents_data: intentApps,
    isPayout,
    showRecommendedUPIApp,
  } = session;

  function isVpaValid(vpa) {
    return VPA_REGEX.test(vpa);
  }

  const checkGPay = session => {
    const hasFeature =
      session.preferences &&
      session.preferences.features &&
      session.preferences.features.google_pay;

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

    /* disable it if it's not enabled for a specific merchant */
    if (!hasFeature) {
      return Promise.reject();
    }

    return session.r.checkPaymentAdapter('gpay');
  };

  const checkOmnichannel = session => {
    const hasFeature =
      session.preferences &&
      session.preferences.features &&
      session.preferences.features.google_pay_omnichannel;

    // Do not use omnichannel for Payouts
    if (session.isPayout) {
      return false;
    }

    if (hasFeature) {
      Analytics.track('omnichannel', {
        type: AnalyticsTypes.RENDER,
      });
    }

    return hasFeature;
  };

  $: selectedAppData = _Arr.find(topUpiApps, item => item.id === selectedApp);
  $: intent =
    !isPayout && preferIntent && intentApps && _.lengthOf(intentApps) > 0;
  $: isGPaySelected = selectedApp === 'gpay' && useWebPaymentsApi;
  $: pspHandle = selectedAppData ? selectedAppData.psp : '';
  $: shouldShowQr =
    qrEnabled && !selectedApp && selectedApp !== null && !isPayout;

  $: {
    /**
     * For separate Gpay tab, if it is intent app and app does not exist,
     * fallback to older GPay UI
     **/
    if (tab) {
      /**
       * For separate Gpay tab, if it is intent app and app does not exist,
       * fallback to older GPay UI
       **/
      if (selectedApp === 'gpay') {
        if (tab === 'gpay') {
          preferIntent = doesAppExist(GOOGLE_PAY_PACKAGE_NAME, intentApps);
        } else if (tab === 'upi') {
          preferIntent = true;
        }
      }
    }
  }

  $: {
    if (session.tab === 'upi' || session.tab === 'gpay') {
      /* TODO: bad practice, remove asap */
      if (selectedApp === undefined || isGPaySelected) {
        _El.removeClass(_Doc.querySelector('#body'), 'sub');
      } else {
        _El.addClass(_Doc.querySelector('#body'), 'sub');
      }
    }
  }

  onMount(() => {
    checkGPay(session)
      /* Use Google Pay */
      .then(() => (useWebPaymentsApi = true))
      /* Don't use Google Pay */
      .catch(() => (useWebPaymentsApi = false));

    useOmnichannel = checkOmnichannel(session);

    /* TODO: improve handling of `prefill.vpa` */
    if (session.get('prefill.vpa')) {
      selectedApp = null;
      vpa = session.get('prefill.vpa');
    }

    const downtimes = DowntimesStore.get();
    if (downtimes.upi && downtimes.upi.length) {
      down = true;
    }

    qrEnabled = session.methods.qr;
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

  export function setOmnichannelType(event) {
    const { type } = event.detail;

    Analytics.track('omnichannel:type:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        type,
      },
    });

    omnichannelType = type;
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
    if (vpaField) {
      vpaField.blur();
    }

    let data = {};
    if (intent) {
      data = intentView.getPayload();
    } else {
      if (selectedApp && isGPaySelected) {
        data = {
          '_[flow]': 'gpay',
        };
      } else if (useOmnichannel && selectedApp === 'gpay') {
        if (!retryOmnichannel) {
          data['_[flow]'] = 'intent';
          data.contact = omnichannelField.getPhone();
          data.upi_provider = 'google_pay';
        } else {
          if (omnichannelType === 'vpa') {
            data['_[flow]'] = 'directpay';
            data.vpa = getFullVpa();
          } else if (omnichannelType === 'phone') {
            data['_[flow]'] = 'intent';
            data.contact = omnichannelField.getPhone();
            data.upi_provider = 'google_pay';
          }
        }
      } else {
        data = {
          vpa: getFullVpa(),
        };
      }

      /**
       * TODO: discuss with vivek whether to continue sending
       * directpay for collect requests
       */
      if (!data['_[flow]']) {
        data['_[flow]'] = 'directpay';
      }
    }

    data.method = 'upi';

    return data;
  }

  export function setOmnichannelAsRetried() {
    Analytics.track('omnichannel:retry:click', {
      type: AnalyticsTypes.BEHAV,
    });

    retryOmnichannel = true;
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
    const id = event.detail.id;

    let pattern = '';

    if (typeof id !== 'undefined') {
      /**
       * `id` is undefined when the user wants to switch app
       * and it is null when the user select "other apps"
       */
      Analytics.track('upi:app:select', {
        type: AnalyticsTypes.BEHAV,
        data: {
          flow: 'collect',
          app: id,
        },
      });
    }

    selectedApp = id;

    if (isGPaySelected) {
      return session.preSubmit();
    }

    focusVpa();
  }

  export function focusVpa() {
    if (!focused && vpaField) {
      if (useOmnichannel && selectedApp === 'gpay') {
        omnichannelField.focus();
      } else {
        vpaField.focus();
      }
    }
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
  :global(#form-upi[down='true']) {
    padding-bottom: 37px;
  }

  .legend {
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

  .ref-changebtn {
    position: absolute;
    top: 0;
    right: 4px;
    bottom: 0;
    font-size: 12px;
    line-height: 47px;
    padding: 0 20px 0 30px;
    color: #7b7f95;
    overflow: hidden;
    cursor: pointer;

    &:after {
      content: '\e604';
      transform: rotate(270deg);
      font-size: 8px;
      position: absolute;
      right: 8px;
      top: 0;
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
    {#if intent}
      <UpiIntent
        bind:this={intentView}
        apps={intentApps}
        {selectedApp}
        {showRecommendedUPIApp} />
    {:else if selectedApp === undefined || isGPaySelected}
      <div class="legend left">Select a UPI app</div>
      <Grid
        items={topUpiApps}
        on:select={onUpiAppSelection}
        selected={selectedApp} />
    {:else}
      <div class="legend left">Selected UPI app</div>
      <Card>
        <span class="ref-iconwrap">
          <Icon icon={selectedAppData.icon} />
        </span>
        <span>{selectedAppData.text}</span>
        <div class="ref-changebtn" on:click={onUpiAppSelection}>change</div>
      </Card>
      {#if selectedApp === 'gpay'}
        {#if useOmnichannel}
          <GooglePayOmnichannel
            error={retryOmnichannel}
            focusOnCreate={true}
            {isFirst}
            retry={retryOmnichannel}
            selected={omnichannelType === 'phone'}
            on:blur={trackOmnichannelEntry}
            on:select={setOmnichannelType}
            bind:this={omnichannelField} />
        {/if}
        {#if retryOmnichannel || !useOmnichannel}
          <GooglePayCollect
            focusOnCreate={!retryOmnichannel}
            {pspHandle}
            retry={retryOmnichannel}
            selected={omnichannelType === 'vpa'}
            on:blur={trackVpaEntry}
            on:handleChange={trackHandleSelection}
            on:select={setOmnichannelType}
            bind:this={vpaField} />
        {/if}
      {:else}
        <Collect
          appId={selectedAppData.id}
          focusOnCreate={true}
          {pspHandle}
          {selectedApp}
          {vpa}
          on:blur={trackVpaEntry}
          bind:this={vpaField} />
      {/if}
    {/if}

    {#if shouldShowQr}
      <div class="legend left">Or, Pay using QR</div>
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
  </Screen>

  {#if down}
    <Callout showIcon={false} classes={['downtime-callout']}>
      <strong>UPI</strong>
      is experiencing low success rates.
    </Callout>
  {/if}
</Tab>
