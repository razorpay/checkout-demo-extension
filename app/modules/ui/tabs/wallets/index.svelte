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

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
    remember,
  } from 'checkoutstore/screens/card';

  import { contact } from 'checkoutstore/screens/home';
  import { isRecurring, shouldRememberCustomer } from 'checkoutstore';
  import {
    isMethodEnabled,
    getEMIBanks,
    getEMIBankPlans,
    getWallets,
  } from 'checkoutstore/methods';
  import { newCardEmiDuration } from 'checkoutstore/emi';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getSavedCards, transform } from 'common/token';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardType } from 'common/card';

  // Transitions
  import { fade } from 'svelte/transition';

  const _ = getSession();
  const wallet = getWallets();

  const applicableOffer =
    _.walletOffer && _.walletOffer.issuer === w.code && _.walletOffer;
</script>

<style>

</style>

<div class="list collapsable">
  {#each wallet as w, i}
    <div class="wallet item radio-item">
      <!-- @Todo Move this to images work -->
      <!-- on:load={function() {
            console.log(this)
            this.nextElementSibling.style.backgroundImage = 'url(' + this.src + ')';
          }} -->
      <input
        type="radio"
        name="wallet"
        value={w.code}
        id={`wallet-radio-${w.code}`} />
      <label for={`wallet-radio-${w.code}`} class="radio-label">
        <span class="checkbox" />
        <img alt={w.code} style="display:none" src={`${w.sqLogo}`} />
        <div class="placeholder" />
        <span class="title">{w.name}</span>
        {#if applicableOffer}
          <span class="offer">{applicableOffer.name}</span>
          <div class="offer-info">{applicableOffer.display_text}</div>
        {/if}
      </label>
    </div>
  {/each}

</div>
