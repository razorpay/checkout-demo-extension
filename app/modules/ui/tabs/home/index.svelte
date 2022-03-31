<script>
  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import CTAOneCC from 'one_click_checkout/cta/index.svelte';
  import { updateActionAreaContentAndCTA } from 'handlers/common';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import NewMethodsList from 'ui/tabs/home/NewMethodsList.svelte';
  import PaymentDetails from 'ui/tabs/home/PaymentDetails.svelte';
  import CardOffer from 'ui/elements/CardOffer.svelte';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';
  import TrustedBadge from 'trusted-badge/ui/component/TrustedBadge.svelte';
  import SecuredMessage from 'ui/components/SecuredMessage.svelte';
  import { getAvailableMethods } from 'ui/tabs/home/helpers';
  import { isScrollableElement } from 'one_click_checkout/helper';
  import {
    showToast,
    TOAST_THEME,
    TOAST_SCREEN,
  } from 'one_click_checkout/Toast';

  import { HOME_VIEWS } from './constants';

  // Svelte imports
  import { onMount, tick } from 'svelte';
  import { slide, fly } from 'svelte/transition';

  // Store
  import {
    country,
    phone,
    contact,
    isContactPresent,
    email,
    selectedInstrumentId,
    multiTpvOption,
    partialPaymentAmount,
    partialPaymentOption,
    setContact,
    setEmail,
    upiIntentInstrumentsForAnalytics,
  } from 'checkoutstore/screens/home';
  import { activeRoute } from 'one_click_checkout/routing/store';

  import { customer } from 'checkoutstore/customer';
  import { getOption, isOneClickCheckout } from 'razorpay';
  import {
    merchantAnalytics,
    merchantFBStandardAnalytics,
  } from 'one_click_checkout/merchant-analytics';
  import {
    isDCCEnabled,
    isDynamicFeeBearer,
    isIndianCustomer,
  } from 'checkoutstore';
  import {
    isCodAddedToAmount,
    codChargeAmount,
    shippingCharge,
    isShippingAddedToAmount,
  } from 'one_click_checkout/charges/store';

  import { getUPIIntentApps } from 'checkoutstore/native';
  import { showOffers as showMethodOffers } from 'checkoutstore/offers';

  // i18n
  import {
    PARTIAL_AMOUNT_EDIT_LABEL,
    PARTIAL_AMOUNT_STATUS_FULL,
    PARTIAL_AMOUNT_STATUS_PARTIAL,
    TPV_METHODS_NOT_AVAILABLE,
  } from 'ui/labels/home';
  import { t, locale } from 'svelte-i18n';

  // Utils imports
  import Razorpay from 'common/Razorpay';
  import { getSession } from 'sessionmanager';
  import { isAddressEnabled, getMerchantConfig } from 'checkoutstore';

  import {
    isPartialPayment as getIsPartialPayment,
    isRecurring,
    isContactEmailReadOnly,
    isContactOptional,
    isContactEmailHidden,
    getPrefilledContact,
    getPrefilledEmail,
    isEmailOptional,
    isContactEmailOptional,
    getMerchantOffers,
  } from 'razorpay';

  import {
    getSingleMethod,
    isEMandateBankEnabled,
    getTPV,
    isMethodEnabled,
  } from 'checkoutstore/methods';

  import { isCodAvailable } from 'one_click_checkout/address/derived';
  import { codReason } from 'one_click_checkout/address/shipping_address/store';
  import {
    getInstrumentsForCustomer,
    getAllInstrumentsForCustomer,
  } from 'checkoutframe/personalization';

  import {
    hideCta,
    showAuthenticate,
    showPayViaSingleMethod,
    showProceed,
    showNext,
  } from 'checkoutstore/cta';

  import {
    P13NEvents,
    OrderEvents,
    Events,
    HomeEvents,
    MetaProperties,
    MiscEvents,
  } from 'analytics';
  import { intentVpaPrefill } from 'checkoutstore/screens/upi';

  import updateScore from 'analytics/checkoutScore';
  import {
    trackUpiIntentInstrumentSelected,
    trackUpiIntentInstrumentAvailable,
  } from 'analytics/highlightUpiIntentAnalytics';

  import { getCardOffer, hasOffersOnHomescreen } from 'checkoutframe/offers';
  import { getMethodNameForPaymentOption } from 'checkoutframe/paymentmethods';
  import { isInstrumentGrouped } from 'configurability/instruments';
  import { isElementCompletelyVisibleInTab } from 'lib/utils';

  import {
    CONTACT_REGEX,
    EMAIL_REGEX,
    PHONE_REGEX_INDIA,
  } from 'common/constants';
  import { getAnimationOptions } from 'svelte-utils';

  import { setBlocks } from 'ui/tabs/home/instruments';

  import {
    isInternationalInPreferredInstrument,
    getInternationalProviderName,
    updateInternationalProviders,
  } from 'ui/tabs/international/helper';

  import { update as updateContactStorage } from 'checkoutframe/contact-storage';
  import { isMobile } from 'common/useragent';
  import { remember } from 'checkoutstore/screens/card';

  import { formatTemplateWithLocale } from 'i18n';
  import UserDetailsStrip from 'ui/components/UserDetailsStrip.svelte';
  import { COD_EVENTS, HOME_EVENTS } from 'analytics/home/events';
  import {
    ACTIONS,
    CATEGORIES,
  } from 'one_click_checkout/merchant-analytics/constant';
  import { DCC_VIEW_FOR_PROVIDERS } from 'ui/tabs/international/constants';
  import {
    PAY_NOW_CTA_LABEL,
    PLACE_ORDER_CTA_LABEL,
  } from 'one_click_checkout/cta/i18n';
  import { headerVisible } from 'one_click_checkout/header/store';

  const cardOffer = getCardOffer();
  const session = getSession();
  const singleMethod = getSingleMethod();

  let selectedMethod = '';
  let showHome = false;
  let renderCtaOneCC = false;
  let ctaOneCCDisabled = true;
  let methodEle;
  let scrollable;

  // TPV
  const tpv = getTPV();

  validateTPVOrder(tpv);

  // Offers
  const showOffers = hasOffersOnHomescreen();

  // Recurring callout
  const showRecurringCallout =
    isRecurring() && session.tab !== 'emandate' && singleMethod === 'card';

  const prefilledBank = getOption('prefill.bank');
  const isPartialPayment = getIsPartialPayment();
  const contactEmailReadonly = isContactEmailReadOnly();
  const isOneCCEnabled = isOneClickCheckout();

  let expSourceSet = false;

  let dccView = 'home-screen';

  setContact(getPrefilledContact());
  setEmail(getPrefilledEmail());

  // Prop that decides which view to show.
  // Values: 'details', 'methods'
  let view = HOME_VIEWS.DETAILS;
  let showSecuredByMessage;
  $: showSecuredByMessage =
    view === HOME_VIEWS.DETAILS &&
    !showOffers &&
    !showRecurringCallout &&
    !tpv &&
    !isPartialPayment &&
    !session.get('address');

  export function showMethods() {
    view = HOME_VIEWS.METHODS;

    onShown();

    Events.TrackBehav(HomeEvents.METHODS_SHOWN);
  }

  export function canGoBack() {
    if (!onMethodsScreen()) {
      return false;
    }

    if (isPartialPayment) {
      return true;
    }

    if (isAddressEnabled()) {
      return true;
    }

    if (tpv) {
      return true;
    }

    /**
     * If contact and email are hidden,
     * there's nothing left on the details
     * screen anymore.
     */
    if (isContactEmailHidden()) {
      return false;
    }

    return true;
  }

  function setTpvError() {
    Events.TrackMetric(OrderEvents.INVALID_TPV, tpv);
    session.showLoadError($t(TPV_METHODS_NOT_AVAILABLE), true);
    updateActionAreaContentAndCTA(session, 'OK', null, true);
  }

  // Same functionality has to reused at pre-submit,
  // hence wrapping here as it can be called in sessionjs as well
  export function validateTPVOrder(tpv, immediate = false) {
    if (tpv && tpv.invalid) {
      if (immediate) {
        setTpvError();
      } else {
        tick().then(setTpvError);
      }
    }
    return;
  }

  export function getSelectedTPVOrderMethod() {
    if (tpv && !tpv.invalid) {
      return tpv.method || $multiTpvOption;
    }
    return null;
  }

  export function hideMethods() {
    const active = document.activeElement;
    if (active) {
      active.blur();
    }

    view = HOME_VIEWS.DETAILS;

    // Reset DCC component
    dccView = 'home-screen';

    setDetailsCta();

    Events.TrackBehav(HomeEvents.METHODS_HIDE);
  }

  function editUserDetails() {
    Razorpay.sendMessage({
      event: 'event',
      data: {
        event: 'user_details.edit',
      },
    });

    hideMethods();
  }

  export function setDetailsCta() {
    if (isPartialPayment) {
      showNext('Next');

      return;
    }

    if (!session.get('amount')) {
      showAuthenticate();
    } else if (singleMethod) {
      showPayViaSingleMethod(
        getMethodNameForPaymentOption(singleMethod, $locale)
      );
    } else if (tpv) {
      showPayViaSingleMethod(
        getMethodNameForPaymentOption(tpv.method || $multiTpvOption, $locale)
      );
    } else {
      showProceed('Proceed');
    }
  }

  $: {
    if ($multiTpvOption) {
      setDetailsCta();
    }
  }

  /**
   * On mobile, hover is sticky and so
   * the hover styles stay even after clicking a button.
   *
   * We add a class `touchfix` that removes the hover styles.
   * We don't need to remove the class because the element
   * will be unmounted.
   *
   * Cannot use Svelte class directive since that won't
   * update a component that's being unmounted from the DOM.
   */
  function touchfix(node, { event = 'click' } = {}) {
    node.addEventListener(event, () => {
      _El.addClass(node, 'touchfix');
    });
  }

  export function onMethodsScreen() {
    return view === HOME_VIEWS.METHODS;
  }

  export function onDetailsScreen() {
    return view === HOME_VIEWS.DETAILS;
  }

  export function setView(passedView) {
    view = passedView;
  }

  /**
   * this object is a key/value pair of contact and p13n data
   * contact key contains the contact number and login status. [0]
   * value is p13n information which contains
   * {
   *   source: 'api' | 'storage' => depending on randomness, the source for p13 will differ
   *   instruments: list of instruments to be shown
   *   experiment : one of EXPERIMENT_IDENTIFIERS
   * }
   *
   * [0] ->  key is a combination of contact and login status because p13n instruments differ based on
   * whether customer is logged in or not. When a customer is logged in p13n block needs to be updated
   * If we don't split these 2 states as separate keys, i.e. by keeping only contact as key,
   * it will be a CACHE HIT and p13n block will not be updated when user state is switched to logged in and vice-versa.
   *
   */
  const USER_EXPERIMENT_CACHE = {};

  /**
   * For A/B testing, check if both api and localstorage instruments are present
   * - if either one is missing, choose the other
   * - if both are present, choose one randomly
   */
  function getRandomInstrumentSet({
    customer: _customer,
    instrumentsFromStorage,
  }) {
    const cacheKey = `${_customer.contact}_${
      _customer.logged ? 'LOGGED_IN' : 'LOGGED_OUT'
    }`;

    if (!USER_EXPERIMENT_CACHE[cacheKey]) {
      USER_EXPERIMENT_CACHE[cacheKey] = new Promise((resolve) => {
        const instrumentMap = {
          api: [],
          storage: instrumentsFromStorage,
          none: [],
        };

        const EXPERIMENT_IDENTIFIERS = {
          BOTH_AVAILABLE_STORAGE_SHOWN: 1,
          BOTH_AVAILABLE_API_SHOWN: 2,
          API_AVAILABLE_API_SHOWN: 3,
          API_AVAILABLE_NONE_SHOWN: 4,
          NONE_AVAILABLE: 5,
        };

        const SOURCES = {
          STORAGE: 'storage',
          API: 'api',
          NONE: 'none',
        };

        let instrumentsSource;
        let userIdentified = true;

        // First figure out which source to attempt using
        if (instrumentsFromStorage.length) {
          if (Math.random() < 0.5) {
            instrumentsSource = SOURCES.STORAGE;
          } else {
            instrumentsSource = SOURCES.API;
          }
        } else {
          instrumentsSource = SOURCES.API;
        }

        // The function that returns the promise to be returned
        // This promise should set the experiment identifier
        // and any analytics meta properties
        const returnPromise = (source) =>
          new Promise((resolve) => {
            let instrumentsToBeShown = instrumentMap[source];

            let experimentIdentifier;

            if (source === SOURCES.STORAGE) {
              experimentIdentifier =
                EXPERIMENT_IDENTIFIERS.BOTH_AVAILABLE_STORAGE_SHOWN;
            } else if (source === SOURCES.API) {
              if (instrumentMap.storage.length) {
                experimentIdentifier =
                  EXPERIMENT_IDENTIFIERS.BOTH_AVAILABLE_API_SHOWN;
              } else {
                experimentIdentifier =
                  EXPERIMENT_IDENTIFIERS.API_AVAILABLE_API_SHOWN;
              }
            } else {
              if (instrumentMap.api.length) {
                experimentIdentifier =
                  EXPERIMENT_IDENTIFIERS.API_AVAILABLE_NONE_SHOWN;
              } else {
                experimentIdentifier = EXPERIMENT_IDENTIFIERS.NONE_AVAILABLE;
              }
            }

            // if user is in home, track the currently visible experiment
            if (!session.tab) {
              /**
               * - `meta.p13n` will only be set when preferred methods are shown in the UI.
               * - `p13n:instruments:list` will be fired when we attempt to show the list.
               * - `p13n:instruments:list` with `meta.p13n` set as true will tell you whether or not preferred methods were shown.
               */

              // meta.p13n should always be set before `p13n:instruments:list`
              if (instrumentsToBeShown && instrumentsToBeShown.length) {
                Events.setMeta(MetaProperties.P13N, true);
              } else {
                Events.removeMeta(MetaProperties.P13N);
              }

              Events.setMeta(
                MetaProperties.P13N_USERIDENTIFIED,
                userIdentified
              );
              expSourceSet = source;
              Events.TrackMetric(HomeEvents.P13N_EXPERIMENT, {
                source,
                experiment: experimentIdentifier,
              });

              Events.setMeta(
                MetaProperties.P13N_EXPERIMENT,
                experimentIdentifier
              );
            }

            // Cache for user
            const p13nRenderData = {
              source: source,
              instruments: instrumentsToBeShown,
              experiment: experimentIdentifier,
            };

            USER_EXPERIMENT_CACHE[cacheKey] = p13nRenderData;

            resolve(USER_EXPERIMENT_CACHE[cacheKey]);
          });

        // if source is api, we need to fetch api instruments and then
        // re-set the source
        if (
          instrumentsSource === SOURCES.API ||
          instrumentsSource === SOURCES.NONE
        ) {
          getInstrumentsForCustomer(
            $customer,
            {
              upiApps: getUPIIntentApps().filtered,
            },
            'api'
          ).then(({ identified, instruments: instrumentsFromApi }) => {
            userIdentified = identified;

            if (instrumentsFromApi.length) {
              instrumentMap.api = instrumentsFromApi;
            }

            resolve(returnPromise(instrumentsSource));
          });
        } else {
          resolve(returnPromise(instrumentsSource));
        }
      });
    }

    return USER_EXPERIMENT_CACHE[cacheKey];
  }

  function getAllAvailableP13nInstruments() {
    return getInstrumentsForCustomer(
      $customer,
      {
        upiApps: getUPIIntentApps().filtered,
      },
      'storage'
    ).then(({ instruments: instrumentsFromStorage }) => {
      return getRandomInstrumentSet({
        instrumentsFromStorage,
        customer: $customer,
      });
    });
  }

  // NOTE: updateBlocks is called multiple times (while showing loading, updating actual instrument)
  // but the analytics should be sent only once (when the preferred instruments displayed changes)
  // so maintaining a store with last updated vpas that updates only when the value changes
  function sendHighlightUpiIntentInstrumentAnalytics(preferredInstruments) {
    if (
      Array.isArray(preferredInstruments) &&
      preferredInstruments.length > 0
    ) {
      let upiIntentInstrumentForDesktop = preferredInstruments
        .map((instrument) => instrument.vendor_vpa)
        .filter((instrument) => !!instrument);

      if (
        Array.isArray($upiIntentInstrumentsForAnalytics) &&
        $upiIntentInstrumentsForAnalytics.toString() !==
          upiIntentInstrumentForDesktop.toString()
      ) {
        $upiIntentInstrumentsForAnalytics =
          upiIntentInstrumentForDesktop.slice();
        trackUpiIntentInstrumentAvailable(upiIntentInstrumentForDesktop);
      }
    }
  }

  function updateBlocks({
    preferredInstruments = [],
    showPreferredLoader = false,
  } = {}) {
    const isPersonalizationEnabled = shouldUsePersonalization();
    const merchantConfig = getMerchantConfig();

    const blocksThatWereSet = setBlocks(
      {
        showPreferredLoader,
        preferred: updateInternationalProviders(preferredInstruments),
        merchantConfig: merchantConfig.config,
        configSource: merchantConfig.sources,
      },
      $customer
    );

    const noBlocksWereSet = blocksThatWereSet.all.length === 0;

    if (isInstrumentFaultEmitted) {
      // Do nothing, we already signalled a fault
    } else if (noBlocksWereSet && !singleMethod) {
      Events.TrackIntegration(MiscEvents.ERROR, {
        type: 'no_instruments_to_render',
        config: merchantConfig,
      });

      Razorpay.sendMessage({
        event: 'fault',
        data: 'Error in integration. Please contact Razorpay for assistance: no instruments available to show',
      });

      isInstrumentFaultEmitted = true;
    } else {
      const setPreferredInstruments = blocksThatWereSet.preferred.instruments;
      const instrumentsShown = setPreferredInstruments.map((item) =>
        item?._ungrouped?.length ? item._ungrouped[0] : []
      );
      if (expSourceSet) {
        Events.TrackMetric(P13NEvents.INSTRUMENTS_SHOWN, {
          source: expSourceSet,
          instrumentsShown,
        });
        expSourceSet = false;
      }

      sendHighlightUpiIntentInstrumentAnalytics(setPreferredInstruments);

      // Get the methods for which a preferred instrument was shown
      const preferredMethods = setPreferredInstruments.reduce(
        (acc, instrument) => {
          acc[`_${instrument.method}`] = true;
          return acc;
        },
        {}
      );

      const allPreferredInstrumentsForCustomer =
        getAllInstrumentsForCustomer($customer);

      if (
        isPersonalizationEnabled &&
        allPreferredInstrumentsForCustomer.length
      ) {
        // Track preferred-methods related things
        Events.Track(P13NEvents.INSTRUMENTS_LIST, {
          all: allPreferredInstrumentsForCustomer.length,
          eligible: preferredInstruments.length,
          shown: setPreferredInstruments.length,
          methods: preferredMethods,
        });
      }
    }
  }

  onMount(() => {
    updateBlocks({
      showPreferredLoader: shouldUsePersonalization(),
    });
  });

  // Svelte executes the following block twice. Even if a fault was emitted, it will be emitted again in the second execution.
  // So, we use this flag to perform no-op if true.
  // TODO: Do this in a better way by figuring out how to make it execute the block only once.
  let isInstrumentFaultEmitted = false;

  /**
   * When we change contact from logged in user to a new contact (which is not logged in)
   * we log out the previously logged in user when p13n api call
   * is made for new contact. (logout happens in backend, p13n api handles it)
   * On client side, we update the customer infromation as logged out
   */
  let prevCustomer = $customer;
  $: if (prevCustomer !== $customer) {
    const prevCustomerLoggedIn = prevCustomer && prevCustomer.logged;

    if (prevCustomerLoggedIn) {
      session.logoutUserOnClient(prevCustomer);
    }

    prevCustomer = $customer;
  }

  $: {
    const loggedIn = _Obj.getSafely($customer, 'logged');
    const topbarRight = _Doc.querySelector('#topbar #top-right');

    if (topbarRight) {
      _El.keepClass(topbarRight, 'logged', loggedIn);
    }
    const isPersonalizationEnabled = shouldUsePersonalization();

    const eligiblePreferredInstrumentsPromise = isPersonalizationEnabled
      ? getAllAvailableP13nInstruments($customer)
      : Promise.resolve([]);

    eligiblePreferredInstrumentsPromise.then(({ instruments }) => {
      updateBlocks({
        preferredInstruments: instruments,
      });
    });
  }

  function shouldUsePersonalization() {
    // Merchant has asked to disable
    if (session.get().personalization === false) {
      return false;
    }

    // Missing contact
    if (!$isContactPresent) {
      return false;
    }

    // Single method
    if (singleMethod && isRecurring()) {
      return false;
    }

    // TPV
    if (tpv) {
      return false;
    }

    /**
     * We're currently not allowing
     * local customers to use p13n.
     * But we should, after filtering out
     * all saved cards.
     */
    if (session.local) {
      return false;
    }

    // Payouts cannot use p13n
    if (session.isPayout) {
      return false;
    }

    return true;
  }

  export function codActions() {
    if (isOneCCEnabled && getMerchantOffers()?.length) {
      showMethodOffers.set(true);
    }
    Events.TrackRender(HOME_EVENTS.HOME_LOADED, {
      cod_available: $isCodAvailable,
      cod_unavailable_reason: $codReason,
      available_methods: getAvailableMethods(),
    });
    merchantAnalytics({
      event: ACTIONS.PAGE_VIEW,
      category: CATEGORIES.PAYMENT_METHODS,
      params: {
        page_title: CATEGORIES.PAYMENT_METHODS,
      },
    });
    merchantFBStandardAnalytics({
      event: ACTIONS.ADDPAYMENTINFO,
    });
    if (isMethodEnabled('cod')) {
      Events.Track(COD_EVENTS.COD_METHOD, { disabled: !$isCodAvailable });
    }
  }

  export function addressNext() {
    $isShippingAddedToAmount = true;
    showHome = true;
    Events.Track(HomeEvents.LANDING, {
      view,
      oneMethod: singleMethod,
    });
    setTimeout(() => {
      hideCta();
    });
  }

  export function onShown() {
    $headerVisible = true;
    renderCtaOneCC = true;
    if (!isOneCCEnabled) {
      showHome = true;
    }
    scrollable = isScrollableElement(methodEle);
    deselectInstrument();
    if (view === HOME_VIEWS.METHODS) {
      hideCta();
    } else {
      setDetailsCta();
    }
  }

  /**
   * Determines if user contact and email is valid
   *
   * @returns {[boolean, boolean]}
   */
  function validateEmailAndContact() {
    /**
     * Mark contact and email as invalid by default
     */
    let isContactValid = false;
    let isEmailValid = false;

    /**
     * Mark optional fields as valid
     */
    if (isContactOptional()) {
      isContactValid = true;
    }
    if (isEmailOptional()) {
      isEmailValid = true;
    }

    /**
     * If contact and email are mandatory, validate
     */
    if (!isContactEmailOptional()) {
      if (!isContactValid) {
        if ($country === '+91') {
          isContactValid = PHONE_REGEX_INDIA.test($phone);
        } else {
          isContactValid = CONTACT_REGEX.test($contact);
        }
      }

      isEmailValid = isEmailValid || EMAIL_REGEX.test($email);
    }

    return [isContactValid, isEmailValid];
  }

  /**
   * Determines where a user should be if
   * they were landing on the homescreen as the first screen.
   *
   * @returns {string} view
   */
  function determineLandingView() {
    const { DETAILS, METHODS } = HOME_VIEWS;
    // return false;
    /**
     * If contact or email are invalid,
     * we need to get them corrected.
     */
    const [isContactValid, isEmailValid] = validateEmailAndContact();
    if (!isContactValid || !isEmailValid) {
      return DETAILS;
    }
    /**
     * Need TPV selection from the details screen.
     */
    if (tpv) {
      return DETAILS;
    }

    /**
     * Need partial payment details from the details screen.
     */
    if (isPartialPayment) {
      return DETAILS;
    }

    // TODO: Add address condition
    if (isContactEmailHidden() && isContactEmailOptional()) {
      // when both are hidden details screen will be empty hence avoid it
      return METHODS;
    }
    /**
     * If there's just one method available,
     * we want to land on the details screen.
     *
     * But, there's an exception:
     *
     * There are some instruments for which we want to show
     * personalized methods.
     *
     * If an instrument on any of these methods exists,
     * we take the user to the methods screen.
     *
     * Otherwise, we take the user to the details screen.
     */
    if (singleMethod) {
      if (isRecurring()) {
        return DETAILS;
      } else {
        return METHODS;
      }
    }

    /**
     * If there are multple methods
     * and no validations have failed,
     * we take the user to the methods screen.
     */
    return METHODS;
  }

  view = determineLandingView();
  if (!isOneCCEnabled) {
    Events.Track(HomeEvents.LANDING, {
      view,
      oneMethod: singleMethod,
    });
  }

  function storeContactDetails() {
    // Update save address/card checkbox
    remember.set($isIndianCustomer);

    // Store only on mobile since Desktops can be shared b/w users
    if (isMobile()) {
      updateContactStorage({
        contact: $contact,
        email: $email,
      });
    }
  }

  export function next(forcedView) {
    if (typeof forcedView === 'string' && forcedView) {
      view = forcedView;
      return;
    }
    /**
     * - Store contact details only when the user has explicity clicked on the CTA
     * - `next()` is not invoked if the merchant had prefilled the user's details
     *    since the user would land directly on the methods view
     */
    storeContactDetails();

    // Multi TPV
    if (tpv) {
      if (tpv.method === 'upi') {
        selectMethod('upi');
      } else if (tpv.method === 'netbanking') {
        session.preSubmit();
      } else {
        if ($multiTpvOption === 'upi') {
          selectMethod('upi');
        } else if ($multiTpvOption === 'netbanking') {
          session.preSubmit();
        }
      }
      return;
    }

    if (singleMethod) {
      if (singleMethod === 'paypal') {
        createPaypalPayment();
        return;
      }

      if (isRecurring()) {
        selectMethod(singleMethod);
        return;
      } else {
        showMethods();
        return;
      }
    }

    showMethods();
  }

  $: {
    if (
      view === HOME_VIEWS.METHODS &&
      $activeRoute?.name === HOME_VIEWS.METHODS
    ) {
      $customer = session.getCustomer($contact);
    }
  }

  export function getCurrentView() {
    return view;
  }

  function createPaypalPayment() {
    // Deselct to hide Pay button
    deselectInstrument();

    const payload = session.getPayload();

    payload.method = 'paypal';

    session.preSubmit(null, payload);
  }

  function deselectInstrument() {
    $selectedInstrumentId = null;
    dccView = 'home-screen';
    ctaOneCCDisabled = true;
  }

  function showSnackbar(isCodApplied) {
    const charge = session.formatAmountWithCurrency($codChargeAmount);
    const template = isCodApplied
      ? 'methods.descriptions.cod_charge_applied'
      : 'methods.descriptions.cod_charge_removed';

    showToast({
      message: formatTemplateWithLocale(template, { charge }),
      theme: TOAST_THEME.INFO,
      screen: TOAST_SCREEN.COMMON,
    });
  }

  export function selectMethod(method) {
    selectedMethod = method;
    Events.TrackMetric(HomeEvents.PAYMENT_METHOD_SELECTED, {
      method,
    });
    merchantAnalytics({
      event: ACTIONS.PAYMENT_METHOD_SELECT,
      category: CATEGORIES.PAYMENT_METHODS,
      params: { method },
    });
    showCODCharges(method);
    if (method === 'cod') {
      return;
    }
    if (method === 'paypal') {
      createPaypalPayment();
      return;
    }

    if (method === 'gpay') {
      // GPay is UPI underneath
      method = 'upi';
    }

    if (method === 'emandate') {
      // If bank is not prefilled, go to netbanking tab. Otherwise, go to the emandate tab directly.
      if (!prefilledBank || !isEMandateBankEnabled(prefilledBank)) {
        method = 'netbanking';
      }
    }

    tick().then(() => {
      // Switch tab in the next tick to allow some
      // other code to run and perform validations.
      session.switchTab(method);
    });
  }

  export function onHide() {
    renderCtaOneCC = false;
  }

  function showCODCharges(method) {
    if (method === 'cod') {
      if ($codChargeAmount) {
        showSnackbar(true);
      }
      $isCodAddedToAmount = true;
    } else if ($isCodAddedToAmount) {
      $isCodAddedToAmount = false;
      if ($codChargeAmount) {
        showSnackbar(false);
      }
    }
  }

  export function shouldGoNext() {
    if (singleMethod === 'paypal') {
      return false;
    }

    if (tpv) {
      if (tpv.method === 'netbanking' || $multiTpvOption === 'netbanking') {
        return false;
      }
    }

    return true;
  }

  function attemptPayment() {
    session.preSubmit();
  }

  let formattedPartialAmount;
  $: {
    if ($partialPaymentOption === 'full') {
      formattedPartialAmount = session.formatAmountWithCurrency(
        session.get('amount')
      );
    } else {
      formattedPartialAmount = session.formatAmountWithCurrencyInMinor(
        $partialPaymentAmount
      );
    }
  }

  let showUserDetailsStrip;
  $: {
    showUserDetailsStrip =
      ($isContactPresent || $email) &&
      !isContactEmailHidden() &&
      !isOneCCEnabled;
  }

  export function onSelectInstrument(event) {
    ctaOneCCDisabled = false;
    const instrument = event.detail;
    Events.TrackMetric(HomeEvents.PAYMENT_INSTRUMENT_SELECTED, {
      instrument,
    });
    updateScore('instrumentSelected');

    $selectedInstrumentId = instrument.id;
    if (instrument.method === 'wallet' && instrument.wallets?.length > 0) {
      dccView = instrument.wallets[0];
    } else if (isInternationalInPreferredInstrument(instrument)) {
      dccView = getInternationalProviderName(instrument);
    } else {
      dccView = 'home-screen';
    }

    if (isInstrumentGrouped(instrument)) {
      selectMethod(instrument.method);
    } else if (instrument.vendor_vpa) {
      trackUpiIntentInstrumentSelected(instrument.vendor_vpa);
      $intentVpaPrefill = instrument.vendor_vpa;
      selectMethod(instrument.method, instrument.vendor_vpa);
    } else {
      // Bring instrument into view if it's not visible
      const domElement = _Doc.querySelector(
        `.home-methods .methods-block [data-id="${instrument.id}"]`
      );
      showCODCharges(instrument.method);

      if (domElement && !isElementCompletelyVisibleInTab(domElement)) {
        domElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
      // SKIP CTA click check
      if (instrument.skipCTAClick) {
        delete instrument.skipCTAClick;
        attemptPayment();
      }
    }
  }
</script>

<Tab method="common" overrideMethodCheck={true} shown={showHome} pad={false}>
  <Screen pad={false}>
    <div
      class="screen-main"
      class:screen-one-cc={scrollable && isOneCCEnabled}
      bind:this={methodEle}
    >
      {#if view === HOME_VIEWS.DETAILS}
        <PaymentDetails {tpv} />
      {/if}
      {#if view === HOME_VIEWS.METHODS}
        <div
          class="solidbg"
          in:slide={getAnimationOptions({ duration: 400 })}
          out:fly={getAnimationOptions({ duration: 200, y: 80 })}
        >
          <!-- We dont want it to show in 1cc flow-->
          {#if !isOneCCEnabled}
            <TrustedBadge />
          {/if}

          {#if showUserDetailsStrip || isPartialPayment}
            <div
              use:touchfix
              class="details-container"
              class:details-container-1cc={isOneCCEnabled}
              in:fly={getAnimationOptions({ duration: 400, y: 80 })}
            >
              {#if showUserDetailsStrip}
                <UserDetailsStrip onEdit={editUserDetails} />
              {/if}
              {#if isPartialPayment}
                <SlottedOption
                  on:click={hideMethods}
                  id="partial-payment-details"
                >
                  <div slot="title">
                    <span>{formattedPartialAmount}</span>
                    <span>
                      {#if $partialPaymentOption === 'full'}
                        <!-- LABEL: Paying full amount -->
                        {$t(PARTIAL_AMOUNT_STATUS_FULL)}
                      {:else}
                        <!-- LABEL: Paying in parts -->
                        {$t(PARTIAL_AMOUNT_STATUS_PARTIAL)}
                      {/if}
                    </span>
                  </div>
                  <div
                    slot="extra"
                    class="theme-highlight-color"
                    aria-label={contactEmailReadonly ? '' : 'Edit'}
                  >
                    {#if !contactEmailReadonly}
                      <!-- LABEL: Change amount -->
                      <span>{$t(PARTIAL_AMOUNT_EDIT_LABEL)}</span>
                      <span>&#xe604;</span>
                    {/if}
                  </div>
                </SlottedOption>
              {/if}
            </div>
          {/if}

          <div
            class="home-methods"
            in:fly={getAnimationOptions({ delay: 100, duration: 400, y: 80 })}
          >
            <NewMethodsList
              on:selectInstrument={onSelectInstrument}
              on:submit={attemptPayment}
            />
          </div>
        </div>
      {/if}
    </div>

    <Bottom tab="common">
      {#if cardOffer}
        <CardOffer offer={cardOffer} />
      {/if}
      {#if (isDCCEnabled() || DCC_VIEW_FOR_PROVIDERS.includes(dccView)) && !isDynamicFeeBearer()}
        <DynamicCurrencyView tabVisible view={dccView} />
      {/if}
      <!-- {#if showRecurringCallout}
        <Callout>
          {generateSubtextForRecurring({
            types: getCardTypesForRecurring(),
            networks: getCardNetworksForRecurring('credit'),
            issuers: getCardIssuersForRecurring(),
            subscription: session.get('subscription_id'),
            offer: cardOffer,
          })}
        </Callout>
      {/if} -->

      {#if showSecuredByMessage}
        <SecuredMessage />
      {/if}
    </Bottom>
    {#if renderCtaOneCC}
      <CTAOneCC
        disabled={ctaOneCCDisabled}
        on:click={() => session.preSubmit()}
      >
        {selectedMethod === 'cod'
          ? $t(PLACE_ORDER_CTA_LABEL)
          : $t(PAY_NOW_CTA_LABEL)}
      </CTAOneCC>
    {/if}
  </Screen>
</Tab>

<style>
  .screen-main {
    padding-top: 12px;
    display: flex;
    flex-direction: column;
  }

  .secured-message {
    display: flex;
    align-items: center;
    padding: 12px 0 12px 24px;
    font-size: 13px;
    color: rgba(51, 51, 51, 0.6);
  }
  i {
    margin-right: 8px;
    position: relative;
    top: 2px;
  }

  .home-methods {
    padding-left: 12px;
    padding-right: 12px;
    margin-top: 28px;
  }

  .home-methods-oneclickcheckout {
    margin-top: 68px;
  }

  .details-container {
    margin: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .details-container-1cc {
    margin-top: 20px;
  }

  .details-container :global(.stack > div:nth-of-type(1)) {
    flex-grow: 1;
  }

  .details-container div[slot='title'] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .details-container div[slot='title'] span:first-child {
    font-size: 0.9rem;
    color: #363636;
  }

  .details-container div[slot='title'] span:nth-child(2) {
    font-size: 0.7rem;
    color: #757575;
    margin-left: 8px;
    padding-left: 8px;
    border-left: solid 1px #757575;
  }

  .details-strip {
    display: flex;
  }

  :global(#user-details) {
    min-width: 0;
  }

  .solidbg {
    background: white;
    order: -1;
  }

  :global(#content.one-cc) .home-methods {
    padding-left: 16px;
    padding-right: 16px;
    margin-bottom: 26px;
    margin-top: 26px;
  }

  .screen-one-cc {
    min-height: 120%;
  }
</style>
