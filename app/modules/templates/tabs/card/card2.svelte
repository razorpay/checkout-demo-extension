<script>
  /* global each */
  import { fly } from 'svelte/transition';

  import Tab from 'templates/tabs/Tab.svelte';
  import AddCardView from '../../views/AddCardView.svelte';
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

  let currentView = 'add-card';
  let cardType = null;
  let savedCards = [];

  let showAddCardCta = false;
  $: showAddCardCta = savedCards && savedCards.length;

  // Refs
  let savedCardsView;

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

        savedCards = session.transformTokens(tokensList.items); // Rajat, looks emi is this needed here?
        // showSavedCards = true;
        // TODO: show saved cards

        var totalSavedCards = getSavedCards(savedCards).length;
      }
    }

    // TODO: check if this can be removed
    // var selectableSavedCard = getSelectableSavedCardElement(
    //   'card', //hardcoding for now
    //   this.selectedSavedCardToken
    // );
    //
    // if (tokens && selectableSavedCard) {
    //   session.setSavedCard({ delegateTarget: selectableSavedCard });
    // }

    session.savedCardScreen = tokens;

    // TODO: implement
    // toggleSavedCards(!!tokens);

    // TODO: check if this is required
    _El.toggleClass(_Doc.querySelector('#form-card'), 'has-cards'); //TODO: pure functions

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
    const payload = {
      'card[number]': $cardNumber,
      'card[expiry]': $cardExpiry,
      'card[cvv]': $cardCvv,
      'card[name]': $cardName,
    };
    if ($remember) {
      payload.save = 1;
    }
    return payload;
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

  export function onShown() {
    setSavedCards();
  }
</script>

<style>
  #show-saved-cards {
    cursor: pointer;
    height: unset;
    transition: 0.2s;
    transition-delay: 0.15s;
    z-index: 1;
  }
</style>

<Tab method="card" pad={false}>
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
      <AddCardView bind:cardType />
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
