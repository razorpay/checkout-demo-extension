var TIMEOUT_CLEAR = -1;
var TIMEOUT_NO_OTP = 30000;
var TIMEOUT_UNKNOWN = 3000;
var TIMEOUT_REDIRECT = 20000;
var TIMEOUT_MAGIC_NO_ACTION = 30000;

var TOAST_SHORT = 0;
var TOAST_LONG = 1;

function magicView(session) {
  this.session = session;
  this.opts = {
    session: session
  };
  this.render();
  this.resendCount = 0;
  this.checkoutVisible = true;
  this.screenMap = {
    'magic-choice': 'select_choice',
    'magic-otp': 'submit_otp'
  };

  this.supportedBanks = ['unknown', 'HDFC'];
}

magicView.prototype = {
  render: function() {
    this.unbind();
    gel('magic-wrapper').innerHTML = templates.magic(this.opts);
    this.bind();
    this.session.input(gel('magic-otp'));
  },

  on: function(event, sel, listener) {
    var $el = $(sel);
    this.listeners.push($el.on(event, listener));
  },

  bind: function() {
    var el_otp = gel('magic-otp');
    var self = this;

    this.on('change', '#form-magic-choice', function(e) {
      $('#body').toggleClass('sub', e.target.value);
    });

    this.on('click', '#form-magic-otp', bind(this.resendOtp, this));

    this.on('click', '#form-magic-otp', function(e) {
      if (!$(e.target).hasClass('show-payment-page')) {
        return;
      }

      self.track('show_payment_page');

      self.showPaymentPage({
        magic: false,
        otpelf: true,
        focus: true
      });
    });

    this.on('click', '#autoread-otp', bind(this.autoreadOtp, this));
    this.on('click', '#enter-otp', bind(this.enterOtp, this));
    this.on('click', '#magic-manual-otp', bind(this.enterOtp, this));

    var delegator = this.session.delegator;

    delegator.otp = delegator.add('number', el_otp);
  },

  unbind: function() {
    invokeEach(this.listeners);
    this.listeners = [];
  },

  destroy: function() {
    this.unbind();
    this.clearTimeout();
    window.clearTimeout(this.otpTimeout);
  },

  track: function(eventName, data) {
    data = isNonNullObject(data) ? clone(data) : {};

    var payload = this.session.getPayload();

    if (payload.token) {
      /* Saved cards */
      data.saved_card = true;
      var tokens = ((this.session.customer || {}).tokens || {}).items;
      if (payload.token && tokens) {
        var currToken = findBy(tokens, 'token', payload.token);
        if (currToken.card) {
          data.iin = currToken.card.iin;
        }
      }
    } else {
      var cardNum = payload['card[number]'];
      if (isString(cardNum)) {
        data.iin = cardNum.replace(/[^0-9]/g, '').substr(0, 6);
      }
    }

    if (this.resolvedPage) {
      data.latest_page = this.resolvedPage;
    }

    if (typeof this.session.attemptCount !== 'undefined') {
      data.attempt_count = this.session.attemptCount;
    }

    if (this.currentBank) {
      data.bank = this.currentBank;
    }

    this.session.track('magic_' + eventName, data);
  },

  resetLoader: function() {
    $('#form-magic-otp .loader').removeClass('load');

    window.setTimeout(function() {
      $('#form-magic-otp .loader').addClass('load');
    }, 100);
  },

  showPaymentPage: function(options) {
    if (typeof options !== 'object') {
      options = {};
    }

    var self = this;

    options.focus = options.focus || true;
    options.magic = options.magic || false;
    options.otpelf = options.otpelf || true;

    if (CheckoutBridge && CheckoutBridge.invokePopup) {
      this.clearTimeout();
      this.checkoutVisible = false;
      self.session.showLoadError(strings.redirect);
      window.setTimeout(function() {
        CheckoutBridge.invokePopup(JSON.stringify(options));
        self.session.destroyMagic();
      }, 1000);
    }
  },

  clearTimeout: function() {
    window.clearTimeout(this.magicTimeout);
    delete this.magicTimeout;
  },

  setTimeout: function(timeout, timeoutMeta) {
    var self = this;

    if (!this.checkoutVisible) {
      return;
    }

    var timeoutFn = function() {
      if (self.magicTimeout) {
        window.clearTimeout(self.magicTimeout);
        delete self.magicTimeout;
        self.track('timeout', timeoutMeta);
        self.showPaymentPage();
      }
    };

    if (this.magicTimeout) {
      this.clearTimeout();
    }

    this.magicTimeout = setTimeout(timeoutFn, timeout);
  },

  pageResolved: function(data) {
    var timeout = TIMEOUT_MAGIC_NO_ACTION;
    var isUnkown = false;

    if (data.bank && indexOf(this.supportedBanks, data.bank) < 0) {
      this.bankNotSupported = true;
      return this.showPaymentPage({
        magic: false,
        otpelf: true
      });
    }

    var self = this;
    self.resolvedPage = data.type;
    self.currentBank = data.bank;

    switch (data.type) {
      case 'otp':
        this.showOtpView(data);
        timeout = TIMEOUT_CLEAR;
        break;

      case 'proceed':
        this.session.showLoadError('Fetching Bank details');
        break;

      case 'choice':
        this.showChoiceView(data);
        break;

      case 'unknown':
        timeout = TIMEOUT_UNKNOWN;
        isUnkown = true;
        break;
    }

    if (timeout === TIMEOUT_CLEAR) {
      this.clearTimeout();
    } else {
      this.setTimeout(timeout, {
        timeout: timeout,
        type: 'page',
        screen: data.type
      });
    }
  },

  pageUnload: function(data) {
    var self = this;
    this.clearTimeout();

    this.setTimeout(TIMEOUT_REDIRECT, {
      timeout: TIMEOUT_REDIRECT,
      type: 'redirect'
    });
  },

  resendOtp: function(e) {
    if (!$(e.target).hasClass('magic-resend-otp')) {
      return;
    }

    if (CheckoutBridge && CheckoutBridge.relay) {
      var resend = true;

      if (this.resendCount === 1) {
        this.track('otp_resend', {
          resend_count: this.resendCount
        });

        if (window.confirm('This is your last attempt to generate OTP.')) {
          $('#magic-wrapper').addClass('hide-resend');
        } else {
          resend = false;
        }
      } else if (this.resendCount > 2) {
        resend = false;
      }

      if (resend) {
        delete this.otpData;
        if (CheckoutBridge && CheckoutBridge.toast) {
          CheckoutBridge.toast(strings.otp_resent, TOAST_SHORT);
        }

        CheckoutBridge.relay(
          JSON.stringify({
            action: 'resend_otp'
          })
        );
        this.resendCount++;
      }
    }
  },

  requestOtpPermission: function(callback) {
    if (CheckoutBridge && CheckoutBridge.requestOtpPermission) {
      this.track('request_otp_permission');
      window.otpPermissionCallback = callback.bind(this);

      CheckoutBridge.requestOtpPermission();
    }
  },

  autoreadOtp: function() {
    var self = this;

    this.track('autoread_otp');

    if (!this.otpPermission) {
      this.requestOtpPermission(function(info) {
        if (info.granted) {
          this.track('otp_permission_granted');
          self.showWaitingScreen();
        }
      });
    } else {
      self.showWaitingScreen();
    }

    $('#body').removeClass('sub');

    if (this.otpData) {
      this.otpParsed(this.otpData);
    }
  },

  enterOtp: function() {
    this.track('enter_otp');

    $('#body').addClass('sub');

    $('#form-magic-otp')
      .removeClass('waiting')
      .addClass('manual');
    $('#magic-otp')
      .attr('readonly', false)
      .val('');
  },

  otpParsed: function(data) {
    if (this.resolvedPage !== 'otp') {
      return (this.otpData = data);
    }

    if (this.session.screen !== 'magic-otp') {
      this.showView('magic-otp');
    }

    if (data.otp) {
      window.clearTimeout(this.otpTimeout);
    }

    this.otpData = data;

    if (!$('#form-magic-otp').hasClass('waiting')) {
      return;
    }

    $('#form-magic-otp')
      .removeClass('waiting')
      .removeClass('manual');
    $('#magic-otp').attr('readonly', true);

    $('#body').addClass('sub');

    if (data.otp) {
      $('#magic-otp')
        .val(data.otp)[0]
        .dispatchEvent(new Event('blur'));
      $('#magic-otp-placeholder').html(data.otp);
      $('#magic-bank')[0].innerHTML =
        "<img src='https://cdn.razorpay.com/bank/" +
        data.bank +
        ".gif' height='13px'> " +
        data.sender;
    }
  },

  showView: function(screen) {
    this.session.setScreen(screen);
    hideOverlayMessage();
  },

  showOtpView: function(data) {
    var self = this;

    if (typeof data === 'undefined') {
      data = {};
    }

    this.otpPermission =
      typeof data.otp_permission !== 'undefined'
        ? data.otp_permission
        : this.otpPermission;

    if (!this.otpPermission && !this.otpPermDenied) {
      return this.requestOtpPermission(function(info) {
        if (info.granted) {
          data.otp_permission = true;
          this.track('otp_permission_granted');
        } else {
          self.otpPermDenied = true;
        }

        self.showOtpView(data);

        delete window.otpPermissionCallback;
      });
    }

    this.showView('magic-otp');
    $('#body').removeClass('sub');

    if (this.otpPermission) {
      this.showWaitingScreen();

      if (this.otpData) {
        this.otpParsed(this.otpData);
      }

      this.otpTimeout = window.setTimeout(function() {
        self.track('otp_timeout');
        if ($('#form-magic-otp').hasClass('waiting')) {
          self.enterOtp();
        }
      }, TIMEOUT_NO_OTP);
    } else {
      this.enterOtp();
    }

    this.resetLoader();
  },

  showWaitingScreen: function() {
    $('#form-magic-otp')
      .removeClass('manual')
      .addClass('waiting');
    this.resetLoader();
  },

  showChoiceView: function(data) {
    this.otpPermission = data.otp_permission;
    this.showView('magic-choice');
  },

  submit: function(screen, data) {
    var relayData = {
      action: this.screenMap[screen],
      data: data
    };

    if (screen === 'magic-otp') {
      if (this.session.checkInvalid('#form-magic-otp')) {
        return;
      }
      this.track('submit_otp');
    }

    this.session.showLoadError(strings.process);

    if (screen === 'magic-choice') {
      this.track('choice', {
        choice: data['choice']
      });

      if (data['choice'] === 'otp') {
        this.showOtpView({
          otp_permission: this.otpPermission
        });
      }
    }

    if (CheckoutBridge && CheckoutBridge.relay) {
      CheckoutBridge.relay(JSON.stringify(relayData));
    }
  }
};
