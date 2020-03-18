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

  // Utils imports
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardType } from 'common/card';

  // Transitions
  import { fade } from 'svelte/transition';

  const session = getSession();
  const wallet = getWallets();

  export let selectedWallet = null;

  const imageReferences = {};

  // Called when the user presses the pay button
  export function getPayload() {
    return {
      wallet: selectedWallet,
    };
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

</style>

<div class="list collapsable">
  {#each wallet as w, i}
    <div
      class="wallet item radio-item"
      on:click={() => {
        selectedWallet = w.code;
      }}>
      <input
        type="radio"
        name="wallet"
        value={w.code}
        id={`wallet-radio-${w.code}`} />
      <label for={`wallet-radio-${w.code}`} class="radio-label">
        <span class="checkbox" />
        <img
          alt={w.name}
          style="display:none"
          on:load={() => {
            imageReferences[w.code].style.backgroundImage = 'url(' + w.sqLogo + ')';
          }}
          src={w.sqLogo} />

        <div class="placeholder" bind:this={imageReferences[w.code]} />
        <span class="title">{w.name}</span>
        {#if getApplicableOffer(w.code)}
          <span class="offer">{getApplicableOffer(w.code).name}</span>
          <div class="offer-info">
            {getApplicableOffer(w.code).display_text}
          </div>
        {/if}
      </label>
    </div>
  {/each}

</div>
