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

  // UI imports
  import AsyncLoading from 'templates/views/ui/AsyncLoading.svelte';
  import Callout from 'templates/views/ui/Callout.svelte';
  import Tab from 'templates/tabs/Tab.svelte';
  import SavedCards from 'templates/screens/savedcards.svelte';

  var session = new getSession();
  // Props
  export let loading = true;
  export let data = null;
  export let error = null;
  export let emiOptions = null;
  export let remember = null;
  export let otpView = null;
  export let commenceOTP = null;

  // Refs
  export let neftDetails = null;
  const cardType = _Doc.querySelector('#elem-card .cardtype[cardtype]');
  var nocvvCheck = _Doc.querySelector('#nocvv');
  var { customer } = session; // Move this to watcher.

  var showSavedCards = false;
  var transformedTokens = null;

  //   //computed
  // TODO Move bindevents line no 2940

  //   const footerButtons = {
  //     copyDetails: _Doc.querySelector('#footer .bank-transfer-copy-details'),
  //     pay: _Doc.querySelector('#footer .pay-btn'),
  //     body: _Doc.querySelector('#body'),
  //   };

  function toggleNoCvv(show) {
    // Display or hide the nocvv checkbox
    //   nocvvCheck.toggleClass(shownClass, show); TODO
    nocvvCheck.disabled = !show;
  }

  function noCvvToggle() {
    var shouldHideExpiryCVV = nocvvCheck.checked && !nocvvCheck.disabled;
    //   _Doc.querySelector('#form-card').toggleClass('nocvv', shouldHideExpiryCVV);
  }

  function onSixDigits(e) {
    const el = _Doc.querySelector('#card_number');
    var emi_options = emiOptions; // Rajat: remove this later.
    const cardType = _Doc.querySelector('#elem-card .cardtype[cardtype]');
    var nocvvCheck = _Doc.querySelector('nocvv');
    var emiObj;
    var val = el.value;

    var isMaestro = /^maestro/.test(cardType);
    var sixDigits = val.length > 5;
    var trimmedVal = val.replace(/[\ ]/g, '');

    //   _Doc.querySelector(el.parentNode).toggleClass('six', sixDigits); // TODo

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

    //   showAppropriateEmiDetailsForNewCard( // Rajat, ask how to port this
    //     this.tab,
    //     emiObj,
    //     trimmedVal.length,
    //     this.methods
    //   );

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
    let { customer } = session;
    session.otpView.updateScreen({
      maxlength: 6,
    });
    onSixDigits.call(this);
    const remember = session.get('remember_customer');
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
            askOTP(
              session.otpView,
              'Enter OTP sent on ' +
                session.getPhone() +
                '<br>to save your card for future payments',
              true
            );
          });
        } else if (customer.saved && !customer.logged) {
          askOTP(otpView, undefined, true);
        } else {
          showCards();
        }
      });
    } else {
      showCards();
    }
  }

  function showCards() {
    console.log('this is showcards');
    setSavedCards();
    session.setScreen('card');
  }

  function setSavedCards() {
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
      this.tab,
      this.selectedSavedCardToken
    );

    if (tokens && selectableSavedCard) {
      session.setSavedCard({ delegateTarget: selectableSavedCard });
    }

    session.savedCardScreen = tokens;

    session.toggleSavedCards(!!tokens);

    toggleClassById('form-card', 'has-cards', tokens); //TODO: pure functions

    each(_Doc.querySelectorAll('.saved-cvv'), function(i, input) {
      delegator.add('number', input);
    });
  }

  //   function setScreen(){

  //   }

  //   export function onBack() {
  //     showCopyButton(false, '');
  //     return false;
  //   }

  function toggleClassById(elem, className, condition) {
    let element = _Doc.querySelector('#elem');

    if (arguments.length === 1) {
      condition = !element.classList.contains(className);
    }
    if (condition) {
      _El.addClass(element, className);
    } else {
      _El.removeClass(element, className);
    }
  }

  function getSelectableSavedCardElement(tab, token) {
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

  export function shouldSubmit() {
    alert(2);
    // copyToClipboard('.neft-details', neftDetails.innerText);
    // Analytics.track('bank_transfer:copy:click', {
    //   type: AnalyticsTypes.BEHAV,
    // });
    // showCopyButton(true, 'COPIED');
    // return false;
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
</script>

<Tab method="card">
  <div>this is card tab</div>
  {#if showSavedCards}
    <SavedCards cards={transformedTokens} on:viewPlans={viewPlans} />
  {/if}
</Tab>
