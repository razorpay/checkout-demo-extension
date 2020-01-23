<script>
  /* global each, Event */

  // Svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import Tab from 'templates/tabs/Tab.svelte';
  import Screen from 'templates/layouts/Screen.svelte';
  import AddCardView from 'templates/views/AddCardView.svelte';
  import SavedCards from 'templates/screens/savedcards.svelte';

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
    remember,
  } from 'checkoutstore/screens/card';

  import { newCardEmiDuration } from 'checkoutstore/emi';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getSavedCards, transform } from 'common/token';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardType } from 'common/card';

  // Transitions
  import { fade } from 'svelte/transition';

  let currentView = 'add-card';

  let tab = '';
  let allSavedCards = [];
  let emiCards = [];
  let savedCards = [];
  let lastSavedCard = null;
  let selectedOffer = {};

  let showEmiCta;
  let emiCtaView;

  let showAddCardCta = false;
  $: showAddCardCta = allSavedCards && allSavedCards.length;

  // State
  let customer = {};

  // Refs
  let savedCardsView;
  let addCardView;

  const session = getSession();

  onMount(() => {
    // Prefill
    $cardNumber = session.get('prefill.card[number]') || '';
    $cardExpiry = session.get('prefill.card[expiry]') || '';
    $cardName = session.get('prefill.card[name]') || '';
    $cardCvv = session.get('prefill.card[cvv]') || '';
  });

  $: {
    // Track saved cards
    const savedCardsCount = allSavedCards.length;

    if (savedCardsCount) {
      Analytics.setMeta('has.savedCards', true);
      Analytics.setMeta('count.savedCards', savedCardsCount);
      Analytics.track('saved_cards', {
        type: AnalyticsTypes.RENDER,
        data: {
          count: savedCardsCount,
        },
      });
    }
  }

  $: {
    allSavedCards = filterSavedCardsForOffer(allSavedCards, selectedOffer);
  }

  $: {
    emiCards = allSavedCards.filter(card => card.plans);
  }

  $: {
    savedCards = tab === 'emi' ? emiCards : allSavedCards;
  }

  $: {
    lastSavedCard = savedCards && savedCards[savedCards.length - 1];
  }

  function getSavedCardsFromCustomer(customer = {}) {
    if (!customer.tokens) {
      return [];
    }

    const tokenList = getSavedCards(customer.tokens.items);

    // TODO: move to separate function
    tokenList.sort((a, b) => {
      if (a.card && b.card) {
        if (a.card.emi && b.card.emi) {
          return 0;
        } else if (a.card.emi) {
          return 1;
        } else if (b.card.emi) {
          return -1;
        }
      }
    });

    return transformTokens(tokenList);
  }

  function transformTokens(tokens) {
    return transform(tokens, {
      amount: session.get('amount'),
      emi: session.methods.emi,
      emiOptions: session.emi_options,
      recurring: session.recurring,
    });
  }

  function filterSavedCardsForOffer(savedCards, offer) {
    const emiBanks = session.emi_options.banks;
    return _Arr.filter(savedCards, function(index, token) {
      var card = token.card;
      if (card && offer.payment_method === 'emi' && offer.emi_subvention) {
        /* Merchant subvention EMI */
        const bank = card.issuer;
        const emiBank = emiBanks[bank];

        if (bank && emiBank) {
          const plans = emiBank.plans;
          if (typeof plans !== 'object') {
            return false;
          }

          return _Arr.any(plans, plan => plan.offer_id === offer.id);
        }
      } else {
        return true;
      }
    });
  }

  export function showLandingView() {
    let viewToSet = 'saved-card';

    if (allSavedCards.length === 0) {
      viewToSet = 'add-card';
    }

    if (tab === 'emi' && emiCards.length === 0) {
      viewToSet = 'add-card';
    }

    setView(viewToSet);
  }

  export function showAddCardView() {
    setView('add-card');
  }

  export function showSavedCards() {
    setView('saved-cards');
  }

  function setView(view) {
    currentView = view;
  }

  // TODO: remove and track when view changes
  export function toggleSavedCards() {
    /**
     * If offer was auto-applied from the
     * emi plans screen.
     * TODO: Validate this.
     */
    if (
      session.offers &&
      !session.offers.offerSelectedByDrawer &&
      session.offers.appliedOffer
    ) {
      session.offers.removeOffer();
    }

    Analytics.track('saved_cards:toggle', {
      type: AnalyticsTypes.BEHAV,
      data: {
        from: currentView === 'saved-cards' ? 'saved' : 'new',
      },
    });
  }

  export function getPayload() {
    if (currentView === 'add-card') {
      return getAddCardPayload();
    } else {
      return getSavedCardPayload();
    }
  }

  export function isOnSavedCardsScreen() {
    return currentView === 'saved-card';
  }

  function getAddCardPayload() {
    return addCardView.getPayload();
  }

  function getSavedCardPayload() {
    return savedCardsView.getSelectedToken();
  }

  function handleViewPlans(event) {
    Analytics.track('saved_card:emi:plans:view', {
      type: AnalyticsTypes.BEHAV,
      data: {
        from: session.tab,
      },
    });

    session.showEmiPlans('saved')(event.detail);
  }

  function onCardInput() {
    const emi_options = session.emi_options;
    const cardNumber = $cardNumber;
    const cardType = getCardType(cardNumber);
    const isMaestro = /^maestro/.test(cardType);
    const sixDigits = cardNumber.length > 5;
    const trimmedVal = cardNumber.replace(/[ ]/g, '');

    var emiObj;

    if (sixDigits && !isMaestro) {
      emiObj = _Obj
        .entries(emi_options.banks)
        .find(([bank, emiObjInner]) =>
          emiObjInner.patt.test(cardNumber.replace(/ /g, ''))
        );
    }

    session.emiPlansForNewCard = emiObj && emiObj[1];

    if (!emiObj) {
      $newCardEmiDuration = '';
    }

    showAppropriateEmiDetailsForNewCard(
      session.tab,
      emiObj,
      trimmedVal.length,
      session.methods
    );

    if (trimmedVal.length >= 6) {
      var emiBankChangeEvent;
      if (typeof Event === 'function') {
        emiBankChangeEvent = new Event('change');
      } else {
        emiBankChangeEvent = document.createEvent('Event');
        emiBankChangeEvent.initEvent('change', true, true);
      }
    }

    if (isMaestro && sixDigits) {
      showEmiCta = false;
    }
  }

  /**
   * Show appropriate EMI-details strip on the new card screen.
   */
  function showAppropriateEmiDetailsForNewCard(
    tab,
    hasPlans,
    cardLength,
    methods
  ) {
    /**
     * tab=card
     * - plan selected: emi available
     * - does not have plans: nothing
     * - has plans: emi available
     * - default: nothing
     *
     *
     * tab=emi
     * - plan selected: plan details
     * - does not have plans: emi unavailable (with action)
     * - does not have emi plans and methods.card=false: emi unavailable (without action)
     * - has plans: pay without emi
     * - methods.card=false: nothing
     * - default: pay without emi
     */
    showEmiCta = true;

    if (tab === 'card') {
      if (hasPlans) {
        emiCtaView = 'available';
      } else {
        showEmiCta = false;
      }
    } else if (tab === 'emi') {
      if ($newCardEmiDuration) {
        emiCtaView = 'plans-available';
      } else if (cardLength >= 6 && !hasPlans) {
        emiCtaView = 'plans-unavailable';
      } else if (methods.card) {
        emiCtaView = 'pay-without-emi';
      } else {
        showEmiCta = false;
      }
    }
  }

  export function updateCustomer(newCustomer = {}) {
    customer = newCustomer;
    allSavedCards = getSavedCardsFromCustomer(customer);
    showLandingView();
  }

  export function setSelectedOffer(newOffer) {
    selectedOffer = newOffer;
  }

  export function onShown() {
    showLandingView();
    onCardInput();
    tab = session.tab;
  }
</script>

<style>
  #show-saved-cards {
    padding-top: 12px;
    padding-bottom: 12px;
    cursor: pointer;
    height: unset;
    transition: 0.2s;
    transition-delay: 0.15s;
    z-index: 1;
    line-height: 24px;
    margin-bottom: -12px;
  }

  .saved-cards-icon {
    position: absolute;
    left: 24px;
    top: 10px;
    border: 1px solid red;
  }
</style>

<Tab method="card" pad={false}>
  <Screen pad={false}>
    <div slot="main">
      {#if currentView === 'add-card'}
        <div in:fade={{ duration: 100, y: 100 }}>
          {#if showAddCardCta}
            <div
              id="show-saved-cards"
              on:click={showSavedCards}
              class="text-btn left-card">
              <div
                class="cardtype"
                class:multiple={savedCards && savedCards.length > 1}
                cardtype={lastSavedCard && lastSavedCard.card.networkCode} />
              Use saved cards
            </div>
          {/if}
          <AddCardView
            {showEmiCta}
            {emiCtaView}
            savedCount={allSavedCards.length}
            bind:this={addCardView}
            on:cardinput={onCardInput} />
        </div>
      {:else}
        <div in:fade={{ duration: 100 }}>
          <div id="saved-cards-container">
            <SavedCards
              {tab}
              cards={savedCards}
              bind:this={savedCardsView}
              on:viewPlans={handleViewPlans} />
          </div>
          <div
            id="show-add-card"
            class="text-btn left-card"
            on:click={() => setView('add-card')}>
            Add another card
          </div>
        </div>
      {/if}
    </div>
  </Screen>
</Tab>
