{#if instrumentsData.length}
  <div class="methods-loader" in:loader>
    <div class="loading-icon">
    </div>
    Loading your preferred methods
  </div>
  <div class="options" in:fade="{delay: 1500}" out:fade>
    {#each instrumentsData as instrument, index}
      {#if instrument.nextOption}
        <NextOption
          data={{method: instrument.method}}
          on:select="methodSelected(event, index)"
          icon={instrument.icon}
        >
          {instrument.text}
        </NextOption>
      {:else}
        <RadioOption
          on:select="select(event, index)"
          data='{instrument}'
          selected={instrument.id === selected}
          showRadio={instrument.method !== 'card'}
          icon={instrument.icon}
        >
          {instrument.text}
          {#if instrument.method === 'card'}
            <input
              class="cvv-input"
              inputmode="numeric"
              maxlength={instrument.cvvDigits}
              pattern={`[0-9]{${instrument.cvvDigits}}`}
              placeholder="CVV"
              required
              type="tel"
            />
          {/if}
        </RadioOption>
      {/if}
    {/each}
    <NextOption on:select='fire("showMethods")'
      type='other-methods up-arrow'
      icon={session.themeMeta.icons['othermethods']}
    >
      <span class="option-title">Other Methods</span>
      <span style="display: inline-block;
        font-size: 12px; color: #757575; margin-left: 2px">
        | Cards, Wallets, UPI etc.
      </span>
    </NextOption>
  </div>
{/if}

{#if showOtherMethods}
  <div transition:otherMethods class="othermethods">
    <div class="legend">Select a payment method</div>
    <div class="options">
      {#if instrumentsData && instrumentsData.length && false}
        <!-- Hide this for now -->
        <NextOption on:select='fire("hideMethods")'
          type='down-arrow'
          arrowText='Show'
          icon={"&#xe714;"}
        >
          <span style="color:#858585">
            My Preferred Methods ({instrumentsData.length})
          </span>
        </NextOption>
      {/if}
      <NextOption on:select='fire("hideMethods")'
        type='dark down-arrow'
        arrowText='Hide'
        icon={session.themeMeta.icons['othermethods']}
      >
        Other Methods
      </NextOption>
      {#each AVAILABLE_METHODS as method}
        <NextOption
          data={{method}} on:select='fire("methodSelected", event)'
          icon={session.themeMeta.icons[method]}
        >
          {session.tab_titles[method]}
        </NextOption>
      {/each}
    </div>
  </div>
{/if}

<style>
  .methods-loader {
    height: 44px;
    line-height: 44px;
    border: 1px solid #E6E7E8;
    box-shadow: 4px 4px 4px 0 rgba(0,0,0,0.04);;
    background-color: #F7F7F7;
    color: #858585;
    font-size: 14px;
    padding-left: 48px;
    right: 12px;
    left: 12px;
    top: 0;
    position: absolute;
    transform: translateY(-44px);
    opacity: 0;
    pointer-events: none;

    .loading-icon {
      width: 12px;
      height: 12px;
      position: absolute;
      left: 20px;
      top: 17px;
      animation: 1s rotate infinite linear;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMiAxMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI0IC0zNDgpIiBmaWxsPSIjMDcyNjU0Ij4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOCAzMzEpIj4KPHBhdGggZD0ibTI1Ljc3NiAxOC42MjQgMS41NjgtMS41Njh2NC42ODhoLTQuNjg4bDIuMTYtMi4xNmMtMC4zNzMzNC0wLjM3MzM0LTAuODAyNjYtMC42NjQtMS4yODgtMC44NzJzLTAuOTk0NjYtMC4zMTItMS41MjgtMC4zMTJjLTAuNzI1MzQgMC0xLjM5NDcgMC4xNzg2Ni0yLjAwOCAwLjUzNnMtMS4wOTg3IDAuODQyNjYtMS40NTYgMS40NTYtMC41MzYgMS4yODI3LTAuNTM2IDIuMDA4IDAuMTc4NjYgMS4zOTQ3IDAuNTM2IDIuMDA4IDAuODQyNjYgMS4wOTg3IDEuNDU2IDEuNDU2IDEuMjgyNyAwLjUzNiAyLjAwOCAwLjUzNmMwLjg2NCAwIDEuNjQyNy0wLjI0NTMzIDIuMzM2LTAuNzM2czEuMTczMy0xLjEzMDcgMS40NC0xLjkyaDEuMzc2Yy0wLjE5MiAwLjc2OC0wLjUzODY2IDEuNDUzMy0xLjA0IDIuMDU2cy0xLjA5ODcgMS4wNzQ3LTEuNzkyIDEuNDE2Yy0wLjcyNTM0IDAuMzUyLTEuNDk4NyAwLjUyOC0yLjMyIDAuNTI4LTAuOTYgMC0xLjg1Ni0wLjI0NTMzLTIuNjg4LTAuNzM2LTAuOC0wLjQ2OTM0LTEuNDM0Ny0xLjEwOTMtMS45MDQtMS45Mi0wLjQ4LTAuODIxMzQtMC43Mi0xLjcxNzMtMC43Mi0yLjY4OHMwLjI0LTEuODY2NyAwLjcyLTIuNjg4YzAuNDY5MzQtMC44MTA2NyAxLjEwNC0xLjQ1MDcgMS45MDQtMS45MiAwLjgzMi0wLjQ5MDY3IDEuNzI4LTAuNzM2IDIuNjg4LTAuNzM2IDAuNzI1MzQgMCAxLjQxMzMgMC4xMzg2NyAyLjA2NCAwLjQxNnMxLjIyMTMgMC42NjEzMyAxLjcxMiAxLjE1MnoiLz4KPC9nPgo8L2c+CjwvZz4KPC9zdmc+Cg==');
      background-repeat: no-repeat;
      background-size: contain;
    }
  }

  .othermethods {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    background: #ffffff;
    overflow: hidden;
    overflow-y: auto;
    padding: 0 0 12px 0;
  }
</style>

<script>
  import { getSession } from 'sessionmanager';
  import { getWallet } from 'common/wallet';
  import { getBankLogo } from 'common/bank';
  import { findCodeByNetworkName } from 'common/card';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  const trimText = (text, till) => {
    if (!_.isString(text)) {
      return text;
    }

    if (text.length - 3 <= till) {
      return text;
    }

    return `${text.substring(0, till - 3)}...`;
  };

  export default {
    components: {
      RadioOption: 'templates/views/ui/options/RadioOption.svelte',
      NextOption: 'templates/views/ui/options/NextOption.svelte',
    },

    transitions: {
      loader: (node, { delay = 0, duration = 1700 }) => {
        const o = +global.getComputedStyle(node).opacity;
        const ANIM_DURATION = 200;
        const FINAL_VALUE = -44;

        const timing = t => {
          let val = FINAL_VALUE;
          if (t * duration <= ANIM_DURATION) {
            val = (FINAL_VALUE * t * duration) / ANIM_DURATION;
          } else if (t * duration >= duration - ANIM_DURATION) {
            val =
              FINAL_VALUE *
              (1 - (t * duration - (duration - ANIM_DURATION)) / ANIM_DURATION);
          }

          return val;
        };

        return {
          delay,
          duration,
          css: t => `opacity: 1; transform: translateY(${timing(t)}px);`,
        };
      },
      fade: (node, { delay = 0, duration = 200 }) => {
        const o = +global.getComputedStyle(node).opacity;

        return {
          delay,
          duration,
          css: t => `opacity: ${t * o}`,
        };
      },

      otherMethods: (node, { delay = 0, duration = 200 }) => {
        const o = +global.getComputedStyle(node).opacity;
        const circIn = t => {
          return 1.0 - Math.sqrt(1.0 - t * t);
        };

        const opacity = t => {
          let x = t * 3 * o;

          if (x > 1) {
            x = 1;
          }

          return x;
        };

        return {
          delay,
          duration,
          css: t => {
            t = circIn(t);
            return `opacity: ${opacity(t)}; top: ${240 *
              (1 - t)}px; overflow: hidden; position: absolute`;
          },
        };
      },
    },

    computed: {
      instrumentsData: ({ instruments, customer }) => {
        let session = getSession();
        let methods = session.methods;
        let banks = methods.netbanking;
        if (!methods) {
          return;
        }

        _Arr.loop(instruments, instrument => {
          let text = '';
          let icon = '';
          switch (instrument.method) {
            case 'netbanking':
              text = `Netbanking - ${trimText(banks[instrument.bank], 18)} `;
              icon = getBankLogo(instrument.bank);
              break;
            case 'wallet':
              var wallet = getWallet(instrument.wallet);
              text = `Wallet - ${trimText(wallet.name, 18)}`;
              icon = wallet.sqLogo;
              break;
            case 'upi':
              var flow = instrument['_[flow]'];
              if (flow === 'intent') {
                text = `UPI - ${trimText(
                  instrument.app_name.replace(/ UPI$/, ''),
                  22
                )}`;
                if (instrument.app_icon) {
                  icon = instrument.app_icon;
                } else {
                  icon = '&#xe70e';
                }
              } else {
                var vpaSplit = instrument.vpa.split('@');
                text = `UPI - ${trimText(vpaSplit[0], 22 - vpaSplit[1].length)}@${
                  vpaSplit[1]
                }`;
                icon = '&#xe70e;';
              }
              break;
            case 'card':
              if (customer) {
                var cards = (customer.tokens || {}).items || [];
                var tokenObj = _Arr.find(cards, x => x.id === instrument.token_id);

                if (!tokenObj && !instrument.issuer) {
                  /* If we know nothing about the card and user logged out */
                  text = `Use your saved cards`;
                  icon = '&#xe715';
                  instrument.nextOption = true;
                  break;
                } else if (!tokenObj && instrument.issuer) {
                  /* If user logged out after making payent with savedcard */

                  text = `Use your ${trimText(
                    (banks[instrument.issuer] || '').replace(/ Bank$/, ''),
                    instrument.type ? 14 : 19
                  )} ${instrument.type || ''} card`;

                  if (instrument.network && instrument.network !== 'unknown') {
                    icon = `.networkicon.${findCodeByNetworkName(
                      instrument.network
                    )}`;
                  } else {
                    icon = session.themeMeta.icons['card'];
                  }
                  instrument.nextOption = true;
                  break;
                }

                /* User logged in */
                var card = tokenObj.card || {};
                var networkCode = findCodeByNetworkName(card.network);
                instrument.token = tokenObj.token;

                text = `${trimText(
                  (banks[card.issuer] || '').replace(/ Bank$/, ''),
                  card.type ? 14 : 19
                )} ${card.type || ''} card - ${card.last4}`;

                instrument.cvvDigits = networkCode === 'amex' ? 4 : 3;

                icon = `.networkicon.${networkCode}`;

                if (networkCode === 'unknown') {
                  icon = session.themeMeta.icons['card'];
                }
              } else {
                text = `Use your saved cards`;
                icon = session.themeMeta.icons['card'];
              }
              break;
          }

          instrument.text = text;
          instrument.icon = icon;
        });

        return instruments;
      },
    },

    data: () => {
      return {
        instruments: [],
        selected: null,
        session: null,
        customer: {},
        showOtherMethods: false,
      };
    },
    methods: {
      trackMethodSelection: function (data = {}) {
        Analytics.track('p13:method:select', {
          type: AnalyticsTypes.BEHAV,
          data,
        });
      },

      methodSelected: function (e, index) {
        this.trackMethodSelection({
          data: e.data,
          index,
        });

        this.fire('methodSelected', e);
      },

      select: function(e, index) {
        this.trackMethodSelection({
          data: e.data,
          index
        });

        this.set({ selected: e.data.id });
        this.fire('select', e.data);
      },
    },
  };
</script>
