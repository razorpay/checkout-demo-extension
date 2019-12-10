<script>
  import { fly } from 'svelte/transition';

  import Tab from 'templates/tabs/Tab.svelte';
  import AddCardView from '../../views/AddCardView.svelte';
  import SavedCards from 'templates/screens/savedcards.svelte';

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
  } from 'checkoutstore/screens/card';

  // Utils imports
  import { getSession } from 'sessionmanager';

  export let askOTP = _Func.noop;

  let currentView = 'add-card';
  let cardType = null;

  const session = getSession();

  const cards = [
    {
      id: 'token_DiV5lzvFEwI31Y',
      entity: 'token',
      token: 'HwsKpQLNbKBrZ5',
      bank: null,
      wallet: null,
      method: 'card',
      card: {
        entity: 'card',
        name: 'Test Service Center',
        last4: '1111',
        network: 'Visa',
        type: 'debit',
        issuer: null,
        international: false,
        emi: false,
        expiry_month: 2,
        expiry_year: 2021,
        flows: { recurring: false, iframe: true },
        networkCode: 'visa',
      },
      recurring: false,
      auth_type: null,
      mrn: null,
      used_at: 1574232987,
      created_at: 1574232987,
      expired_at: 1614536999,
      plans: null,
      cvvDigits: 3,
      debitPin: false,
    },
    {
      id: 'token_Bsz59A6aWr7RsR',
      entity: 'token',
      token: 'HSUHVkyFGqBFll',
      bank: null,
      wallet: null,
      method: 'card',
      card: {
        entity: 'card',
        name: 'Chintan',
        last4: '8293',
        network: 'Visa',
        type: 'debit',
        issuer: 'SBIN',
        international: false,
        emi: false,
        expiry_month: 2,
        expiry_year: 2021,
        flows: { recurring: false, iframe: false },
        networkCode: 'visa',
      },
      recurring: false,
      auth_type: null,
      mrn: null,
      used_at: 1556195751,
      created_at: 1549447828,
      expired_at: 1614536999,
      plans: false,
      cvvDigits: 3,
      debitPin: false,
    },
  ];

  function setView(view) {
    currentView = view;
  }

  function showCards() {
    // TODO: implement
  }

  export function getPayload() {
    return {
      'card[number]': $cardNumber,
      'card[expiry]': $cardExpiry,
      'card[cvv]': $cardCvv,
      'card[name]': $cardName,
    };
  }

  // function onSixDigits(e) {
  //   const el = _Doc.querySelector('#card_number');
  //   var emi_options = session.emi_options; // Rajat: remove this later.
  //   const cardType = _Doc.querySelector('#elem-card .cardtype[cardtype]');
  //   var nocvvCheck = _Doc.querySelector('nocvv');
  //   var emiObj;
  //   var val = el.value;
  //
  //   var isMaestro = /^maestro/.test(cardType);
  //   var sixDigits = val.length > 5;
  //   var trimmedVal = val.replace(/[ ]/g, '');
  //
  //   _El.toggleClass(el.parentNode, 'six');
  //
  //   if (sixDigits) {
  //     if (isMaestro) {
  //       if (nocvvCheck.disabled) {
  //         toggleNoCvv(true);
  //       }
  //     } else {
  //       each(emi_options.banks, function(bank, emiObjInner) {
  //         if (emiObjInner.patt.test(val.replace(/ /g, ''))) {
  //           emiObj = emiObjInner;
  //         }
  //       });
  //
  //       toggleNoCvv(false);
  //     }
  //   } else {
  //     toggleNoCvv(false);
  //   }
  //
  //   this.emiPlansForNewCard = emiObj;
  //
  //   if (emiObj) {
  //     _Doc.querySelector('#expiry-cvv').removeClass('hidden'); //Rajat, convention for id of elements
  //   } else {
  //     _Doc.querySelector('#emi_duration').value = '';
  //   }
  //
  //   if (trimmedVal.length >= 6) {
  //     var emiBankChangeEvent;
  //     if (typeof Event === 'function') {
  //       emiBankChangeEvent = new Event('change');
  //     } else {
  //       emiBankChangeEvent = document.createEvent('Event');
  //       emiBankChangeEvent.initEvent('change', true, true);
  //     }
  //   }
  //
  //   noCvvToggle();
  //
  //   var elem_emi = _Doc.querySelector('#elem-emi');
  //   var hiddenClass = 'hidden';
  //
  //   if (isMaestro && sixDigits) {
  //     elem_emi.addClass(hiddenClass);
  //   } else if (elem_emi.classList.contains(hiddenClass)) {
  //     invoke('removeClass', elem_emi, hiddenClass, 200);
  //   }
  // }

  export function onShown() {
    let { customer } = session;
    session.otpView.updateScreen({
      maxlength: 6,
    });
    // onSixDigits.call(this);
    const remember = session.get('remember_customer');

    if (!remember) {
      // Rajat
      return session.setScreen('card');
    }

    session.tab_titles.otp = session.tab_titles.card; //Rajat, how is this working?
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
          askOTP(session.otpView, undefined, true);
        } else {
          // showCards();
        }
      });
    } else {
      // showCards();
    }
  }
</script>

<Tab method="card" pad={false}>
  {#if currentView === 'add-card'}
    <div transition:fly={{ duration: 100, y: 100 }}>
      <div
        id="show-saved-cards"
        on:click={() => setView('saved-cards')}
        class="text-btn left-card">
        Use saved cards
      </div>
      <AddCardView bind:cardType />
    </div>
  {:else}
    <div>
      <div id="saved-cards-container">
        <SavedCards {cards} />
      </div>
      <div
        id="show-add-card"
        class="text-btn left-card"
        on:click={() => setView('add-card')}>
        Add another card
      </div>
    </div>
  {/if}
</Tab>
