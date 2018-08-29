import Track from 'tracker';
import { getSession } from 'sessionmanager';

const emandateTabTitles = {
  'emandate-bank': 'Bank',
  'emandate-netbanking': 'Netbanking',
  'emandate-aadhaar': 'Aadhaar',
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
    /* bank_ifsc is the ifsc code for user's bank account */
    bank_ifsc: session.get('prefill.bank_account[ifsc]'),
    /* auth_type that the merchant wants to enforce */
    auth_type: session.get('prefill.auth_type'),
    /* aadhaar VID is the 16 digit aadhaar number of the user */
    aadhaar: session.get('prefill.aadhaar[vid]'),
    /* auth mode can be otp/fp */
    auth_mode: session.get('prefill.auth_mode'),
    /* account type can be savings/current */
    account_type: session.get('prefill.account_type'),
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
    const $el = _Doc.querySelector(selector);
    this.listeners.push($el |> _El.on(event, listener, capture));
  },

  inputRadioChanged: function(e) {
    const val = e.target.value;

    if (val === 'yes') {
      this.session.setPayButtonText('Proceed');
    } else if (val === 'no') {
      this.session.setPayButtonText('Create Aadhaar VID');
    }
  },

  bind: function() {
    const delegator = this.session.delegator;

    if (!this.session.get('prefill.bank')) {
      this.on('click', '#emandate-bank .btn-change-bank', () => {
        this.session.deselectBank();
        this.setScreen('emandate');
        this.history = ['emandate'];
      });
    }

    delegator.adhr_acc_no = delegator.add(
      'alphanumeric',
      _Doc.querySelector('#adhr-acc-no')
    );
    delegator.nb_acc_no = delegator.add(
      'alphanumeric',
      _Doc.querySelector('#nb-acc-no')
    );
    delegator.adhr_ifsc = delegator
      .add('ifsc', _Doc.querySelector('#adhr-acc-ifsc'))
      .on('change', function() {
        if (this.isValid() && this.el.value.length === this.caretPosition) {
          invoke('focus', _Doc.querySelector('#adhr-acc-name'), null, 0);
        }
      });
    delegator.nb_ifsc = delegator
      .add('ifsc', _Doc.querySelector('#nb-acc-ifsc'))
      .on('change', function() {
        if (this.isValid() && this.el.value.length === this.caretPosition) {
          invoke('focus', _Doc.querySelector('#nb-acc-name'), null, 0);
        }
      });
    delegator.aadhaar = delegator.add(
      'aadhaar',
      _Doc.querySelector('#adhr-acc-aadhaar')
    );

    // Fire events for the aadhaar-linked-to-bank-account checkbox
    this.on('change', '#emandate-aadhaar-linked-check-label', e => {
      const checked = e.target.checked;

      Track(this.session.r, 'emandate_aadhaar_linked_checkbox_change', {
        checked,
      });
    });
  },

  unbind: function() {
    // TODO: Replace invokeEach once refactored.
    invokeEach(this.listeners);
    this.listeners = [];
  },

  input: function() {
    _Arr.loop(this.el.querySelectorAll('input[name]'), el => {
      this.session.input(el);
    });
  },

  determineLandingScreen: function() {
    if (this.prefill.bank && this.banks[this.prefill.bank]) {
      let landingScreen = 'emandate-bank';

      _Doc.querySelector('#bank-select').value = this.prefill.bank;

      this.setBank(this.prefill.bank);

      if (this.prefill.auth_type) {
        landingScreen = 'emandate-' + this.prefill.auth_type;
      }

      return landingScreen;
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
     * 2. auth_mode and account_type are NOT set in prefill
     */
    if (
      authTypes.indexOf('netbanking') > -1 &&
      (this.prefill.auth_mode || this.prefill.account_type)
    ) {
      authTypes.splice(authTypes.indexOf('netbanking'), 1);
    }

    return authTypes;
  },

  setBank: function(bankCode) {
    const netbanks = this.session.netbanks;
    const backgroundImage =
      'background-image: url(' +
      (netbanks[bankCode]
        ? netbanks[bankCode].logo
        : 'https://cdn.razorpay.com/bank/' + bankCode + '.gif') +
      ')';

    this.bank = bankCode;

    const authTypes = this.getAuthTypes(bankCode);

    _El.addClass(
      _Doc.querySelector('#emandate-options .netbanking'),
      'disabled'
    );
    _El.addClass(_Doc.querySelector('#emandate-options .aadhaar'), 'disabled');

    /**
     * Netbanking is allowed only if
     * 1. netbanking is an auth type, AND
     * 2. auth_mode and account_type are NOT set in prefill
     */
    if (
      authTypes.indexOf('netbanking') > -1 &&
      !(this.prefill.auth_mode || this.prefill.account_type)
    ) {
      $('#emandate-options .netbanking').removeClass('disabled');
    }

    if (authTypes.indexOf('aadhaar') > -1) {
      _El.removeClass(
        _Doc.querySelector('#emandate-options .aadhaar'),
        'disabled'
      );
    }

    _Arr.loop(_Doc.querySelectorAll('#emandate-inner .bank-icon'), elem => {
      _El.setAttribute(elem, 'style', backgroundImage);
    });

    _El.setAttribute(_Doc.querySelector('#emandate-bank'), 'bank', bankCode);
    _El.setContents(
      _Doc.querySelector('#emandate-bank .bank-name'),
      this.banks[bankCode]
    );
  },

  showBankOptions: function(bankCode) {
    this.setBank(bankCode);
    this.showTab('emandate-bank');
  },

  setTabTitles: function() {
    _Obj.loop(emandateTabTitles, (v, k) => {
      tab_titles[k] = v;
    });
  },

  setScreen: function(screen) {
    this.session.setScreen(screen);

    if (screen === 'emandate-bank' || screen === 'emandate') {
      this.session.body.removeClass('sub');
    } else {
      this.session.body.addClass('sub');
    }

    // if (screen === 'emandate-aadhaar') {
    //   this.originalPayBtnText = _Doc.querySelector('.pay-btn').innerHTML;

    //   if (this.session.get('prefill.aadhaar[vid]')) {
    //     this.session.setPayButtonText('Proceed');
    //   } else {
    //     this.session.setPayButtonText('Next');
    //   }
    // } else if (this.originalPayBtnText) {
    //   this.session.setPayButtonText(this.originalPayBtnText);
    // }
  },

  showTab: function(tab) {
    const landingScreen = this.determineLandingScreen();

    if (tab === 'emandate' && landingScreen) {
      tab = landingScreen;
    }

    const authTypes = this.getAuthTypes();

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

    // if (screen === 'emandate-aadhaar') {
    //   if (!this.session.get('prefill.aadhaar[vid]')) {
    //     if (this.curtainVisible && gel('emandate-aadhaar-radio-no')) {
    //       if (gel('emandate-aadhaar-radio-no').checked) {
    //         this.openUIDAI();
    //         gel('emandate-aadhaar-radio-no').checked = false;
    //         gel('emandate-aadhaar-radio-yes').checked = true;
    //         this.session.setPayButtonText('Proceed');
    //         return;
    //       }
    //     } else if (!this.curtainVisible) {
    //       this.showCurtain();
    //       return;
    //     }
    //   }
    // }

    fillData(formSelector, data);

    delete data['emandate-aadhaar-radio'];

    if (data['aadhaar[vid]']) {
      data['aadhaar[vid]'] = data['aadhaar[vid]'].replace(/ /g, '');
    }

    if (screen === 'emandate-aadhaar') {
      data['auth_type'] = 'aadhaar';
    } else if (screen === 'emandate-netbanking') {
      data['auth_type'] = 'netbanking';
    }

    /**
     * If the auth type is Aadhaar,
     * proceed only if the checkbox is checked by the user.
     */
    if (data['auth_type'] === 'aadhaar') {
      const checkbox = _Doc.querySelector('#emandate-aadhaar-linked-check');
      if (checkbox && !checkbox.checked) {
        this.session.shake();
        return;
      }
    }

    this.session.submit();
  },

  openUIDAI: function() {
    const qpmap = _.getQueryParams();
    const isSupportedSDK = qpmap.platform && !isUnsupportedSDK();

    if (isSupportedSDK) {
      Track(this.session.r, 'emandate_aadhaar_uidai_link_intent');
      CheckoutBridge.callNativeIntent(
        _Doc.querySelector('#aadhaar_vid_link').href
      );
    } else {
      Track(this.session.r, 'emandate_aadhaar_uidai_link_native');
      _Doc.querySelector('#aadhaar_vid_link').click();
    }
  },

  showCurtain: function() {
    const showSDKView = isUnsupportedSDK();

    Curtain.show({
      content: templates.contents_aadhaar_vid({
        showSDKView: showSDKView,
      }),
      onClose: () => {
        this.hideCurtain();
      },
      onShow: () => {
        this.curtainVisible = true;

        if (showSDKView) {
          this.session.setPayButtonText('Proceed');

          _El.setContents(
            _Doc.querySelector('#emandate-uidai-copy'),
            templates.copytoclipboard({
              content:
                'https://resident.uidai.gov.in/web/resident/vidgeneration',
              btnText: 'Copy Link',
            })
          );

          this.on('click', '#emandate-uidai-copy .copytoclipboard--btn', () => {
            Track(this.session.r, 'aadhar_vid_link_copied');
          });
        } else {
          this.session.setPayButtonText('Create Aadhaar VID');

          this.on(
            'change',
            '#emandate-aadhaar-radios',
            bind(this.inputRadioChanged, this),
            true
          );
        }

        this.on('mouseover', '.emandate-education-text .has-tooltip', () => {
          Track(this.session.r, 'emandate_aadhaar_tooltip_viewed');
        });

        this.on('click', '#emandate-aadhaar-radios', e => {
          if (e.target.nodeName.toLowerCase() === 'input') {
            Track(this.session.r, 'emandate_aadhaar_radio_change', {
              value: e.target.value,
            });
          }
        });
      },
    });
  },

  hideCurtain: function() {
    this.curtainVisible = false;

    this.session.setPayButtonText('Next');

    Track(this.session.r, 'emandate_aadhaar_curtain_closed');
  },
};

/**
 * Unsupported SDKs are
 * all iOS SDKs and
 * Android SDKs without callNativeIntent
 */
function isUnsupportedSDK() {
  var qpmap = _.getQueryParams();
  if (qpmap.platform) {
    return !(CheckoutBridge && CheckoutBridge.callNativeIntent);
  }

  return false;
}
