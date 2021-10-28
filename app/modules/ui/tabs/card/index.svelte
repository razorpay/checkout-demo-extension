<script>
  // Svelte imports
  import { onMount, tick, onDestroy } from 'svelte';
  import { get } from 'svelte/store';

  // UI Imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import AddCardView from 'ui/tabs/card/AddCardView.svelte';
  import EmiActions from 'ui/components/EmiActions.svelte';
  import SavedCards from 'ui/tabs/card/savedcards.svelte';
  import AppInstruments from 'ui/tabs/card/AppInstruments.svelte';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';
  import { checkDowntime } from 'checkoutframe/downtimes';
  import SavedCardCTA from 'card/ui/component/saved-card-cta.svelte';
  import ToggleHeading from 'ui/components/common/heading/ToggleHeading.svelte';
  import RecurringCardsCallout from './RecurringCardsCallout.svelte';

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
    remember,
    selectedCard,
    selectedApp,
    newCardInputFocused,
    cardTab,
    internationalCurrencyCalloutNeeded,
    hideExpiryCvvFields,
    showAuthTypeSelectionRadio,
    authType,
    currentCvv,
    AVSDccPayload,
    currentAuthType,
    selectedCardFromHome,
    defaultDCCCurrency,
    cardCountry,
    AVSScreenMap,
  } from 'checkoutstore/screens/card';

  import {
    methodInstrument,
    blocks,
    phone,
    selectedInstrument,
  } from 'checkoutstore/screens/home';

  import { findCodeByNetworkName } from 'common/card';
  import { customer } from 'checkoutstore/customer';

  import {
    isRecurring,
    shouldRememberCustomer,
    isDCCEnabled,
    isShowMORTncEnabled,
    isSiftJSEnabled,
    getCardFeatures,
    isInternational,
    getDowntimes,
    isPartialPayment,
    getAmount,
    getCurrencies,
    isIndianCustomer,
  } from 'checkoutstore';

  import {
    isMethodEnabled,
    getEMIBanks,
    isMethodUsable,
    getAppsForCards,
    getPayloadForCRED,
    isApplicationEnabled,
  } from 'checkoutstore/methods';

  import { newCardEmiDuration, savedCardEmiDuration } from 'checkoutstore/emi';
  // i18n
  import { t, locale } from 'svelte-i18n';
  import { fly } from 'svelte/transition';

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
    AVS_INFO_TITLE,
    AVS_HEADING,
    AVS_INFO_MESSAGE_1,
    AVS_INFO_MESSAGE_2,
    AVS_INFO_MESSAGE_3,
  } from 'ui/labels/card';

  import { MERCHANT_OF_RECORD, DCC_TERMS_AND_CONDITIONS } from 'ui/labels/dcc';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getSavedCards, transform } from 'common/token';
  import { Events, CardEvents, MetaProperties } from 'analytics/index';

  import {
    getIin,
    getCardType,
    isAmex,
    addDowntimesToSavedCards,
    injectSiftScript,
  } from 'common/card';

  import { getSubtextForInstrument } from 'subtext';
  import { getProvider as getAppProvider, getAppsForMethod } from 'common/apps';
  import { getAnimationOptions } from 'svelte-utils';

  // Transitions
  import { fade } from 'svelte/transition';
  import AvsForm from './AVSForm.svelte';
  import { showAmount, showCtaWithDefaultText } from 'checkoutstore/cta';
  import Icon from 'ui/elements/Icon.svelte';
  import Info from 'ui/elements/Info.svelte';
  import { Views, cardWithRecurringSupport } from './constant';

  let showAVSInfo = false;

  let AVSInfo = [];
  // experiments
  import { delayLoginOTPExperiment } from 'card/helper';

  let delayOTPExperiment;

  $: {
    delayOTPExperiment = delayLoginOTPExperiment() && $customer?.haveSavedCard;
  }

  const apps = _Arr.map(getAppsForCards(), (code) => getAppProvider(code));
  const appsAvailable = apps.length;

  const session = getSession();
  const icons = session.themeMeta.icons;
  let isSavedCardsEnabled = shouldRememberCustomer();

  $: {
    AVSInfo = [
      {
        icon: icons.user_protect,
        label: $t(AVS_INFO_MESSAGE_2),
      },
      {
        icon: icons.message,
        label: $t(AVS_INFO_MESSAGE_1),
      },
      {
        icon: icons.lock,
        label: $t(AVS_INFO_MESSAGE_3),
      },
    ];
  }

  const cardDowntimes = getDowntimes().cards;
  let downtime = {
    network: false,
    issuer: false,
  };
  let downtimeVisible = false;
  let downtimeSeverity;
  let downtimeInstrument;

  let currentView = Views.SAVED_CARDS;
  let lastView;

  /**
   * tabVisible {Boolean}
   * used by DCC component to allow preselect last currency selection and update the CTA accordingly
   *
   * why? component not destroyed when we go back state remains so when we come back no update trigger
   * CTA need to update.
   */
  let tabVisible = false;

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
  }

  let tab = '';
  $: $cardTab = tab;

  let showApps = false;
  // None of the apps support EMI currently,
  // Don't show it on anything except card tab.
  $: showApps = tab === 'card' && appsAvailable && userWantsApps;

  let appsListExpandedOnSavedCard = true;
  let appsListExpandedOnAddNewCard = false;

  let allSavedCards = [];
  let savedCards = [];
  let lastSavedCard = null;

  let showEmiCta;
  let emiCtaView;

  let showSavedCardsCta = false;
  $: showSavedCardsCta = savedCards && savedCards.length && isSavedCardsEnabled;

  /**
   * Store flags based on /flows API is called for card IIN
   */
  let cardFlowsMap = {};

  onMount(() => {
    // Prefill
    $cardNumber = session.get('prefill.card[number]') || '';
    $cardExpiry = session.get('prefill.card[expiry]') || '';
    $cardName = session.get('prefill.name') || '';
    $cardCvv = session.get('prefill.card[cvv]') || '';

    if (session.get('prefill.method') === 'card') {
      if (isApplicationEnabled(session.get('prefill.provider'))) {
        setSelectedApp(session.get('prefill.provider'));
      }
    }

    phone.subscribe(() => {
      isSavedCardsEnabled = shouldRememberCustomer();
    });

    if (isSiftJSEnabled() && session.r.isLiveMode()) {
      if (isInternational()) {
        // load sift js
        injectSiftScript(session.id).catch((_e) => {
          // Do nothing
        });
      }

      defaultDCCCurrency.subscribe((currency) => {
        if (currency && currency !== 'INR') {
          // load sift js
          injectSiftScript(session.id).catch((_e) => {
            // Do nothing
          });
        }
      });
    }
  });

  onDestroy(() => {
    $newCardInputFocused = false;
  });

  $: {
    // Track saved cards
    const savedCardsCount = allSavedCards.length;

    if (savedCardsCount) {
      Events.setMeta(MetaProperties.HAS_SAVED_CARDS, true);
      Events.setMeta(MetaProperties.SAVED_CARD_COUNT, savedCardsCount);
      Events.Track(CardEvents.SAVED_CARDS, {
        count: savedCardsCount,
      });
    }
  }

  $: {
    if ($selectedCard) {
      $selectedApp = null;
      $newCardInputFocused = false;
    }
    if ($selectedApp || $selectedCard || $newCardInputFocused) {
      // validate offer only for card-apps, to avoid breaks in existing flow.
      const appliedOffer = session?.getAppliedOffer();
      const appsAvailable = getAppsForMethod('card') || [];
      if (
        appliedOffer?.payment_method === 'card' &&
        appliedOffer?.id &&
        appsAvailable.includes(appliedOffer.issuer)
      ) {
        session.validateOffers($selectedApp, (offerRemoved) => {
          if (!offerRemoved) {
            // If the offer was not removed, revert to the app in offer issuer
            setSelectedApp(session?.getAppliedOffer()?.issuer);
          }
        });
      }
    }
  }

  let last4 = '';
  let selectedCardNetwork = '';

  $: {
    if (currentView === Views.ADD_CARD && $cardNumber.length > 4) {
      last4 = $cardNumber.substr(-4, 4);
      selectedCardNetwork = findCodeByNetworkName(getCardType($cardNumber));
    } else if (currentView === Views.SAVED_CARDS && $selectedCard) {
      last4 = $selectedCard?.card?.last4;
      selectedCardNetwork = findCodeByNetworkName($selectedCard?.card?.network);
    } else if (!last4 && currentView === Views.AVS && $selectedCardFromHome) {
      // incase user directly come to avs screen from preferred method (saved card)
      last4 = $selectedCardFromHome?.card?.last4;
      selectedCardNetwork = findCodeByNetworkName(
        $selectedCardFromHome?.card?.network
      );
    }
  }

  /**
   * Session calls this to ask if tab will handle back
   *
   * @returns {boolean} will tab handle back
   */
  export function onBack() {
    if (currentView === Views.AVS && session.screen !== 'otp') {
      directlyOpenAVS = false;
      if (lastView) {
        tabVisible = true;
      }
      setView(
        lastView || (savedCards.length ? Views.SAVED_CARDS : Views.ADD_CARD)
      );
      return true;
    }
    $selectedCard = null; // De-select saved card
    tabVisible = false;
    $newCardInputFocused = false;
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

    if (instrument.method !== tab && !instrument.method.includes('_card')) {
      return tokens;
    }

    const eligibleTokens = _Arr.filter(tokens, (token) => {
      const hasIssuers = Boolean(instrument.issuers);
      const hasNetworks = Boolean(instrument.networks);

      const hasIins = Boolean(instrument.iins);
      const issuers = instrument.issuers || [];
      const networks = instrument.networks || [];

      let hasTypes = Boolean(instrument.types);
      let types = instrument.types || [];
      if (instrument?.method?.includes('_card')) {
        //credit_card, debit_card
        hasTypes = true;
        // adds ['credit'] for credit and ['debit'] for debit
        types = [instrument.method.split('_')[0]];
      }

      // We don't have IIN for a saved card. So if we're requested to support only specific IINs, we can't show saved cards
      if (hasIins) {
        return false;
      }

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

  function getCardByTokenId(tokenId) {
    if (!$customer.tokens) {
      return;
    }
    if (!$customer.tokens.items) {
      return;
    }
    return _Arr.find($customer.tokens.items, (token) => token.id === tokenId);
  }

  $: {
    /**
     * If DCC is not enabled and cardCountry is not "IN" then call the flows api to check the address_required enabled
     */
    const iin = getIin($cardNumber);
    if (
      $cardCountry &&
      $cardCountry !== 'IN' &&
      !cardFlowsMap[iin] &&
      !isDCCEnabled()
    ) {
      let prop = { iin };
      if (currentView === Views.SAVED_CARDS && $selectedCard) {
        const tokenId = $selectedCard.id;
        prop = { tokenId };
      } else if (currentView === Views.HOME_SCREEN && $selectedInstrument) {
        const card = getCardByTokenId($selectedInstrument.token_id);
        if (card) {
          prop = { tokenId: card.id };
        }
      }

      getCurrencies(prop).then((currencyPayload) => {
        cardFlowsMap[iin] = true;
        let entity = null;
        if (prop) {
          entity = prop.iin || prop.tokenId || null;
        }
        AVSScreenMap.update((value) => ({
          ...value,
          [entity]: currencyPayload.avs_required,
        }));
      });
    }
  }

  let instrumentSubtext;
  $: {
    if (!$methodInstrument) {
      instrumentSubtext = undefined;
    } else if ($methodInstrument.method !== tab) {
      instrumentSubtext = undefined;
    } else {
      instrumentSubtext = getSubtextForInstrument($methodInstrument, $locale);
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

    const block = _Arr.find($blocks, (block) =>
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

    const transformed = transformTokens(tokenList);
    return addDowntimesToSavedCards(transformed, cardDowntimes);
  }

  function transformTokens(tokens) {
    return transform(tokens, {
      amount: session.get('amount'),
      emi: isMethodEnabled('emi'),
      recurring: isRecurring(),
    });
  }

  function filterSavedCardsForRecurring(tokens) {
    return _Arr.filter(tokens, (token) => token.recurring);
  }

  function filterSavedCardsForEmi(tokens) {
    return _Arr.filter(tokens, (token) => token.plans);
  }

  export function showLandingView() {
    return tick()
      .then(() => {
        let viewToSet = Views.ADD_CARD;

        if (savedCards && savedCards.length > 0 && isSavedCardsEnabled) {
          viewToSet = Views.SAVED_CARDS;
        }
        setView(viewToSet);
      })
      .then(tick);
  }

  export function showAddCardView() {
    Events.Track(CardEvents.HIDE_SAVED_CARDS);
    setView(Views.ADD_CARD);
  }

  let directlyOpenAVS = false;

  export function showAVSView(direct = false) {
    if (currentView === Views.SAVED_CARDS) {
      Events.Track(CardEvents.HIDE_SAVED_CARDS);
    } else {
      Events.Track(CardEvents.HIDE_ADD_CARD_SCREEN);
    }
    Events.Track(CardEvents.SHOW_AVS_SCREEN);
    const AVSData = get(AVSDccPayload);
    tabVisible = false;
    if (AVSData) {
      if (AVSData.header) {
        session.setRawAmountInHeader(AVSData.header);
        showAmount(AVSData.cta);
      } else if (!isPartialPayment()) {
        showCtaWithDefaultText();
        session.updateAmountInHeader(getAmount());
      }
    }
    directlyOpenAVS = direct;
    setView(Views.AVS);
  }

  export function showSavedCardsView() {
    Events.Track(CardEvents.SHOW_SAVED_CARDS);
    setView(Views.SAVED_CARDS);
  }

  function setView(view) {
    [lastView, currentView] = [currentView, view];
  }

  export function setSelectedApp(code) {
    Events.TrackBehav(CardEvents.APP_SELECT, {
      app: code,
    });
    $selectedApp = code;
    $selectedCard = null;
    $newCardInputFocused = false;
  }

  export function getPayload() {
    if ($selectedApp) {
      return getAppPayload();
    } else if (
      currentView === Views.ADD_CARD ||
      (currentView === Views.AVS && lastView === Views.ADD_CARD)
    ) {
      return getAddCardPayload();
    } else {
      return getSavedCardPayload();
    }
  }

  function getAppPayload() {
    // TODO: Keep this mapping stored somewhere else when we add another app.
    if ($selectedApp === 'google_pay') {
      return { method: 'app', provider: 'google_pay' };
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

  export function isOnAVSScreen() {
    return currentView === Views.AVS;
  }

  function getAddCardPayload() {
    const payload = {
      'card[number]': $cardNumber.replace(/ /g, ''),
      'card[expiry]': $cardExpiry,
      'card[cvv]': $cardCvv,
      'card[name]': $cardName,
      downtimeSeverity,
      downtimeInstrument,
    };
    // Fill in dummy values for expiry and CVV if the CVV and expiry fields are hidden
    if ($hideExpiryCvvFields) {
      payload['card[expiry]'] = '12 / 21';
      payload['card[cvv]'] = '000';
    }
    if ($remember && isSavedCardsEnabled) {
      payload.save = 1;
    }
    if ($showAuthTypeSelectionRadio) {
      payload.auth_type = $authType;
    }
    return payload;
  }

  function getSavedCardPayload() {
    const selectedToken = $selectedCard || {};
    let downtimeSeverity, downtimeInstrument;
    if (selectedToken.card) {
      downtimeSeverity = selectedToken.card.downtimeSeverity;
      downtimeInstrument = selectedToken.card.downtimeInstrument;
    }
    const payload = {
      token: selectedToken.token,
      'card[cvv]': $currentCvv,
      downtimeSeverity,
      downtimeInstrument,
    };
    if ($currentAuthType) {
      payload.auth_type = $currentAuthType;
    }
    if ($savedCardEmiDuration) {
      payload.emi_duration = $savedCardEmiDuration;
    }

    return payload;
  }

  function handleViewPlans(event) {
    Events.TrackBehav(CardEvents.EMI_PLAN_VIEW_SAVED_CARDS, {
      from: session.tab,
    });
    session.showEmiPlansForSavedCard(event.detail);
  }

  function onAddCardViewFocused() {
    $selectedApp = null;
    $newCardInputFocused = true;
  }

  let isCardSupportedForRecurring = false;
  let showRecurringCallout = false;
  $: {
    /**
     * recurring callout needs to be displayed when 3 conditions are met
     * a -> must be a recurring/subscription payment
     * b -> user focused in card input.
     * c -> card bin number is NOT supported for recurring payments (card's constants)
     *
     * note: b -> toggles on when user clicks on card input field, for subsequent interactions it remains toggled on.
     * note: c -> as user enters the card number, we switch it to false (#onCardInput),
     *            when card features are fetched from backend or cache,
     *            the issuer and type is compared with supported recurring BINS. (#checkCardSupportForRecurring)
     */
    showRecurringCallout =
      isRecurring() && $newCardInputFocused && !isCardSupportedForRecurring;
  }

  function checkCardSupportForRecurring(features) {
    const { issuer, type } = features;
    const issuerDetail = cardWithRecurringSupport[issuer];
    return Boolean(issuerDetail?.[type]);
  }

  function onCardInput() {
    const _cardNumber = $cardNumber;
    const cardType = getCardType(_cardNumber);
    const iin = getIin(_cardNumber);
    const sixDigits = _cardNumber.length > 5;
    const trimmedVal = _cardNumber.replace(/[ ]/g, '');
    const amexCard = isAmex($cardNumber);

    // Reset the card country if entering new card
    $cardCountry = '';

    $internationalCurrencyCalloutNeeded = amexCard && isInternational();
    isDowntime('network', cardType);
    if (sixDigits) {
      getCardFeatures(_cardNumber).then((features) => {
        if (iin !== getIin($cardNumber)) {
          // $cardNumber's IIN has changed since we started the n/w request, do nothing
          return;
        }

        if (features.country) {
          $cardCountry = features.country;
        }

        if (features?.issuer) {
          isDowntime('issuer', features.issuer);
        }

        let emiObj;

        const hasEmi = (features.flows || {}).emi;

        if (hasEmi) {
          let issuer = features.issuer;

          // Handle AMEX
          if (amexCard) {
            issuer = 'AMEX';
          }

          // Handle debit cards
          const type = features.type;

          if (type === 'debit') {
            issuer += '_DC';
          }

          emiObj = (getEMIBanks() || {})[issuer];
        }

        session.emiPlansForNewCard = emiObj;

        // No EMI plans available. Unset duration.
        if (!emiObj) {
          $newCardEmiDuration = '';
        }

        showAppropriateEmiDetailsForNewCard(
          session.tab,
          emiObj,
          trimmedVal.length
        );

        isCardSupportedForRecurring = checkCardSupportForRecurring(features);
      });
    } else {
      // Need six digits for EMI. Unset things.
      session.emiPlansForNewCard = undefined;
      $newCardEmiDuration = '';
      showAppropriateEmiDetailsForNewCard(session.tab, null, trimmedVal.length);
      isCardSupportedForRecurring = false;
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
    let eventName = '';
    const eventData = {
      from: session.tab,
    };

    if (emiCtaView === 'available' && isMethodUsable('emi')) {
      session.showEmiPlansForNewCard(e);
      eventName = CardEvents.VIEW_EMI_PLANS;
    } else if (emiCtaView === 'plans-available' && isMethodUsable('emi')) {
      session.showEmiPlansForNewCard(e);
      eventName = CardEvents.EDIT_EMI_PLANS;
    } else if (emiCtaView === 'pay-without-emi' && isMethodUsable('card')) {
      if (isMethodEnabled('card')) {
        session.setScreen('card');
        session.switchTab('card');
        showLandingView();
        eventName = CardEvents.PAY_WITHOUT_EMI;
      }
    } else if (emiCtaView === 'plans-unavailable' && isMethodUsable('card')) {
      if (isMethodEnabled('card')) {
        session.setScreen('card');
        session.switchTab('card');
        eventName = CardEvents.PAY_WITHOUT_EMI;
      }
    }

    Events.TrackBehav(eventName, eventData);
  }

  export function onShown() {
    tab = session.tab;
    onCardInput();
  }
  function isDowntime(instrument, value) {
    const currentDowntime = checkDowntime(cardDowntimes, instrument, value);
    if (currentDowntime) {
      downtime[instrument] = true;
      downtimeSeverity = currentDowntime;
      downtimeInstrument = value;
    } else {
      downtime[instrument] = false;
    }
    if (downtime.network || downtime.issuer) {
      downtimeVisible = true;
    } else {
      downtimeVisible = false;
    }
  }

  export function setTabVisible(status = true) {
    tabVisible = status;
  }

  function toggleAppListOnAddNewCard() {
    appsListExpandedOnAddNewCard = !appsListExpandedOnAddNewCard;
  }

  function toggleAppListOnSavedCard() {
    appsListExpandedOnSavedCard = !appsListExpandedOnSavedCard;
  }
</script>

<Tab method="card" pad={false} overrideMethodCheck>
  <Screen pad={false}>
    <div>
      {#if currentView === Views.ADD_CARD}
        <div in:fade={getAnimationOptions({ duration: 100, y: 100 })}>
          {#if showSavedCardsCta && !delayOTPExperiment}
            <div
              id="show-saved-cards"
              on:click={showSavedCardsView}
              class="text-btn left-card"
            >
              <div
                class="cardtype"
                class:multiple={savedCards && savedCards.length > 1}
                cardtype={lastSavedCard && lastSavedCard.card.networkCode}
              />
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

          {#if delayOTPExperiment && $isIndianCustomer}
            <!-- Show Trigger to use Saved Card -->
            <SavedCardCTA
              showSubTitle={!$customer.logged}
              on:click={() => {
                if ($customer.logged) {
                  showSavedCardsView();
                } else {
                  Events.Track(CardEvents.SHOW_SAVED_CARDS);
                  session.askOTPForSavedCard();
                }
              }}
            />
          {/if}

          {#if showRecurringCallout}
            <div
              class="pad"
              transition:fly={getAnimationOptions({ duration: 250, y: -10 })}
            >
              <RecurringCardsCallout />
            </div>
          {/if}

          <AddCardView
            {tab}
            faded={Boolean($selectedApp)}
            on:focus={onAddCardViewFocused}
            on:cardinput={onCardInput}
            {downtimeVisible}
            {downtimeSeverity}
            {downtimeInstrument}
            {delayOTPExperiment}
            {isCardSupportedForRecurring}
          />
          {#if showEmiCta}
            <EmiActions
              {showEmiCta}
              {emiCtaView}
              savedCount={allSavedCards.length}
              on:click={handleEmiCtaClick}
            />
          {/if}
          {#if showApps}
            <!-- LABEL: Pay with cards on other apps -->
            <ToggleHeading
              class="pad"
              on:click={toggleAppListOnAddNewCard}
              expanded={appsListExpandedOnAddNewCard}
            >
              {$t(CARDS_SAVED_ON_APPS_LABEL)}
            </ToggleHeading>
            {#if appsListExpandedOnAddNewCard}
              <div role="list" class="border-list">
                <AppInstruments
                  {apps}
                  selectedApp={$selectedApp}
                  on:select={(e) => setSelectedApp(e.detail)}
                />
              </div>
            {/if}
          {/if}
        </div>
      {:else if currentView === Views.AVS}
        <div id="avsContainer">
          <div class="avs-card-info">
            <div class="cardtype" cardtype={selectedCardNetwork} />
            <span class="card-info"
              >Card ending with <span class="last4">{last4}</span></span
            >
          </div>
          <div class="avs-title">
            {$t(AVS_HEADING)}
            <span
              on:click={() => {
                showAVSInfo = true;
              }}><Icon icon={icons.question} /></span
            >
          </div>
          <AvsForm direct={directlyOpenAVS} {lastView} />
          <Info
            bind:show={showAVSInfo}
            title={$t(AVS_INFO_TITLE)}
            data={AVSInfo}
          />
        </div>
      {:else}
        <div in:fade={getAnimationOptions({ duration: 100 })}>
          {#if shouldShowSubtext}
            <div class="pad instrument-subtext-description">
              {instrumentSubtext}
            </div>
          {/if}

          <!-- LABEL: Your saved cards -->
          <h3 class="pad">{$t(CARDS_SAVED_ON_RZP_LABEL)}</h3>
          <div id="saved-cards-container">
            <SavedCards
              {tab}
              cards={savedCards}
              on:viewPlans={handleViewPlans}
            />
          </div>
          <div
            id="show-add-card"
            class="text-btn left-card"
            on:click={showAddCardView}
          >
            <!-- LABEL: Add another card -->
            {$t(ADD_ANOTHER_CARD_BTN)}
          </div>

          {#if showApps}
            <!-- LABEL: Pay with cards on other apps -->
            <div class="apps-heading-container">
              <ToggleHeading
                class="pad"
                on:click={toggleAppListOnSavedCard}
                expanded={appsListExpandedOnSavedCard}
              >
                {$t(CARDS_SAVED_ON_APPS_LABEL)}
              </ToggleHeading>
            </div>
            {#if appsListExpandedOnSavedCard}
              <div role="list" class="border-list">
                <AppInstruments
                  {apps}
                  selectedApp={$selectedApp}
                  on:select={(e) => setSelectedApp(e.detail)}
                />
              </div>
            {/if}
          {/if}
        </div>
      {/if}
      {#if isShowMORTncEnabled() && $defaultDCCCurrency === 'USD'}
        <p class="pad">
          {$t(MERCHANT_OF_RECORD)}
          <a
            class="theme-highlight"
            href="https://razorpay.com/mor_terms/"
            target="_blank"
            rel="noopener"
          >
            {$t(DCC_TERMS_AND_CONDITIONS)}.
          </a>
        </p>
      {/if}
    </div>
    <Bottom tab="card">
      {#if isDCCEnabled()}
        <DynamicCurrencyView
          {tabVisible}
          view={$selectedApp
            ? Views.CARD_APP
            : currentView === Views.AVS
            ? lastView
            : currentView}
          isAVS={currentView === Views.AVS}
        />
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

  .instrument-subtext-description {
    margin: 12px 0;
  }

  .avs-card-info {
    height: 46px;
    display: flex;
    align-items: center;
    padding: 0 22px;
  }
  .avs-title {
    margin: 16px 24px 0;
    line-height: 1;
    display: flex;
  }

  .avs-title :global(svg) {
    height: 14px;
    width: 14px;
    cursor: pointer;
    margin-left: 4px;
  }

  .avs-card-info span.card-info {
    margin-left: 46px;
    font-size: 13px;
    color: #707070;
    line-height: 20px;
  }

  .avs-card-info span.last4 {
    font-weight: 600;
    color: #000;
  }

  .apps-heading-container {
    margin-top: 26px;
  }
</style>
