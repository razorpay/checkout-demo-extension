<script>
  /* global each, Event */

  // Svelte imports
  import { onMount, tick } from 'svelte';

  // UI Imports
  import Tab from 'templates/tabs/Tab.svelte';
  import Callout from 'templates/views/ui/Callout.svelte';
  import Screen from 'templates/layouts/Screen.svelte';
  import AddCardView from 'templates/views/AddCardView.svelte';
  import EmiActions from 'templates/views/EmiActions.svelte';
  import SavedCards from 'templates/screens/savedcards.svelte';
  import OffersPortal from 'templates/views/OffersPortal.svelte';

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
    remember,
  } from 'checkoutstore/screens/card';

  import { contact } from 'checkoutstore/screens/home';

  import { newCardEmiDuration } from 'checkoutstore/emi';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getSavedCards, transform } from 'common/token';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardType } from 'common/card';

  // Transitions
  import { fade } from 'svelte/transition';

  // Constants
  const Views = {
    SAVED_CARDS: 'saved-cards',
    ADD_CARD: 'add-card',
  };

  const session = getSession();
  const isSavedCardsEnabled = session.get('remember_customer');

  let currentView = Views.SAVED_CARDS;

  let tab = '';
  let allSavedCards = [];
  let savedCards = [];
  let lastSavedCard = null;
  let selectedOffer = null;

  let showEmiCta;
  let emiCtaView;

  let showSavedCardsCta = false;
  $: showSavedCardsCta = savedCards && savedCards.length && isSavedCardsEnabled;

  // State
  let customer = {};

  // Refs
  let savedCardsView;
  let addCardView;

  onMount(() => {
    // Prefill
    $cardNumber = session.get('prefill.card[number]') || '';
    $cardExpiry = session.get('prefill.card[expiry]') || '';
    $cardName = session.get('prefill.name') || '';
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

  function getSavedCardsForDisplay(allSavedCards, tab) {
    if (session.recurring) {
      return filterSavedCardsForRecurring(allSavedCards);
    }

    if (tab === 'emi') {
      return filterSavedCardsForEmi(allSavedCards);
    }

    return allSavedCards;
  }

  $: {
    allSavedCards = getSavedCardsFromCustomer(customer);
  }

  $: {
    savedCards = filterSavedCardsForOffer(
      getSavedCardsForDisplay(allSavedCards, tab),
      selectedOffer
    );
  }

  $: {
    lastSavedCard = savedCards && savedCards[savedCards.length - 1];
  }

  $: {
    // TODO: find a better way
    // Remove selected offer every time the view changes.
    if (currentView) {
      session.removeOfferSelectedFromDrawer();
    }
  }

  function getSavedCardsFromCustomer(customer = {}) {
    if (!customer.tokens) {
      return [];
    }

    let tokenList = getSavedCards(customer.tokens.items);

    // TODO: move to separate function
    tokenList = tokenList.slice().sort((a, b) => {
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
    // If offer no offer is selected, do not try to filter cards.
    if (!offer) {
      return savedCards;
    }

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

  function filterSavedCardsForRecurring(tokens) {
    return _Arr.filter(tokens, token => token.recurring);
  }

  function filterSavedCardsForEmi(tokens) {
    return _Arr.filter(tokens, token => token.plans);
  }

  export function showLandingView() {
    tick().then(_ => {
      let viewToSet = Views.ADD_CARD;

      if (savedCards && savedCards.length > 0 && isSavedCardsEnabled) {
        viewToSet = Views.SAVED_CARDS;
      }
      setView(viewToSet);
    });
  }

  export function showAddCardView() {
    Analytics.track('saved_cards:hide');
    setView(Views.ADD_CARD);
  }

  export function showSavedCards() {
    Analytics.track('saved_cards:show');
    setView(Views.SAVED_CARDS);
  }

  function setView(view) {
    currentView = view;
  }

  export function getPayload() {
    if (currentView === Views.ADD_CARD) {
      return getAddCardPayload();
    } else {
      return getSavedCardPayload();
    }
  }

  export function isOnSavedCardsScreen() {
    return currentView === Views.SAVED_CARDS;
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
      const emiBanks = _Obj.entries(emi_options.banks);
      emiObj = _Arr.find(emiBanks, ([bank, emiObjInner]) =>
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

  function handleEmiCtaClick(e) {
    let eventName = 'emi:plans:';
    const eventData = {
      from: session.tab,
    };

    session.removeAndCleanupOffers();

    if (emiCtaView === 'available') {
      session.showEmiPlans('new')(e);
      eventName += 'view';
    } else if (emiCtaView === 'plans-available') {
      session.showEmiPlans('new')(e);
      eventName += 'edit';
    } else if (emiCtaView === 'pay-without-emi') {
      if (session.methods.card) {
        session.setScreen('card');
        session.switchTab('card');
        session.offers && session.renderOffers(session.tab);
        showLandingView();

        eventName = 'emi:pay_without';
      }
    } else if (emiCtaView === 'plans-unavailable') {
      if (session.methods.card) {
        session.setScreen('card');
        session.switchTab('card');
        session.offers && session.renderOffers(session.tab);

        eventName = 'emi:pay_without';
      }
    }

    Analytics.track(eventName, {
      type: AnalyticsTypes.BEHAV,
      data: eventData,
    });
  }

  /**
   * Updates the customer, shows the landing view and returns a promise that resolves when the landing view is visible
   * @param newCustomer
   * @return {Promise<void>}
   */
  export function updateCustomerAndShowLandingView(newCustomer = {}) {
    customer = newCustomer;
    // Wait for pending state updates from reactive statements
    return tick()
      .then(showLandingView)
      .then(tick);
  }

  export function setSelectedOffer(newOffer) {
    selectedOffer = newOffer;
  }

  export function onShown() {
    tab = session.tab;
    onCardInput();
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

<Tab method="card" pad={false} overrideMethodCheck>
  <Screen pad={false}>
    <div slot="main">
      {#if currentView === Views.ADD_CARD}
        <div in:fade={{ duration: 100, y: 100 }}>
          {#if showSavedCardsCta}
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
            {tab}
            bind:this={addCardView}
            on:cardinput={onCardInput} />
          {#if showEmiCta}
            <EmiActions
              {showEmiCta}
              {emiCtaView}
              savedCount={allSavedCards.length}
              on:click={handleEmiCtaClick} />
          {/if}
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
            on:click={() => setView(Views.ADD_CARD)}>
            Add another card
          </div>
        </div>
      {/if}
    </div>
    <div slot="bottom">
      <OffersPortal />
      {#if session.recurring}
        <Callout>
          {#if !session.subscription}
            Future payments on this card will be charged automatically.
          {:else if session.subscription && session.subscription.type === 0}
            The charge is to enable subscription on this card and it will be
            refunded.
          {:else}
            This card will be linked to the subscription and future payments
            will be charged automatically.
          {/if}
        </Callout>
      {/if}
    </div>
  </Screen>
</Tab>
