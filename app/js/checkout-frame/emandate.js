var emandateTabTitles = {
  'emandate-bank': 'Bank',
  'emandate-netbanking': 'Netbanking',
  'emandate-aadhaar': 'Aadhaar'
};

function emandateView(session) {
  this.history = [];
  this.session = session;
  this.opts = {
    session: session
  };

  this.banks = this.session.methods.emandate;

  this.setTabTitles();
  this.render();
}

emandateView.prototype = {
  render: function() {
    this.unbind();
    gel('emandate-wrapper').innerHTML = templates.emandate(this.opts);
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
          invoke('focus', gel('adhr-acc-aadhaar'), null, 0);
        }
      });
    delegator.nb_ifsc = delegator.add('ifsc', gel('nb-acc-ifsc'));
    delegator.aadhaar = delegator.add('aadhaar', gel('adhr-acc-aadhaar'));
  },

  unbind: function() {
    invokeEach(this.listeners);
    this.listeners = [];
  },

  setBank: function(bankCode) {
    var backgroundImage =
      'background-image: url(' +
      (netbanks[bankCode]
        ? netbanks[bankCode].image
        : 'https://cdn.razorpay.com/bank/' + bankCode + '.gif') +
      ')';
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

    console.log(data);

    this.session.submit();
  }
};
