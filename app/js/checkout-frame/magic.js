var TIMEOUT_NO_OTP = 30000;
var TIMEOUT_UNKNOWN = 3000;
var TIMEOUT_REDIRECT = 20000;
var TIMEOUT_MAGIC_NO_ACTION = 30000;

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
    options.otpelf = options.otpelf || false;

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

  setTimeout: function(timeout) {
    var self = this;

    if (!this.checkoutVisible) {
      return;
    }

    var timeoutFn = function() {
      if (self.magicTimeout) {
        window.clearTimeout(self.magicTimeout);
        delete self.magicTimeout;
        self.showPaymentPage();
      }
    };

    if (this.magicTimeout) {
      this.clearTimeout();
    }

    this.magicTimeout = setTimeout(timeoutFn, timeout);
  },

  pageResolved: function(data) {
    var timeout = TIMEOUT_NO_OTP;
    var isUnkown = false;

    if (data.bank && indexOf(this.supportedBanks, data.bank) < 0) {
      this.bankNotSupported = true;
      return this.showPaymentPage({
        magic: false,
        otpelf: true
      });
    }

    var self = this;
    switch (data.type) {
      case 'otp':
        this.showOtpView(data);
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

    this.setTimeout(timeout);
  },

  pageUnload: function(data) {
    var self = this;
    this.clearTimeout();

    this.setTimeout(TIMEOUT_REDIRECT);
  },

  resendOtp: function(e) {
    if (!$(e.target).hasClass('magic-resend-otp')) {
      return;
    }

    if (CheckoutBridge && CheckoutBridge.relay) {
      var resend = true;

      if (this.resendCount === 1) {
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
      window.otpPermissionCallback = callback.bind(this);

      CheckoutBridge.requestOtpPermission();
    }
  },

  autoreadOtp: function() {
    var self = this;

    if (!this.otpPermission) {
      this.requestOtpPermission(function(info) {
        if (info.granted) {
          self.showWaitingScreen();
        }
      });
    } else {
      self.showWaitingScreen();
    }

    if (this.otpData) {
      this.otpParsed(this.otpData);
    }
  },

  enterOtp: function() {
    $('#form-magic-otp')
      .removeClass('waiting')
      .addClass('manual');
    $('#magic-otp')
      .attr('readonly', false)
      .val('');
  },

  otpParsed: function(data) {
    if (this.session.screen !== 'magic-otp') {
      this.showView('magic-otp');
    }

    if (data.otp) {
      this.clearTimeout();
    }

    this.otpData = data;

    if (!$('#form-magic-otp').hasClass('waiting')) {
      return;
    }

    $('#form-magic-otp')
      .removeClass('waiting')
      .removeClass('manual');
    $('#magic-otp').attr('readonly', true);

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
        } else {
          self.otpPermDenied = true;
        }

        self.showOtpView(data);

        delete window.otpPermissionCallback;
      });
    }

    this.showView('magic-otp');
    if (this.otpPermission) {
      this.showWaitingScreen();
    } else {
      $('#form-magic-otp')
        .removeClass('waiting')
        .addClass('manual');
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

    this.session.showLoadError(strings.process);

    if (screen === 'magic-choice' && data['choice'] === 'otp') {
      this.showOtpView({
        otp_permission: this.otpPermission
      });
    }

    if (CheckoutBridge && CheckoutBridge.relay) {
      CheckoutBridge.relay(JSON.stringify(relayData));
    }
  }
};
