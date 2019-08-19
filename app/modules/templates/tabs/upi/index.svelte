<Tab method="upi" {down}>
  {#if intent}
    <UpiIntent
      ref:intentView
      apps={intentApps}
      {selectedApp}
      {showRecommendedUPIApp}
    />
  {:else}
    {#if selectedApp === undefined || isGPaySelected}
      <div class="legend left">Select a UPI app</div>
      <Grid items={topUpiApps}
        on:select="onUpiAppSelection(event)"
        selected={selectedApp}
      />
    {:else}
      <div class="legend left">Selected UPI app</div>
      <Card>
        <span ref:iconWrap>
          <Icon icon={selectedAppData.icon} />
        </span>
        <span>
          {selectedAppData.text}
        </span>
        <div ref:changeBtn on:click="onUpiAppSelection()">change</div>
      </Card>
      {#if selectedApp === 'gpay'}
        {#if useOmnichannel}
          <GooglePayOmnichannel
            error="{retryOmnichannel}"
            focusOnCreate={true}
            {isFirst}
            retry={retryOmnichannel}
            selected="{omnichannelType === 'phone'}"

            on:select="setOmnichannelType(event)"
            ref:omnichannelField
          />
        {/if}
        {#if retryOmnichannel || !useOmnichannel}
          <GooglePayCollect
            focusOnCreate="{!retryOmnichannel}"
            {pspHandle}
            retry={retryOmnichannel}
            selected="{omnichannelType === 'vpa'}"

            on:blur="trackVpaEntry(event)"
            on:handleChange="trackHandleSelection(event)"
            on:select="setOmnichannelType(event)"
            ref:vpaField
          />
        {/if}
      {:else}
        <Collect
          appId="{selectedAppData.id}"
          focusOnCreate={true}
          {pspHandle}
          {selectedApp}
          {vpa}

          on:blur="trackVpaEntry(event)"
          ref:vpaField
        />
      {/if}
    {/if}
  {/if}

  {#if shouldShowQr}
    <div class="legend left">Or, Pay using QR</div>
    <div class="options" id="showQr">
      <NextOption
        icon={qrIcon}
        tabindex="0"
        attributes={{
          role: 'button',
          'aria-label': 'Show QR Code - Scan the QR code using your UPI app'
        }}

        on:select="selectQrMethod(event)"
      >
        <div>Show QR Code</div>
        <div class="desc">Scan the QR code using your UPI app</div>
      </NextOption>
    </div>
  {/if}

  {#if down}
    <Callout
      showIcon={false}
      classes={['downtime-callout']}
    >
      <strong>UPI</strong> is experiencing low success rates.
    </Callout>
  {/if}
</Tab>

<style>
  :global(#form-upi[down=true]) {
    padding-bottom: 48px;
  }

  .legend {
    margin: 12px 0 8px 0;
    padding: 0;
  }

  #vpa-wrap{
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

  ref:changeBtn {
    position: absolute;
    top: 0;
    right: 4px;
    bottom: 0;
    font-size: 12px;
    line-height: 47px;
    padding: 0 20px 0 30px;
    color: #7B7F95;
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

  ref:iconWrap {
    width: 20px;
    height: @width;
  }

  span :global(img) {
    height: 20px;
    width: 20px;
  }

</style>

<script>
  import { getSession } from 'sessionmanager.js';
  import * as GPay from 'gpay.js';
  import * as Bridge from 'bridge.js';
  import DowntimesStore from 'checkoutstore/downtimes.js';
  import { VPA_REGEX } from 'common/constants.js';
  import { doesAppExist, GOOGLE_PAY_PACKAGE_NAME, topUpiApps, otherAppsIcon } from 'common/upi.js';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  function isVpaValid(vpa) {
    return VPA_REGEX.test(vpa);
  }

  const checkGPay = () => {
    const session = getSession();
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

  const checkOmnichannel = () => {
    const session = getSession();

    const hasFeature = session.preferences &&
      session.preferences.features &&
      session.preferences.features.google_pay_omnichannel

    // Do not use omnichannel for Payouts
    if (session.isPayout) {
      return false;
    }

    return hasFeature;
  };

  export default {
    components: {
      UpiIntent: './UpiIntent.svelte',
      Tab: 'templates/tabs/Tab.svelte',
      Grid: 'templates/views/ui/grid/Base.svelte',
      Card: 'templates/views/ui/Card.svelte',
      Field: 'templates/views/ui/Field.svelte',
      Icon: 'templates/views/ui/Icon.svelte',
      Callout: 'templates/views/ui/Callout.svelte',
      Collect: './Collect.svelte',
      GooglePayCollect: './GooglePayCollect.svelte',
      GooglePayOmnichannel: './GooglePayOmnichannel.svelte',
      NextOption: 'templates/views/ui/options/NextOption.svelte',
    },

    data() {
      return {
        vpa: '',
        tab: 'upi',
        isFirst: true, // Has the user come to this screen for the first time?
        topUpiApps,
        omnichannelType: 'phone',
        otherAppsIcon,
        pattern: '.+',
        preferIntent: true,
        selectedApp: undefined,
        useWebPaymentsApi: false,
        useOmnichannel: false,
        retryOmnichannel: false, // Should we show collect flow on Omnichannel as well?
        down: false,
        qrEnabled: false,
      };
    },

    computed: {
      selectedAppData: ({ topUpiApps, selectedApp }) =>
        _Arr.find(topUpiApps, item => item.id === selectedApp),

      allIntentApps: _ => getSession().all_upi_intents_data, // All intent apps installed
      intentApps: _ => getSession().upi_intents_data, // Intent apps that can be used (after blacklist and validation)

      showRecommendedUPIApp: _ => getSession().showRecommendedUPIApp,

      intent: ({ preferIntent }) => {
        let intentApps = getSession().upi_intents_data;
        // We'll not use intent for Payouts
        const { isPayout } = getSession();

        return !isPayout && preferIntent && intentApps && _.lengthOf(intentApps) > 0;
      },

      /* Will be true if Google Pay for web payments API is selected */
      isGPaySelected: ({ selectedApp, useWebPaymentsApi }) =>
        selectedApp === 'gpay' && useWebPaymentsApi,

      pspHandle: ({ selectedAppData }) => selectedAppData ? selectedAppData.psp : '',
      /**
       * Show "Show QR" button only if QR is enabled and an app has not been selected.
       * selectedApp === null when "Other Apps" is selected
       */
      shouldShowQr: ({ qrEnabled, selectedApp }) => {
        const session = getSession();
        return qrEnabled && !selectedApp && selectedApp !== null && !session.isPayout;
      },
    },

    oncreate() {
      const session = getSession();

      checkGPay()
        /* Use Google Pay */
        .then(() => this.set({ useWebPaymentsApi: true }))
        /* Don't use Google Pay */
        .catch(() => this.set({ useWebPaymentsApi: false }));

      this.set({
        useOmnichannel: checkOmnichannel()
      });

      /* TODO: improve handling of `prefill.vpa` */
      if (session.get('prefill.vpa')) {
        this.set({
          selectedApp: null,
          vpa: session.get('prefill.vpa'),
        });
      }

      const downtimes = DowntimesStore.get() || {};
      if (downtimes.upi && downtimes.upi.length) {
        this.set({
          down: true,
        });
      }

      this.set({
        qrEnabled: session.methods.qr,
        qrIcon: getSession().themeMeta.icons.qr,
      });
    },

    onstate({ changed, current }) {
      const session = getSession();

      if (
        changed.selectedApp &&
        (session.tab === 'upi' || session.tab === 'gpay')
      ) {
        /* TODO: bad practice, remove asap */
        if (current.selectedApp === undefined || current.isGPaySelected) {
          _El.removeClass(_Doc.querySelector('#body'), 'sub');
        } else {
          _El.addClass(_Doc.querySelector('#body'), 'sub');
        }
      }

      if (changed.tab) {
        /**
         * For separate Gpay tab, if it is intent app and app does not exist,
         * fallback to older GPay UI
         **/
        let { selectedApp, intent, tab, intentApps } = current;

        if (selectedApp === 'gpay') {
          if (tab === 'gpay') {
            this.set({
              preferIntent: doesAppExist(
                GOOGLE_PAY_PACKAGE_NAME,
                intentApps
              )
            });
          } else if (tab === 'upi') {
            this.set({ preferIntent: true });
          }
        }
      }
    },

    methods: {
      /**
       * Does the equivalent of
       * selecting the QR payment method
       */
      selectQrMethod() {
        const session = getSession();

        Analytics.track('payment_method:select', {
          type: AnalyticsTypes.BEHAV,
          data: {
            method: 'qr',
          },
        });

        session.switchTab('qr');
      },

      /**
       * This function will be invoked externally via session on
       * payment form submission
       */
      setOmnichannelType(event) {
        const {
          type
        } = event;

        this.set({
          omnichannelType: type
        });
      },

      getPayload() {
        const {
          selectedApp,
          intent,
          isGPaySelected,
          useOmnichannel,
          retryOmnichannel,
        } = this.get();

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
        if (this.refs.vpaField) {
          this.refs.vpaField.blur();
        }

        let data = {};
        if (intent) {
          data = this.refs.intentView.getPayload();
        } else {
          if (selectedApp && isGPaySelected) {
            data = {
              '_[flow]': 'gpay',
            };
          }
          else if (useOmnichannel && selectedApp === 'gpay') {
            if (!retryOmnichannel) {
              data['_[flow]'] = 'intent';
              data.contact = this.refs.omnichannelField.getPhone();
              data.upi_provider = 'google_pay';
            } else {
              const omnichannelType = this.get().omnichannelType;
              if (omnichannelType === 'vpa') {
                data['_[flow]'] = 'directpay';
                data.vpa = this.getFullVpa();
              }
              else if (omnichannelType === 'phone') {
                data['_[flow]'] = 'intent';
                data.contact = this.refs.omnichannelField.getPhone();
                data.upi_provider = 'google_pay';
              }
            }
          } else {
            data = {
              vpa: this.getFullVpa()
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
      },
      setOmnichannelAsRetried: function () {
        this.set({ retryOmnichannel: true });
      },
      onBack() {
        // User has gone back, set isFirst as false
        this.set({
          isFirst: false
        });

        const {
          intent,
          selectedApp,
          isGPaySelected,
        } = this.get();

        if (!intent) {
          if (isGPaySelected) {
            this.set({ selectedApp: undefined });
            return false;
          }

          if (selectedApp !== undefined) {
            this.set({ selectedApp: undefined });
            return true;
          } else {
            return false;
          }
        }

        return false;
      },

      onUpiAppSelection(id) {
        const session = getSession();
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

        this.set({ selectedApp: id });
        const { isGPaySelected } = this.get();

        if (isGPaySelected) {
          return session.preSubmit();
        }

        this.focusVpa();
      },

      /* VPA card specific code */
      focusVpa(event) {
        const { focused, useOmnichannel, selectedApp } = this.get();

        if (!focused && this.refs.vpaField) {
          if (useOmnichannel && selectedApp === 'gpay') {
            this.refs.omnichannelField.focus();
          } else {
            this.refs.vpaField.focus();
          }
        }
      },

      /**
       * Called when the UPI address card is clicked.
       */
      handleCardClick: function (event) {
        this.focusVpa(event);
      },

      /**
       * Returns the full VPA,
       * with the selected or prefilled PSP
       *
       * @returns {string}
       */
      getFullVpa() {
        if (this.refs.vpaField) {
          return this.refs.vpaField.getVpa();
        }
        return '';
      },

      /**
       * Track the entry of a VPA.
       * Fired when the input field is blurred.
       */
      trackVpaEntry(event) {
        const {
          selectedApp
        } = this.get();
        const vpa = this.getFullVpa();

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
          }
        });
      },

      /**
       * Track the selection of a PSP handle from a dropdown.
       * Fired on selection.
       */
      trackHandleSelection(handle) {
        const {
          selectedApp
        } = this.get();
        const vpa = this.refs.vpaField.getVpa();

        const valid = vpa ? isVpaValid(vpa) : false;

        Analytics.track('vpa:handle:select', {
          type: AnalyticsTypes.BEHAV,
          data: {
            app: selectedApp,
            value: vpa,
            valid,
            handle,
          }
        });
      }
    },
  };
</script>
