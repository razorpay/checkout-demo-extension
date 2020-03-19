<script>
  /* global each, Event */

  // Svelte imports
  import { onMount, tick } from 'svelte';

  // UI Imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import AddCardView from 'ui/tabs/card/AddCardView.svelte';
  import EmiActions from 'ui/components/EmiActions.svelte';
  import SavedCards from 'ui/tabs/card/savedcards.svelte';
  import OffersPortal from 'ui/components/OffersPortal.svelte';
  import DowntimeCallout from 'ui/elements/DowntimeCallout.svelte';

  import { getWallets } from 'checkoutstore/methods';
  import { showCta } from 'checkoutstore/cta';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardType } from 'common/card';
  import * as WalletsData from 'common/wallet';

  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { scrollIntoView } from 'lib/utils';

  // Transitions
  import { slide } from 'svelte/transition';

  const session = getSession();
  const wallet = getWallets();

  const ua = navigator.userAgent;
  const ua_iPhone = /iPhone/.test(ua);

  export let selectedWallet = session.get('prefill.wallet') || null;

  const walletReferences = {};

  export function onWalletSelection(e, code) {
    const isEcod = session.get('ecod');
    selectedWallet = code;

    if (!session.validateOffers(selectedWallet)) {
      session.showOffersError(function(removeOffer) {
        if (removeOffer) {
          selectedWallet = code;
        } else {
          selectedWallet = null;
        }
      });

      return;
    }

    if (ua_iPhone) {
      window.Razorpay.sendMessage({ event: 'blur' });
    }

    Analytics.track('wallet:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: selectedWallet,
        power: WalletsData.isPowerWallet(selectedWallet),
      },
    });

    showCta();
  }

  export function onShown() {
    if (selectedWallet) {
      showCta();
      setTimeout(() => {
        scrollIntoView(walletReferences[selectedWallet]);
      }, 200);
    }
  }

  // Called when the user presses the pay button
  export function getPayload() {
    const payload = {
      wallet: selectedWallet,
    };

    /**
     * Wallets might need to go through intent flow too
     * TODO: Add a feature check here
     */
    const shouldTurnWalletToIntent = WalletsData.shouldTurnWalletToIntent(
      selectedWallet,
      session.upi_intents_data
    );

    if (shouldTurnWalletToIntent) {
      payload.upi_app = WalletsData.getPackageNameForWallet(selectedWallet);
    }

    return payload;
  }

  /**
   * @description get an applicable offer (if any)
   * @param {String} code Wallet code for the offer is needed
   */
  function getApplicableOffer(code) {
    return (
      session.walletOffer &&
      session.walletOffer.issuer === code &&
      session.walletOffer
    );
  }
</script>

<style>
  .border-list {
    margin: 0 -12px;
  }

  [slot='icon'].top {
    align-self: flex-start;
  }
</style>

<div class="border-list collapsable">
  {#each wallet as w, i}
    <SlottedRadioOption
      name={w.code}
      selected={selectedWallet === w.code}
      align="top"
      on:click={e => onWalletSelection(e, w.code)}>
      <div
        slot="title"
        bind:this={walletReferences[w.code]}
        id={`wallet-radio-${w.code}`}>
        <span class="title">{w.name}</span>
      </div>
      <div slot="body">
        {#if selectedWallet === w.code}
          <div transition:slide={{ duration: 200 }}>
            {#if getApplicableOffer(w.code)}
              <span class="offer">{getApplicableOffer(w.code).name}</span>
              <div class="offer-info">
                {getApplicableOffer(w.code).display_text}
              </div>
            {/if}
          </div>
        {/if}
      </div>
      <i slot="icon" class="top">
        <Icon icon={w.sqLogo} />
      </i>
    </SlottedRadioOption>
  {/each}

</div>
