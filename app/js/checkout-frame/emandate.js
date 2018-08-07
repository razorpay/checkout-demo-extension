var emandateTabTitles = {
  'emandate-bank': 'Bank',
  'emandate-netbanking': 'Netbanking',
  'emandate-aadhaar': 'Aadhaar',
};

function emandateView(session) {
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
    /* bank_ifsc is the ifsc code for user's bank account */
    bank_ifsc: session.get('prefill.bank_account[ifsc]'),
    /* auth_type that the merchant wants to enforce */
    auth_type: session.get('prefill.auth_type'),
    /* aadhaar is the 12 digit aadhaar number of the user */
    aadhaar: session.get('prefill.aadhaar[number]'),
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
    gel('emandate-wrapper').innerHTML = templates.emandate(this.opts);
    this.el = gel('emandate-wrapper').firstChild;
    this.input();
    this.bind();
  },

  on: function(event, sel, listener) {
    var $el = $(sel);
    this.listeners.push($el.on(event, listener));
  },

  bind: function() {
    var self = this;

    this.on('click', '#emandate-bank .btn-change-bank', function() {
      self.setScreen('emandate');
      self.history = ['emandate'];
    });

    var delegator = this.session.delegator;
    delegator.adhr_acc_no = delegator.add('alphanumeric', gel('adhr-acc-no'));
    delegator.nb_acc_no = delegator.add('alphanumeric', gel('nb-acc-no'));
    delegator.adhr_ifsc = delegator
      .add('ifsc', gel('adhr-acc-ifsc'))
      .on('change', function() {
        if (this.isValid() && this.el.value.length === this.caretPosition) {
          invoke('focus', gel('adhr-acc-name'), null, 0);
        }
      });
    delegator.nb_ifsc = delegator
      .add('ifsc', gel('nb-acc-ifsc'))
      .on('change', function() {
        if (this.isValid() && this.el.value.length === this.caretPosition) {
          invoke('focus', gel('nb-acc-name'), null, 0);
        }
      });
    delegator.aadhaar = delegator.add('aadhaar', gel('adhr-acc-aadhaar'));
  },

  unbind: function() {
    invokeEach(this.listeners);
    this.listeners = [];
  },

  input: function() {
    var self = this;
    each($(this.el).find('input[name]'), function(i, el) {
      self.session.input(el);
    });
  },

  determineLandingScreen: function() {
    if (this.prefill.bank && this.banks[this.prefill.bank]) {
      var landingScreen = 'emandate-bank';
      $('#bank-select').val(this.prefill.bank);
      this.setBank(this.prefill.bank);

      if (this.prefill.auth_type) {
        landingScreen = 'emandate-' + this.prefill.auth_type;
      }

      return landingScreen;
    }
    return false;
  },

  getAuthTypes: function(bankCode) {
    var authTypes = [];
    bankCode = bankCode || this.bank;

    if (this.session.emandateBanks && this.session.emandateBanks[bankCode]) {
      authTypes = this.session.emandateBanks[bankCode].auth_types;
    }

    return authTypes;
  },

  setBank: function(bankCode) {
    var netbanks = this.session.netbanks;
    var backgroundImage =
      'background-image: url(' +
      (netbanks[bankCode]
        ? netbanks[bankCode].logo
        : 'https://cdn.razorpay.com/bank/' + bankCode + '.gif') +
      ')';

    this.bank = bankCode;

    var authTypes = this.getAuthTypes(bankCode);

    $('#emandate-options .netbanking').addClass('disabled');
    $('#emandate-options .aadhaar').addClass('disabled');

    if (authTypes.indexOf('netbanking') > -1) {
      $('#emandate-options .netbanking').removeClass('disabled');
    }

    if (authTypes.indexOf('aadhaar') > -1) {
      $('#emandate-options .aadhaar').removeClass('disabled');
    }

    each($$('#emandate-inner .bank-icon'), function(i, elem) {
      $(elem).attr('style', backgroundImage);
    });

    $('#emandate-bank').attr('bank', bankCode);
    $('#emandate-bank .bank-name').html(this.banks[bankCode]);
  },

  showBankOptions: function(bankCode) {
    this.setBank(bankCode);
    this.showTab('emandate-bank');
  },

  setTabTitles: function() {
    each(emandateTabTitles, function(k, v) {
      tab_titles[k] = v;
    });
  },

  setScreen: function(screen) {
    this.session.setScreen(screen);

    if (screen === 'emandate-bank') {
      this.session.body.removeClass('sub');
    } else {
      this.session.body.addClass('sub');
    }

    if (screen === 'emandate') {
      $('#container').addClass('emandate-extra');
    } else {
      $('#container').removeClass('emandate-extra');
    }
  },

  showTab: function(tab) {
    var landingScreen = this.determineLandingScreen();
    if (tab === 'emandate' && landingScreen) {
      tab = landingScreen;
    }

    var authTypes = this.getAuthTypes();

    if (
      (tab === 'emandate-netbanking' && authTypes.indexOf('netbanking') < 0) ||
      (tab === 'emandate-aadhaar' && authTypes.indexOf('aadhaar') < 0)
    ) {
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
      $('#container').removeClass('emandate-extra');
      return false;
    }

    this.setScreen(this.history[this.history.length - 1]);
    return true;
  },

  submit: function(data) {
    var screen = this.session.screen;
    var formSelector = '#form-' + screen;
    fillData(formSelector, data);

    if (this.session.checkInvalid(formSelector)) {
      return;
    }

    if (data['aadhaar[number]']) {
      data['aadhaar[number]'] = data['aadhaar[number]'].replace(/ /g, '');
    }

    if (screen === 'emandate-aadhaar') {
      data['auth_type'] = 'aadhaar';
    } else if (screen === 'emandate-netbanking') {
      data['auth_type'] = 'netbanking';
    }

    this.session.submit();
  },
};
