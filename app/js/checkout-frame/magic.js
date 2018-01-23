function magicView(session) {
  this.session = session;
  this.opts = {
    session: session
  };
  this.render();
  this.resendCount = 0;
  this.screenMap = {
    'magic-choice': 'select_choice',
    'magic-otp': 'submit_otp'
  };

  this.supportedBanks = ['unknown', 'HDFC', 'ICIC'];
}

magicView.prototype = {
  render: function() {
    this.unbind();
    gel('magic-wrapper').innerHTML = templates.magic(this.opts);
    this.bind();
  },

  onchange: function(e) {
    this.opts.selected = e.target.value;
    this.render();
  },

  on: function(event, sel, listener) {
    var $el = $(sel);
    this.listeners.push($el.on(event, listener));
  },

  bind: function() {
    var el_otp = gel('magic-otp');

    this.on('change', '#form-magic-choice', function(e) {
      $('#body').toggleClass('sub', e.target.value);
    });

    this.on('click', '#form-magic-otp', this.resendOtp.bind(this));
    this.on('click', '#autoread-otp', this.autoreadOtp.bind(this));
    this.on('click', '#enter-otp', this.enterOtp.bind(this));
    this.on('click', '#magic-manual-otp', this.enterOtp.bind(this));

    var delegator = this.session.delegator;

    delegator.otp = delegator.add('number', el_otp);
  },

  unbind: function() {
    invokeEach(this.listeners);
    this.listeners = [];
  },

  destroy: function() {
    this.unbind();
  },

  resetLoader: function() {
    $('#form-magic-otp .loader').removeClass('load');

    setTimeout(function() {
      $('#form-magic-otp .loader').addClass('load');
    }, 100);
  },

  showPaymentPage: function(options) {
    if (typeof options !== 'object') {
      options = {};
    }

    options.focus = options.focus || true;
    options.magic = options.magic || false;
    options.otpelf = options.otpelf || false;

    if (CheckoutBridge && CheckoutBridge.invokePopup) {
      CheckoutBridge.invokePopup(JSON.stringify(options));
    }
  },

  setTimeout: function(timeout) {
    var self = this;

    var timeoutFn = function() {
      console.log('timeout fn called', (new Date().getTime() / 1000) >> 0);
      if (self.magicTimeout) {
        clearTimeout(self.magicTimeout);
        delete self.magicTimeout;

        setTimeout(function() {
          self.showPaymentPage();
        }, 1000);

        self.session.showLoadError(strings.redirect);
        self.session.destroyMagic();
      }
    };

    if (this.magicTimeout) {
      clearTimeout(this.magicTimeout);
      delete this.magicTimeout;
    }

    this.magicTimeout = setTimeout(timeoutFn, timeout);
  },

  pageResolved: function(data) {
    var timeout = 30000;
    var isUnkown = false;

    console.log('pageResolved', (new Date().getTime() / 1000) >> 0);

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
        timeout = 3000;
        isUnkown = true;
        break;
    }

    this.setTimeout(timeout);
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
      delete this.otpData;
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

    if (!$('#form-magic-otp').hasClass('waiting')) {
      this.otpData = data;
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

      this.setTimeout(30000);
    }
  },

  showView: function(screen) {
    this.session.setScreen(screen);
    hideOverlayMessage();
  },

  showOtpView: function(data = {}) {
    var self = this;

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

    console.log(relayData);

    if (CheckoutBridge && CheckoutBridge.relay) {
      CheckoutBridge.relay(JSON.stringify(relayData));
    }
  }
};
