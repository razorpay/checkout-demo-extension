<script>
  // Svelte imports
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  // UI imports
  import RadioOption from 'templates/views/ui/options/RadioOption.svelte';
  import NextOption from 'templates/views/ui/options/NextOption.svelte';
  import GridMethods from 'templates/views/ui/methods/GridMethods.svelte';
  import Loader from 'templates/views/ui/methods/Loader.svelte';
  import OtherMethodsList from 'templates/views/ui/methods/OtherMethods.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getWallet } from 'common/wallet';
  import { getBankLogo } from 'common/bank';
  import { findCodeByNetworkName } from 'common/card';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getMethodPrefix } from 'checkoutframe/paymentmethods';
  import CheckoutStore from 'checkoutstore';
  import PreferencesStore from 'checkoutstore/preferences';
  import { hasAnyInstrumentsOnDevice } from 'checkoutframe/personalization';

  // Props
  export let instruments = [];
  export let customer = {};
  export let AVAILABLE_METHODS;
  export let loading = false;
  export let disableP13n = true;
  export let selected = null;
  export let showMessage = false;
  export let animate = false;

  // Computed
  export let instrumentsData;
  export let showcaseMethods;
  export let otherMethodsDetail;
  export let showOtherMethodsDirectly;

  export const dispatch = createEventDispatcher();
  const session = getSession();
  let loaderTimeout;

  function trimText(text, till) {
    if (!_.isString(text)) {
      return text;
    }

    if (text.length - 3 <= till) {
      return text;
    }

    return `${text.substring(0, till - 3)}...`;
  }

  /**
   * Turns word into capital-case
   * @param {string} word
   *
   * @returns {string}
   */
  function capitalizeWord(word) {
    if (word.length) {
      return `${word[0].toUpperCase()}${word.slice(1)}`;
    }

    return word;
  }

  onMount(() => {
    /**
     * Force p13n for international card+paypal
     * since the UI uses p13n UI
     */
    const isInternationalCardAndPayPal =
      session.international &&
      session.methods.paypal &&
      session.methods.count > 1;

    if (
      session.get().personalization !== false ||
      isInternationalCardAndPayPal
    ) {
      session.set('personalization', true);
    }

    const hasOffersOnHomescreen =
      session.hasOffers &&
      _Arr.any(session.eligibleOffers, offer => offer.homescreen);

    // P13n is supressed due to UI reasons
    let p13nSupressed =
      hasOffersOnHomescreen ||
      session.methods.count === 1 ||
      CheckoutStore.get().optional.contact ||
      CheckoutStore.get().isPartialPayment;

    let shouldDisableP13n =
      !session.get('personalization') ||
      p13nSupressed ||
      session.tpvBank ||
      session.upiTpv ||
      session.multiTpv ||
      session.local ||
      session.isPayout;

    /**
     * Force p13n for international card+paypal
     * since the UI uses p13n UI
     */
    if (isInternationalCardAndPayPal) {
      shouldDisableP13n = false;
    }

    if (shouldDisableP13n) {
      /* disableP13n is both, the template prop and the class prop */
      disableP13n = true;
      session.p13n = false;
    } else {
      disableP13n = false;
      session.p13n = true;
    }

    if (p13nSupressed && hasAnyInstrumentsOnDevice()) {
      Analytics.setMeta('p13nsupressed', true);
    } else {
      Analytics.removeMeta('p13nsupressed');
    }
  });

  onDestroy(() => {
    global.clearTimeout(loaderTimeout);
    loaderTimeout = null;
  });

  $: {
    if (disableP13n) {
      loading = false;
      showMessage = false;
    }
  }

  $: {
    const contact = customer.contact || '';
    const timing = x => 0.9991521 + 69093410000 * Math.exp(-3.069087 * x);

    if (customer && !disableP13n) {
      if (loaderTimeout) {
        global.clearTimeout(loaderTimeout);
        loaderTimeout = null;
      }

      if (contact.length >= 8) {
        loading = animate;
        showMessage = false;

        loaderTimeout = global.setTimeout(() => {
          loading = false;
        }, timing(contact.length) * 1000);
      } else if (contact.length < 8) {
        showMessage = true;
        loading = false;
      }
    }
  }

  $: {
    let { methods, themeMeta } = session;
    let banks = PreferencesStore.get().methods.netbanking;

    if (!methods) {
      instrumentsData = [];
    } else {
      _Arr.loop(instruments, instrument => {
        let text = '';
        let icon = '';
        switch (instrument.method) {
          case 'paypal':
            text = 'PayPal';
            icon = themeMeta.icons.paypal;
            break;
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
              text = `UPI QR`;
              icon = themeMeta.icons['qr'];
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

                const bankName = banks && banks[instrument.issuer];
                const bankText =
                  bankName &&
                  trimText(
                    bankName.replace(/ Bank$/, ''),
                    instrument.type ? 14 : 19
                  );

                text = `Use your${
                  bankName ? ` ${bankText}` : ''
                } ${capitalizeWord(instrument.type || '')} card`;

                if (instrument.network && instrument.network !== 'unknown') {
                  icon = `.networkicon.${findCodeByNetworkName(
                    instrument.network
                  )}`;
                } else {
                  icon = themeMeta.icons['card'];
                }
                instrument.nextOption = true;
                break;
              }

              /* User logged in */
              var card = tokenObj.card || {};
              var networkCode = findCodeByNetworkName(card.network);
              instrument.token = tokenObj.token;

              const bankName = banks && banks[card.issuer];
              const bankText =
                bankName &&
                trimText(bankName.replace(/ Bank$/, ''), card.type ? 14 : 19);

              text = `${bankName ? `${bankText} ` : ''}${capitalizeWord(
                card.type || ''
              )} card - ${card.last4}`;

              instrument.cvvDigits = networkCode === 'amex' ? 4 : 3;

              icon = `.networkicon.${networkCode}`;

              if (networkCode === 'unknown') {
                icon = themeMeta.icons['card'];
              }
            } else {
              text = `Use your saved cards`;
              icon = themeMeta.icons['card'];
            }
            break;
        }

        instrument.text = text;
        instrument.icon = icon;
      });

      instrumentsData = instruments;
    }
  }

  $: {
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

    showcaseMethods = methods;
  }

  $: {
    const preferred = ['card', 'wallet', 'upi'];

    let available = _Arr.filter(preferred, method =>
      _Arr.contains(AVAILABLE_METHODS, method)
    );

    /**
     * If none of the preffered methods
     * are available,
     * use the first method
     */
    if (!available.length) {
      available = AVAILABLE_METHODS.slice(0, 1);
    }

    const names = _Arr.map(available, getMethodPrefix);

    let string = names.join(', ');

    // Add ".etc" if there are methods we didn't mention already
    if (AVAILABLE_METHODS.length > available.length) {
      string += ', etc.';
    }

    otherMethodsDetail = string;
  }

  $: showOtherMethodsDirectly = AVAILABLE_METHODS.length === 1;

  function trackMethodSelection(data = {}) {
    Analytics.track('p13:method:select', {
      type: AnalyticsTypes.BEHAV,
      data,
    });
  }

  function trackEducationClick() {
    Analytics.track('p13n:education:click', {
      type: AnalyticsTypes.BEHAV,
    });
  }

  export function methodSelected(event, index) {
    trackMethodSelection({
      data: event.detail,
      index,
    });

    dispatch('methodSelected', event.detail);
  }

  export function select(event, index) {
    trackMethodSelection({
      data: event.detail,
      index,
    });

    selected = event.detail.id;

    dispatch('select', event.detail);
  }
</script>

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

  .method-icon,
  .showcase-method,
  .and-more {
    display: inline-block;
    line-height: 20px;
  }

  .method-icon {
    width: 20px;
    margin-right: 2px;
  }

  .method-icon :global(svg) {
    height: 16px;
    margin-bottom: -2px;
  }

  .showcase-method {
    font-size: 14px;
    margin: 0 12px;
    position: relative;

    &::before {
      content: '';
      width: 4px;
      height: 4px;
      border-radius: 3px;
      background: #d8d8d8;
      position: absolute;
      top: 8px;
      left: -14px;
    }
  }

  .showcase-method,
  .and-more {
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
    font-size: 14px;
    color: #474747;
    opacity: 1;
    text-transform: none;
  }

  :global(.no-details) #methods-list .options {
    margin: 0;
  }

  .methodlist-top {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }

  .ref-prompttitle {
    text-transform: none;
    color: #757575;
    margin-bottom: 4px !important;
  }

  .ref-preferred .legend {
    margin: 9px 12px !important;
  }
</style>

{#if loading}
  <div class="pad ref-loader" transition:slide={{ duration: 200 }}>
    <div class="small legend">
      <div class="loading-icon" />
      Loading payment methods for you...
    </div>
    <Loader />
  </div>
{:else if !disableP13n && instrumentsData.length}
  <div
    class="options methodlist-top ref-preferred"
    transition:slide={{ duration: 200 }}>
    <div class="legend">Select a payment method</div>
    {#each instrumentsData as instrument, index}
      {#if instrument.nextOption}
        <NextOption
          data={{ method: instrument.method }}
          on:select={event => methodSelected(event, index)}
          icon={instrument.icon}>
          {instrument.text}
        </NextOption>
      {:else}
        <RadioOption
          on:select={event => select(event, index)}
          data={instrument}
          selected={instrument.id === selected}
          showRadio={instrument.method !== 'card'}
          icon={instrument.icon}
          name="p13n_method"
          value={instrument.id}>
          {instrument.text}
          {#if instrument.method === 'card'}
            <input
              class="cvv-input"
              inputmode="numeric"
              maxlength={instrument.cvvDigits}
              pattern={`[0-9]{${instrument.cvvDigits}}`}
              placeholder="CVV"
              required
              type="tel" />
          {/if}
        </RadioOption>
      {/if}
    {/each}
    {#if showOtherMethodsDirectly}
      <OtherMethodsList
        standalone={true}
        visible={true}
        {AVAILABLE_METHODS}
        on:methodSelected />
    {:else}
      <NextOption
        on:select={() => dispatch('showMethods')}
        type="other-methods up-arrow"
        icon={session.themeMeta.icons['othermethods']}>
        <span class="option-title">Other Methods</span>
        <span
          style="display: inline-block; font-size: 12px; color: #757575;
          margin-left: 2px">
          | {otherMethodsDetail}
        </span>
      </NextOption>
    {/if}
  </div>
{:else if showMessage}
  <div transition:slide={{ duration: 200 }} on:click={trackEducationClick}>
    <div class="small legend ref-prompttitle">
      Enter Phone number to pay using
    </div>
    <div class="pad" style="line-height: 22px;">
      {#each showcaseMethods as method}
        {#if method === 'and'}
          and
        {:else if method === 'more'}
          <span style="margin-left: -8px">and more</span>
        {:else}
          <div class="showcase-method">
            <div class="method-icon">
              {@html session.themeMeta.icons[method]}
            </div>
            {session.tab_titles[method]}
          </div>
        {/if}
      {/each}
    </div>
  </div>
{:else}
  <!-- TODO: create separate list methods (used in partial payments
         and optional contacts) in future -->
  <div class="ref-grid" transition:slide={{ duration: 200 }}>
    <div class="legend">Select a payment method</div>
    <GridMethods avail_methods={AVAILABLE_METHODS} />
  </div>
{/if}
