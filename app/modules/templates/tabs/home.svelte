<script>
  // UI imports
  import Tab from 'templates/tabs/Tab.svelte';
  import Screen from 'templates/layouts/Screen.svelte';
  import Field from 'templates/views/ui/Field.svelte';
  import PartialPaymentOptions from 'templates/views/partialpaymentoptions.svelte';
  import RadioOption from 'templates/views/ui/options/RadioOption.svelte';
  import SlottedOption from 'templates/views/ui/options/Slotted/Option.svelte';
  import NewMethodsList from 'templates/views/ui/methods/NewMethodsList.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';
  import OffersPortal from 'templates/views/OffersPortal.svelte';
  import Address from 'templates/views/address.svelte';
  import PaymentDetails from 'templates/views/PaymentDetails.svelte';
  import Callout from 'templates/views/ui/Callout.svelte';

  // Svelte imports
  import { onMount } from 'svelte';
  import { slide, fly } from 'svelte/transition';

  // Store
  import {
    contact,
    email,
    address,
    pincode,
    state,
    selectedInstrumentId,
    multiTpvOption,
  } from 'checkoutstore/screens/home';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import CheckoutStore from 'checkoutstore';
  import { getInstrumentsForCustomer } from 'checkoutframe/personalization';
  import {
    hideCta,
    showCta,
    showCtaWithText,
    showCtaWithDefaultText,
  } from 'checkoutstore/cta';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getMethodNameForPaymentOption } from 'checkoutframe/paymentmethods';

  const session = getSession();
  const methods = session.methods;
  const icons = session.themeMeta.icons;
  const order = session.order || {};
  const { isPartialPayment, prefill } = CheckoutStore.get();

  $contact = prefill.contact || '';
  $email = prefill.email || '';

  // Prop that decides which view to show.
  // Values: 'details', 'methods'
  let view = 'details';

  let showSecuredByMessage;
  $: showSecuredByMessage =
    view === 'details' &&
    !session.multiTpv &&
    !session.tpvBank &&
    !isPartialPayment &&
    !session.get('address');

  export function showMethods() {
    view = 'methods';

    onShown();
  }

  export function hideMethods() {
    const active = document.activeElement;

    if (active) {
      active.blur();
    }

    view = 'details';

    setDetailsCta();
  }

  export function setDetailsCta() {
    if (isPartialPayment) {
      // TODO: This hack should be removed and Next button should be removed too
      _El.addClass(_Doc.querySelector('#container'), 'extra');
      hideCta();

      return;
    }

    if (!session.get('amount')) {
      showCtaWithText('Authenticate');
    } else if (session.oneMethod) {
      showCtaWithText(
        'Pay by ' +
          getMethodNameForPaymentOption(session.oneMethod, {
            session,
          })
      );
    } else {
      showCtaWithText('Proceed');
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

  function getInstruments() {
    const _customer = session.getCustomer($contact);

    const instruments = getInstrumentsForCustomer(_customer, {
      methods: session.methods,
      upiApps: session.upi_intents_data,
    });

    return instruments.slice(0, 3);
  }

  export function updateCustomer() {
    customer = session.getCustomer($contact);

    instruments = getInstruments();
  }

  function shouldUseP13n() {
    // Merchant has asked to disable
    if (session.get().personalization === false) {
      return false;
    }

    // Missing contact
    if (!$contact || !$contact.length) {
      return false;
    }

    // Single method
    if (
      session.oneMethod &&
      !['wallet', 'netbanking', 'upi'].contains(session.oneMethod)
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

  let personalization;
  let instruments;
  let customer;

  $: {
    if (view === 'methods') {
      personalization = shouldUseP13n();

      if (personalization) {
        updateCustomer();
      } else {
        instruments = [];
      }
    }
  }

  $: {
    if (personalization) {
      Analytics.setMeta('p13n', true);
      session.p13n = true;
    } else {
      Analytics.removeMeta('p13n');
      session.p13n = false;
    }
  }

  export function onShown() {
    if (view === 'methods') {
      // TODO: This hack should be removed and Next button should be removed
      _El.removeClass(_Doc.querySelector('#container'), 'extra');

      if ($selectedInstrumentId) {
        showCtaWithDefaultText();
      } else {
        hideCta();
      }
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

    const checkoutStore = CheckoutStore.get();

    const {
      isPartialPayment: partial,
      contactEmailOptional,
      contactEmailHidden: hidden,
      contactEmailReadonly: readonly,
      address,
      optional,
    } = checkoutStore;

    // If email and contact are prefilled, validate them
    if (!contactEmailOptional && !hidden) {
      const contactRegex = /^\+?[0-9]{8,15}$/;
      const emailRegex = /^[^@\s]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

      /**
       * For contact and email:
       * - If optional, allow anything
       * - If not optional, validate
       */
      if (!optional.contact && !contactRegex.test($contact)) {
        return DETAILS;
      }

      if (!optional.email && !emailRegex.test($email)) {
        return DETAILS;
      }
    }

    // TPV bank
    // TPV UPI
    // Multi TPV
    if (session.tpvBank || session.upiTpv || session.multiTpv) {
      return DETAILS;
    }

    if (partial) {
      return DETAILS;
    }

    if (address) {
      return DETAILS;
    }

    if (contactEmailOptional || hidden || readonly) {
      return METHODS;
    }

    // TODO: What should we do in case of only one of email or contact is optional?

    // Missing contact
    if (!$contact || !$contact.length) {
      return DETAILS;
    }

    // Update instruments
    const _instruments = getInstruments();

    if (session.oneMethod) {
      if (
        _Arr.contains(['wallet', 'netbanking', 'upi'], session.oneMethod) &&
        _instruments.length > 0
      ) {
        return METHODS;
      } else {
        return DETAILS;
      }
    }

    return METHODS;
  }

  view = determineLandingView();

  export function next() {
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
    if (session.tpvBank) {
      // TODO: Create payment
      return;
    }

    const _instruments = getInstruments();

    if (session.oneMethod) {
      if (session.oneMethod === 'paypal') {
        createPaypalPayment();
        return;
      }

      if (
        _Arr.contains(['wallet', 'netbanking', 'upi'], session.oneMethod) &&
        _instruments.length > 0
      ) {
        showMethods();
        return;
      } else {
        selectMethod({
          detail: {
            method: session.oneMethod,
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
    Analytics.track('p13:method:select', {
      type: AnalyticsTypes.BEHAV,
      data: event.detail,
    });

    const { down, method } = event.detail;

    if (down) {
      return;
    }

    $selectedInstrumentId = null;

    if (method === 'paypal') {
      createPaypalPayment();
    } else {
      session.switchTab(method);
    }
  }

  export function shouldShowNext() {
    if (session.oneMethod === 'paypal') {
      return false;
    }

    if ($multiTpvOption === 'netbanking' && session.multiTpv) {
      return false;
    }

    return true;
  }

  export function getSelectedInstrument() {
    return (
      instruments &&
      _Arr.find(
        instruments,
        instrument => instrument.id === $selectedInstrumentId
      )
    );
  }

  function attemptPayment() {
    session.preSubmit();
  }
</script>

<style>
  .screen-main {
    padding-top: 12px;
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

  .home-details {
    margin: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* Styles for "Edit v" button */
  .home-details div[slot='extra'] {
    display: flex;
  }

  .home-details div[slot='extra'] span {
    display: block;
  }

  .home-details div[slot='extra'] span:first-child {
    margin: 2px 4px 0;
    font-size: 1.2em;
  }

  .home-details div[slot='extra'] span:last-child {
    transform: rotate(-90deg);
  }

  .home-details div[slot='title'] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-details div[slot='title'] span:first-child {
    font-size: 0.9rem;
    color: #363636;
  }

  .home-details div[slot='title'] span:nth-child(2) {
    font-size: 0.7rem;
    color: #757575;
    margin-left: 8px;
    padding-left: 8px;
    border-left: solid 1px #757575;
  }
</style>

<Tab method="common" overrideMethodCheck={true} shown={true} pad={false}>
  <Screen pad={false}>
    <div slot="main" class="screen-main">
      {#if view === 'details'}
        <PaymentDetails {session} />
      {/if}
      {#if view === 'methods'}
        {#if $contact || $email}
          <div
            use:touchfix
            class="home-details border-list"
            transition:slide={{ duration: 400 }}>
            <SlottedOption on:click={hideMethods} className="instrument-strip">
              <i slot="icon">
                <Icon icon={icons.contact} />
              </i>
              <div slot="title">
                {#if $contact}
                  <span>{$contact}</span>
                {/if}
                {#if $email}
                  <span>{$email}</span>
                {/if}
              </div>
              <div slot="extra" class="theme-highlight-color" aria-label="Edit">
                <span>Edit</span>
                <span>&#xe604;</span>
              </div>
            </SlottedOption>
          </div>
        {/if}

        <div
          class="home-methods"
          in:fly={{ delay: 100, duration: 400, y: 100 }}
          out:fly={{ duration: 400, y: 100 }}>
          <NewMethodsList
            {personalization}
            {instruments}
            {customer}
            on:selectMethod={selectMethod}
            on:submit={attemptPayment} />
        </div>
      {/if}
    </div>

    <div slot="bottom">
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

      <OffersPortal />

      {#if session.recurring && session.tab !== 'emandate' && methods.count === 1 && methods.card}
        <Callout>
          {#if session.get('subscription_id')}
            {#if methods.debit_card && methods.credit_card}
              Subscription payments are supported on Visa and Mastercard Credit
              Cards from all Banks and Debit Cards from ICICI, Kotak, Citibank
              and Canara Bank.
            {:else if methods.debit_card}
              Subscription payments are only supported on Visa and Mastercard
              Debit Cards from ICICI, Kotak, Citibank and Canara Bank.
            {:else}
              Subscription payments are only supported on Mastercard and Visa
              Credit Cards.
            {/if}
          {:else if methods.debit_card && methods.credit_card}
            Visa and Mastercard Credit Cards from all Banks and Debit Cards from
            ICICI, Kotak, Citibank and Canara Bank are supported for this
            payment.
          {:else if methods.debit_card}
            Only Visa and Mastercard Debit Cards from ICICI, Kotak, Citibank and
            Canara Bank are supported for this payment.
          {:else}
            Only Visa and Mastercard Credit Cards are supported for this
            payment.
          {/if}
        </Callout>
      {/if}

    </div>
  </Screen>
</Tab>
