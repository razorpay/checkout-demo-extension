import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { getCheckoutBridge } from 'bridge';
import * as Curtain from 'components/curtain';

/* global templates, fillData */

const emandateTabTitles = {
  'emandate-netbanking': 'Netbanking',
};

export default function emandateView(session) {
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

  determineLandingScreen: function() {
    if (this.prefill.bank && this.banks[this.prefill.bank]) {
      _Doc.querySelector('#bank-select').value = this.prefill.bank;
      this.setBank(this.prefill.bank);

      return 'emandate-netbanking';
    }
    return false;
  },

  getAuthTypes: function(bankCode) {
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
    const netbanks = this.session.netbanks;
    const backgroundImage = `background-image: url(https://cdn.razorpay.com/bank/${bankCode}.gif)`;

    this.bank = bankCode;

    const authTypes = this.getAuthTypes(bankCode);

    _Arr.loop(_Doc.querySelectorAll('#emandate-inner .bank-icon'), elem => {
      _El.setAttribute(elem, 'style', backgroundImage);
    });
  },

  showBankDetailsForm: function(bankCode) {
    this.setBank(bankCode);
    this.showTab('emandate-netbanking');
  },

  setTabTitles: function() {
    _Obj.loop(emandateTabTitles, (v, k) => {
      this.session.tab_titles[k] = v;
    });
  },

  setScreen: function(screen) {
    this.session.setScreen(screen);

    if (screen === 'emandate') {
      this.session.body.removeClass('sub');
    } else {
      this.session.body.addClass('sub');
    }
  },

  showTab: function(tab) {
    const landingScreen = this.determineLandingScreen();

    if (landingScreen) {
      tab = landingScreen;
    }

    const authTypes = this.getAuthTypes();

    if (tab === 'emandate-netbanking' && authTypes.indexOf('netbanking') < 0) {
      return false;
    }

    this.session.body.attr('tab', 'emandate');
    this.session.tab = 'emandate';
    this.history.push(tab);
    this.setScreen(tab);
  },

  back: function() {
    this.history.pop();
    if (this.history.length === 0) {
      _El.removeClass(_Doc.querySelector('#container'), 'emandate-extra');
      return false;
    }

    var newScreen = this.history[this.history.length - 1];
    this.setScreen(newScreen);

    if (newScreen === 'emandate') {
      this.session.deselectBank();
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
      data['auth_type'] = 'netbanking';
    }

    this.session.submit();
  },
};
