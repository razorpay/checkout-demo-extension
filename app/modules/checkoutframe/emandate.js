import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { getCheckoutBridge } from 'bridge';
import * as Curtain from 'components/curtain';
import { getSession } from 'sessionmanager';

/* global templates, fillData */

const emandateTabTitles = {
  'emandate-details': 'Account Details',
  'emandate-auth-selection': 'Select Auth',
};

export default function emandateView() {
  const session = getSession();

  this.history = [];
  this.session = session;

  /* Prefill */
  this.prefill = {
    /* bank is the bank code for a particular bank */
    bank: session.get('prefill.bank'),
    /* bank_account is the account number of user */
    bank_account: session.get('prefill.bank_account[account_number]'),
    /* bank_name is the name of the account holder */
    bank_name: session.get('prefill.bank_account[name]'),
    /* account type can be savings/current */
    account_type: session.get('prefill.bank_account[account_type]'),
    /* bank_ifsc is the ifsc code for user's bank account */
    bank_ifsc: session.get('prefill.bank_account[ifsc]'),
    /* auth_type that the merchant wants to enforce */
    auth_type: session.get('prefill.auth_type'),
  };

  this.opts = {
    session: session,
    prefill: this.prefill,
  };

  this.banks = this.session.methods.emandate;
  this.emandateBanks = this.session.emandateBanks;

  this.setTabTitles();
  this.render();
}

emandateView.prototype = {
  render: function() {
    this.unbind();

    _El.setContents(
      _Doc.querySelector('#emandate-wrapper'),
      templates.emandate(this.opts)
    );

    this.el = _Doc.querySelector('#emandate-wrapper').firstChild;

    this.input();
    this.bind();
  },

  on: function(event, selector, listener, capture) {
    const el = _Doc.querySelector(selector);
    this.listeners.push(el |> _El.on(event, listener, capture));
  },

  bind: function() {
    const delegator = this.session.delegator;

    delegator.nb_acc_no = delegator.add(
      'alphanumeric',
      _Doc.querySelector('#nb-acc-no')
    );

    delegator.nb_ifsc = delegator
      .add('ifsc', _Doc.querySelector('#nb-acc-ifsc'))
      .on('change', function() {
        if (this.isValid() && this.el.value.length === this.caretPosition) {
          let field = _Doc.querySelector('#nb-acc-name');
          if (field && _.isFunction(field.focus)) {
            field.focus();
          }
        }
      });

    if (!this.session.get('prefill.bank')) {
      this.on('click', '#emandate-bank .btn-change-bank', () => {
        this.session.netbankingTab.deselectBank();
        this.setScreen('emandate');
        this.history = ['emandate'];
      });
    }

    this.on('click', '.auth-option.netbanking', () => {
      Analytics.track('emandate:auth_type:select', {
        type: AnalyticsTypes.BEHAV,
        data: {
          auth_type: 'netbanking',
        },
      });

      this.setAuthType('netbanking');
      this.showTab('emandate-details');
    });

    this.on('click', '.auth-option.debitcard', () => {
      Analytics.track('emandate:auth_type:select', {
        type: AnalyticsTypes.BEHAV,
        data: {
          auth_type: 'debitcard',
        },
      });

      this.setAuthType('debitcard');
      this.showTab('emandate-details');
    });
  },

  track: function(name, data = {}, type) {
    Analytics.track(`emandate:${name}`, {
      type,
      data,
    });
  },

  unbind: function() {
    _Arr.loop(this.listeners, function(delistener) {
      delistener();
    });
    this.listeners = [];
  },

  input: function() {
    _Arr.loop(this.el.querySelectorAll('input[name]'), el => {
      this.session.input(el);
    });
  },

  showLandingScreenIfApplicable: function(tab) {
    const prefilledBank = this.prefill.bank;
    const prefilledAuthType = this.prefill.auth_type;

    /**
     * 'emandate' refers to the emandate landing screen. If the tab to be
     * switched to is emandate i.e. the landing screen and bank is prefilled,
     * we set the bank snd skip the bank selection screen.
     */
    if (tab === 'emandate' && this.prefill.bank && this.banks[prefilledBank]) {
      this.session.netbankingTab.setSelectedBank(prefilledBank);
      this.setBank(prefilledBank);

      /**
       * If auth_type is also prefilled and available, we set the auth type, skip
       * the auth type screen as well and directly switch to the bank details
       * form.
       */
      if (
        this.prefill.auth_type &&
        _Arr.contains(
          this.getAvailableAuthTypes(prefilledBank),
          prefilledAuthType
        )
      ) {
        this.setAuthType(prefilledAuthType);
        this.showTab('emandate-details');
      } else {
        this.showTab('emandate-auth-selection');
      }
      return true;
    }
    return false;
  },

  getAvailableAuthTypes: function(bankCode) {
    let authTypes = [];
    bankCode = bankCode || this.bank;

    if (this.session.emandateBanks && this.session.emandateBanks[bankCode]) {
      authTypes = this.session.emandateBanks[bankCode].auth_types;
    }

    /**
     * Netbanking is allowed only if
     * 1. netbanking is an auth type, AND
     * 2. account_type is NOT set in prefill
     */
    if (authTypes.indexOf('netbanking') > -1 && this.prefill.account_type) {
      authTypes.splice(authTypes.indexOf('netbanking'), 1);
    }

    return authTypes;
  },

  setBank: function(bankCode) {
    const backgroundImage = `background-image: url(https://cdn.razorpay.com/bank/${bankCode}.gif)`;

    this.bank = bankCode;

    const authTypes = this.getAvailableAuthTypes(bankCode);
    this.setAvailableAuthTypesInView(authTypes);

    _Arr.loop(_Doc.querySelectorAll('#emandate-inner .bank-icon'), elem => {
      _El.setAttribute(elem, 'style', backgroundImage);
    });

    _El.setContents(
      _Doc.querySelector('#emandate-inner .bank-name'),
      this.banks[bankCode]
    );
  },

  setAuthType: function(authType) {
    this.authType = authType;
  },

  getAuthType: function() {
    return this.authType;
  },

  setAvailableAuthTypesInView: function(authTypes) {
    _El.keepClass(
      _Doc.querySelector('.auth-option.netbanking'),
      'hidden',
      !_Arr.contains(authTypes, 'netbanking')
    );
    _El.keepClass(
      _Doc.querySelector('.auth-option.debitcard'),
      'hidden',
      !_Arr.contains(authTypes, 'debitcard')
    );
  },

  showBankDetailsForm: function(bankCode) {
    this.setBank(bankCode);
    this.showTab('emandate-auth-selection');
  },

  setTabTitles: function() {
    _Obj.loop(emandateTabTitles, (v, k) => {
      this.session.tab_titles[k] = v;
    });
  },

  setScreen: function(screen) {
    this.session.setScreen(screen);

    if (screen !== 'emandate-details') {
      this.session.body.removeClass('sub');
    } else {
      this.session.body.addClass('sub');
    }
  },

  showTab: function(tab) {
    const landingScreenShown = this.showLandingScreenIfApplicable(tab);
    if (landingScreenShown) {
      return;
    }
    const authTypes = this.getAvailableAuthTypes();

    // Proceed only if selected auth_type is available for the selected bank
    if (
      tab === 'emandate-details' &&
      !_Arr.contains(authTypes, this.getAuthType())
    ) {
      return false;
    }

    this.session.body.attr('tab', 'emandate');
    this.session.tab = 'emandate';
    this.history.push(tab);
    this.setScreen(tab);
  },

  back: function() {
    Analytics.track('emandate:back', {
      type: AnalyticsTypes.BEHAV,
      data: {
        auth_type: this.authType,
      },
    });

    this.history.pop();
    if (this.history.length === 0) {
      _El.removeClass(_Doc.querySelector('#container'), 'emandate-extra');
      return false;
    }

    var newScreen = this.history[this.history.length - 1];
    this.setScreen(newScreen);

    if (newScreen === 'emandate') {
      this.session.netbankingTab.deselectBank();
    }

    return true;
  },

  submit: function(data) {
    const screen = this.session.screen;
    const formSelector = '#form-' + screen;

    if (this.session.checkInvalid(formSelector)) {
      return;
    }

    fillData(formSelector, data);

    if (!data['auth_type']) {
      data['auth_type'] = this.getAuthType();
    }

    this.session.submit();
  },
};
