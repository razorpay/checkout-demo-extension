<Tab method="upi">
  {#if intent}
    <UpiIntent
      ref:intentView
      apps={intentApps}
      {showRecommendedUPIApp}
    />
  {:else}
    {#if selectedApp === undefined || isTezSelected}
      <div class="legend left">Select a UPI app</div>
      <Grid items={topUpiApps}
        on:select="onUpiAppSelection(event)"
        selected={selectedApp}
      />
    {:else}
      <div class="legend left">Selected UPI app</div>
      <Card>
        <span ref:iconWrap>
          <Icon icon={selectedAppData.icon}/>
        </span>
        <span>
          {selectedAppData.text}
        </span>
        <div ref:changeBtn on:click="onUpiAppSelection()">change</div>
      </Card>
      <div class="legend left" style="margin-top: 18px">
        Enter your UPI ID
      </div>
      <Card selected={true} on:click="focusVpa(event)">
        {#if selectedApp === 'gpay'}
          <div id="upi-tez">
            <div class="elem-wrap collect-form">
              <!-- TODO: remove all non svelte css for this -->
              <Field
                type="text"
                name="vpa"
                id='vpa'
                ref:vpaField
                placeholder="Enter UPI ID"
                helpText="Please enter a valid handle"
                pattern=".+"
                required={true}
                formatter={{
                  type: 'vpa'
                }}
              />
              <div class="elem at-separator">@</div>
              <div class="elem">
                <select
                  required
                  class="input"
                  name="tez_bank"
                  bind:value="pspHandle">
                  <option value="">Select Bank</option>
                  <option value="okhdfcbank">okhdfcbank</option>
                  <option value="okicici">okicici</option>
                  <option value="oksbi">oksbi</option>
                  <option value="okaxis">okaxis</option>
                </select>
              </div>
            </div>
          </div>
        {:else}
          <div id='vpa-wrap' class={selectedAppData.id}>
            <!-- TODO: use formatter for validation once all fields
              are moved to `Field` -->
            <Field
              type="text"
              name="vpa"
              id="vpa"
              ref:vpaField
              placeholder={selectedApp ? "" : "Enter your UPI Address"}
              helpText="Please enter a valid VPA of the form username@bank"
              value={selectedApp === null ? vpa : ''}
              pattern={pattern}
              required={true}
              formatter={{
                type: 'vpa'
              }}
            />
            {#if pspHandle}
              <div ref:pspName>@{pspHandle}</div>
            {/if}
          </div>
        {/if}
      </Card>
    {/if}
  {/if}
</Tab>

<style>
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

  ref:pspName {
    color: #424242;
    position: absolute;
    top: 12px;
    right: 12px;
    line-height: 40px;
    z-index: 1;
  }

  #upi-tez {
    display: block;
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
  import * as Tez from 'tez.js';
  import * as Bridge from 'bridge.js';

  const otherAppsIcon =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNNCA4aDRWNEg0djR6bTYgMTJoNHYtNGgtNHY0em0tNiAwaDR2LTRINHY0em0wLTZoNHYtNEg0djR6bTYgMGg0di00aC00djR6bTYtMTB2NGg0VjRoLTR6bS02IDRoNFY0aC00djR6bTYgNmg0di00aC00djR6bTAgNmg0di00aC00djR6IiBmaWxsPSIjYjBiMGIwIi8+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

  const topUpiApps = [
    {
      text: 'BHIM',
      icon: 'https://cdn.razorpay.com/app/bhim.svg',
      id: 'bhim',
      psp: 'upi',
    },
    {
      text: 'Google Pay',
      icon: 'https://cdn.razorpay.com/app/googlepay.svg',
      id: 'gpay',
      psp: ['okhdfcbank', 'okicici', 'okaxis', 'oksbi'],
    },
    {
      text: 'WhatsApp',
      icon: 'https://cdn.razorpay.com/app/whatsapp.svg',
      id: 'whatsapp',
      psp: 'icici',
    },
    {
      text: 'Paytm',
      icon: 'https://cdn.razorpay.com/app/paytm.svg',
      id: 'paytm',
      psp: 'paytm',
    },
    {
      text: 'PhonePe',
      icon: 'https://cdn.razorpay.com/app/phonepe.svg',
      id: 'phonepe',
      psp: 'ybl',
    },
    {
      text: 'Other Apps',
      icon: otherAppsIcon,
      id: null,
      psp: '',
    },
  ];

  const checkTez = function(
    successCallback = () => {},
    errorCallback = () => {}
  ) {
    var session = getSession();

    var hasFeature =
      session.preferences &&
      session.preferences.features &&
      session.preferences.features.google_pay;

    /* disable Web payments API for fee_bearer for now */
    if (session.preferences.fee_bearer) {
      return errorCallback();
    }

    /* disable Web payments API for Android SDK as we have intent there */
    if (Bridge.checkout.exists()) {
      return errorCallback();
    }

    /* disable it if it's not enabled for a specific merchant */
    if (!(hasFeature || Tez.checkKey(session.get('key')))) {
      return errorCallback();
    }

    session.r.isTezAvailable(successCallback, errorCallback);
  };

  export default {
    components: {
      UpiIntent: './UpiIntent.svelte',
      Tab: 'templates/tabs/Tab.svelte',
      Grid: 'templates/views/ui/grid/Base.svelte',
      Card: 'templates/views/ui/Card.svelte',
      Field: 'templates/views/ui/Field.svelte',
      Icon: 'templates/views/ui/Icon.svelte',
    },

    data() {
      return {
        vpa: '',
        topUpiApps,
        otherAppsIcon,
        pspHandle: '',
        pattern: '.+',
        selectedApp: undefined,
        useWebPaymentsApi: false,
      };
    },

    computed: {
      selectedAppData: ({ topUpiApps, selectedApp }) =>
        _Arr.find(topUpiApps, item => item.id === selectedApp),

      intentApps: data => getSession().upi_intents_data,

      showRecommendedUPIApp: data => getSession().showRecommendedUPIApp,

      intent: data => {
        let intentApps = getSession().upi_intents_data;
        return intentApps && _.lengthOf(intentApps) > 0;
      },

      /* Will be true if Tez for web payments API is selected */
      isTezSelected: ({ selectedApp, useWebPaymentsApi }) =>
        selectedApp === 'gpay' && useWebPaymentsApi,
    },

    oncreate() {
      const session = getSession();

      checkTez(
        /* Use Tez */
        () => this.set({ useWebPaymentsApi: true }),
        /* Don't use Tez */
        () =>this.set({ useWebPaymentsApi: false })
      );

      /* TODO: improve handling of `prefill.vpa` */
      if (session.get('prefill.vpa')) {
        this.set({
          selectedApp: null,
          vpa: session.get('prefill.vpa'),
        });
      }
    },

    onstate({ changed, current }) {
      const session = getSession();

      if (changed.selectedApp && session.tab === 'upi') {
        /* TODO: bad practice, remove asap */
        if (
          current.selectedApp === undefined || current.isTezSelected
        ) {
          _El.removeClass(_Doc.querySelector('#body'), 'sub');
        } else {
          _El.addClass(_Doc.querySelector('#body'), 'sub');
        }
      }
    },

    methods: {
      /**
       * This function will be invoked externally via session on
       * payment form submission
       */
      getPayload() {
        const {
          selectedApp,
          intent,
          pspHandle,
          isTezSelected
        } = this.get();

        let vpa = '';
        let data = {};

        if (this.refs.vpaField) {
          vpa = this.refs.vpaField.getValue();
        }

        if (intent) {
          data = this.refs.intentView.getPayload();
        } else {
          if (selectedApp) {
            if (isTezSelected) {
              data = {
                '_[flow]': 'tez',
              };
            } else {
              data = {
                vpa: `${vpa}@${pspHandle}`,
              };
            }
          } else {
            data = {
              vpa,
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

        return data;
      },

      onBack() {
        const {
          intent,
          selectedApp,
          isTezSelected,
        } = this.get();

        if (!intent) {
          if (isTezSelected) {
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

        this.set({ selectedApp: id });
        const { selectedAppData, isTezSelected } = this.get();

        if (isTezSelected) {
          return session.preSubmit();
        }

        if (id === null) {
          pattern = '.+@.+';
        } else {
          pattern = '.+';
        }

        this.set({
          pspHandle: selectedAppData ? selectedAppData.psp : '',
          pattern,
        });

        this.focusVpa();
      },

      /* VPA card specific code */
      focusVpa(event) {
        if (!this.get()['focused']) {
          this.refs.vpaField.focus();
        }
      },
    },
  };
</script>