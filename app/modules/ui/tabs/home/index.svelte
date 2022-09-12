<script lang="ts">
  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import { updateActionAreaContentAndCTA } from 'handlers/common';
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import NewMethodsList from 'ui/tabs/home/NewMethodsList.svelte';
  import PaymentDetails from 'ui/tabs/home/PaymentDetails.svelte';
  import CardOffer from 'ui/elements/CardOffer.svelte';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';
  import RTBBanner from 'rtb/ui/component/RTBBanner.svelte';
  import SecuredMessage from 'ui/components/SecuredMessage.svelte';
  import { initUpiQrV2 } from 'upi/features';
  import {
    getAvailableMethods,
    getSectionsDisplayed,
  } from 'ui/tabs/home/helpers';
  import {
    showToast,
    TOAST_THEME,
    TOAST_SCREEN,
  } from 'one_click_checkout/Toast';
  import * as _El from 'utils/DOM';
  import { isIntlBankTransferMethod } from 'InternationalBankTransfer/helpers';

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
    blocks,
    countryISOCode,
    isIndianCustomer,
  } from 'checkoutstore/screens/home';

  import { customer } from 'checkoutstore/customer';
  import {
    isRedesignV15,
    isOneClickCheckout,
    isHDFCVASMerchant,
    getMerchantOption,
    getAmount,
    isEmiV2,
    isMethodRestrictionEnabledForMerchant,
  } from 'razorpay';
  import {
    merchantAnalytics,
    merchantFBStandardAnalytics,
  } from 'one_click_checkout/merchant-analytics';
  import {
    isCodAddedToAmount,
    codChargeAmount,
    isShippingAddedToAmount,
  } from 'one_click_checkout/charges/store';

  import { getUPIIntentApps } from 'checkoutstore/native';
  import { showOffers as showMethodOffers } from 'offers/store';

  // i18n
  import {
    FULL_AMOUNT_LABEL,
    PARTIAL_AMOUNT_EDIT_LABEL,
    PARTIAL_AMOUNT_LABEL_V15,
    PARTIAL_AMOUNT_STATUS_FULL,
    PARTIAL_AMOUNT_STATUS_PARTIAL,
    TPV_METHODS_NOT_AVAILABLE,
  } from 'ui/labels/home';
  import { t, locale } from 'svelte-i18n';

  // Utils imports
  import Razorpay from 'common/Razorpay';
  import { getSession } from 'sessionmanager';
  import * as ObjectUtils from 'utils/object';
  import { getMerchantConfig, screenStore } from 'checkoutstore';

  import {
    isAddressEnabled,
    isDCCEnabled,
    isPartialPayment as getIsPartialPayment,
    isRecurring,
    isContactOptional,
    isContactEmailHidden,
    isEmailOptional,
    isContactEmailOptional,
    getMerchantOffers,
    isDynamicFeeBearer,
    getCurrency,
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

  import CTA, {
    hideCta,
    showAuthenticate,
    showPayViaSingleMethod,
    showProceed,
    showNext,
  } from 'cta';

  import Analytics, {
    P13NEvents,
    OrderEvents,
    Events,
    HomeEvents,
    MetaProperties,
    MiscEvents,
  } from 'analytics';
  import MetaPropertiesOneCC from 'one_click_checkout/analytics/metaProperties';
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
    isDCCEnabledForProvider,
    isCustomerWithIntlPhone,
  } from 'common/international';

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
  import {
    AUTHENTICATE,
    CTA_LABEL,
    CTA_PROCEED,
    PAY_NOW_CTA_LABEL,
    PLACE_ORDER_CTA_LABEL,
  } from 'cta/i18n';
  import { headerVisible } from 'one_click_checkout/header/store';
  import { querySelector } from 'utils/doc';
  import { getPrefillBank } from 'netbanking/helper';
  import {
    formatAmountWithCurrency,
    formatAmountWithCurrencyInMinor,
  } from 'helper/currency';
  import {
    getPrefilledContact,
    getPrefilledEmail,
    isContactEmailReadOnly,
    logoutUserOnClient,
  } from 'checkoutframe/customer';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getAllWebPaymentApps } from 'common/webPaymentsApi';
  import { definePlatform } from 'upi/helper';
  import { toggleHeaderExpansion } from 'header';
  import { isRTBEnabled } from 'rtb/helper';
  import { RTBExperiment } from 'rtb/store';
  import { validatePrefilledDetails } from 'one_click_checkout/helper';
  import { setNoCostAvailable } from 'checkoutstore/emi';

  setEmail(getPrefilledEmail());
  setContact(getPrefilledContact());
  validatePrefilledDetails();

  const cardOffer = getCardOffer();
  const session = getSession();
  const singleMethod = getSingleMethod();

  let selectedMethod = '';
  let showHome = false;
  let ctaV15Disabled = true;
  let preferredMethods;
  let contentRef: HTMLDivElement;
  // TPV
  const tpv = getTPV();

  validateTPVOrder(tpv);

  // Offers
  const showOffers = hasOffersOnHomescreen();

  // Recurring callout
  const showRecurringCallout =
    isRecurring() && session.tab !== 'emandate' && singleMethod === 'card';

  const prefilledBank = getPrefillBank();
  const isPartialPayment = getIsPartialPayment();
  const contactEmailReadonly = isContactEmailReadOnly();
  const isOneCCEnabled = isOneClickCheckout();
  const isRedesignV15Enabled = isRedesignV15();
  const isEmiV2Enabled = isEmiV2();

  let expSourceSet = false;

  let dccView = 'home-screen';

  // Prop that decides which view to show.
  // Values: 'details', 'methods'
  let view = HOME_VIEWS.DETAILS;
  let showSecuredByMessage;

  $: {
    if (view && contentRef && typeof contentRef.scrollTo === 'function') {
      contentRef.scrollTo(0, 0);
    }
  }
  $: showSecuredByMessage =
    view === HOME_VIEWS.DETAILS &&
    !isRedesignV15() &&
    !showOffers &&
    !showRecurringCallout &&
    !tpv &&
    !isPartialPayment &&
    !session.get('address');

  // If is new emi flow we show the no cost avalilable label
  // if any no cost emi plans exists
  if (isEmiV2()) {
    setNoCostAvailable();
  }

  export function showMethods() {
    view = HOME_VIEWS.METHODS;

    onShown();
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

  /**
   * For recurring payment && controlled set of merchants
   * Enabling payment Configuration
   */
  function isRecurringAndPaymentConfigEnabaled() {
    return isRecurring() && !isMethodRestrictionEnabledForMerchant();
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

  export function editUserDetails() {
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
      showNext();
      return;
    }

    if (!session.get('amount')) {
      CTAState.label = AUTHENTICATE;
      showAuthenticate();
    } else if (singleMethod) {
      const { label, labelData } = showPayViaSingleMethod(
        getMethodNameForPaymentOption(singleMethod, $locale)
      );
      CTAState.label = label;
      CTAState.labelData = labelData;
    } else if (tpv) {
      const { label, labelData } = showPayViaSingleMethod(
        getMethodNameForPaymentOption(tpv.method || $multiTpvOption, $locale)
      );
      CTAState.label = label;
      CTAState.labelData = labelData;
    } else {
      showProceed();
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
          instrumentsSource = SOURCES.STORAGE;
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
      preferredMethods = setPreferredInstruments.reduce((acc, instrument) => {
        acc[`_${instrument.method}`] = true;
        return acc;
      }, {});

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

    /**
     * Partial Payments Related Handling will happen from session
     */
    initUpiQrV2();
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
      logoutUserOnClient(prevCustomer);
    }

    prevCustomer = $customer;
  }

  $: {
    const loggedIn = ObjectUtils.get($customer, 'logged');
    const topbarRight = querySelector('#topbar #top-right');

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
    if (getMerchantOption('personalization') === false) {
      return false;
    }

    // if hdfc VAS merchant
    if (isHDFCVASMerchant()) {
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
     * local customers to use p13n, if customer phone number is Indian(+91).
     * But we should, after filtering out
     * all saved cards.
     */
    if (session.local && !isCustomerWithIntlPhone($countryISOCode)) {
      return false;
    }

    // Payouts cannot use p13n
    if (session.isPayout) {
      return false;
    }

    return true;
  }

  export function codActions() {
    Analytics.setMeta(MetaPropertiesOneCC.IS_COD_ENABLED, $isCodAvailable);
    if (isOneCCEnabled && getMerchantOffers()?.length) {
      showMethodOffers.set(true);
    }
    Events.TrackRender(HOME_EVENTS.HOME_LOADED, {
      cod_available: $isCodAvailable,
      cod_unavailable_reason: $codReason,
      available_methods: getAvailableMethods(),
    });
    Events.TrackRender(HOME_EVENTS.HOME_LOADED_V2, {
      is_cod_enabled: $isCodAvailable,
      cod_unavailable_reason: $codReason,
      available_methods: getAvailableMethods(),
      sections: getSectionsDisplayed($blocks),
      p13n_instruments: Object.keys(preferredMethods),
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
      Events.TrackRender(COD_EVENTS.COD_SHOWN_V2, {
        is_cod_enabled: $isCodAvailable,
      });
    }
  }

  export function addressNext() {
    $isShippingAddedToAmount = true;
    showHome = true;
    Events.Track(HomeEvents.LANDING, {
      view,
      oneMethod: singleMethod,
      ...(definePlatform('mWebAndroid')
        ? { webPaymentApps: getAllWebPaymentApps() }
        : {}),
    });
    setTimeout(() => {
      hideCta();
    });
  }

  export function onShown() {
    $headerVisible = true;

    if (!isOneCCEnabled) {
      showHome = true;
    }

    deselectInstrument();
    if (view === HOME_VIEWS.METHODS) {
      const sections = getSectionsDisplayed($blocks);
      Events.TrackBehav(HomeEvents.METHODS_SHOWN, {
        is_P13n_shown: sections.includes('p13n'),
        is_Custom_shown: sections.includes('custom'),
        is_Generic_shown: sections.includes('generic'),
      });
      if (isRedesignV15() && !isOneClickCheckout()) {
        CTAState.showAmount = true;
        CTAState.disabled = true;
        CTAState.label = PAY_NOW_CTA_LABEL;
      } else {
        hideCta();
      }
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
      if (isRecurringAndPaymentConfigEnabaled()) {
        return DETAILS;
      }
      return METHODS;
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
      ...(definePlatform('mWebAndroid')
        ? { webPaymentApps: getAllWebPaymentApps() }
        : {}),
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

      if (isRecurringAndPaymentConfigEnabaled()) {
        selectMethod(singleMethod);
        return;
      }
      showMethods();
      return;
    }

    showMethods();
  }

  $: {
    if (view === HOME_VIEWS.METHODS) {
      $customer = session.getCustomer($contact);
    }
    if (
      isRedesignV15() &&
      !isOneClickCheckout() &&
      isRTBEnabled($RTBExperiment)
    ) {
      // only in case of rtb we expand or shrink header
      let expandedHeader =
        $screenStore === '' ? showHome || view === HOME_VIEWS.DETAILS : false;
      toggleHeaderExpansion(expandedHeader);
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
    ctaV15Disabled = true;
  }

  function showSnackbar(isCodApplied) {
    const currency = getCurrency();
    const spaceAmountWithSymbol = false;
    const charge = formatAmountWithSymbol(
      $codChargeAmount,
      currency,
      spaceAmountWithSymbol
    );
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

    /**
     * For new emi flow we would be  showing saved cards on L1 screen
     * So we need to change the tab to 'emi' in order to make otp flow work without hassle
     */
    if (method === 'cardless_emi') {
      if (isEmiV2Enabled) {
        method = 'emi';
      }
    }

    tick().then(() => {
      // Switch tab in the next tick to allow some
      // other code to run and perform validations.
      session.switchTab(method);
    });
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
      formattedPartialAmount = formatAmountWithCurrency(session.get('amount'));
    } else {
      formattedPartialAmount = formatAmountWithCurrencyInMinor(
        $partialPaymentAmount
      );
    }
  }

  let showUserDetailsStrip;
  $: {
    showUserDetailsStrip =
      ($isContactPresent || $email) &&
      !isContactEmailHidden() &&
      !isRedesignV15();
  }

  export function onSelectInstrument(event) {
    const instrument = event.detail;
    ctaV15Disabled = instrument._type === 'method';
    Events.TrackMetric(HomeEvents.PAYMENT_INSTRUMENT_SELECTED, {
      instrument,
    });
    Events.TrackBehav(HOME_EVENTS.PAYMENT_INSTRUMENT_SELECTED_V2, {
      instrument,
    });
    Events.TrackBehav(HOME_EVENTS.PAYMENT_METHOD_SELECTED_V2, {
      method: instrument.method,
      section: instrument.section,
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
    } else if (isIntlBankTransferMethod(instrument)) {
      attemptPayment();
    } else {
      // Bring instrument into view if it's not visible
      const domElement = querySelector(
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

  let onPaymentDetailSubmit: () => void;
  let paymentDetailInvalid = false;

  let CTAState: {
    disabled: boolean;
    label: string;
    onSubmit?: () => void;
    showAmount: boolean;
    labelData?: Record<string, string>;
  } = {
    disabled: true,
    label: '',
    onSubmit: undefined,
    showAmount: true,
  };

  $: {
    if (isRedesignV15Enabled) {
      if (view !== HOME_VIEWS.DETAILS) {
        CTAState.onSubmit = undefined;
        CTAState.showAmount = true;
        CTAState.disabled = isRedesignV15Enabled ? ctaV15Disabled : false;
        if (selectedMethod === 'cod') {
          CTAState.disabled = false;
        }
        CTAState.label =
          selectedMethod === 'cod' ? PLACE_ORDER_CTA_LABEL : PAY_NOW_CTA_LABEL;
      } else if (view === HOME_VIEWS.DETAILS) {
        CTAState.showAmount = isPartialPayment ? true : false;
        CTAState.onSubmit = onPaymentDetailSubmit;
        if (singleMethod) {
          const { label, labelData } = showPayViaSingleMethod(
            getMethodNameForPaymentOption(singleMethod, $locale)
          );
          CTAState.label = label;
          CTAState.labelData = labelData;
        } else {
          CTAState.label =
            !isOneCCEnabled && !isPartialPayment ? CTA_PROCEED : CTA_LABEL;
        }
        CTAState.disabled = paymentDetailInvalid;
      }
      if (!getAmount()) {
        CTAState.label = AUTHENTICATE;
      }
    }
  }

  function onPaymentDetailsSubmit() {
    if (session.checkCommonValidAndTrackIfInvalid()) {
      next();
    }
  }
</script>

<Tab method="common" overrideMethodCheck={true} shown={showHome} pad={false}>
  <Screen bind:contentRef pad={false}>
    <div class="screen-main" class:screen-one-cc={isRedesignV15Enabled}>
      {#if view === HOME_VIEWS.DETAILS}
        <PaymentDetails
          {tpv}
          bind:onSubmitClick={onPaymentDetailSubmit}
          bind:disabled={paymentDetailInvalid}
          ctaV15={isRedesignV15Enabled}
          onSubmit={onPaymentDetailsSubmit}
        />
      {/if}
      {#if view === HOME_VIEWS.METHODS}
        <div
          class="solidbg"
          in:slide={getAnimationOptions({ duration: 400 })}
          out:fly={getAnimationOptions({ duration: 200, y: 80 })}
        >
          <!-- We dont want it to show in 1cc flow-->
          {#if !isRedesignV15Enabled}
            <RTBBanner />
          {/if}

          {#if showUserDetailsStrip || isPartialPayment}
            <div
              use:touchfix
              class="details-container"
              class:details-container-1cc={isRedesignV15Enabled}
              in:fly={getAnimationOptions({ duration: 400, y: 80 })}
            >
              {#if showUserDetailsStrip}
                <UserDetailsStrip onEdit={editUserDetails} />
              {/if}
              {#if isPartialPayment}
                {#if isRedesignV15Enabled}
                  <Bottom tab="common">
                    <div class="partial-strip" on:click={hideMethods}>
                      <span>
                        {#if $partialPaymentOption === 'full'}
                          <!-- LABEL: Paying full amount -->
                          {$t(FULL_AMOUNT_LABEL)}
                        {:else}
                          <!-- LABEL: Paying in parts -->
                          {$t(PARTIAL_AMOUNT_LABEL_V15)}
                        {/if}
                      </span>
                      {#if !contactEmailReadonly}
                        <!-- LABEL: Change amount -->
                        <span>{$t(PARTIAL_AMOUNT_EDIT_LABEL)}</span>
                      {/if}
                    </div>
                  </Bottom>
                {:else}
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

    <CTA
      screen="home"
      tab={'tab'}
      disabled={CTAState.disabled}
      label={CTAState.label}
      labelData={CTAState.labelData}
      show
      showAmount={CTAState.showAmount}
    />
    <Bottom tab="common">
      {#if cardOffer}
        <CardOffer offer={cardOffer} />
      {/if}
      {#if (isDCCEnabled() || isDCCEnabledForProvider(dccView)) && !isDynamicFeeBearer()}
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
  </Screen>
</Tab>

<style>
  .screen-main {
    padding-top: 12px;
    display: flex;
    flex-direction: column;
  }

  .home-methods {
    padding-left: 12px;
    padding-right: 12px;
    margin-top: 16px;
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
    margin-top: 20px;
  }

  .screen-one-cc {
    min-height: 100%;
  }
  .partial-strip {
    background: linear-gradient(
      89.97deg,
      rgba(213, 232, 254, 0.7) -1.19%,
      rgba(237, 245, 255, 0.7) 99.97%
    );
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    cursor: pointer;
    span {
      &:nth-child(2) {
        color: var(--primary-color);
        text-decoration: underline;
      }
    }
  }
</style>
