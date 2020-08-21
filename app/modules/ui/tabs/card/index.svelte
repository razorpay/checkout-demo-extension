<script>
  // Svelte imports
  import { onMount, tick } from 'svelte';

  // UI Imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import AddCardView from 'ui/tabs/card/AddCardView.svelte';
  import EmiActions from 'ui/components/EmiActions.svelte';
  import SavedCards from 'ui/tabs/card/savedcards.svelte';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';
  import SlottedRadioOption from 'ui/elements/options/Slotted/RadioOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
    remember,
    selectedCard,
    selectedApp,
    cardTab,
  } from 'checkoutstore/screens/card';
  import { methodInstrument, blocks } from 'checkoutstore/screens/home';
  import { getSDKMeta } from 'checkoutstore/native';

  import { customer } from 'checkoutstore/customer';

  import { contact } from 'checkoutstore/screens/home';
  import {
    isRecurring,
    shouldRememberCustomer,
    isDCCEnabled,
    methodErrors,
    getIdForPaymentPayload,
  } from 'checkoutstore';
  import {
    isMethodEnabled,
    getEMIBanks,
    getEMIBankPlans,
    isMethodUsable,
    getAppsForCards,
    getPayloadForCRED,
    isApplicationEnabled,
  } from 'checkoutstore/methods';
  import { newCardEmiDuration } from 'checkoutstore/emi';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getAppProviderName, getAppProviderSubtext } from 'i18n';

  import {
    USE_SAVED_CARDS_BTN,
    USE_SAVED_CARDS_ON_RZP_BTN,
    CARDS_SAVED_ON_APPS_LABEL,
    CARDS_SAVED_ON_RZP_LABEL,
    ENTER_CARD_DETAILS_OPTION_LABEL,
    ADD_ANOTHER_CARD_BTN,
    RECURRING_CALLOUT,
    SUBSCRIPTION_CALLOUT,
    SUBSCRIPTION_REFUND_CALLOUT,
  } from 'ui/labels/card';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getSavedCards, transform } from 'common/token';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getCardType } from 'common/card';
  import { getSubtextForInstrument } from 'subtext';
  import { getProvider as getAppProvider } from 'common/apps';
  import { getAnimationOptions } from 'svelte-utils';

  // Transitions
  import { fade } from 'svelte/transition';

  // Constants
  const Views = {
    SAVED_CARDS: 'saved-cards',
    ADD_CARD: 'add-card',
  };

  const apps = _Arr.map(getAppsForCards(), code => getAppProvider(code));
  const appsAvailable = apps.length;

  const session = getSession();
  const isSavedCardsEnabled = shouldRememberCustomer();

  let currentView = Views.SAVED_CARDS;
  let lastView;

  // We're showing apps on both saved cards & new card screen,
  // But if the user switches to new card screen from the saved cards screen,
  // hide the apps. It clearly indicates that the user doesn't want to use apps.
  let userWantsApps = true;
  $: {
    if (
      savedCards.length &&
      lastView === Views.SAVED_CARDS &&
      currentView === Views.ADD_CARD
    ) {
      userWantsApps = false;
    } else {
      userWantsApps = true;
    }
    lastView = currentView;
  }

  let tab = '';
  $: $cardTab = tab;

  let showApps = false;
  // None of the apps support EMI currently,
  // Don't show it on anything except card tab.
  $: showApps = tab === 'card' && appsAvailable && userWantsApps;

  let allSavedCards = [];
  let savedCards = [];
  let lastSavedCard = null;

  let showEmiCta;
  let emiCtaView;

  let showSavedCardsCta = false;
  $: showSavedCardsCta = savedCards && savedCards.length && isSavedCardsEnabled;

  // Refs
  let savedCardsView;
  let addCardView;
  let selectedMethodError;

  onMount(() => {
    // Prefill
    $cardNumber = session.get('prefill.card[number]') || '';
    $cardExpiry = session.get('prefill.card[expiry]') || '';
    $cardName = session.get('prefill.name') || '';
    $cardCvv = session.get('prefill.card[cvv]') || '';

    if (session.get('prefill.method') === 'card') {
      if (isApplicationEnabled(session.get('prefill.provider'))) {
        $selectedApp = session.get('prefill.provider');
      }
    }

    methodErrors.subscribe(updateMethodError);
  });

  function updateMethodError() {
    // Either we got a new error from API or
    // the user has changed the selected app.
    // Show the error from API in the callout.
    selectedMethodError = null;
    if ($selectedApp) {
      const payload = {
        contact: $contact,
        ...getPayload(),
      };
      const id = getIdForPaymentPayload(payload);
      if (id && $methodErrors[id]) {
        selectedMethodError = $methodErrors[id].description;
      }
    }
  }

  $: $selectedApp, updateMethodError();
  $: $contact, updateMethodError();

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
    if ($selectedCard) {
      $selectedApp = null;
    }
  }

  /**
   * Session calls this to ask if tab will handle back
   *
   * @returns {boolean} will tab handle back
   */
  export function onBack() {
    $selectedCard = null; // De-select saved card

    return false;
  }

  function getSavedCardsForDisplay(allSavedCards, tab) {
    if (isRecurring()) {
      return filterSavedCardsForRecurring(allSavedCards);
    }

    if (tab === 'emi') {
      return filterSavedCardsForEmi(allSavedCards);
    }

    return allSavedCards;
  }

  /**
   * Filters saved card tokens against the given instrument.
   * Only allows those cards that match the given instruments.
   *
   * @param {Array<Token>} tokens
   * @param {Instrument} instrument
   *
   * @returns {Array<Token>}
   */
  function filterSavedCardsAgainstInstrument(tokens, instrument) {
    // Sanity check
    if (!instrument) {
      return tokens;
    }

    if (instrument.method !== tab) {
      return tokens;
    }

    const eligibleTokens = _Arr.filter(tokens, token => {
      const hasIssuers = Boolean(instrument.issuers);
      const hasNetworks = Boolean(instrument.networks);
      const hasTypes = Boolean(instrument.types);
      const hasIins = Boolean(instrument.iins);

      // We don't have IIN for a saved card. So if we're requested to support only specific IINs, we can't show saved cards
      if (hasIins) {
        return false;
      }

      const issuers = instrument.issuers || [];
      const networks = instrument.networks || [];
      const types = instrument.types || [];

      // If there is no issuer present, it means match all issuers.
      const issuerMatches = hasIssuers
        ? _Arr.contains(issuers, token.card.issuer)
        : true;

      const networkMatches = hasNetworks
        ? _Arr.contains(networks, token.card.network)
        : true;

      const typeMatches = hasTypes
        ? _Arr.contains(types, token.card.type)
        : true;

      return issuerMatches && networkMatches && typeMatches;
    });

    return eligibleTokens;
  }

  $: {
    allSavedCards = getSavedCardsFromCustomer($customer);
  }

  $: {
    let _savedCards = getSavedCardsForDisplay(allSavedCards, tab);

    _savedCards = filterSavedCardsAgainstInstrument(
      _savedCards,
      $methodInstrument
    );

    savedCards = _savedCards;
  }

  $: {
    lastSavedCard = savedCards && savedCards[savedCards.length - 1];
  }

  let instrumentSubtext;
  $: {
    if (!$methodInstrument) {
      instrumentSubtext = undefined;
    } else if ($methodInstrument.method !== tab) {
      instrumentSubtext = undefined;
    } else {
      instrumentSubtext = getSubtextForInstrument($methodInstrument);
    }
  }

  /**
   * Determine if subtext should be shown
   * We don't show subtext if subtext is empty
   * or if the instrument is a part of rzp.cluster block
   *
   * @returns {boolean}
   */
  function detemineIfSubtextShouldBeShown() {
    if (!instrumentSubtext) {
      return false;
    }

    const block = _Arr.find($blocks, block =>
      _Arr.contains(block.instruments, $methodInstrument)
    );

    return block && block.code !== 'rzp.cluster';
  }

  let shouldShowSubtext = detemineIfSubtextShouldBeShown();
  $: instrumentSubtext, (shouldShowSubtext = detemineIfSubtextShouldBeShown());

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
      emi: isMethodEnabled('emi'),
      recurring: isRecurring(),
    });
  }

  function filterSavedCardsForRecurring(tokens) {
    return _Arr.filter(tokens, token => token.recurring);
  }

  function filterSavedCardsForEmi(tokens) {
    return _Arr.filter(tokens, token => token.plans);
  }

  export function showLandingView() {
    return tick()
      .then(_ => {
        let viewToSet = Views.ADD_CARD;

        if (savedCards && savedCards.length > 0 && isSavedCardsEnabled) {
          viewToSet = Views.SAVED_CARDS;
        }
        setView(viewToSet);
      })
      .then(tick);
  }

  export function showAddCardView() {
    Analytics.track('saved_cards:hide');
    setView(Views.ADD_CARD);
  }

  export function showSavedCardsView() {
    Analytics.track('saved_cards:show');
    setView(Views.SAVED_CARDS);
  }

  function setView(view) {
    currentView = view;
  }

  function setSelectedApp(code) {
    $selectedApp = code;
    $selectedCard = null;
  }

  export function getPayload() {
    if ($selectedApp) {
      return getAppPayload();
    } else if (currentView === Views.ADD_CARD) {
      return getAddCardPayload();
    } else {
      return getSavedCardPayload();
    }
  }

  function getAppPayload() {
    // TODO: Keep this mapping stored somewhere else when we add another app.
    if ($selectedApp === 'google_pay_cards') {
      return { method: 'app', provider: 'google_pay_cards' };
    } else if ($selectedApp === 'cred') {
      return getPayloadForCRED();
    }
  }

  export function getTransformedTokens() {
    if (allSavedCards && allSavedCards.length) {
      return allSavedCards;
    }
    // TODO: Fix session.customer usage when customer is moved to store.
    return getSavedCardsFromCustomer(session.getCurrentCustomer());
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

  function onAddCardViewFocused() {
    $selectedApp = null;
  }

  function onCardInput() {
    const cardNumber = $cardNumber;
    const cardType = getCardType(cardNumber);
    const isMaestro = /^maestro/.test(cardType);
    const sixDigits = cardNumber.length > 5;
    const trimmedVal = cardNumber.replace(/[ ]/g, '');

    var emiObj;

    if (sixDigits && !isMaestro) {
      const emiBanks = _Obj.entries(getEMIBanks());
      emiObj = _Arr.find(emiBanks, ([bank, emiObjInner]) =>
        emiObjInner.patt.test(cardNumber.replace(/ /g, ''))
      );
    }

    session.emiPlansForNewCard = emiObj && emiObj[1];

    if (!emiObj) {
      $newCardEmiDuration = '';
    }

    showAppropriateEmiDetailsForNewCard(session.tab, emiObj, trimmedVal.length);

    if (isMaestro && sixDigits) {
      showEmiCta = false;
    }
  }

  /**
   * Show appropriate EMI-details strip on the new card screen.
   */
  function showAppropriateEmiDetailsForNewCard(tab, hasPlans, cardLength) {
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
      if (hasPlans && isMethodUsable('emi')) {
        emiCtaView = 'available';
      } else {
        showEmiCta = false;
      }
    } else if (tab === 'emi') {
      if ($newCardEmiDuration) {
        emiCtaView = 'plans-available';
      } else if (cardLength >= 6 && !hasPlans) {
        emiCtaView = 'plans-unavailable';
      } else if (isMethodUsable('card')) {
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

    if (emiCtaView === 'available' && isMethodUsable('emi')) {
      session.showEmiPlans('new')(e);
      eventName += 'view';
    } else if (emiCtaView === 'plans-available' && isMethodUsable('emi')) {
      session.showEmiPlans('new')(e);
      eventName += 'edit';
    } else if (emiCtaView === 'pay-without-emi' && isMethodUsable('card')) {
      if (isMethodEnabled('card')) {
        session.setScreen('card');
        session.switchTab('card');
        showLandingView();
        eventName = 'emi:pay_without';
      }
    } else if (emiCtaView === 'plans-unavailable' && isMethodUsable('card')) {
      if (isMethodEnabled('card')) {
        session.setScreen('card');
        session.switchTab('card');
        eventName = 'emi:pay_without';
      }
    }

    Analytics.track(eventName, {
      type: AnalyticsTypes.BEHAV,
      data: eventData,
    });
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
    position: relative; /* This is needed because the stupid network icon has position: absolute */
  }

  .saved-cards-icon {
    position: absolute;
    left: 24px;
    top: 10px;
    border: 1px solid red;
  }

  .instrument-subtext-description {
    margin: 12px 0;
  }
</style>

<Tab method="card" pad={false} overrideMethodCheck>
  <Screen pad={false}>
    <div>
      {#if currentView === Views.ADD_CARD}
        <div in:fade={getAnimationOptions({ duration: 100, y: 100 })}>
          {#if showSavedCardsCta}
            <div
              id="show-saved-cards"
              on:click={showSavedCardsView}
              class="text-btn left-card">
              <div
                class="cardtype"
                class:multiple={savedCards && savedCards.length > 1}
                cardtype={lastSavedCard && lastSavedCard.card.networkCode} />
              {#if showApps}
                <!-- LABEL: Use saved cards on Razorpay -->
                {$t(USE_SAVED_CARDS_ON_RZP_BTN)}
              {:else}
                <!-- LABEL: Use saved cards -->
                {$t(USE_SAVED_CARDS_BTN)}
              {/if}
            </div>
          {/if}

          {#if shouldShowSubtext}
            <div class="pad instrument-subtext-description">
              {instrumentSubtext}
            </div>
          {/if}

          {#if showApps}
            <!-- LABEL: Cards Saved on Apps -->
            <h3 class="pad">{$t(CARDS_SAVED_ON_APPS_LABEL)}</h3>
            <div id="cards-saved-on-apps" role="list" class="border-list pad">
              {#each apps as app}
                <SlottedRadioOption
                  ellipsis
                  name={app.name}
                  selected={$selectedApp === app.code}
                  className="instrument"
                  value={app.code}
                  on:click={_ => setSelectedApp(app.code)}>
                  <i slot="icon">
                    <Icon icon={app.logo} alt="" />
                  </i>
                  <div slot="title">
                    {getAppProviderName(app.code, $locale)}
                  </div>
                  <div slot="subtitle">
                    {#if getAppProviderSubtext(app.code, $locale)}
                      {getAppProviderSubtext(app.code, $locale)}
                    {/if}
                  </div>
                </SlottedRadioOption>
              {/each}
            </div>
            <!-- LABEL: Or, Enter card details -->
            <h3 class="pad">{$t(ENTER_CARD_DETAILS_OPTION_LABEL)}</h3>
          {/if}
          <AddCardView
            {tab}
            bind:this={addCardView}
            faded={Boolean($selectedApp)}
            on:focus={onAddCardViewFocused}
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
        <div in:fade={getAnimationOptions({ duration: 100 })}>
          {#if shouldShowSubtext}
            <div class="pad instrument-subtext-description">
              {instrumentSubtext}
            </div>
          {/if}

          {#if showApps}
            <!-- LABEL: Cards Saved on Apps -->
            <h3 class="pad">{$t(CARDS_SAVED_ON_APPS_LABEL)}</h3>
            <div id="cards-saved-on-apps" role="list" class="border-list pad">
              {#each apps as app}
                <SlottedRadioOption
                  ellipsis
                  name="application"
                  selected={$selectedApp === app.code}
                  className="instrument"
                  value={app.code}
                  on:click={_ => setSelectedApp(app.code)}>
                  <i slot="icon">
                    <Icon icon={app.logo} alt="" />
                  </i>
                  <div slot="title">
                    {getAppProviderName(app.code, $locale)}
                  </div>
                  <div slot="subtitle">
                    {#if getAppProviderSubtext(app.code, $locale)}
                      {getAppProviderSubtext(app.code, $locale)}
                    {/if}
                  </div>
                </SlottedRadioOption>
              {/each}
            </div>
            <!-- LABEL: Cards Saved on Apps -->
            <h3 class="pad">{$t(CARDS_SAVED_ON_RZP_LABEL)}</h3>
          {/if}

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
            on:click={showAddCardView}>
            <!-- LABEL: Add another card -->
            {$t(ADD_ANOTHER_CARD_BTN)}
          </div>
        </div>
      {/if}
    </div>
    <Bottom tab="card">
      {#if selectedMethodError}
        <Callout>{selectedMethodError}</Callout>
      {/if}
      {#if isDCCEnabled()}
        <DynamicCurrencyView view={currentView} />
      {/if}
      {#if isRecurring()}
        <Callout>
          {#if !session.subscription}
            <!-- LABEL: Future payments on this card will be charged automatically. -->
            {$t(RECURRING_CALLOUT)}
          {:else if session.subscription && session.subscription.type === 0}
            <!-- LABEL : The charge is to enable subscription on this card and it will be
            refunded. -->
            {$t(SUBSCRIPTION_REFUND_CALLOUT)}
          {:else}
            <!-- This card will be linked to the subscription and future payments
            will be charged automatically. -->
            {$t(SUBSCRIPTION_CALLOUT)}
          {/if}
        </Callout>
      {/if}
    </Bottom>
  </Screen>
</Tab>
