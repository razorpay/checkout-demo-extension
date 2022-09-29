<script lang="ts">
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
  import SavedCards from 'ui/tabs/card/SavedCards.svelte';
  import AppInstruments from 'ui/tabs/card/AppInstruments.svelte';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';
  import { getDowntimes, checkDowntime } from 'checkoutframe/downtimes';
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
    AVSBillingAddress,
    currentAuthType,
    selectedCardFromHome,
    defaultDCCCurrency,
    cardCountry,
    showSavedCardTooltip,
  } from 'checkoutstore/screens/card';

  import {
    methodInstrument,
    blocks,
    phone,
    selectedInstrument,
    isIndianCustomer,
  } from 'checkoutstore/screens/home';

  import { findCodeByNetworkName } from 'common/card';
  import { customer } from 'checkoutstore/customer';

  import {
    getAmount,
    isRecurring,
    getCardFeatures,
    isDynamicFeeBearer,
    isRedesignV15,
    isPartialPayment,
    hasFeature,
    isInternational,
    isDCCEnabled,
    getPrefillMethod,
    isOneClickCheckout,
    isEmiV2,
  } from 'razorpay';

  import { shouldRememberCustomer, tabStore } from 'checkoutstore';

  import {
    isMethodEnabled,
    getEMIBanks,
    isMethodUsable,
    getAppsForCards,
    getPayloadForCRED,
    isApplicationEnabled,
  } from 'checkoutstore/methods';

  import {
    newCardEmiDuration,
    savedCardEmiDuration,
    selectedPlanTextForNewCard,
    selectedPlanTextForSavedCard,
  } from 'checkoutstore/emi';
  import {
    isCurrentCardInvalidForEmi,
    isCurrentCardProviderInvalid,
  } from 'emiV2/store';
  // i18n
  import { t, locale } from 'svelte-i18n';
  import { fly } from 'svelte/transition';

  import {
    USE_SAVED_CARDS_BTN,
    USE_SAVED_CARDS_ON_RZP_BTN,
    CARDS_SAVED_ON_APPS_LABEL,
    CARDS_SAVED_ON_RZP_LABEL,
    CARD_SAVED_ON_RZP_LABEL_REDESIGN,
    ADD_ANOTHER_CARD_BTN,
    RECURRING_CALLOUT,
    SUBSCRIPTION_CALLOUT,
    SUBSCRIPTION_REFUND_CALLOUT,
    AVS_INFO_TITLE,
    AVS_HEADING,
    AVS_INFO_MESSAGE_1,
    AVS_INFO_MESSAGE_2,
    AVS_INFO_MESSAGE_3,
    CARDS_SAVED_LABEL_ONE_CC,
  } from 'ui/labels/card';
  import {
    CTA_PROCEED,
    PAY_NOW_CTA_LABEL,
    SELECT_EMI_PLAN_LABEL,
  } from 'cta/i18n';

  import { MERCHANT_OF_RECORD, DCC_TERMS_AND_CONDITIONS } from 'ui/labels/dcc';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { getSavedCards, transform } from 'common/token';
  import { Events, CardEvents, MetaProperties } from 'analytics/index';
  import {
    sortBasedOnTokenization,
    shouldShowTnc,
    isSIHubEnabledMerchant,
  } from 'ui/tabs/card/utils';

  import {
    getIin,
    getCardType,
    isAmex,
    addDowntimesToSavedCards,
    injectSiftScript,
    injectCyberSourceScript,
  } from 'common/card';
  import { getSubtextForInstrument } from 'subtext';
  import { getProvider as getAppProvider, getAppsForMethod } from 'common/apps';
  import { getAnimationOptions } from 'svelte-utils';

  // Transitions
  import { fade } from 'svelte/transition';
  import { BillingAddressVerificationForm } from 'ui/components/BillingAddressVerificationForm';
  import CTA, { showAmount, showCta, showCtaWithDefaultText } from 'cta';
  import Icon from 'ui/elements/Icon.svelte';
  import Info from 'ui/elements/Info.svelte';
  import { Views, cardWithRecurringSupport, AVS_COUNTRIES } from './constant';

  let AVSInfo: Array<{ icon: string; label: string }> = [];
  // experiments
  import {
    delayLoginOTPExperiment,
    getIntSelectedCardTokenId,
    fetchAVSFlagForCard,
    updateAVSFormDataForCardView,
    setAVSBillingAddressData,
  } from 'card/helper';
  import { addCardView } from 'checkoutstore/dynamicfee';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { pushOverlay } from 'navstack';
  import type { EMIPayload } from 'emiV2/types';
  import { PAY_FULL_AMOUNT, PAY_VIA_EMI } from 'ui/labels/bajaj-emi';
  import { TRY_ANOTHER_EMI_OPTION } from 'ui/labels/debit-emi';
  import { isEmiContactValid } from 'emiV2/ui/components/EmiTabsScreen/store';
  import { selectedTab } from 'components/Tabs/tabStore';
  import { CardsTracker } from 'card/analytics/events';

  let delayOTPExperiment: boolean;
  let cardEle: Element;
  let AVSRequired: boolean;
  let ctaLabel = PAY_NOW_CTA_LABEL;
  let isAddNewCardFormValid = false;
  let isSavedCardFormValid = false;
  let checkFormErrors: () => void;
  let onSubmit: any;

  const apps = getAppsForCards().map((code) => getAppProvider(code));
  const appsAvailable = apps.length;
  const isRedesignV15Enabled = isRedesignV15();

  const session = getSession();
  const themeMeta = getThemeMeta();
  const icons = themeMeta.icons;
  let isSavedCardsEnabled = shouldRememberCustomer();

  $: {
    delayOTPExperiment = delayLoginOTPExperiment() && $customer?.haveSavedCard;
  }

  $: {
    // CTA for new EMI flow
    // If entered card is invalid for emi
    if (isNewEmiFlow && session.tab === 'emi') {
      if ($isCurrentCardInvalidForEmi) {
        ctaLabel = PAY_FULL_AMOUNT;
      } else if ($isCurrentCardProviderInvalid) {
        ctaLabel = TRY_ANOTHER_EMI_OPTION;
      } else {
        ctaLabel = PAY_VIA_EMI;
      }
    } else if (AVSRequired && currentView !== Views.AVS) {
      /**
       * handling DCC & AVS case
       */
      ctaLabel = CTA_PROCEED;
      onSubmit = undefined; // reset to default action
    } else if (currentView === Views.AVS) {
      onSubmit = () => {
        checkFormErrors();
        tick().then(() => {
          session.preSubmit();
        });
      };
      ctaLabel = PAY_NOW_CTA_LABEL;
    } else {
      onSubmit = undefined;
      ctaLabel =
        !isNewEmiFlow &&
        $tabStore === 'emi' &&
        ((currentView !== Views.SAVED_CARDS &&
          session.emiPlansForNewCard &&
          !$selectedPlanTextForNewCard) ||
          (currentView === Views.SAVED_CARDS && !$selectedPlanTextForSavedCard))
          ? SELECT_EMI_PLAN_LABEL
          : PAY_NOW_CTA_LABEL;
    }
  }

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

  function showAVSInfo() {
    pushOverlay({
      component: Info,
      props: {
        title: $t(AVS_INFO_TITLE),
        data: AVSInfo,
      },
    });
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

  $: showTnC = shouldShowTnc($defaultDCCCurrency, $cardCountry);

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
      $selectedApp = null;
    } else {
      userWantsApps = true;
    }
  }

  let tab = session.tab;
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
   * cardAVSFlowsMap is being used to store the AVS flag fetched for the selected cards.
   */
  let cardAVSFlowsMap = {};

  function isSiftJSEnabled() {
    return hasFeature('disable_sift_js', false) !== true;
  }

  const isNewEmiFlow = isEmiV2();

  onMount(() => {
    // Prefill
    $cardNumber = session.get('prefill.card[number]') || '';
    $cardExpiry = session.get('prefill.card[expiry]') || '';
    $cardName = session.get('prefill.name') || '';
    $cardCvv = session.get('prefill.card[cvv]') || '';

    if (getPrefillMethod() === 'card') {
      if (isApplicationEnabled(session.get('prefill.provider'))) {
        setSelectedApp(session.get('prefill.provider'));
      }
    }

    phone.subscribe(() => {
      isSavedCardsEnabled = shouldRememberCustomer();
    });

    if (isInternational() && session.r.isLiveMode()) {
      if (isSiftJSEnabled()) {
        // load sift js
        injectSiftScript(session.id);
      }

      // load cyber source js
      injectCyberSourceScript(session.id);
    }

    if (isNewEmiFlow && emiPayload) {
      showLandingView();
    }

    const unbsubscribe = defaultDCCCurrency.subscribe((currency) => {
      if (currency && currency !== 'INR' && session.r.isLiveMode()) {
        if (isSiftJSEnabled()) {
          injectSiftScript(session.id);
        }
        injectCyberSourceScript(session.id);
      }
    });

    return unbsubscribe;
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

      /**
       * a. newCardInputFocused determines if supported cards
       *    for recurring callout will be visible or not
       * b. It is also dependant on the flag isCardSupportedForRecurring
       * c. For all the other payments except recurring keeping as is.
       */
      $newCardInputFocused = isRecurring()
        ? !isCardSupportedForRecurring
        : false;
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
    if (!isNewEmiFlow) {
      $selectedCard = null; // De-select saved card
    }
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

    const eligibleTokens = tokens.filter((token) => {
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
        ? issuers.includes(token.card.issuer)
        : true;

      const networkMatches = hasNetworks
        ? networks.includes(token.card.network)
        : true;

      const typeMatches = hasTypes ? types.includes(token.card.type) : true;

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

    savedCards = sortBasedOnTokenization(_savedCards);
  }

  $: {
    lastSavedCard = savedCards && savedCards[savedCards.length - 1];
  }

  $: {
    /**
     * For saved cards check cardCountry is not "IN" then call the flows api to check the address_required enabled
     */

    const tokenId = getIntSelectedCardTokenId({
      tokens: get(customer)?.tokens,
      currentView,
      selectedCard: $selectedCard,
      selectedInstrument: $selectedInstrument,
    });

    if (tokenId && !cardAVSFlowsMap[tokenId] && !isDCCEnabled()) {
      fetchAVSFlagForCard({ tokenId });
      cardAVSFlowsMap[tokenId] = 1;
    }
  }

  $: {
    /**
     * If DCC is not enabled and cardCountry is not "IN" then call the flows api to check the address_required enabled
     */
    // get IIN for new card
    const iin = getIin($cardNumber);

    if (
      iin &&
      !cardAVSFlowsMap[iin] &&
      $cardCountry &&
      $cardCountry !== 'IN' &&
      !isDCCEnabled()
    ) {
      fetchAVSFlagForCard({ iin });
      cardAVSFlowsMap[iin] = 1;
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

    const block = $blocks.find((block) =>
      block.instruments.includes($methodInstrument)
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
    return tokens.filter((token) => token.recurring);
  }

  function filterSavedCardsForEmi(tokens) {
    return tokens.filter((token) => token.plans);
  }

  export function showLandingView(source = '') {
    return tick()
      .then(() => {
        let viewToSet = Views.ADD_CARD;
        // if the add card screen is rendered from new emi flow
        // or if user clicked on 'Pay Full Amount' in emi flow -> if source arguement is emi
        // we need to change the view to add card
        if ((isNewEmiFlow && tab === 'emi') || source === 'emi') {
          viewToSet = Views.ADD_CARD;
        } else if (savedCards && savedCards.length > 0 && isSavedCardsEnabled) {
          viewToSet = Views.SAVED_CARDS;
        }
        setView(viewToSet);
      })
      .then(tick);
  }

  export function showAddCardView() {
    /**
     * IMPORTANT NOTE
     * Need to set showSavedCardTooltip to false right before showing
     * Add card screen. Please don't change the order
     */
    $showSavedCardTooltip = false;
    Events.Track(CardEvents.HIDE_SAVED_CARDS);
    setView(Views.ADD_CARD);
  }

  let directlyOpenAVS = false;

  $: {
    updateAVSFormDataForCardView({
      lastView,
      direct: directlyOpenAVS,
      selectedCard: $selectedCard,
      selectedCardFromHome: $selectedCardFromHome,
    });
  }

  function handleAVSFormInput(evt: CustomEvent<any>) {
    setAVSBillingAddressData(evt.detail);
  }

  /**
   * Filter AVS countries to show in AVS form
   * @param countries
   */
  function filterCountries(
    countries: { key: string; label: string; type: string }[]
  ) {
    return countries.filter((country) => AVS_COUNTRIES.includes(country.key));
  }

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
    $addCardView = view;
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
    }
    return getSavedCardPayload();
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

  export function isOnAddCardScreen() {
    return currentView === Views.ADD_CARD;
  }

  export function isOnSavedCardsScreen() {
    return currentView === Views.SAVED_CARDS;
  }

  export function isOnAVSScreen() {
    return currentView === Views.AVS;
  }

  export function getAVSPayload(selectedInstrument: any) {
    const isAVSScreen = isOnAVSScreen() || false;
    const isAVSScreenFromHomeScreen =
      selectedInstrument &&
      selectedInstrument.method === 'card' &&
      selectedInstrument.token_id &&
      isAVSScreen;

    return {
      isOnAVSScreen: isAVSScreen,
      isAVSScreenFromHomeScreen: isAVSScreenFromHomeScreen,
    };
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
     * a -> user must be domestic user
     * b -> must be a recurring/subscription payment
     * c -> SI-HUB should not be enabled
     * d -> user focused in card input.
     * e -> card bin number is NOT supported for recurring payments (card's constants)
     *
     * note: b -> toggles on when user clicks on card input field, for subsequent interactions it remains toggled on.
     * note: c -> as user enters the card number, we switch it to false (#onCardInput),
     *            when card features are fetched from backend or cache,
     *            the issuer and type is compared with supported recurring BINS. (#checkCardSupportForRecurring)
     */
    showRecurringCallout =
      $isIndianCustomer &&
      isRecurring() &&
      !isSIHubEnabledMerchant() &&
      $newCardInputFocused &&
      !isCardSupportedForRecurring;
  }

  function checkCardSupportForRecurring(features) {
    // For non domestic users don't need to check support
    if (!$isIndianCustomer) {
      return true;
    }
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
      getCardFeatures(_cardNumber)
        .then((features) => {
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
        })
        .catch(() => {
          console.error('Unable to fetch card features/meta');
        });
    } else {
      // Need six digits for EMI. Unset things.
      session.emiPlansForNewCard = undefined;
      $newCardEmiDuration = '';
      showAppropriateEmiDetailsForNewCard(session.tab, null, trimmedVal.length);
      isCardSupportedForRecurring = false;
    }
  }

  // If entered card is not supported for EMI
  // Change the CTA label
  let isCardInvalid = false;
  const onCardError = (e) => {
    const { detail } = e;
    if (isNewEmiFlow && session.tab === 'emi') {
      isCardInvalid = detail.inValid;
    }
  };

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
    } else if (tab === 'emi' && !isNewEmiFlow) {
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
    //#region cards-tokenization
    /**
     * this is a hack to trigger auto-select logic only if the saved-cards are in view ( no-impact on functionality)
     */
    $selectedCard = null;
    //#endregion
    tab = session.tab;
    onCardInput();
    showCta();
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
      downtimeSeverity = null;
      downtimeInstrument = null;
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

  $: {
    if (tabVisible) {
      if (currentView === Views.ADD_CARD) {
        Events.TrackRender(CardEvents.ADD_CARD_SCREEN_RENDERED);
        CardsTracker.GEN_ADD_NEW_CARD_SCREEN();
      } else if (
        currentView === Views.SAVED_CARDS &&
        isSavedCardsEnabled &&
        savedCards.length
      ) {
        Events.TrackRender(CardEvents.SAVED_CARD_SCREEN_RENDERED);
        CardsTracker.GEN_SAVED_CARD_SCREEN({ savedCards: savedCards.length });
      }
    }
  }

  export let emiPayload: EMIPayload;
  // using this prop if we are rendering card screen from navstack
  export let isRenderedByNavstack = false;

  let showCardTab = false;
  $: showCardTab = isNewEmiFlow && tab === 'emi';
</script>

<Tab method="card" pad={false} shown={isRenderedByNavstack} overrideMethodCheck>
  <Screen pad={false}>
    <div bind:this={cardEle} class:screen-one-cc={isRedesignV15Enabled}>
      {#if currentView === Views.ADD_CARD}
        <div in:fade={getAnimationOptions({ duration: 100, y: 100 })}>
          {#if showSavedCardsCta && !delayOTPExperiment && !showCardTab}
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
            bind:isFormValid={isAddNewCardFormValid}
            {emiPayload}
            faded={Boolean($selectedApp)}
            on:focus={onAddCardViewFocused}
            on:cardinput={onCardInput}
            on:error={onCardError}
            {downtimeVisible}
            {downtimeSeverity}
            {downtimeInstrument}
            {delayOTPExperiment}
            {isCardSupportedForRecurring}
            {cardEle}
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
                showAVSInfo();
              }}><Icon icon={icons.question} /></span
            >
          </div>
          <BillingAddressVerificationForm
            {filterCountries}
            bind:checkFormErrors
            value={$AVSBillingAddress}
            on:input={handleAVSFormInput}
            on:blur={handleAVSFormInput}
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
          <h3 class:saved-card-header={isRedesignV15Enabled} class="pad">
            {#if isOneClickCheckout()}
              {$t(CARDS_SAVED_LABEL_ONE_CC)}
            {:else if isRedesignV15Enabled}
              {$t(CARD_SAVED_ON_RZP_LABEL_REDESIGN)}
            {:else}
              {$t(CARDS_SAVED_ON_RZP_LABEL)}
            {/if}
          </h3>
          <div id="saved-cards-container">
            <SavedCards
              {tab}
              cards={savedCards}
              bind:isFormValid={isSavedCardFormValid}
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
      {#if showTnC}
        <p class="pad tnc">
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
      {#if isDCCEnabled() && !isDynamicFeeBearer()}
        <DynamicCurrencyView
          bind:AVSRequired
          {tabVisible}
          view={$selectedApp
            ? Views.CARD_APP
            : currentView === Views.AVS
            ? lastView
            : currentView}
          isAVS={currentView === Views.AVS}
        />
      {/if}
      {#if isRecurring() && currentView !== Views.ADD_CARD}
        <Callout classes={['recurring-callout']}>
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
    <CTA
      screen="card"
      tab={$tabStore}
      disabled={(currentView === Views.ADD_CARD &&
        !isAddNewCardFormValid &&
        !$selectedApp) ||
        (currentView === Views.SAVED_CARDS &&
          !isSavedCardFormValid &&
          !$selectedApp) ||
        (!$isEmiContactValid &&
        $isCurrentCardInvalidForEmi &&
        $isCurrentCardProviderInvalid &&
        isNewEmiFlow &&
        $selectedTab === 'debit'
          ? true
          : false)}
      show
      showAmount
      {onSubmit}
      label={ctaLabel}
    />
  </Screen>
</Tab>

<style lang="scss">
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

  :global(.redesign) #show-saved-cards {
    padding-top: 20px;
    text-transform: initial;
    font-size: 13px;
  }

  .instrument-subtext-description {
    margin: 12px 0;
  }

  .avs-card-info {
    height: 46px;
    display: flex;
    align-items: center;
    padding: 0 1rem;
  }
  .avs-title {
    margin: 0.5rem 1rem;
    line-height: 1;
    display: flex;
  }

  :global(.redesign) {
    .avs-title {
      margin: 1.5rem 1rem;
    }

    .tnc {
      font-size: 12px;
    }
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
  .screen-one-cc {
    min-height: 100%;
  }

  .saved-card-header {
    font-weight: 600;
    font-size: 14px;
    color: var(--primary-text-color);
    text-transform: none;
    margin-top: 26px;
  }

  :global(.redesign) {
    #show-add-card {
      text-transform: initial;
      font-size: 13px;
      font-weight: 500;

      &::before {
        background: #ffffff;
        border: 1px solid #263a4a;
        box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.04);
        border-radius: 2px;
      }
    }

    .saved-card-header {
      margin-top: 16px;
    }
  }
</style>
