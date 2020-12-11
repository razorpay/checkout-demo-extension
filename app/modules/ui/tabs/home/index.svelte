<script>
  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Bottom from 'ui/layouts/Bottom.svelte';
  import Field from 'ui/components/Field.svelte';

  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import NewMethodsList from 'ui/tabs/home/NewMethodsList.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import Address from 'ui/elements/address.svelte';
  import PaymentDetails from 'ui/tabs/home/PaymentDetails.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import CardOffer from 'ui/elements/CardOffer.svelte';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';
  import Rewards from 'ui/components/rewards/index.svelte';
  import Tooltip from 'ui/elements/Tooltip.svelte';
  import TrustedBadge from 'ui/components/TrustedBadge.svelte';

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
    methodInstrument,
    multiTpvOption,
    partialPaymentAmount,
    partialPaymentOption,
    instruments,
    blocks,
    setContact,
    setEmail,
  } from 'checkoutstore/screens/home';
  import { showBackdrop } from 'checkoutstore/backdrop';

  import { customer } from 'checkoutstore/customer';
  import {
    getOption,
    isDCCEnabled,
    getTrustedBadgeHighlights,
  } from 'checkoutstore';

  import { getUPIIntentApps } from 'checkoutstore/native';
  import { isRewardsVisible, rewards } from 'checkoutstore/rewards';

  // i18n
  import {
    PARTIAL_AMOUNT_EDIT_LABEL,
    PARTIAL_AMOUNT_STATUS_FULL,
    PARTIAL_AMOUNT_STATUS_PARTIAL,
    SECURED_BY_MESSAGE,
    SUBSCRIPTIONS_CREDIT_DEBIT_CALLOUT,
    SUBSCRIPTIONS_DEBIT_ONLY_CALLOUT,
    SUBSCRIPTIONS_CREDIT_ONLY_CALLOUT,
    CARD_OFFER_CREDIT_DEBIT_CALLOUT,
    CARD_OFFER_CREDIT_ONLY_CALLOUT,
    CARD_OFFER_DEBIT_ONLY_CALLOUT,
    RECURRING_CREDIT_DEBIT_CALLOUT,
    RECURRING_CREDIT_ONLY_CALLOUT,
    RECURRING_DEBIT_ONLY_CALLOUT,
  } from 'ui/labels/home';
  import { REWARDS_TOOLTIP_TEXT } from 'ui/labels/rewards';

  import { t, locale } from 'svelte-i18n';

  import { formatTemplateWithLocale } from 'i18n';

  // Utils imports
  import Razorpay from 'common/Razorpay';
  import { getSession } from 'sessionmanager';
  import { generateSubtextForRecurring } from 'subtext/card';
  import {
    isPartialPayment as getIsPartialPayment,
    isContactOptional,
    isEmailOptional,
    isContactHidden,
    isEmailHidden,
    isContactEmailOptional,
    isContactEmailHidden,
    isContactEmailReadOnly,
    getPrefilledContact,
    getPrefilledEmail,
    isAddressEnabled,
    isRecurring,
    getMerchantOrder,
    getMerchantConfig,
  } from 'checkoutstore';

  import {
    getCardTypesForRecurring,
    getCardNetworksForRecurring,
    getCardIssuersForRecurring,
    getSingleMethod,
    isEMandateBankEnabled,
    getTPV,
  } from 'checkoutstore/methods';

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

  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
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

  import { update as updateContactStorage } from 'checkoutframe/contact-storage';
  import { isMobile } from 'common/useragent';
  const cardOffer = getCardOffer();
  const session = getSession();
  const icons = session.themeMeta.icons;
  const order = getMerchantOrder();
  const singleMethod = getSingleMethod();

  // TPV
  const tpv = getTPV();

  // Offers
  const showOffers = hasOffersOnHomescreen();

  // Recurring callout
  const showRecurringCallout =
    isRecurring() && session.tab !== 'emandate' && singleMethod === 'card';

  const prefilledBank = getOption('prefill.bank');
  const isPartialPayment = getIsPartialPayment();
  const contactEmailReadonly = isContactEmailReadOnly();

  const trustedBadgeHighlights = getTrustedBadgeHighlights();

  setContact(getPrefilledContact());
  setEmail(getPrefilledEmail());

  // Prop that decides which view to show.
  // Values: 'details', 'methods'
  let view = 'details';
  let showSecuredByMessage;
  export let showTooltip = false;
  $: showSecuredByMessage =
    view === 'details' &&
    !showOffers &&
    !showRecurringCallout &&
    !tpv &&
    !isPartialPayment &&
    !session.get('address');

  export function showMethods() {
    view = 'methods';

    onShown();

    Analytics.track('home:methods:show', {
      type: AnalyticsTypes.BEHAV,
    });
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

  export function hideMethods() {
    const active = document.activeElement;

    if (active) {
      active.blur();
    }

    view = 'details';

    setDetailsCta();

    Analytics.track('home:methods:hide', {
      type: AnalyticsTypes.BEHAV,
    });
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

  function showRewards() {
    // TODO
    session.svelteOverlay.$$set({
      component: Rewards,
      props: {
        onClick: function(e) {
          session.hideErrorMessage(e);
        },
      },
    });
    session.showSvelteOverlay();
    showBackdrop();
    isRewardsVisible.update(flag => !flag);
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
    return view === 'methods';
  }

  export function onDetailsScreen() {
    return view === 'details';
  }

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
    const user = _customer.contact;

    if (!USER_EXPERIMENT_CACHE[user]) {
      USER_EXPERIMENT_CACHE[user] = new Promise(resolve => {
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
        const returnPromise = source =>
          new Promise(resolve => {
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
                Analytics.setMeta('p13n', true);
              } else {
                Analytics.removeMeta('p13n');
              }

              Analytics.setMeta('p13n.userIdentified', userIdentified);

              Analytics.track('home:p13n:experiment', {
                type: AnalyticsTypes.METRIC,
                data: {
                  source: source,
                  experiment: experimentIdentifier,
                },
              });

              Analytics.setMeta('p13n.experiment', experimentIdentifier);
            }

            // Cache for user
            const p13nRenderData = {
              source: source,
              instruments: instrumentsToBeShown,
              experiment: experimentIdentifier,
            };

            USER_EXPERIMENT_CACHE[user] = p13nRenderData;

            resolve(USER_EXPERIMENT_CACHE[user]);
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

    return USER_EXPERIMENT_CACHE[user];
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

  $: {
    if (view === 'methods') {
      $customer = session.getCustomer($contact);
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
        preferred: preferredInstruments,
        merchantConfig: merchantConfig.config,
        configSource: merchantConfig.sources,
      },
      $customer
    );

    const noBlocksWereSet = blocksThatWereSet.all.length === 0;

    if (isInstrumentFaultEmitted) {
      // Do nothing, we already signalled a fault
    } else if (noBlocksWereSet && !singleMethod) {
      Analytics.track('error', {
        type: AnalyticsTypes.INTEGRATION,
        data: {
          type: 'no_instruments_to_render',
          config: merchantConfig,
        },
      });

      Razorpay.sendMessage({
        event: 'fault',
        data:
          'Error in integration. Please contact Razorpay for assistance: no instruments available to show',
      });

      isInstrumentFaultEmitted = true;
    } else {
      const setPreferredInstruments = blocksThatWereSet.preferred.instruments;

      // Get the methods for which a preferred instrument was shown
      const preferredMethods = _Arr.reduce(
        setPreferredInstruments,
        (acc, instrument) => {
          acc[`_${instrument.method}`] = true;
          return acc;
        },
        {}
      );

      const allPreferredInstrumentsForCustomer = getAllInstrumentsForCustomer(
        $customer
      );

      if (
        isPersonalizationEnabled &&
        allPreferredInstrumentsForCustomer.length
      ) {
        // Track preferred-methods related things
        Analytics.track('p13n:instruments:list', {
          data: {
            all: allPreferredInstrumentsForCustomer.length,
            eligible: preferredInstruments.length,
            shown: setPreferredInstruments.length,
            methods: preferredMethods,
          },
        });
      }
    }
  }

  onMount(() => {
    updateBlocks({
      showPreferredLoader: shouldUsePersonalization(),
    });
    showTooltip = true;
    setTimeout(() => {
      // showTooltip = false;
    }, 5000);
  });

  // Svelte executes the following block twice. Even if a fault was emitted, it will be emitted again in the second execution.
  // So, we use this flag to perform no-op if true.
  // TODO: Do this in a better way by figuring out how to make it execute the block only once.
  let isInstrumentFaultEmitted = false;

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

  export function onShown() {
    deselectInstrument();

    if (view === 'methods') {
      hideCta();
    } else {
      setDetailsCta();
    }
  }

  /**
   * Determines where a user should be if
   * they were landing on the homescreen as the first screen.
   *
   * @returns {string} view
   */
  function determineLandingView() {
    const DETAILS = 'details';
    const METHODS = 'methods';

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

    /**
     * If contact or email are invalid,
     * we need to get them corrected.
     */
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

    /**
     * Need address from the details screen.
     */
    if (isAddressEnabled()) {
      return DETAILS;
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
  Analytics.track('home:landing', {
    data: {
      view,
      oneMethod: singleMethod,
    },
  });

  function storeContactDetails() {
    // Store only on mobile since Desktops can be shared b/w users
    if (isMobile()) {
      updateContactStorage({
        contact: $contact,
        email: $email,
      });
    }
  }

  export function next() {
    Analytics.track('home:proceed');

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

  function createPaypalPayment() {
    // Deselct to hide Pay button
    deselectInstrument();

    const payload = session.getPayload();

    payload.method = 'paypal';

    session.preSubmit(null, payload);
  }

  function deselectInstrument() {
    $selectedInstrumentId = null;
  }

  export function selectMethod(method) {
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
      ($isContactPresent || $email) && !isContactEmailHidden();
  }

  export function onSelectInstrument(event) {
    const instrument = event.detail;

    $selectedInstrumentId = instrument.id;

    if (isInstrumentGrouped(instrument)) {
      selectMethod(instrument.method);
    } else {
      // Bring instrument into view if it's not visible
      const domElement = _Doc.querySelector(
        `.home-methods .methods-block [data-id="${instrument.id}"]`
      );

      if (domElement && !isElementCompletelyVisibleInTab(domElement)) {
        domElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    }
  }
  console.log('test');
</script>

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

    i {
      margin-right: 8px;
      position: relative;
      top: 2px;
    }
  }

  .home-methods {
    padding-left: 12px;
    padding-right: 12px;
    margin-top: 28px;
  }

  .details-container {
    margin: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
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

  :global(#rewards-cta) {
    width: 56px;
    position: relative;
  }

  /* :global(.tooltip.rewards-cta-tooltip) {
    left: calc(50% - -42px);
    top: 65px;
  }
  :global(.mobile .tooltip.rewards-cta-tooltip) {
    left: calc(50% - -50px);
  } */

  :global(.rewards-cta-tooltip.tooltip-shown) {
    opacity: 1;
  }

  /* :global(.tooltip.tooltip-bottom.rewards-cta-tooltip::before) {
    left: 87%;
  } */

  .solidbg {
    background: white;
    order: -1;
  }
</style>

<Tab method="common" overrideMethodCheck={true} shown={true} pad={false}>
  <Screen pad={false}>
    <div class="screen-main">
      {#if view === 'details'}
        <PaymentDetails {tpv} />
      {/if}
      {#if view === 'methods'}
        <div
          class="solidbg"
          in:slide={getAnimationOptions({ duration: 400 })}
          out:fly={getAnimationOptions({ duration: 200, y: 80 })}>
          {#if trustedBadgeHighlights}
            <TrustedBadge list={trustedBadgeHighlights} />
          {/if}
          {#if showUserDetailsStrip || isPartialPayment}
            <div
              use:touchfix
              class="details-container"
              in:fly={getAnimationOptions({ duration: 400, y: 80 })}>
              {#if showUserDetailsStrip}
                <div class="details-strip border-list-horizontal">
                  <SlottedOption on:click={editUserDetails} id="user-details">
                    <i slot="icon">
                      <Icon icon={icons.edit} />
                    </i>
                    <div slot="title">
                      {#if $isContactPresent && !isContactHidden()}
                        <span>{$contact}</span>
                      {/if}
                      {#if $email && !isEmailHidden()}<span>{$email}</span>{/if}
                    </div>
                  </SlottedOption>
                  {#if $rewards?.length > 0}
                    <Tooltip
                      align={['bottom']}
                      bindTo="#rewards-cta"
                      className="rewards-cta-tooltip"
                      shown={showTooltip}>
                      {$t(REWARDS_TOOLTIP_TEXT)}
                    </Tooltip>
                    <SlottedOption on:click={showRewards} id="rewards-cta">
                      <i slot="icon">
                        <Icon icon={icons.present} />
                      </i>
                    </SlottedOption>
                  {/if}
                </div>
              {/if}
              {#if isPartialPayment}
                <SlottedOption
                  on:click={hideMethods}
                  id="partial-payment-details">
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
                    aria-label={contactEmailReadonly ? '' : 'Edit'}>
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
            in:fly={getAnimationOptions({ delay: 100, duration: 400, y: 80 })}>
            <NewMethodsList
              on:selectInstrument={onSelectInstrument}
              on:submit={attemptPayment} />
          </div>
        </div>
      {/if}
    </div>

    <Bottom tab="common">
      {#if cardOffer}
        <CardOffer offer={cardOffer} />
      {/if}
      {#if isDCCEnabled()}
        <DynamicCurrencyView view="home-screen" />
      {/if}
      {#if showRecurringCallout}
        <Callout>
          {generateSubtextForRecurring({
            types: getCardTypesForRecurring(),
            networks: getCardNetworksForRecurring(),
            issuers: getCardIssuersForRecurring(),
            subscription: session.get('subscription_id'),
            offer: cardOffer,
          })}
        </Callout>
      {/if}

      {#if showSecuredByMessage}
        <div
          class="secured-message"
          out:slide={getAnimationOptions({ duration: 100 })}>
          <i>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 5.33335H11.3333V4.00002C11.3333 2.16002 9.83999 0.666687
                7.99999 0.666687C6.15999 0.666687 4.66666 2.16002 4.66666
                4.00002V5.33335H3.99999C3.26666 5.33335 2.66666 5.93335 2.66666
                6.66669V13.3334C2.66666 14.0667 3.26666 14.6667 3.99999
                14.6667H12C12.7333 14.6667 13.3333 14.0667 13.3333
                13.3334V6.66669C13.3333 5.93335 12.7333 5.33335 12
                5.33335ZM7.99999 11.3334C7.26666 11.3334 6.66666 10.7334 6.66666
                10C6.66666 9.26669 7.26666 8.66669 7.99999 8.66669C8.73332
                8.66669 9.33332 9.26669 9.33332 10C9.33332 10.7334 8.73332
                11.3334 7.99999 11.3334ZM6 4V5.33334H10V4C10 2.89334 9.10666 2 8
                2C6.89333 2 6 2.89334 6 4Z"
                fill="#A7A7A7" />
            </svg>
          </i>
          <!-- LABEL: This payment is secured by Razorpay. -->
          {$t(SECURED_BY_MESSAGE)}
        </div>
      {/if}
    </Bottom>
  </Screen>
</Tab>
