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
  import { getSavedCards } from 'common/token';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardType } from 'common/card';

  let currentView = 'add-card';
  let cardType = null;
  let savedCards = [];
  let showEmiCta;
  let emiCtaView;

  let showAddCardCta = false;
  $: showAddCardCta = savedCards && savedCards.length;

  // Refs
  let savedCardsView;
  let addCardView;

  const session = getSession();

  function setSavedCards() {
    const { customer } = session;
    const tokens = customer && customer.tokens && customer.tokens.count;
    if (tokens) {
      var tokensList = customer.tokens;
      // TODO: check what this if condition does
      if (
        _Doc.querySelectorAll('.saved-card').length !== tokensList.items.length
      ) {
        try {
          // Keep EMI cards at the end
          tokensList.items.sort(function(a, b) {
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
        } catch (e) {}

        var savedCardsCount = getSavedCards(tokensList.items).length;

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

        savedCards = session.transformTokens(tokensList.items);
      }
    }

    session.savedCardScreen = tokens;

    // TODO: handle this using Field component
    each(_Doc.querySelectorAll('.saved-cvv'), function(i, input) {
      // delegator.add('number', input);
    });
  }

  export function showSavedCards() {
    setView('saved-cards');
  }

  function setView(view) {
    currentView = view;
  }

  function toggleSavedCards(condition) {
    if (condition) {
      setView('saved-cards');
    }
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

  export function onShown() {
    setSavedCards();
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
          on:click={() => showSavedCards()}
          class="text-btn left-card">
          Use saved cards
        </div>
      {/if}
      <AddCardView
        {showEmiCta}
        {emiCtaView}
        bind:cardType
        bind:this={addCardView}
        on:cardinput={onCardInput} />
    </div>
  {:else}
    <div>
      <div id="saved-cards-container">
        <SavedCards
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
