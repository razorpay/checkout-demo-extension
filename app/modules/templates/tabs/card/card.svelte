<script>
  //   Utils imports
  import Razorpay from 'common/Razorpay';
  import { makeAuthUrl } from 'common/Razorpay';
  import { timeConverter } from 'common/formatDate';
  import { copyToClipboard } from 'common/clipboard';
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getSavedCards } from 'common/token';
  import Field from 'templates/views/ui/Field.svelte';
  import * as Card from 'common/card';

  // UI imports
  import AsyncLoading from 'templates/views/ui/AsyncLoading.svelte';
  import Callout from 'templates/views/ui/Callout.svelte';
  import Tab from 'templates/tabs/Tab.svelte';
  import SavedCards from 'templates/screens/savedcards.svelte';

  const session = getSession();

  // Props
  export let loading = true;
  export let data = null;
  export let error = null;
  let cardNumber = null;

  // Refs
  const cardType = _Doc.querySelector('#elem-card .cardtype[cardtype]');
  var nocvvCheck = _Doc.querySelector('#nocvv');

  var remember = false;

  $: showSavedCardsScreen = false;
  $: showSavedCards = false;
  $: customer = session.customer;
  var transformedTokens = null;

  function toggleNoCvv(show) {
    // Display or hide the nocvv checkbox
    nocvvCheck.disabled = !show;
  }

  function noCvvToggle() {
    var shouldHideExpiryCVV = nocvvCheck.checked && !nocvvCheck.disabled;
  }

  function onSixDigits(e) {
    const el = _Doc.querySelector('#card_number');
    var emi_options = session.emi_options; // Rajat: remove this later.
    const cardType = _Doc.querySelector('#elem-card .cardtype[cardtype]');
    var nocvvCheck = _Doc.querySelector('nocvv');
    var emiObj;
    var val = el.value;

    var isMaestro = /^maestro/.test(cardType);
    var sixDigits = val.length > 5;
    var trimmedVal = val.replace(/[\ ]/g, '');

    _El.toggleClass(el.parentNode, 'six');

    if (sixDigits) {
      if (isMaestro) {
        if (nocvvCheck.disabled) {
          toggleNoCvv(true);
        }
      } else {
        each(emi_options.banks, function(bank, emiObjInner) {
          if (emiObjInner.patt.test(val.replace(/ /g, ''))) {
            emiObj = emiObjInner;
          }
        });

        toggleNoCvv(false);
      }
    } else {
      toggleNoCvv(false);
    }

    this.emiPlansForNewCard = emiObj;

    if (emiObj) {
      _Doc.querySelector('#expiry-cvv').removeClass('hidden'); //Rajat, convention for id of elements
    } else {
      _Doc.querySelector('#emi_duration').value = '';
    }

    if (trimmedVal.length >= 6) {
      var emiBankChangeEvent;
      if (typeof Event === 'function') {
        emiBankChangeEvent = new Event('change');
      } else {
        emiBankChangeEvent = document.createEvent('Event');
        emiBankChangeEvent.initEvent('change', true, true);
      }
    }

    noCvvToggle();

    var elem_emi = _Doc.querySelector('#elem-emi');
    var hiddenClass = 'hidden';

    if (isMaestro && sixDigits) {
      elem_emi.addClass(hiddenClass);
    } else if (elem_emi.classList.contains(hiddenClass)) {
      invoke('removeClass', elem_emi, hiddenClass, 200);
    }
  }

  export function onShown() {
    session.setFormatting();
    let { customer } = session;
    session.otpView.updateScreen({
      maxlength: 6,
    });
    onSixDigits.call(this);
    remember = session.get('remember_customer');

    if (!remember) {
      // Rajat
      return session.setScreen('card');
    }

    tab_titles.otp = tab_titles.card; //Rajat, how is this working?
    session.otpView.updateScreen({
      skipText: 'Skip Saved Cards',
    });
    if (!session.customer.logged && !session.wants_skip) {
      session.commenceOTP('saved cards', true);
      customer.checkStatus(function() {
        /**
         * 1. If this is a recurring payment and customer doesn't have saved cards,
         *    create and ask for OTP.
         * 2. If customer has saved cards and is not logged in, ask for OTP.
         * 3. If customer doesn't have saved cards, show cards screen.
         */
        if (session.recurring && !customer.saved && !customer.logged) {
          customer.createOTP(function() {
            session.askOTP(
              session.otpView,
              'Enter OTP sent on ' +
                session.getPhone() +
                '<br>to save your card for future payments',
              true
            );
          });
        } else if (customer.saved && !customer.logged) {
          session.askOTP(session.otpView, undefined, true);
        } else {
          showCards();
        }
      });
    } else {
      showCards();
    }
  }

  export function showCards() {
    setSavedCards();
    session.setScreen('card');
  }

  function setSavedCards() {
    let { customer } = session;
    var tokens = customer && customer.tokens && customer.tokens.count;
    var cardTab = _Doc.querySelector('#form-card');
    var delegator = session.delegator;

    if (!delegator) {
      delegator = session.delegator = Razorpay.setFormatter(session.el);
    }

    if (tokens) {
      var tokensList = customer.tokens;
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

        transformedTokens = session.transformTokens(tokensList.items); // Rajat, looks emi is this needed here?
        showSavedCards = true;

        var totalSavedCards = getSavedCards(transformedTokens).length;
      }
    }

    var selectableSavedCard = getSelectableSavedCardElement(
      'card', //hardcoding for now
      this.selectedSavedCardToken
    );

    if (tokens && selectableSavedCard) {
      session.setSavedCard({ delegateTarget: selectableSavedCard });
    }

    session.savedCardScreen = tokens;

    toggleSavedCards(!!tokens);

    _El.toggleClass(_Doc.querySelector('#form-card'), 'has-cards'); //TODO: pure functions

    each(_Doc.querySelectorAll('.saved-cvv'), function(i, input) {
      delegator.add('number', input);
    });
  }

  function getSelectableSavedCardElement(tab, token) {
    // TODO: Remove this
    var selectors = {
      checked: '.saved-card.checked',
      saved: '.saved-card',
      token: '.saved-card',
    };

    // Add token to selectors
    if (token) {
      selectors.token += '[token="' + token + '"]';
    }

    var emiSelector = tab === 'emi' ? '[emi]' : '';

    // Add EMI selector to selectors
    selectors = _Obj.map(selectors, function(value) {
      return value + emiSelector;
    });

    var validSelector = _Arr.find(
      [selectors.checked, selectors.token, selectors.saved],
      function(selector) {
        return _Doc.querySelector(selector);
      }
    );

    var elem = _Doc.querySelector(validSelector);

    return elem;
  }

  export function shouldSubmit() {}

  export function toggleSavedCards(value) {
    showSavedCards = value;
  }

  export function preSubmit() {
    let formattingDelegator = session.delegator;

    // Do not proceed with amex cards if amex is disabled for merchant
    // also without this, cardsaving is triggered before API returning unsupported card error
    if (
      !session.preferences.methods.amex &&
      formattingDelegator.card.type === 'amex'
    ) {
      return session.showLoadError('AMEX cards are not supported', true);
    }
    var nocvv_el = _Doc.querySelector('#nocvv-check [type=checkbox]');
    if (!showSavedCards) {
      // handling add new card screen
      formattingDelegator.card.format();
      formattingDelegator.expiry.format();

      // if maestro card is active
      if (nocvv_el.checked && !nocvv_el.disabled) {
        _Doc.querySelector('.elem-expiry').removeClass('invalid');
        _Doc.querySelector('.elem-cvv').removeClass('invalid');
        session.data['card[cvv]'] = '000';

        // explicitly remove, else it'll override month/year later
        delete session.data['card[expiry]'];
        session.data['card[expiry_month]'] = '12';
        session.data['card[expiry_year]'] = '21';
      }
    } else {
      if (!session.data['card[cvv]']) {
        var checkedCard = _Doc.querySelector('.saved-card.checked');

        /**
         * When CVV is missing, allow to go ahead only if:
         * 1. Card is a not Maestro card
         * OR
         * 2. tab=emi and saved card supports emi and emi duration is not selected
         */
        if (
          !(
            _Doc.querySelector('.saved-card.checked .cardtype') &&
            _Doc
              .querySelector('.saved-card.checked .cardtype')
              .getAttribute('cardtype') === 'maestro'
          )
        ) {
          // no saved card was selected
          session.shake();
          return _Doc.querySelector('.checked .saved-cvv').focus();
        }
      }
    }
  }

  export function viewPlans(event) {
    Analytics.track('saved_card:emi:plans:view', {
      type: AnalyticsTypes.BEHAV,
      data: {
        from: 'card',
      },
    });
    session.showEmiPlans('saved')(event.detail);
  }

  function handleCardNumber() {
    var el_card = _Doc.querySelector('#card_number');
    var el_expiry = _Doc.querySelector('#card_expiry');
    var el_cvv = _Doc.querySelector('#card_cvv');
    var el_name = _Doc.querySelector('#card_name');

    var type = Card.getCardType(cardNumber.getValue());

    // update cvv element
    var cvvlen = type !== 'amex' ? 3 : 4;
    el_cvv.maxLength = cvvlen;
    el_cvv.pattern = '^[0-9]{' + cvvlen + '}$';
    // _Doc.querySelector(el_cvv)
    //   .toggleClass('amex', type === 'amex')
    //   .toggleClass('maestro', type === 'maestro');

    if (!preferences.methods.amex && type === 'amex') {
      _Doc.querySelector('#elem-card').addClass('noamex');
    } else {
      _Doc.querySelector('#elem-card').removeClass('noamex');
    }

    self.input(el_cvv);

    // card icon element
    this.el.parentNode
      .querySelector('.cardtype')
      .setAttribute('cardtype', type);
  }
</script>

<Tab method="card" pad={false}>

  {#if showSavedCards}
    <div id="saved-cards-container">
      <SavedCards cards={transformedTokens} on:viewPlans={viewPlans} />
    </div>
    <div
      id="show-add-card"
      on:click={() => toggleSavedCards(false)}
      class="text-btn left-card">
      Add another card
    </div>
  {:else}
    <div
      id="show-saved-cards"
      on:click={() => toggleSavedCards(true)}
      class="text-btn left-card">
      Use saved cards
    </div>
    <div class="pad">
      <div id="add-card-container">
        <div class="card-fields">
          <div class="elem-wrap two-third">
            <div
              class="elem elem-card {session.recurring ? 'recurring' : ''}
              "
              id="elem-card">
              <div class="cardtype" />
              <label>Card Number</label>
              <i>&#xe605;</i>
              <span class="help">Please enter a valid card number</span>
              <span class="help amex-error">
                Amex cards are not supported for this transaction
              </span>
              <span class="help recurring-card-error">
                Card does not support automatic recurring payments
              </span>
              <Field
                formatter={{ type: 'card', on: { input: handleCardNumber, change: handleCardNumber } }}
                helpText="Please enter your card number"
                id="card_number"
                name="card[number]"
                required={true}
                type="tel"
                class="input"
                autocomplete="off"
                maxlength={19}
                value={''}
                bind:this={cardNumber}
                on:input
                on:change />
            </div>
          </div>
          <div class="elem-wrap third">
            <div class="elem elem-expiry">
              <label>Expiry</label>
              <i>&#xe606;</i>
              <Field
                formatter={{ type: 'expiry' }}
                helpText="Please enter your expiry"
                id="card_expiry"
                name="card[expiry]"
                placeholder="MM / YY"
                required={true}
                type={session.isMobile() ? 'tel' : ''}
                class="input"
                maxlength={7}
                value={session.get('prefill.card[expiry]')}
                on:blur />
            </div>
          </div>
          <div class="elem-wrap two-third">
            <div
              class="elem elem-name {session.get('prefill.name') && session.get('readonly.name') ? 'name_readonly' : ''}">
              <span class="help">Please enter name on your card</span>
              <label>Card Holder's Name</label>
              <i>&#xe602;</i>
              <Field
                formatter={{ type: 'card' }}
                helpText="Please enter name on your card"
                id="card_name"
                name="card[name]"
                pattern="^[a-zA-Z. 0-9'-]{(1, 100)}$"
                required={true}
                type="text"
                class="input"
                value={session.get('prefill.name')}
                on:blur />
            </div>
          </div>
          <div class="elem-wrap third">
            <div class="elem elem-cvv mature">
              <label>CVV</label>
              <i>&#xe604;</i>
              <Field
                formatter={{ type: 'number' }}
                helpText="Please enter your cvv"
                id="card_cvv"
                name="card[cvv]"
                pattern="[0-9]{3}"
                required={true}
                type="tel"
                class="input"
                maxlength={3}
                value={session.get('prefill.card[cvv]')}
                on:blur />
              <div class="help" />
            </div>
          </div>
        </div>
        <div class="clear" />
        <div class="double">
          {#if !session.recurring && session.get('remember_customer')}
            <label class="first" id="should-save-card" for="save" tabIndex="0">
              <input
                type="checkbox"
                class="checkbox--square"
                id="save"
                name="save"
                value="1"
                checked />
              <span class="checkbox" />
              Remember Card
            </label>
          {/if}
          <div class="second">
            <span id="view-emi-plans" class="link">
              <a>View all EMI Plans</a>
            </span>
          </div>
          <div class="clear" />
        </div>
        <label id="nocvv-check" for="nocvv">
          <input type="checkbox" class="checkbox--square" id="nocvv" disabled />
          <span class="checkbox" />
          My Maestro Card doesn't have Expiry/CVV
        </label>
        <div class="flow-selection-container">
          <label>Complete Payment Using</label>
          <div class="flow input-radio">
            <input
              type="radio"
              name="auth_type"
              id="flow-3ds"
              value="c3ds"
              checked />
            <label for="flow-3ds">
              <div class="radio-display" />
              <div class="label-content">OTP / Password</div>
            </label>
          </div>

          <div class="flow input-radio">
            <input type="radio" name="auth_type" id="flow-pin" value="pin" />
            <label for="flow-pin">
              <div class="radio-display" />
              <div class="label-content">ATM PIN</div>
            </label>
          </div>
        </div>
      </div>
    </div>
  {/if}
  {#if session.recurring}
    <div id="recurring-message" class="pad recurring-message">
      <span>&#x2139;</span>
      `? !_.subscription`
      {#if session.subscription}
        Future payments on this card will be charged automatically.
        {#if session.subscription && session.subscription.type === 0}
          The charge is to enable subscription on this card and it will be
          refunded.
        {/if}
        This card will be linked to the subscription and future payments will be
        charged automatically.
      {/if}
    </div>
  {/if}

</Tab>
