<script>
  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import Field from 'ui/components/Field.svelte';

  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import NewMethodsList from 'ui/tabs/home/NewMethodsList.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import OffersPortal from 'ui/components/OffersPortal.svelte';
  import Address from 'ui/elements/address.svelte';
  import PaymentDetails from 'ui/tabs/home/PaymentDetails.svelte';
  import Callout from 'ui/elements/Callout.svelte';
  import DynamicCurrencyView from 'ui/elements/DynamicCurrencyView.svelte';

  // Svelte imports
  import { onMount } from 'svelte';
  import { slide, fly } from 'svelte/transition';

  // Store
  import {
    contact,
    isContactPresent,
    email,
    selectedInstrumentId,
    methodTabInstrument,
    multiTpvOption,
    partialPaymentAmount,
    partialPaymentOption,
    instruments,
    blocks,
  } from 'checkoutstore/screens/home';

  import { customer } from 'checkoutstore/customer';
  import { isDCCEnabled } from 'checkoutstore';

  // Utils imports
  import { getSession } from 'sessionmanager';
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
    getCheckoutConfig,
  } from 'checkoutstore';
  import {
    isCreditCardEnabled,
    isDebitCardEnabled,
    getSingleMethod,
  } from 'checkoutstore/methods';
  import {
    getTranslatedInstrumentsForCustomer,
    getAllInstrumentsForCustomer,
  } from 'checkoutframe/personalization';
  import {
    hideCta,
    showCta,
    showCtaWithText,
    showCtaWithDefaultText,
  } from 'checkoutstore/cta';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getMethodNameForPaymentOption } from 'checkoutframe/paymentmethods';
  import {
    INDIA_COUNTRY_CODE,
    MAX_PREFERRED_INSTRUMENTS,
  } from 'common/constants';
  import { setBlocks } from 'ui/tabs/home/instruments';

  const session = getSession();
  const icons = session.themeMeta.icons;
  const order = getMerchantOrder();
  const singleMethod = getSingleMethod();

  // TPV
  const multiTpv = session.multiTpv;
  const onlyUpiTpv = session.upiTpv;
  const onlyNetbankingTpv =
    session.tpvBank && !onlyUpiTpv && !multiTpv && singleMethod !== 'emandate';
  const isTpv = multiTpv || onlyUpiTpv || onlyNetbankingTpv;

  // Offers
  const hasOffersOnHomescreen =
    session.hasOffers &&
    _Arr.any(session.eligibleOffers, offer => offer.homescreen);

  // Recurring callout
  const showRecurringCallout =
    isRecurring() && session.tab !== 'emandate' && singleMethod === 'card';

  const cardOffer = session.cardOffer;
  const isPartialPayment = getIsPartialPayment();
  const contactEmailReadonly = isContactEmailReadOnly();

  $contact = getPrefilledContact() || INDIA_COUNTRY_CODE;
  $email = getPrefilledEmail();

  // Prop that decides which view to show.
  // Values: 'details', 'methods'
  let view = 'details';
  let showSecuredByMessage;
  $: showSecuredByMessage =
    view === 'details' &&
    !hasOffersOnHomescreen &&
    !showRecurringCallout &&
    !session.multiTpv &&
    !session.tpvBank &&
    !isPartialPayment &&
    !session.get('address');

  function getRawMerchantConfig() {
    const displayFromOptions = session.get('config.display');
    const displayFromPreferences = _Obj.getSafely(
      getCheckoutConfig(),
      'display',
      {}
    );

    let config = null;
    let source;

    if (_.isNull(displayFromOptions)) {
      // Setting config.display as null allows you to disable the configuration
      source = 'options';
      config = null;
    } else if (_.isNull(displayFromPreferences)) {
      source = 'preferences';
      config = null;
    } else if (!_.isEmptyObject(displayFromOptions)) {
      // displayFromOptions will be an empty object by default
      source = 'options';
      config = displayFromOptions;
    } else if (!_.isEmptyObject(displayFromPreferences)) {
      source = 'preferences';
      config = displayFromPreferences;
    }

    return {
      config,
      source,
    };
  }

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

    if (session.tpvBank) {
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

  export function setDetailsCta() {
    if (isPartialPayment) {
      showCtaWithText('Next');

      return;
    }

    if (!session.get('amount')) {
      showCtaWithText('Authenticate');
    } else if (singleMethod) {
      showCtaWithText('Pay by ' + getMethodNameForPaymentOption(singleMethod));
    } else if (isTpv) {
      let _method;
      if (onlyNetbankingTpv) {
        _method = 'netbanking';
      } else if (onlyUpiTpv) {
        _method = 'upi';
      } else if (multiTpv) {
        _method = $multiTpvOption;
      }

      showCtaWithText('Pay by ' + getMethodNameForPaymentOption(_method));
    } else {
      showCtaWithText('Proceed');
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

  function getAllAvailableP13nInstruments() {
    return getTranslatedInstrumentsForCustomer($customer, {
      upiApps: session.upi_intents_data,
    });
  }

  $: {
    if (view === 'methods') {
      $customer = session.getCustomer($contact);
    }
  }

  $: {
    const loggedIn = _Obj.getSafely($customer, 'logged');
    _El.keepClass(_Doc.querySelector('#topbar #top-right'), 'logged', loggedIn);

    const isPersonalizationEnabled = shouldUsePersonalization();
    const eligiblePreferredInstruments = isPersonalizationEnabled
      ? getAllAvailableP13nInstruments($customer)
      : [];

    const merchantConfig = getRawMerchantConfig();

    const blocksThatWereSet = setBlocks(
      {
        preferred: eligiblePreferredInstruments,
        merchantConfig: merchantConfig.config,
        configSource: merchantConfig.source,
      },
      $customer
    );

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

    /**
     * - `meta.p13n` will only be set when preferred methods are shown in the UI.
     * - `p13n:instruments:list` will be fired when we attempt to show the list.
     * - `p13n:instruments:list` with `meta.p13n` set as true will tell you whether or not preferred methods were shown.
     */

    // meta.p13n should always be set before `p13n:instruments:list`
    if (setPreferredInstruments.length) {
      Analytics.setMeta('p13n', true);
    } else {
      Analytics.removeMeta('p13n');
    }

    const allPreferredInstrumentsForCustomer = getAllInstrumentsForCustomer(
      $customer
    );

    if (isPersonalizationEnabled && allPreferredInstrumentsForCustomer.length) {
      // Track preferred-methods related things
      Analytics.track('p13n:instruments:list', {
        data: {
          all: allPreferredInstrumentsForCustomer.length,
          eligible: eligiblePreferredInstruments.length,
          shown: setPreferredInstruments.length,
          methods: preferredMethods,
        },
      });
    }
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
    if (
      singleMethod &&
      !_Arr.contains(['wallet', 'netbanking', 'upi'], singleMethod)
    ) {
      return false;
    }

    // TPV bank
    // TPV UPI
    // Multi TPV
    if (session.tpvBank || session.upiTpv || session.multiTpv) {
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

  function deselectAllInstruments() {
    $methodTabInstrument = null;
    $selectedInstrumentId = null;
  }

  export function onShown() {
    deselectAllInstruments();

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
      const contactRegex = /^\+?[0-9]{8,15}$/;
      const emailRegex = /^[^@\s]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

      isContactValid = isContactValid || contactRegex.test($contact);
      isEmailValid = isEmailValid || emailRegex.test($email);
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
    if (session.tpvBank || session.upiTpv || session.multiTpv) {
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
      if (
        _Arr.contains(['wallet', 'netbanking', 'upi'], singleMethod) &&
        $instruments.length > 0
      ) {
        return METHODS;
      } else {
        return DETAILS;
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

  export function next() {
    Analytics.track('home:proceed');

    // Multi TPV
    if (session.multiTpv) {
      if ($multiTpvOption === 'upi') {
        selectMethod({
          detail: {
            method: 'upi',
          },
        });
      } else if ($multiTpvOption === 'netbanking') {
        session.preSubmit();
      }
      return;
    }

    // TPV UPI
    if (session.upiTpv) {
      selectMethod({
        detail: {
          method: 'upi',
        },
      });
      return;
    }

    // TPV bank
    if (session.onlyNetbankingTpv) {
      session.preSubmit();
      return;
    }

    if (singleMethod) {
      if (singleMethod === 'paypal') {
        createPaypalPayment();
        return;
      }

      if (
        _Arr.contains(['wallet', 'netbanking', 'upi'], singleMethod) &&
        $instruments.length > 0
      ) {
        showMethods();
        return;
      } else {
        selectMethod({
          detail: {
            method: singleMethod,
          },
        });
        return;
      }
    }

    showMethods();
  }

  function createPaypalPayment() {
    const payload = session.getPayload();

    payload.method = 'paypal';

    session.preSubmit(null, payload);
  }

  function selectMethod(event) {
    Analytics.track('payment_method:select', {
      type: AnalyticsTypes.BEHAV,
      data: event.detail,
    });

    let { down, method } = event.detail;

    if (down) {
      return;
    }

    $selectedInstrumentId = null;

    if (method === 'paypal') {
      createPaypalPayment();
      return;
    }

    if (method === 'gpay') {
      // GPay is UPI underneath
      method = 'upi';
    }

    session.switchTab(method);
  }

  export function shouldGoNext() {
    if (singleMethod === 'paypal') {
      return false;
    }

    if (multiTpv) {
      if ($multiTpvOption === 'netbanking') {
        return false;
      } else {
        return true;
      }
    }

    if (onlyNetbankingTpv) {
      return false;
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

  /* Styles for "Edit v" button */
  .details-container div[slot='extra'] {
    display: flex;
  }

  .details-container div[slot='extra'] span {
    display: block;
  }

  .details-container div[slot='extra'] span:first-child {
    margin: 2px 4px 0;
    font-size: 1.2em;
  }

  .details-container div[slot='extra'] span:last-child {
    transform: rotate(-90deg);
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

  .solidbg {
    background: white;
    order: -1;
  }
</style>

<Tab method="common" overrideMethodCheck={true} shown={true} pad={false}>
  <Screen pad={false}>
    <div slot="main" class="screen-main">
      {#if view === 'details'}
        <PaymentDetails {session} />
      {/if}
      {#if view === 'methods'}
        <div
          class="solidbg"
          in:slide={{ duration: 400 }}
          out:fly={{ duration: 200, y: 80 }}>
          {#if showUserDetailsStrip || isPartialPayment}
            <div
              use:touchfix
              class="details-container border-list"
              in:fly={{ duration: 400, y: 80 }}>
              {#if showUserDetailsStrip}
                <SlottedOption on:click={hideMethods} id="user-details">
                  <i slot="icon">
                    <Icon icon={icons.contact} />
                  </i>
                  <div slot="title">
                    {#if $isContactPresent && !isContactHidden()}
                      <span>{$contact}</span>
                    {/if}
                    {#if $email && !isEmailHidden()}
                      <span>{$email}</span>
                    {/if}
                  </div>
                  <div
                    slot="extra"
                    class="theme-highlight-color"
                    aria-label={contactEmailReadonly ? '' : 'Edit'}>
                    {#if !contactEmailReadonly}
                      <span>Edit</span>
                      <span>&#xe604;</span>
                    {/if}
                  </div>
                </SlottedOption>
              {/if}
              {#if isPartialPayment}
                <SlottedOption
                  on:click={hideMethods}
                  id="partial-payment-details">
                  <div slot="title">
                    <span>{formattedPartialAmount}</span>
                    <span>
                      {#if $partialPaymentOption === 'full'}
                        Paying full amount
                      {:else}Paying in parts{/if}
                    </span>
                  </div>
                  <div
                    slot="extra"
                    class="theme-highlight-color"
                    aria-label={contactEmailReadonly ? '' : 'Edit'}>
                    {#if !contactEmailReadonly}
                      <span>Change amount</span>
                      <span>&#xe604;</span>
                    {/if}
                  </div>
                </SlottedOption>
              {/if}
            </div>
          {/if}

          <div
            class="home-methods"
            in:fly={{ delay: 100, duration: 400, y: 80 }}>
            <NewMethodsList
              on:selectMethod={selectMethod}
              on:submit={attemptPayment} />
          </div>
        </div>
      {/if}
    </div>

    <div slot="bottom">
      {#if isDCCEnabled()}
        <DynamicCurrencyView view="home-screen" />
      {/if}
      {#if showRecurringCallout}
        <Callout>
          {#if session.get('subscription_id')}
            {#if isDebitCardEnabled() && isCreditCardEnabled()}
              Subscription payments are supported on Visa and Mastercard Credit
              Cards from all Banks and Debit Cards from ICICI, Kotak, Citibank
              and Canara Bank.
            {:else if isDebitCardEnabled()}
              Subscription payments are only supported on Visa and Mastercard
              Debit Cards from ICICI, Kotak, Citibank and Canara Bank.
            {:else}
              Subscription payments are only supported on Mastercard and Visa
              Credit Cards.
            {/if}
          {:else if cardOffer}
            {#if isDebitCardEnabled() && isCreditCardEnabled()}
              All {cardOffer.issuer} Cards are supported for this payment
            {:else if isDebitCardEnabled()}
              All {cardOffer.issuer} Debit Cards are supported for this payment
            {:else}
              All {cardOffer.issuer} Credit Cards are supported for this
              payment.
            {/if}
          {:else if isDebitCardEnabled() && isCreditCardEnabled()}
            Visa and Mastercard Credit Cards from all Banks and Debit Cards from
            ICICI, Kotak, Citibank and Canara Bank are supported for this
            payment.
          {:else if isDebitCardEnabled()}
            Only Visa and Mastercard Debit Cards from ICICI, Kotak, Citibank and
            Canara Bank are supported for this payment.
          {:else}
            Only Visa and Mastercard Credit Cards are supported for this
            payment.
          {/if}
        </Callout>
      {/if}

      <OffersPortal />

      {#if showSecuredByMessage}
        <div class="secured-message" out:slide={{ duration: 100 }}>
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
          This payment is secured by Razorpay.
        </div>
      {/if}

    </div>
  </Screen>
</Tab>
