<script>
  /* global each, gel, Event */
  import { fly } from 'svelte/transition';

  import Tab from 'templates/tabs/Tab.svelte';
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

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getSavedCards, transform } from 'common/token';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardType } from 'common/card';

  let currentView = 'add-card';

  let tab = '';
  let allSavedCards = [];
  let emiCards = [];
  let savedCards = [];

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
    emiCards = allSavedCards.filter(card => card.plans);
  }

  $: {
    savedCards = tab === 'emi' ? emiCards : allSavedCards;
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

  export function showLandingView() {
    console.log('showing landing view');
    let viewToSet = 'saved-card';

    // TODO compare based on tab as well
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
    session.savedCardScreen = false;
  }

  export function showSavedCards() {
    setView('saved-cards');
    session.savedCardScreen = true;
  }

  function setView(view) {
    currentView = view;
  }

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
      // TODO: move to session.js
      _Doc.querySelector('#emi_duration').value = '';
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
    // TODO: read from state once moved
    const emiDuration = _Doc.querySelector('#emi_duration').value;
    showEmiCta = true;

    if (tab === 'card') {
      if (hasPlans) {
        emiCtaView = 'available';
      } else {
        showEmiCta = false;
      }
    } else if (tab === 'emi') {
      if (emiDuration) {
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

  export function updateCustomer(newCustomer) {
    customer = newCustomer;
    allSavedCards = getSavedCardsFromCustomer(customer);
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
  }
</style>

<Tab method="card" pad={false}>
  <!-- TODO: check if this can be moved to store/ state -->
  <input type="hidden" id="emi_duration" name="emi_duration" />
  {#if currentView === 'add-card'}
    <div transition:fly={{ duration: 100, y: 100 }}>
      {#if showAddCardCta}
        <div
          id="show-saved-cards"
          on:click={showSavedCards}
          class="text-btn left-card">
          Use saved cards
        </div>
      {/if}
      <AddCardView
        {showEmiCta}
        {emiCtaView}
        savedCount={savedCards.length}
        bind:this={addCardView}
        on:cardinput={onCardInput} />
    </div>
  {:else}
    <div>
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
</Tab>
