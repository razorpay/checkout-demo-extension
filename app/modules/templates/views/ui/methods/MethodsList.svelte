{#if loading}
  <div ref:loader class="pad" transition:fade>
    <div class="small legend">
      <div class="loading-icon"></div>Loading payment methods for you...
    </div>
    <Loader />
  </div>
{:elseif !disableP13n && instrumentsData.length}
  <div ref:preferred class="options" transition:fade>
    <div class="legend">Select a payment method</div>
    {#each instrumentsData as instrument, index}
      {#if instrument.nextOption}
        <NextOption data={{method: instrument.method}}
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
          name='p13n_method'
          value={instrument.id}
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
    <NextOption
      on:select='fire("showMethods")'
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
{:elseif showMessage}
  <div transition:fade>
    <div class="small legend" style="text-transform: none"><i>&#x2139; </i> Enter Phone number to pay using</div>
    <div class="pad">
    {#each showcaseMethods as method}
      {#if method === 'and'}
        and
      {:elseif method === 'more'}
        <span style="margin-left: -4px"> and more</span>
      {:else}
        <div class="showcase-method">
          <div class="method-icon">{@html session.themeMeta.icons[method]}</div>
          {session.tab_titles[method]}
        </div>
      {/if}
    {/each}
    </div>
  </div>
{:else}
  <!-- TODO: create separate list methods (used in partial payments
         and optional contacts) in future -->
  <div ref:grid transition:fade>
    <div class="legend">Select a payment method</div>
    <GridMethods session={session} avail_methods={AVAILABLE_METHODS} />
  </div>
{/if}

<style>
  .loading-icon {
    width: 12px;
    height: 12px;
    position: absolute;
    left: -20px;
    top: 13px;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMiAxMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI0IC0zNDgpIiBmaWxsPSIjMDcyNjU0Ij4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOCAzMzEpIj4KPHBhdGggZD0ibTI1Ljc3NiAxOC42MjQgMS41NjgtMS41Njh2NC42ODhoLTQuNjg4bDIuMTYtMi4xNmMtMC4zNzMzNC0wLjM3MzM0LTAuODAyNjYtMC42NjQtMS4yODgtMC44NzJzLTAuOTk0NjYtMC4zMTItMS41MjgtMC4zMTJjLTAuNzI1MzQgMC0xLjM5NDcgMC4xNzg2Ni0yLjAwOCAwLjUzNnMtMS4wOTg3IDAuODQyNjYtMS40NTYgMS40NTYtMC41MzYgMS4yODI3LTAuNTM2IDIuMDA4IDAuMTc4NjYgMS4zOTQ3IDAuNTM2IDIuMDA4IDAuODQyNjYgMS4wOTg3IDEuNDU2IDEuNDU2IDEuMjgyNyAwLjUzNiAyLjAwOCAwLjUzNmMwLjg2NCAwIDEuNjQyNy0wLjI0NTMzIDIuMzM2LTAuNzM2czEuMTczMy0xLjEzMDcgMS40NC0xLjkyaDEuMzc2Yy0wLjE5MiAwLjc2OC0wLjUzODY2IDEuNDUzMy0xLjA0IDIuMDU2cy0xLjA5ODcgMS4wNzQ3LTEuNzkyIDEuNDE2Yy0wLjcyNTM0IDAuMzUyLTEuNDk4NyAwLjUyOC0yLjMyIDAuNTI4LTAuOTYgMC0xLjg1Ni0wLjI0NTMzLTIuNjg4LTAuNzM2LTAuOC0wLjQ2OTM0LTEuNDM0Ny0xLjEwOTMtMS45MDQtMS45Mi0wLjQ4LTAuODIxMzQtMC43Mi0xLjcxNzMtMC43Mi0yLjY4OHMwLjI0LTEuODY2NyAwLjcyLTIuNjg4YzAuNDY5MzQtMC44MTA2NyAxLjEwNC0xLjQ1MDcgMS45MDQtMS45MiAwLjgzMi0wLjQ5MDY3IDEuNzI4LTAuNzM2IDIuNjg4LTAuNzM2IDAuNzI1MzQgMCAxLjQxMzMgMC4xMzg2NyAyLjA2NCAwLjQxNnMxLjIyMTMgMC42NjEzMyAxLjcxMiAxLjE1MnoiLz4KPC9nPgo8L2c+CjwvZz4KPC9zdmc+Cg==');
    background-repeat: no-repeat;
    background-size: contain;
  }

  .method-icon, .showcase-method, .and-more {
    display: inline-block;
    vertical-align: middle;
    line-height: 20px;
  }

  .method-icon {
    width: 20px;
    margin-right: 4px;
  }

  .method-icon :global(svg) {
    height: 16px;
  }

  .showcase-method {
    font-size: 14px;
    margin: 0 8px;
    position: relative;

    &::before {
      content: '';
      width: 4px;
      height: 4px;
      border-radius: 3px;
      background: #d8d8d8;
      position: absolute;
      top: 8px;
      left: -10px;
    }
  }

  .showcase-method, .and-more {
    &:first-child {
      margin-left: 0;
      &::before {
        display: none;
      }
    }

    &:last-child {
      margin-right: 0;
      &::before {
        display: none;
      }
    }
  }

  .legend.small {
    font-size: 14px
    color: #474747;
    opacity: 1;
    text-transform: none;
  }

  ref:preferred,
  ref:grid,
  ref:loader {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }

  ref:preferred .legend {
    margin: 9px 12px !important;
  }
</style>

<script>
  /* globals getStore, shouldEnableP13n */
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
      GridMethods: 'templates/views/ui/methods/GridMethods.svelte',
      Loader: 'templates/views/ui/methods/Loader.svelte',
    },

    oncreate() {
      const session = getSession();

      if ((shouldEnableP13n(session.get('key')) ||
        session.get('flashcheckout')) &&
        session.get().personalization !== false
      ) {
        session.set('personalization', true);
      }

      const hasOffersOnHomescreen = session.hasOffers && _Arr.any(session.eligibleOffers, offer => offer.homescreen);

      if (
        !session.get('personalization') ||
        hasOffersOnHomescreen ||
        session.oneMethod ||
        getStore('optional').contact ||
        getStore('isPartialPayment') ||
        session.tpvBank ||
        session.upiTpv ||
        session.multiTpv
      ) {
        /* disableP13n is both, the template prop and the class prop */
        this.disableP13n = true;
        session.p13n = false;
      } else {
        session.p13n = true;
      }
    },

    ondestroy() {
      global.clearTimeout(this.loaderTimeout);
      this.loaderTimeout = null;
    },

    onstate({ changed, current }) {
      const contact = current.customer.contact || '';

      const timing = x => 0.9991521 + 69093410000 * Math.exp(-3.069087 * x);

      if (this.disableP13n) {
        return this.set({
          loading: false,
          showMessage: false,
          disableP13n: true,
        });
      }

      if (changed.customer) {
        if (this.loaderTimeout) {
          global.clearTimeout(this.loaderTimeout);
          this.loaderTimeout = null;
        }

        if (contact.length >= 8) {
          this.set({ loading: current.animate, showMessage: false });

          this.loaderTimeout = global.setTimeout(() => {
            this.set({ loading: false });
          }, timing(contact.length) * 1000);
        } else if (contact.length < 8) {
          this.set({ showMessage: true, loading: false });
        }
      }
    },

    transitions: {
      fade: (node, { delay = 0, duration = 200 }) => {
        const o = +global.getComputedStyle(node).opacity;

        if (!this.get().animate) {
          return {
            delay: 0,
            duration: 0,
            css: t => `opacity: 1`,
          };
        }

        return {
          delay,
          duration,
          css: t => `opacity: ${t * o};`,
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
              if (instrument['_[upiqr]'] === '1') {
                text = `QR`;
                icon = session.themeMeta.icons['qr'];
                break;
              }

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
                var tokenObj = _Arr.find(
                  cards,
                  x => x.id === instrument.token_id
                );

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

      showcaseMethods: ({ AVAILABLE_METHODS }) => {
        let methods;

        let length = _.lengthOf(AVAILABLE_METHODS);
        let hasMore = length > 3;

        methods = _Arr.slice(
          AVAILABLE_METHODS,
          0,
          hasMore ? 3 : _.lengthOf(AVAILABLE_METHODS) - 1
        );

        if (hasMore) {
          methods.push('more');
        } else {
          methods.push('and', AVAILABLE_METHODS[length - 1]);
        }

        return methods;
      },
    },

    data: () => {
      return {
        instruments: [],
        selected: null,
        session: null,
        customer: {},
        showOtherMethods: false,
        animate: false,
        loading: false,
        showMessage: true,
        disableP13n: false,
      };
    },
    methods: {
      trackMethodSelection: function(data = {}) {
        Analytics.track('p13:method:select', {
          type: AnalyticsTypes.BEHAV,
          data,
        });
      },

      methodSelected: function(e, index) {
        this.trackMethodSelection({
          data: e.data,
          index,
        });

        this.fire('methodSelected', e);
      },

      select: function(e, index) {
        this.trackMethodSelection({
          data: e.data,
          index,
        });

        this.set({ selected: e.data.id });
        this.fire('select', e.data);
      },
    },
  };
</script>
