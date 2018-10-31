var RAZORPAY_HOVER_COLOR = '#626A74';

var ua = navigator.userAgent;

var preferences = window.preferences,
  CheckoutBridge = window.CheckoutBridge,
  StorageBridge = window.StorageBridge,
  isIframe = window !== parent,
  ownerWindow = isIframe ? parent : opener,
  _uid = Track.id,
  tab_titles = Constants.TAB_TITLES,
  getDownBanks = Bank.getDownBanks,
  getPreferredBanks = Bank.getPreferredBanks,
  freqWallets = Wallet.wallets,
  contactPattern = Constants.CONTACT_PATTERN,
  emailPattern = Constants.EMAIL_PATTERN,
  ua_Android = discreet.androidBrowser,
  cookieDisabled = !navigator.cookieEnabled,
  getCustomer = discreet.getCustomer,
  Customer = discreet.Customer,
  sanitizeTokens = discreet.sanitizeTokens,
  getQueryParams = discreet.getQueryParams;

// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone|iPad/.test(ua);
var shouldFixFixed = /iPhone/.test(ua);
var ua_iPhone = shouldFixFixed;
var isIE = /MSIE |Trident\//.test(ua);

// .shown has display: none from iOS ad-blocker
// using दृश्य, which will never be seen by tim cook
var shownClass = 'drishy';

var strings = {
  otpsend: 'Sending OTP to ',
  process: 'Your payment is being processed',
  redirect: 'Redirecting to Bank page',
  acs_load_delay: 'Seems like your bank page is taking time to load.',
  otp_resent: 'OTP resent',
};

var fontTimeout;

// Change this when running experiment 2 for Debit + Pin: Select ATM PIN by default.
var defaultAuthTypeRadioVal = '3ds';

/* this === session */
function handleRelayFn(relayObj) {
  var self = this;

  if (
    !(relayObj && relayObj.action) ||
    !(this instanceof Session && this.magicView)
  ) {
    return;
  }

  var trackingObj = clone(relayObj);

  if (trackingObj.action === 'otp_parsed' && trackingObj.data) {
    if (typeof trackingObj.data.otp === 'string') {
      trackingObj.data.otp = trackingObj.data.otp.replace(/\d/g, '0');
    }
  }

  this.magicView.track(trackingObj.action, trackingObj);

  switch (relayObj.action) {
    case 'page_resolved':
      this.magicView.pageResolved(relayObj.data);
      break;

    case 'otp_parsed':
      this.magicView.otpParsed(relayObj.data);
      break;

    case 'page_unload':
      this.magicView.pageUnload(relayObj.data);
      break;

    case 'otp_resent':
      if (relayObj.data) {
        break;
      }
    /* falls through */
    case 'abort_magic':
    /* falls through */
    case 'error_message':
    /* falls through */
    default:
      this.magicView.showPaymentPage();
      break;
  }
}

function confirmClose() {
  return confirm('Ongoing payment. Press OK to abort payment.');
}

function fillData(container, returnObj) {
  each($(container).find('input[name],select[name]'), function(i, el) {
    if (/radio|checkbox/.test(el.getAttribute('type')) && !el.checked) {
      return;
    }
    if (!el.disabled) {
      returnObj[el.name] = el.value;
    }
  });
}

function selectElementText(el) {
  var win = window;
  var doc = win.document,
    sel,
    range;
  if (win.getSelection && doc.createRange) {
    sel = win.getSelection();
    range = doc.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (doc.body.createTextRange) {
    range = doc.body.createTextRange();
    range.moveToElementText(el);
    range.select();
  }
}

function copyToClipboardListener(e) {
  var btn = e.delegateTarget;
  var parent = btn.parentNode;
  var text = $(parent).find('.copytoclipboard--text')[0];

  selectElementText(text);
  try {
    document.execCommand('copy');
    $(parent).addClass('copied');
    $(parent).find('.copytoclipboard--label')[0].innerHTML = 'Copied';
  } catch (err) {}
}

function makeEmiDropdown(emiObj, session, isOption) {
  var amount = session.get('amount');

  if (session.isOfferApplicableOnIssuer(emiObj.code)) {
    amount = session.getDiscountedAmount();
  }

  var h = '';
  var isSubvented =
    preferences.methods.emi_subvention === 'merchant' ? true : false;
  if (emiObj.plans) {
    each(emiObj.plans, function(length, rate) {
      rate = isSubvented ? 0 : rate;
      h +=
        (isOption ? '<option' : '<div class="option"') +
        ' value="' +
        length +
        '">' +
        length +
        ' month EMI ' +
        (rate ? '@ ' + rate + '%' : '') +
        ' (₹ ' +
        Razorpay.emi.calculator(amount, length, rate) / 100 +
        ' per month)</' +
        (isOption ? 'option>' : 'div>');
    });
  }
  return h;
}

function unsetEmiBank() {
  $('#emi-plans-wrap .active').removeClass('active');
  $('#emi-check-label input[type=checkbox]')[0].checked = false;
}

function setEmiBank(data, savedCardScreen) {
  if (savedCardScreen) {
    var savedEmi = $(
      '#saved-cards-container .checked select[name=emi_duration]'
    )[0];
    if (savedEmi && savedEmi.value) {
      data.method = 'emi';
      data.emi_duration = savedEmi.value;
    }
  } else {
    var activeEmiPlan = $('#emi-plans-wrap .active')[0];
    if (activeEmiPlan) {
      data.method = 'emi';
      data.emi_duration = activeEmiPlan.getAttribute('value');
    }
  }
}

function onSixDigits(e) {
  var el = e.target;
  var emi_options = this.emi_options;

  // Sanity check.
  if (!el) {
    return;
  }

  var val = el.value;

  var cardType = $('#elem-card .cardtype').attr('cardtype');
  var isMaestro = /^maestro/.test(cardType);
  var sixDigits = val.length > 5;
  var trimmedVal = val.replace(/[\ ]/g, '');
  var exactSixDigits = trimmedVal.length === 6;
  var lessThanSixDigits = trimmedVal.length < 6;
  var moreThanSixDigits = trimmedVal.length > 6;

  $(el.parentNode).toggleClass('six', sixDigits);
  var emiObj;

  var nocvvCheck = gel('nocvv');

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

  var emi_parent = $('#emi-check-label').toggleClass('disabled', !emiObj);

  if (emiObj) {
    $('#expiry-cvv').removeClass('hidden');
    if (!$('#emi-plans-wrap .option')[0]) {
      gel('emi-plans-wrap').innerHTML = makeEmiDropdown(emiObj, this);
    }
  } else {
    emi_parent.find('input[type=checkbox]')[0].checked = false;
    $(emi_parent.find('.active')[0]).removeClass('active');
  }
  noCvvToggle({ target: nocvvCheck });

  var elem_emi = $('#elem-emi');
  var hiddenClass = 'hidden';

  if (isMaestro && sixDigits) {
    elem_emi.addClass(hiddenClass);
  } else if (elem_emi.hasClass(hiddenClass)) {
    invoke('removeClass', elem_emi, hiddenClass, 200);
  }

  // Debit + PIN stuff.
  if (exactSixDigits || moreThanSixDigits) {
    /**
     * Don't check for flows if the card number
     * was reduced from 7 digits to 6 digits.
     */
    if (trimmedVal.slice(0, 6) !== this.flowIIN) {
      this.checkFlows(trimmedVal.slice(0, 6), e.isPrefilled);
    }
  } else if (lessThanSixDigits) {
    this.flowIIN = null;
    showFlowRadioButtons(false);
  }
}

/**
 * Toggles the ATM radio buttons on new card screen.
 * @param {Boolean} show
 */
function showFlowRadioButtons(show) {
  if (show) {
    // Unhide
    $('#add-card-container .flow-selection-container').addClass('drishy');

    // Check default
    var radio = $('#add-card-container .flow.input-radio #flow-3ds');

    if (radio[0]) {
      radio[0].checked = true;
    }
  } else {
    // Uncheck values
    var checked = $(
      '#add-card-container .flow.input-radio input[type=radio]:checked'
    );

    if (checked[0]) {
      checked[0].checked = false;
    }

    // Hide
    $('#add-card-container .flow-selection-container').removeClass('drishy');
  }
}

function noCvvToggle(e) {
  var nocvvCheck = e.target;
  var shouldHideExpiryCVV = nocvvCheck.checked && !nocvvCheck.disabled;
  $('#form-card').toggleClass('nocvv', shouldHideExpiryCVV);
}

function toggleNoCvv(show) {
  // Display or hide the nocvv checkbox
  $('#nocvv-check').toggleClass(shownClass, show);
  gel('nocvv').disabled = !show;
}

function makeVisible(subject) {
  $(subject)
    .css('display', 'block')
    .reflow()
    .addClass(shownClass);
}

function makeHidden(subject) {
  subject = $(subject);
  if (subject[0]) {
    subject.removeClass(shownClass);
    invoke('hide', subject, null, 200);
  }
}

function toggle(subject, showOrHide) {
  (showOrHide ? makeVisible : makeHidden)(subject);
}

function showOverlay($with) {
  makeVisible('#overlay');
  if ($with) {
    makeVisible($with[0]);
  }
}

function hideOverlay($with) {
  makeHidden('#overlay');
  if ($with) {
    makeHidden($with[0]);
  }
}

function hideEmi() {
  var emic = $('#emi-wrap');
  var wasShown = emic.hasClass(shownClass);
  if (wasShown) {
    hideOverlay(emic);
  }
  return wasShown;
}

function hideOverlayMessage() {
  if (!hideEmi()) {
    if ($('#confirmation-dialog').hasClass('animate')) {
      makeHidden(gel('error-message'));
    } else {
      hideOverlay($('#error-message'));
    }
  }
}

function overlayVisible() {
  return $('#overlay').hasClass(shownClass);
}

// this === Session
function errorHandler(response) {
  if (isString(response)) {
    try {
      response = JSON.parse(response);
    } catch (e) {
      return;
    }
  }
  if (!response || !response.error) {
    return;
  }

  var error = response.error;
  var message = error.description;

  if (this.powerwallet && message === discreet.cancelMsg) {
    // prevent payment canceled error
    this.powerwallet = null;
    return;
  }

  this.clearRequest();

  /* don't attempt magic if failed for the first time */
  this.magic = false;

  Analytics.track('error', {
    data: response,
  });
  Analytics.setMeta('payment.failed', true);
  Razorpay.sendMessage({ event: 'paymenterror', data: { error: error } });

  if (this.modal) {
    this.modal.options.backdropclose = this.get('modal.backdropclose');
  }

  if (this.get('retry') === false) {
    return this.modal.hide();
  }

  var err_field = error.field;
  if (err_field && !(this.screen === 'otp' && this.tab === 'wallet')) {
    if (!err_field.indexOf('expiry')) {
      err_field = 'card[expiry]';
    }
    var error_el = document.getElementsByName(err_field)[0];
    if (error_el) {
      if (this.screen && (err_field === 'contact' || err_field === 'email')) {
        this.switchTab();
      }
      error_el = $(error_el);

      setTimeout(function() {
        error_el.focus();
      }, 100);

      if (error_el.bbox().width) {
        var parent = error_el.parent();
        var help;

        if (parent.hasClass('elem')) {
          /* We don't want to add invalid to radio butons */
          help = parent.addClass('mature invalid').find('.help')[0];
        }

        if (help) {
          if (message) {
            $(help).html(message);
          }
          this.shake();
          return hideOverlayMessage();
        }
      }
    }
  }

  if (/^magic*/.test(this.screen)) {
    this.switchTab('card');
  }

  if (this.tab || message !== discreet.cancelMsg) {
    if (message && message.indexOf('OFFER_MISMATCH') === 0) {
      // show offers UI error only when offers ui is initialized
      if (this.offers) {
        hideOverlayMessage();
        this.showOffersError();
      } else {
        this.showLoadError(
          'The Offer you selected is not applicable on this Payment Method',
          true
        );
      }

      Analytics.track('offers:mismatch', {
        data: this.getAppliedOffer(),
      });
    } else {
      this.showLoadError(
        message || 'There was an error in handling your request',
        true
      );
    }
  }
  $('#fd-hide').focus();
}

/* bound with session */
function cancelHandler(response) {
  if (!this.payload) {
    return;
  }

  /* don't attempt magic if failed for the first time */
  this.magic = false;

  Analytics.setMeta('payment.cancelled', true);

  if (this.payload.method === 'upi' && this.payload['_[flow]'] === 'intent') {
    this.showLoadError('Payment did not complete.', true);
  } else if (
    /^(card|emi)$/.test(this.payload.method) &&
    this.screen !== 'card'
  ) {
    this.switchTab('card');
  }
}

function getPhone() {
  return gel('contact').value;
}

function setOtpText(text) {
  gel('otp-prompt').innerHTML = text;
}

function elfShowOTP(otp, sender, bank) {
  window.handleOTP(otp);
}

function askOTP(text) {
  var qpmap = getQueryParams();
  if (qpmap.platform === 'android') {
    if (window.OTPElf) {
      window.OTPElf.showOTP = elfShowOTP;
    } else {
      window.OTPElf = {
        showOTP: elfShowOTP,
      };
    }
  }
  if (isNonNullObject(text)) {
    text = text.error && text.error.description;
  }
  $('#otp').val('');
  $('#form-otp')
    .removeClass('loading')
    .removeClass('action');
  $('#body').addClass('sub');
  if (!text) {
    var thisSession = SessionManager.getSession();
    if (thisSession.tab === 'card' || thisSession.tab === 'emi') {
      text = 'Enter OTP sent on ' + getPhone() + '<br>to ';
      if (thisSession.payload) {
        text += 'save your card';
      } else {
        text += 'access Saved Cards';
      }
    } else {
      text = 'An OTP has been sent on<br>' + getPhone();
    }
  }
  setOtpText(text);
}

function debounceAskOTP(msg) {
  debounce(askOTP, 750)(msg);
}

// this === Session
function successHandler(response) {
  this.clearRequest();
  // prevent dismiss event
  this.modal.options.onhide = noop;

  // sending oncomplete event because CheckoutBridge.oncomplete
  Razorpay.sendMessage({ event: 'complete', data: response });
  this.hide();
}

function cancel_upi(session) {
  $('#error-message').addClass('cancel_upi');
  session.r.on('payment.error', function() {
    $('#error-message').removeClass('cancel_upi');
  });
}

var UDACITY_KEY = 'rzp_live_z1RZhOg4kKaEZn';
var EMBIBE_KEY = 'rzp_live_qqfsRaeiWx5JmS';

var IRCTC_KEYS = [
  'rzp_test_mZcDnA8WJMFQQD',
  'rzp_live_ENneAQv5t7kTEQ',
  'rzp_test_kD8QgcxVGzYSOU',
  'rzp_live_alEMh9FVT4XpwM',
];

function Session(message) {
  var options = message.options;
  var self = this;

  this.r = Razorpay(options);
  this.get = this.r.get;
  this.set = this.r.set;
  this.tab = this.screen = '';
  this.tab_titles = tab_titles;

  each(message, function(key, val) {
    if (key !== 'options') {
      self[key] = val;
    }
  });

  this.ua_Android = ua_Android;

  if (this.embedded) {
    $(doc).addClass('embedded');
  }

  this.states = Constants.STATES;

  /* The count of payments attempted */
  this.attemptCount = 0;
  this.listeners = [];
  this.bits = [];
}

Session.prototype = {
  getDecimalAmount: getDecimalAmount,
  formatAmount: function(amount) {
    return (amount / 100)
      .toFixed(2)
      .replace(/(.{1,2})(?=.(..)+(\...)$)/g, '$1,')
      .replace('.00', '');
  },
  formatAmountWithCurrency: function(amount) {
    var discountAmount = amount,
      discountFigure = this.formatAmount(discountAmount),
      displayCurrency = this.r.get('display_currency');

    if (displayCurrency) {
      // TODO: handle display_amount case as in modal.jst
      discountAmount = discreet.currencies[displayCurrency] + discountAmount;
    } else if (this.r.get('currency') === 'INR') {
      discountAmount =
        "&#x20B9;<span class='amount-figure'>" + discountFigure + '</span>';
    } else {
      discountAmount = '$' + discountFigure;
    }

    return discountAmount;
  },
  // so that accessing this.data would not produce error
  data: emo,
  params: emo,

  track: function(event, extra) {
    Track(this.r, event, extra);
  },

  getClasses: function() {
    var classes = [];
    if (
      window.innerWidth < 450 ||
      shouldFixFixed ||
      (window.matchMedia &&
        matchMedia(
          '@media (max-device-height: 450px),(max-device-width: 450px)'
        ).matches)
    ) {
      this.isMobile = true;
      classes.push('mobile');
    }

    var getter = this.get;
    var setter = this.set;

    if (!this.r.isLiveMode()) {
      classes.push('test');
    }

    if (this.forceRender) {
      classes.push('rerender');
    }

    if (this.fontLoaded) {
      classes.push('font-loaded');
    }

    if (getter('theme.hide_topbar')) {
      classes.push('notopbar');
    }

    var key = getter('key');
    if (key === UDACITY_KEY || key === EMBIBE_KEY) {
      if (preferences.order && preferences.order.partial_payment) {
        classes.push('extra');
      } else {
        classes.push('address extra');
      }
      setter('address', true);
    }

    if (IRCTC_KEYS.indexOf(key) !== -1) {
      tab_titles.upi = 'BHIM/UPI';
      tab_titles.card = 'Debit/Credit Card';
      this.irctc = true;
      this.r.set('theme.image_frame', false);
    }

    if (isArray(this.methods.wallet) && this.methods.wallet.length > 0) {
      var amazonPay = 'amazonpay';

      this.methods.wallet.sort(function(item1, item2) {
        return item1.code === amazonPay ? -1 : item2.code === amazonPay ? 1 : 0;
      });

      var walletsLen = this.methods.wallet.length,
        walletNames = this.methods.wallet.slice(0, 2).map(function(item) {
          return item.name;
        });

      this.walletsDesc =
        walletsLen <= 2
          ? walletNames.join(' and ')
          : walletNames.join(', ') + ' & More';
    }

    if (getter('theme.emi_mode')) {
      tab_titles.card = 'Card';
      this.emiMethod = true;
      classes.push('emi-method');
      if (this.methods.count === 5) {
        $('#body').addClass('long');
      }
    }

    if (getter('ecod')) {
      classes.push('ecod');
    }

    if (!getter('image')) {
      classes.push('noimage');
    }

    if (shouldFixFixed) {
      classes.push('ip');
    }

    if (this.extraFields) {
      classes.push('extra');
    }

    if (this.emandate) {
      classes.push('emandate');
    }

    if (isIE) {
      classes.push('noanim');
    }

    return classes.join(' ');
  },

  getEl: function() {
    var r = this.r;
    if (!this.el) {
      if (
        this.order &&
        this.order.partial_payment &&
        !r.get('prefill.amount')
      ) {
        this.extraFields = true;
      }

      var classes = this.getClasses();
      var ecod = r.get('ecod');
      if (ecod) {
        if (!r.get('prefill.email')) {
          r.set('prefill.email', 'void@razorpay.com');
        }
        if (!r.get('prefill.contact')) {
          r.set('prefill.contact', '' + preferences.customer.contact);
        }
      }
      var div = document.createElement('div');
      var styleEl = this.renderCss();
      div.innerHTML = templates.modal(this);
      this.el = div.firstChild;
      this.applyFont(this.el.querySelector('#powered-link'));
      document.body.appendChild(this.el);

      this.el.appendChild(styleEl);

      this.body = $('#body');

      if (this.invoice) {
        r.set('order_id', this.invoice.order_id);
        if (ecod) {
          commenceECOD(this);
        }
      }
      if (ecod) {
        r.set('prefill.method', 'wallet');
        r.set('theme.hide_topbar', true);
        gel('form-wallet').insertBefore(gel('pad-common'), gel('ecod-label'));
      }
      $(this.el).addClass(classes);
    }
    return this.el;
  },

  fillData: function() {
    var oldMethod = this.data.method;
    if (oldMethod) {
      this.wants_skip = true;
    }
    var tab = oldMethod || this.get('prefill.method');

    if (tab) {
      var optional = this.optional;
      var prefill = {
        email: this.get('prefill.email'),
        contact: this.get('prefill.contact'),
      };

      var valid = true;
      var fields = ['contact', 'email'];
      each(fields, function(optionKey, option) {
        if (valid && !prefill[option] && !optional[option]) {
          valid = false;
          errorHandler.call(SessionManager.getSession(), {
            error: {
              field: option,
            },
          });
        }
      });
      if (!valid) {
        tab = '';
      }
    }

    if (tab && !(this.order && this.order.bank)) {
      this.switchTab(tab);
    }

    var prefilledWallet = this.get('prefill.wallet');
    if (prefilledWallet) {
      var selectedWalletEl = $('#wallet-radio-' + prefilledWallet);

      if (selectedWalletEl && selectedWalletEl[0]) {
        selectedWalletEl.prop('checked', true);
        $('#body').addClass('sub');

        var walletsEle = $('#wallets')[0].parentElement;

        selectedWalletEl = selectedWalletEl[0].parentElement;

        // TODO: hacky stuff , need to refactor
        // setTimeout with 200ms - waiting for checkout animation to complete
        window.setTimeout(function() {
          // scrolling to the selected wallet when checkout is opened
          var walletsEleBottom =
              walletsEle.getBoundingClientRect().top + walletsEle.clientHeight,
            selectedWalletElBottom =
              selectedWalletEl.getBoundingClientRect().top +
              selectedWalletEl.clientHeight;

          walletsEle.scrollTop =
            walletsEle.scrollTop + selectedWalletElBottom - walletsEleBottom;
        }, 200);
      }
    }

    if (this.hasOwnProperty('data')) {
      var data = this.data;

      var exp_m = data['card[expiry_month]'];
      var exp_y = data['card[expiry_year]'];
      if (exp_m && exp_y) {
        data['card[expiry]'] = exp_m + ' / ' + exp_y;
      }

      each(
        {
          contact: 'contact',
          email: 'email',
          bank: 'bank-select',
          'card[name]': 'card_name',
          'card[number]': 'card_number',
          'card[expiry]': 'card_expiry',
          'card[cvv]': 'card_cvv',
        },
        function(name, id) {
          var el = gel(id);
          var val = data[name];
          if (el && val) {
            el.value = val;
          }
        }
      );
    }
  },

  completePendingPayment: function() {
    var self = this;
    try {
      var pollUrl, pendingPaymentTimestamp;
      pendingPaymentTimestamp = StorageBridge.getString(
        Constants.PENDING_PAYMENT_TS
      );
      pendingPaymentTimestamp = parseInt(pendingPaymentTimestamp, 10) || 0;

      // "activity_recreated" was passed as true.
      var isActivityRecreated = self.activity_recreated;

      if (pendingPaymentTimestamp) {
        /**
         * If the payment is pending, and is NOT older than
         * MINUTES_TO_WAIT_FOR_PENDING_PAYMENT number of minutes,
         * AND, isActivityRecreated is true, get pollUrl.
         *
         * Otherwise, clear it.
         */
        if (
          isActivityRecreated &&
          now() - pendingPaymentTimestamp <=
            Constants.MINUTES_TO_WAIT_FOR_PENDING_PAYMENT * 60000
        ) {
          pollUrl = StorageBridge.getString(Constants.UPI_POLL_URL);
        } else {
          var params = {};
          params[Constants.UPI_POLL_URL] = '';
          params[Constants.PENDING_PAYMENT_TS] = '0';
          this.setParamsInStorage(params);
        }
      }

      if (pollUrl) {
        this.switchTab('upi');
        this.showLoadError();
        this.isResumedPayment = true;

        /*
         * TODO: fix this flow. We should not need to rewrite this entire thing
         * We should be reusing Payment object.
         */
        this.ajax = fetch({
          url: pollUrl,
          callback: function(response) {
            if (response.razorpay_payment_id) {
              invoke(successHandler, self, response);
            } else {
              var errorObj = response.error;
              if (!isNonNullObject(errorObj) && !errorObj.description) {
                response = discreet.error('Payment failed');
              }

              invoke(errorHandler, self, response);
            }
          },
        }).till(function(response) {
          return response && response.status;
        });

        var abortPaymentOnUPIIntentFailure = function() {
          self.ajax.abort();
          self.showLoadError('Payment did not complete.', true);
          self.clearRequest({
            '_[method]': 'upi',
            '_[flow]': 'intent',
            '_[reason]': 'UPI_INTENT_BACK_BUTTON',
          });
        };

        // Show error and clear request when back is pressed from PSP UPI App
        if (this.recievedUPIIntentRespOnBackBtn) {
          abortPaymentOnUPIIntentFailure();
        } else {
          this.r.once('activity_recreated_upi_intent_back_btn', function() {
            abortPaymentOnUPIIntentFailure();
          });
        }
      }
    } catch (e) {}
  },

  setParamsInStorage: function(params) {
    each(params, function(key, val) {
      try {
        StorageBridge.setString(key, val);
      } catch (e) {}
    });
  },

  checkTez: function() {
    var self = this;

    /**
     * TODO: Replace window.CheckoutBridge check with isSDK check or similar.
     */

    var hasFeature =
      this.preferences &&
      this.preferences.features &&
      this.preferences.features.google_pay;

    if (this.preferences.fee_bearer) {
      return;
    }

    if (window.CheckoutBridge) {
      return;
    }

    if (!(hasFeature || Tez.checkKey(self.get('key')))) {
      return;
    }

    this.tezMode = 'desktop';

    var $upiForm = $('#form-upi'),
      $tezUPIForm = $('#upi-tez'),
      $upiDirectpay = $('#upi-directpay');

    $upiDirectpay.addClass('tez-first');

    Tez.check(function() {
      self.tezMode = 'mobile';
      /* This is success callback */
      $upiForm.addClass('show-tez');
      $tezUPIForm.removeClass('tez-desktop');
      $tezUPIForm.addClass('tez-mweb');

      // removing desktop elements to avoid form validations on empty inputs
      each($tezUPIForm.find('.desktop-only'), function(i, item) {
        item.remove();
      });

      Analytics.track('tez:mweb:visible');
    });
  },

  render: function(options) {
    var that = this;

    options = options || {};

    if (options.forceRender) {
      this.forceRender = true;
      this.close();
    }

    if (this.upi_intents_data) {
      /**
       * We need to show "(Recommended)" string alongside the app name
       * when there is only 1 preferred app, and 1 or more other apps.
       */
      var count = discreet.UPIUtils.getNumberOfAppsByCategory(
        this.upi_intents_data
      );

      if (count.preferred === 1 && this.upi_intents_data.length > 1) {
        this.showRecommendedUPIApp = true;
      }
    }

    this.isOpen = true;

    this.setTpvBanks();
    this.getEl();
    this.setFormatting();
    this.setEmandate();
    this.checkTez();
    this.fillData();
    this.setEMI();
    this.improvisePaymentOptions();
    this.setModal();
    this.completePendingPayment();
    this.bindEvents();
    errorHandler.call(this, this.params);

    var hasOffers = this.hasOffers,
      forcedOffer = this.forcedOffer;

    if (forcedOffer) {
      if (
        'original_amount' in forcedOffer &&
        'amount' in forcedOffer &&
        forcedOffer.amount !== forcedOffer.original_amount
      ) {
        this.showDiscount(forcedOffer);
        Analytics.track('offers:forced_with_discount', {
          data: forcedOffer,
        });
      }
    } else if (hasOffers) {
      var eligibleOffers = preferences.offers.filter(function(offer) {
        var method = offer.payment_method,
          enabledMethods = that.methods,
          isMethodEnabled =
            method !== 'wallet'
              ? enabledMethods[method]
              : isArray(enabledMethods.wallet) &&
                enabledMethods.wallet.filter(function(item) {
                  return item.code === offer.issuer;
                })[0];

        return isMethodEnabled;
      });

      var $offersContainer = $('#body #offers-container'),
        $offersTitle;

      if (eligibleOffers.length > 0) {
        // TODO: convert args to kwargs
        this.offers = initOffers(
          $offersContainer[0],
          eligibleOffers,
          {},
          this.handleOfferSelection.bind(this),
          this.handleOfferRemoval.bind(this),
          this.formatAmountWithCurrency.bind(this),
          $('#body')[0]
        );

        this.renderOffers(this.screen);

        $offersContainer.on('click', function(e) {
          $offersTitle = $offersTitle || this.querySelector('.offers-title');

          if (!$offersTitle || !$offersTitle.contains(e.target)) {
            return;
          }

          Analytics.track(
            'offers:list_view:screen:' + (that.screen || 'home'),
            {
              data: that.offers.appliedOffer,
            }
          );
        });
      }
    }

    if (!this.tab && !this.get('prefill.contact')) {
      $('#contact').focus();
    }

    if (this.closeAt) {
      var timeLeft = this.closeAt - now();
      var timeoutEl = $('#timeout').show()[0];
      $('#body').addClass('has-timeout');
      var timerFn = updateTimer(timeoutEl, this.closeAt);
      timerFn();
      if (this.isMobile) {
        var modalEl = gel('modal');
        modalEl.insertBefore(timeoutEl, modalEl.firstChild);
      }
      var self = this;
      this.closeTimer = setInterval(timerFn, 1000);
      this.closeTimeout = setTimeout(function() {
        clearInterval(self.closeTimer);
        self.dismissReason = 'timeout';
        self.modal.hide();
      }, timeLeft);
    }

    // Debit + PIN stuff
    var cardNumber = this.get('prefill.card[number]');
    if (cardNumber) {
      onSixDigits.call(this, {
        target: gel('card_number'),
        isPrefilled: true,
      });
    }

    // Look for new UPI apps.
    if (this.all_upi_intents_data) {
      discreet.UPIUtils.findAndReportNewApps(this.all_upi_intents_data);
    }

    Analytics.track('complete', {
      type: AnalyticsTypes.RENDER,
    });
    Analytics.setMeta('timeSince.render', discreet.timer());
  },

  setTpvBanks: function() {
    var options = this.get();
    var bankCode, accountNumber;

    if (this.order && this.order.method === 'upi') {
      this.upiTpv = true;
    }

    if (options['prefill.bank'] && !options['recurring']) {
      this.tab = this.oneMethod = 'netbanking';
    }

    if (this.order && this.order.bank) {
      bankCode = this.order.bank;
      accountNumber = this.order.account_number;
      if (!this.order.method && this.methods.upi && this.methods.netbanking) {
        this.multiTpv = true;
      }
    }

    var banks = this.methods.netbanking;

    if (bankCode && banks) {
      this.tpvBank = {
        name:
          typeof banks[bankCode] === 'object'
            ? banks[bankCode].name
            : banks[bankCode],
        code: bankCode,
        account_number: accountNumber,
        image: 'https://cdn.razorpay.com/bank/' + bankCode + '.gif',
      };
    }
  },

  setEMI: function() {
    if (!this.emi && this.methods.emi) {
      $(this.el).addClass('emi');
      this.emi = new discreet.emiView(this);
    }
  },

  setEmandate: function() {
    if (this.emandate && this.methods.emandate) {
      this.emandateView = new discreet.emandateView(this);
    }
  },

  setMagic: function() {
    if (!this.magicView && this.magic) {
      $(this.el).addClass('magic');
      this.magicView = new magicView(this);
      this.magicView.setTimeout(TIMEOUT_MAGIC_NO_ACTION, {
        timeout: TIMEOUT_MAGIC_NO_ACTION,
        type: 'magic_no_action',
      });
    }

    if (this.magicView) {
      this.magicView.resendCount = 0;
    }
    $('#magic-wrapper').removeClass('hide-resend');
  },

  destroyMagic: function() {
    if (this.magicView) {
      $(this.el).removeClass('magic');
      this.magicView.destroy();
      delete this.magicView;
    }

    if (this.get('redirect')) {
      $('#error-message .link').hide();
    }
  },

  setModal: function() {
    if (!this.modal) {
      var self = this;
      this.modal = new window.Modal(this.el, {
        escape: this.get('modal.escape') && !this.embedded,
        backdropclose: this.get('modal.backdropclose'),
        onhide: function() {
          Razorpay.sendMessage({ event: 'dismiss', data: self.dismissReason });
        },
        onhidden: bind(function() {
          this.saveAndClose();
          Razorpay.sendMessage({ event: 'hidden' });
        }, this),
      });
    }
  },

  setOneMethod: function(methodName) {
    this.oneMethod = methodName;
    var el = document.createElement('span');
    el.className = 'proceed-btn';
    if (this.get('amount')) {
      el.innerHTML = 'Pay by ' + tab_titles[methodName];
    } else {
      el.innerHTML = 'Authenticate';
    }
    $('#footer').append(el);

    $(this.el).addClass('one-method');
    $('.payment-option').addClass('submit-button button');
  },

  improvisePaymentOptions: function() {
    if (this.optional.contact) {
      if (this.optional.email) {
        $(this.el).addClass('no-details');
      }
      $('#top-right').hide();
    }
    if (this.methods.count === 1) {
      var self = this;
      /* Please don't change the order, this code is order senstive */
      ['card', 'emi', 'netbanking', 'emandate', 'upi', 'wallet'].some(function(
        methodName
      ) {
        if (self.methods[methodName]) {
          self.setOneMethod(methodName);
          return true;
        }
      });
    }

    if (this.upiTpv) {
      this.setOneMethod('upi');
    }
  },

  renderCss: function() {
    var div = document.createElement('div');
    var style = document.createElement('style');
    style.type = 'text/css';
    try {
      var getter = this.get;

      div.style.color = getter('theme.color');

      if (!div.style.color) {
        getter()['theme.color'] = '';
      }

      this.setTheme();

      var rules = templates.theme(getter, this.themeMeta);
      if (style.styleSheet) {
        style.styleSheet.cssText = rules;
      } else {
        style.appendChild(document.createTextNode(rules));
      }
    } catch (e) {
      roll('renderCss', e);
    }
    return style;
  },

  setTheme: function() {
    // update r.themeMeta based on prefs color
    this.r.postInit();

    var themeMeta = this.r.themeMeta;

    var themeColor = themeMeta.color,
      colorVariations = Color.getColorVariations(themeColor),
      hoverStateColor = Color.getHoverStateColor(
        themeColor,
        colorVariations.backgroundColor,
        RAZORPAY_HOVER_COLOR
      ),
      activeStateColor = Color.getActiveStateColor(
        themeColor,
        colorVariations.backgroundColor,
        RAZORPAY_HOVER_COLOR
      ),
      secondaryHighlightColor = hoverStateColor;

    themeMeta = this.themeMeta = Object.create(this.r.themeMeta);

    themeMeta.secondaryHighlightColor = secondaryHighlightColor;
    themeMeta.hoverStateColor = hoverStateColor;
    themeMeta.activeStateColor = activeStateColor;
    themeMeta.icons = _PaymentMethodIcons.getIcons(colorVariations);
  },

  applyFont: function(anchor, retryCount) {
    if (!retryCount) {
      retryCount = 0;
    }
    if (anchor.offsetWidth / anchor.offsetHeight > 3) {
      $(this.el).addClass('font-loaded');
      this.fontLoaded = true;
    } else if (retryCount < 25) {
      var self = this;
      fontTimeout = setTimeout(function() {
        self.applyFont(anchor, ++retryCount);
      }, 120 + retryCount * 50);
    }
  },

  hideErrorMessage: function(confirmedCancel) {
    var self = this;
    if (this.r._payment) {
      if (
        this.payload &&
        this.payload.method === 'upi' &&
        this.payload['_[flow]'] === 'directpay'
      ) {
        return cancel_upi(this);
      }
    }

    if (this.r._payment || this.isResumedPayment) {
      if (confirmedCancel === true) {
        return this.clearRequest();
      } else if (this.r._payment.isMagicPayment) {
        return Confirm.show({
          message:
            'Your payment is ongoing. ' +
            'Are you sure you want to cancel the payment?',
          heading: 'Cancel Payment?',
          positiveBtnTxt: 'Yes, cancel',
          negativeBtnTxt: 'No',
          onPositiveClick: function() {
            self.hideErrorMessage(true);
          },
        });
      }

      if (confirmClose()) {
        this.clearRequest();
      } else {
        return;
      }
    }
    hideOverlayMessage();
  },

  shake: function() {
    if (this.el) {
      $(this.el.querySelector('#modal-inner'))
        .removeClass('shake')
        .reflow()
        .addClass('shake');
    }
  },

  click: function(selector, delegateClass, listener, useCapture) {
    this.on('click', selector, delegateClass, listener, useCapture);
  },

  on: function(event, selector, delegateClass, listener, useCapture) {
    var listeners = this.listeners;
    if (!listener || listener === true) {
      each(
        $$(selector),
        function(i, element) {
          listeners.push($(element).on(event, delegateClass, listener, this));
        },
        this
      );
    } else {
      var self = this;
      var $parent = $(selector);
      return listeners.push(
        $parent.on(
          event,
          function(e) {
            var target = e.target;
            while (target !== $parent[0]) {
              if (!$(target)[0]) {
                break;
              }

              if ($(target).hasClass(delegateClass)) {
                e.delegateTarget = target;
                invoke(listener, self, e);
                break;
              }
              target = target.parentNode;
            }
          },
          useCapture
        )
      );
    }
  },

  resendOTP: function() {
    Analytics.track('otp:resend', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: this.tab === 'wallet',
      },
    });

    this.showLoadError(strings.otpsend + getPhone());
    if (this.tab === 'wallet') {
      this.r.resendOTP(this.r.emitter('payment.otp.required'));
    } else {
      this.customer.createOTP(debounceAskOTP);
    }
  },

  secAction: function() {
    Analytics.track('saved_cards:skip', {
      type: AnalyticsTypes.BEHAV,
      data: {
        while_submitting: !!payload,
      },
    });
    $('#save').attr('checked', 0);
    this.wants_skip = true;
    var payload = this.payload;
    if (payload) {
      delete payload.save;
      delete payload.app_token;
      this.submit();
      this.setScreen('card');
      this.showLoadError();
    } else {
      this.showCardTab();
    }
  },

  addFunds: function(event) {
    setOtpText('Loading...');
    $('#add-funds').removeClass('show');
    $('#form-otp')
      .removeClass('action')
      .addClass('loading')
      .css('display', 'block');
    this.r.topupWallet();
  },

  extraNext: function() {
    var commonInvalid = $('#pad-common .invalid');
    if (commonInvalid[0]) {
      return commonInvalid
        .addClass('mature')
        .$('.input')
        .focus();
    }

    var partialEl = gel('amount-value');
    if (partialEl) {
      var amountValue = partialEl.value;
      each($$('.amount-figure'), function(i, el) {
        $(el).html(amountValue);
      });
      var options = this.get();
      options.amount = 100 * amountValue;
      options['prefill.contact'] = gel('contact').value;
      options['prefill.email'] = gel('email').value;
      this.render({ forceRender: true });
    }
    $(this.el).addClass('show-methods');
  },

  /**
   * Asks for second factor of confirmation for UPI intent.
   */
  askUPI2FPermission: function(packageName) {
    var self = this;
    var app = discreet.UPIUtils.getAppByPackageName(packageName);
    var UPISecondFactorConsent = {};

    try {
      UPISecondFactorConsent = JSON.parse(
        StorageBridge.getString('rzp_upi_2f_consent')
      );
    } catch (readErr) {}

    var hide = function() {
      var checked = $('#upi-apps input:checked');

      if (checked[0]) {
        checked[0].checked = false;
      }

      Analytics.track('upi:2f:consent:dismiss', {
        type: AnalyticsTypes.BEHAV,
        data: {
          package_name: packageName,
          consent: false,
        },
      });

      $('#body').toggleClass('sub', false);
    };

    Analytics.track('upi:2f:consent', {
      type: AnalyticsTypes.RENDER,
      data: {
        package_name: packageName,
      },
    });

    Confirm.show({
      position: 'middle',
      message:
        'To make a UPI payment, you need to have a UPI ID linked to your bank account.',
      heading:
        'Are you registered for UPI on ' +
        (app.name || app.app_name || 'this app') +
        '?',
      layout: 'rtl',
      positiveBtnTxt: 'Yes, Proceed',
      negativeBtnTxt: 'No, Go Back',
      onHide: hide,
      onNegativeClick: hide,
      onPositiveClick: function() {
        UPISecondFactorConsent[packageName] = true;
        self.shouldAskUPI2FPermission = false;

        try {
          StorageBridge.setString(
            'rzp_upi_2f_consent',
            JSON.stringify(UPISecondFactorConsent)
          );
        } catch (saveErr) {}

        Analytics.track('upi:2f:consent:agree', {
          type: AnalyticsTypes.BEHAV,
          data: {
            package_name: packageName,
            consent: true,
          },
        });

        // Show overlay manually because it gets hidden.
        var $overlay = $('#overlay');
        setTimeout(function() {
          $overlay.css('display', 'block');
          $overlay.addClass(shownClass);
        }, 300);

        self.preSubmit.call(self);
      },
    });
  },

  bindEvents: function() {
    var self = this;
    var emi_options = this.emi_options;
    var thisEl = this.el;
    this.click('#partial-back', function() {
      $(thisEl).removeClass('show-methods');
    });

    this.on('change', '#partial-select-partial', function(e) {
      var parentEle = $('#amount-value').parent();

      if (!e.target.checked) {
        var amount = this.order.amount_due;
        $('#amount-value').val(this.getDecimalAmount(amount));
        toggleInvalid(parentEle, true); // To unset 'invalid' class on 'partial amount input' field's parent

        this.get().amount = amount;
        $('#amount .amount-figure').html(this.formatAmount(amount));

        var infoEle = $('.partial-payment-block .subtitle--help');
        /* Reset text in info element */
        if (infoEle) {
          infoEle.html('Pay some amount now and remaining later.');
        }
      } else {
        $('#amount-value').val(null);
        $('#amount-value').focus();

        parentEle.addClass('mature'); // mature class helps show tooltip if input is invalid
      }
    });

    this.click('#next-button', 'extraNext');

    this.on('focus', '#body', 'input', 'focus', true);
    this.on('blur', '#body', 'input', 'blur', true);
    this.on(
      'input',
      '#body',
      'input',
      function(e) {
        this.input(e.target);
      },
      true
    );

    /**
     * Listener used for UPI Intent flow.
     * 1. Scrolls the App List to the bottom (to make the error tooltip visible)
     * 2. Selects the VPA radio button
     */
    this.on('focus', '#vpa', function() {
      $('#form-upi').scrollTo(window.innerHeight);
      var directpayRadio = gel('upi_app-directpay');
      if (directpayRadio) {
        directpayRadio.checked = true;
        $('#body').addClass('sub');
      }
    });

    if (this.get('theme.close_button')) {
      this.click('#modal-close', function() {
        if (this.get('modal.confirm_close') && !confirmClose()) {
          return;
        }
        this.hide();
      });
    }
    this.click('#top-left', this.back);
    this.click('.payment-option', function(e) {
      Analytics.track('payment_method:select', {
        type: AnalyticsTypes.BEHAV,
        data: {
          disabled: $(e.currentTarget).hasClass('disabled'),
          method: e.currentTarget.getAttribute('tab') || '',
        },
      });

      if (!$(e.currentTarget).hasClass('disabled')) {
        this.switchTab(e.currentTarget.getAttribute('tab') || '');
      }
    });
    this.on('submit', '#form', this.preSubmit);
    this.click('#otp-action', this.back);
    this.click('#otp-resend', this.resendOTP);
    this.click('#otp-sec', this.secAction);
    this.click('#add-funds-action', this.addFunds);
    this.click('#choose-payment-method', function() {
      this.switchTab();
    });

    var enabledMethods = this.methods;
    if (enabledMethods.card || enabledMethods.emi) {
      this.on('keyup', '#card_number', onSixDigits);
      // Also listen for paste.
      this.on('blur', '#card_number', onSixDigits);

      this.on('change', '#nocvv', noCvvToggle);

      var saveTick = qs('#save');
      if (saveTick) {
        this.on('change', '#save', function(e) {
          Analytics.track('card:save:change', {
            type: AnalyticsTypes.BEHAV,
            data: {
              active: e.target.checked,
            },
          });
        });
      }

      this.on('change', '#emi-bank', function(e) {
        $('#elem-emi select')[0].innerHTML = makeEmiDropdown(
          emi_options.banks[e.target.value],
          this,
          true
        );
      });

      // saved cards events
      this.click('#show-add-card', this.toggleSavedCards);
      this.click('#show-saved-cards', this.toggleSavedCards);
      this.on(
        'click',
        '#saved-cards-container',
        'saved-card',
        this.setSavedCard
      );
      this.on('click', '#saved-cards-container', 'nocvv-checkbox', function(e) {
        var target = e.delegateTarget;
        var checked = target.checked;
        var cvvField = $(target.parentNode.parentNode).qs('input.saved-cvv');

        if (checked) {
          $(cvvField).css('display', 'none');
        } else {
          $(cvvField).css('display', 'block');
        }
      });
    }
    this.on('click', '#top-right', function() {
      $('#top-right').addClass('focus');
      var self = this;
      var container_listener = $('#container').on(
        'click',
        function(e) {
          if (e.target.tagName === 'LI') {
            var customer = self.customer;
            customer.logged = false;
            customer.tokens = null;
            self.setSavedCards();
            $('#top-right').removeClass('logged');
            customer.logout(e.target.parentNode.firstChild === e.target);
          }
          container_listener();
          $('#top-right').removeClass('focus');
          return preventDefault(e);
        },
        true
      );
    });
    if (enabledMethods.netbanking || enabledMethods.emandate) {
      this.on('change', '#bank-select', this.switchBank);
      this.on('change', '#netb-banks', this.selectBankRadio, true);
    }
    if (enabledMethods.wallet) {
      try {
        this.on(
          'change',
          '#wallets',
          function(e) {
            if (ua_iPhone) {
              Razorpay.sendMessage({ event: 'blur' });
            }
            if (this.get('ecod')) {
              $(this.el).removeClass('notopbar');
              var tab = $(e.target).attr('tab');
              if (tab !== 'ecod') {
                $('#footer').css('display', 'block');
              }
              if (tab) {
                this.switchTab(tab);
              } else {
                this.preSubmit();
              }
            } else {
              var value = e.target.value;

              Analytics.track('wallet:select', {
                type: AnalyticsTypes.BEHAV,
                data: {
                  wallet: value,
                  power: discreet.WalletUtils.isPowerWallet(value),
                },
              });

              $('#body').toggleClass('sub', value);
              $('#wallets').removeClass('invalid');
            }
          },
          true
        );

        this.on('click', '#wallets [name="wallet"]', function(e) {
          if (!this.validateOffers(e.target.value)) {
            e.preventDefault();
            e.stopPropagation();

            this.showOffersError(function(removeOffer) {
              return removeOffer && e.target.click();
            });

            return;
          }
        });
      } catch (e) {}
    }

    if (enabledMethods.upi) {
      this.click('#cancel_upi .btn', function() {
        var upi_radio = $('#cancel_upi input:checked');
        if (!upi_radio[0]) {
          return;
        }
        var metaParam = {};
        metaParam[upi_radio.prop('name')] = upi_radio.val();
        this.clearRequest(metaParam);
        $('#error-message').removeClass('cancel_upi');
      });
      this.click('#cancel_upi .back-btn', function() {
        $('#error-message').removeClass('cancel_upi');
      });

      this.on('click', '#upi-directpay', function() {
        $('#vpa').focus();
      });

      this.on('click', '#vpa', function() {
        $('#upi-directpay label')[0].dispatchEvent(new MouseEvent('click'));
      });

      this.on('change', '#form-upi', function(e) {
        var packageName = e.target.value;
        var UPISecondFactorConsent = {};

        try {
          UPISecondFactorConsent = JSON.parse(
            StorageBridge.getString('rzp_upi_2f_consent')
          );
        } catch (readErr) {}

        if (
          discreet.UPIUtils.isSecondFactorApp(packageName) &&
          !UPISecondFactorConsent[packageName]
        ) {
          self.shouldAskUPI2FPermission = true;
        } else {
          self.shouldAskUPI2FPermission = false;
        }

        $('#body').toggleClass('sub', e.target.value);

        Analytics.track('upi:app:select', {
          type: AnalyticsTypes.BEHAV,
          data: {
            package_name: packageName,
            showRecommended: Boolean(self.showRecommendedUPIApp),
            recommended: Boolean(
              self.showRecommendedUPIApp &&
                discreet.UPIUtils.isPreferredApp(packageName)
            ),
          },
        });
      });
    }

    if (this.get('ecod')) {
      this.click('#ecod-resend', send_ecod_link);
    }

    var goto_payment = '#error-message .link';
    if (this.get('redirect')) {
      $(goto_payment).hide();
    } else {
      this.click(goto_payment, function() {
        if (this.payload && this.payload.method === 'upi') {
          if (this.payload['_[flow]'] === 'directpay') {
            return cancel_upi(this);
          } else if (this.payload['_[flow]'] === 'intent') {
            this.hideErrorMessage();
          }
        }
        this.r.focus();
      });
    }
    this.click('#backdrop', this.hideErrorMessage);
    this.click('#overlay', function(e) {
      if ($('#confirmation-dialog').hasClass('animate')) {
        return;
      }

      this.hideErrorMessage(e);
    });
    this.click('#fd-hide', this.hideErrorMessage);

    // Debit + PIN flow change.
    this.on('change', '#body', 'auth_type_radio', function(e) {
      var target = e.target;
      if (!target) {
        return;
      }

      // Check for name.
      if (target.name && target.name.indexOf('auth_type') === 0) {
        Analytics.track('atmpin:flows:change', {
          type: AnalyticsTypes.BEHAV,
          data: {
            default_auth_type: defaultAuthTypeRadioVal,
            flow: target.value || null,
          },
        });
      }
    });

    // Copy to clipboard text.
    this.on('click', '#body', 'copytoclipboard--text', function(e) {
      selectElementText(e.target);
    });
    this.on('click', '#body', 'copytoclipboard--btn', copyToClipboardListener);

    this.on('click', '#form-upi.collapsible .item', function(e) {
      $('#form-upi.collapsible .item.expanded').removeClass('expanded');
      $(e.currentTarget).addClass('expanded');
    });
  },

  /**
   * Sets text of the Pay button.
   */
  setPayButtonText: function(text) {
    $('.pay-btn').html(text);
  },

  focus: function(e) {
    $(e.target.parentNode).addClass('focused');
    if (ua_iPhone) {
      Razorpay.sendMessage({ event: 'focus' });
    }
  },

  blur: function(e) {
    $(e.target.parentNode)
      .removeClass('focused')
      .addClass('mature');
    this.input(e.target);
    if (ua_iPhone) {
      Razorpay.sendMessage({ event: 'blur' });
    }
  },

  input: function(el) {
    var value = el.value;
    var required = isString(el.getAttribute('required'));
    var pattern = el.getAttribute('pattern');
    var $parent = $(el.parentNode);

    $parent.toggleClass('filled', value);

    // validity check past this
    if (!(required || pattern)) {
      return;
    }
    var valid = true;
    if (required && !value) {
      valid = false;
    }
    if (!required && !value) {
      valid = true;
    } else {
      if (valid && pattern) {
        valid = new RegExp(pattern).test(value);
      }
    }
    toggleInvalid($parent, valid);
  },

  refresh: function() {
    var self = this;
    each($$('.input'), function(i, el) {
      self.input(el);
    });
  },

  setFormatting: function() {
    var self = this;
    self.refresh();
    var bits = self.bits;
    var delegator = (self.delegator = Razorpay.setFormatter(self.el));

    var el_amount = gel('amount-value');
    if (self.methods.card || self.methods.emi) {
      var el_card = gel('card_number');
      var el_expiry = gel('card_expiry');
      var el_cvv = gel('card_cvv');
      var el_name = gel('card_name');

      // check if we're in webkit
      // checking el_expiry here in place of el_cvv, as IE also returns browser unsupported attribute rules from getComputedStyle
      try {
        // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        if (el_cvv) {
          /**
           * -webkit-text-security is supported from IE9.
           * input[type=tel] is supported from IE10.
           *
           * If <IE9, use type=password
           * If <IE10, use type=number (-webkit-text-security will still be applied)
           */

          /**
           * Check for <IE10. input[type=tel] will be converted to input[type=text] automatically on <IE10.
           */
          if (el_cvv.type === 'text') {
            el_cvv.type = 'number';
          }

          /**
           * Check for <IE9. Masking-input-using-CSS isn't available so we change the type to password.
           */
          if (
            typeof getComputedStyle(el_expiry)['-webkit-text-security'] ===
            'undefined'
          ) {
            el_cvv.type = 'password';
          }
        }
      } catch (e) {}

      delegator.card = delegator
        .add('card', el_card)
        .on('network', function() {
          var type = this.type;
          // update cvv element
          var cvvlen = type !== 'amex' ? 3 : 4;
          el_cvv.maxLength = cvvlen;
          el_cvv.pattern = '^[0-9]{' + cvvlen + '}$';
          $(el_cvv)
            .toggleClass('amex', type === 'amex')
            .toggleClass('maestro', type === 'maestro');

          if (!preferences.methods.amex && type === 'amex') {
            $('#elem-card').addClass('noamex');
          } else {
            $('#elem-card').removeClass('noamex');
          }

          self.input(el_cvv);

          // card icon element
          this.el.parentNode
            .querySelector('.cardtype')
            .setAttribute('cardtype', type);
        })
        .on('change', function() {
          var isValid = this.isValid(),
            type = this.type;

          if (!preferences.methods.amex && type === 'amex') {
            isValid = false;
          }

          // set validity classes
          toggleInvalid($(this.el.parentNode), isValid);

          // adding maxLen change because some cards may have multiple kind of valid lengths
          if (isValid && this.el.value.length === this.caretPosition) {
            if (this.type !== 'maestro') {
              invoke('focus', el_expiry, null, 0);
            }
          }
        });

      delegator.expiry = delegator
        .add('expiry', el_expiry)
        .on('change', function() {
          self.input(el_expiry);

          var isValid = this.isValid();
          toggleInvalid($(this.el.parentNode), isValid);

          if (isValid && this.el.value.length === this.caretPosition) {
            invoke('focus', el_name.value ? el_cvv : el_name);
          }
        });

      delegator.cvv = delegator.add('number', el_cvv).on('change', function() {
        self.input(this.el);
      });
    }

    if (el_amount) {
      delegator.amount = delegator
        .add('amount', el_amount)
        .on('change', function() {
          self.input(el_amount);
          var value = this.value * 100;
          var maxAmount = self.order.partial_payment
            ? self.order.amount_due
            : self.order.amount;

          var isValid = 100 <= value && value <= maxAmount;
          toggleInvalid($(this.el.parentNode), isValid);

          var amountDue = self.order.amount_due;
          var amountDueFormatted = self.formatAmount(amountDue);

          var infoEle = $('.partial-payment-block .subtitle--help');

          if (isValid) {
            $('#amount .amount-figure').html(self.formatAmount(value));

            // Update the remaining amount being changed
            if (value && gel('partial-select-partial').checked && infoEle) {
              infoEle.html(
                'Pay remaining ₹' +
                  self.formatAmount(amountDue - value) +
                  ' later.'
              );
            }
          } else {
            var helpEle = $('#amount-value + .help');

            $('#amount .amount-figure').html(amountDueFormatted); // Update amount is header

            /* Update tooltip error */
            if (helpEle) {
              if (!value) {
                // Reset error on no value
                helpEle.html(
                  'Please enter a valid amount upto ₹' + amountDueFormatted
                );
              } else if (value > self.order.amount_due) {
                helpEle.html('Amount cannot exceed ₹' + amountDueFormatted);
              } else if (value < 100) {
                helpEle.html('Minimum payable amount is ₹' + 1);
              }
            }

            /* Reset text in info element */
            if (infoEle) {
              infoEle.html('Pay some amount now and remaining later.');
            }
          }
        });
    }

    var contactEl = gel('contact');
    if (contactEl && !contactEl.readOnly) {
      delegator.contact = delegator
        .add('phone', contactEl)
        .on('change', function() {
          self.input(this.el);
        });
    }
    delegator.otp = delegator
      .add('number', gel('otp'))
      .on('change', function() {
        self.input(this.el);
      });

    var pinEl = gel('pincode');
    if (pinEl) {
      delegator.add('number', pinEl).on('change', function() {
        self.input(this.el);
        if (this.value.length === 6) {
          $('#state').focus();
        }
      });
    }
  },

  setScreen: function(screen) {
    if (screen === this.screen) {
      return;
    }

    Analytics.track('screen:switch', {
      data: {
        from: this.screen,
        to: screen,
      },
    });
    Analytics.setMeta('screen', screen);
    Analytics.setMeta('timeSince.screen', discreet.timer());

    // Back button is pressed before going to card page page
    if (this.screen === 'otp' && screen !== 'card') {
      this.preSelectedOffer = null;
    }

    this.screen = screen;
    $('#body').attr('screen', screen);
    makeHidden('.screen.' + shownClass);

    if (screen) {
      var screenTitle =
        this.tab === 'emi' ? 'EMI' : tab_titles[this.cardTab || screen];

      screenTitle = /^magic/.test(screen) ? tab_titles.card : screenTitle;

      gel('tab-title').innerHTML = screenTitle;
      makeVisible('#topbar');
      $('.elem-email').addClass('mature');
      $('.elem-contact').addClass('mature');
    } else {
      makeHidden('#topbar');
    }

    if (screen === 'emandate') {
      screen = 'netbanking';
    }

    var screenEl = '#form-' + (screen || 'common');
    makeVisible(screenEl);

    if (!(screen === 'upi' && this.upi_intents_data)) {
      invoke('focus', qs(screenEl + ' .invalid input'));
    }

    var showPaybtn = screen;
    if (
      (screen === 'wallet' && !$('.wallet :checked')[0]) ||
      (screen === 'upi' &&
        this.upi_intents_data &&
        !$('#form-upi .item :checked')[0]) ||
      (screen === 'magic-choice' && !$('#form-magic-choice .item :checked')[0])
    ) {
      showPaybtn = false;
    }
    this.body.toggleClass('sub', showPaybtn);

    return this.offers && this.renderOffers(screen);
  },
  renderOffers: function(screen) {
    if (['', 'card', 'netbanking', 'wallet', 'upi'].indexOf(screen) < 0) {
      $('#body').removeClass('has-offers');
      return this.offers.display(false);
    }

    // reset offers UI
    if (this.offers.appliedOffer || this.offers.selectedOffer) {
      this.offers.removeOffer();
      // Explicitly call this because we removed the offer explicitly
      this.handleOfferRemoval();
    }

    this.offers.applyFilter((screen && { payment_method: screen }) || {});

    if (this.preSelectedOffer) {
      this.offers.selectOffer(this.preSelectedOffer);
      // Explicitly call this because we selected the offer explicitly
      this.handleOfferSelection(this.preSelectedOffer, screen);
      this.offers.applyOffer();
      this.preSelectedOffer = null;
    }

    $('#body').toggleClass('has-offers', this.offers.numVisibleOffers > 0);
  },
  handleOfferSelection: function(offer, screen) {
    var offerInstance = offer;

    offer = offer.data;

    if (offer.original_amount > offer.amount) {
      this.showDiscount(offer);
    }

    screen = screen || this.screen;

    if (!screen) {
      this.preSelectedOffer = offerInstance;
      this.switchTab(offer.payment_method);
      return this.handleOfferSelection(offerInstance, offer.payment_method);
    }

    var issuer = offer.issuer;

    if (screen === 'wallet') {
      $('#wallet-radio-' + issuer).click();
    } else if (screen === 'netbanking') {
      if (issuer) {
        $('#bank-select').val(issuer);
        this.switchBank({ target: { value: issuer } });
      }
    } else if (screen === 'card') {
      //TODO: WIP try to see if the card exists in the saved cards and focus
      /*
      var savedCards = this.customer.tokens && this.customer.tokens.items;

      if (this.savedCardScreen && savedCards && savedCards.length > 0) {
        var matchingCardIndex;

        savedCards.every(function(item, index) {
          var card = item.card;

          if (!card) {
            return true;
          }

          if (
            offer.issuer === card.issuer &&
            (!offer.payment_network || offer.payment_network === card.network)
          ) {
            matchingCardIndex = index;
            return false;
          }

          return true;
        });

        if (typeof matchingCardIndex === void 0) {
          var cvv = qs('#saved-cards-container .saved-cvv')[matchingCardIndex];

          if (cvv) {
            cvv.focus();
          }
        }
      }
      */
    }
  },
  handleOfferRemoval: function() {
    this.hideDiscount();
  },
  showDiscount: function(offer) {
    $('#content').addClass('has-discount');

    var discountAmount = this.formatAmountWithCurrency(offer.amount);

    //TODO: optimise queries
    $('#amount .discount')[0].innerHTML = discountAmount;
    $('#footer .discount')[0].innerHTML = discountAmount;
  },
  hideDiscount: function() {
    $('#content').removeClass('has-discount');
    //TODO: optimise queries
    $('#amount .discount').html('');
    $('#footer .discount').html('');
  },
  back: function(confirmedCancel) {
    var tab = '';
    var self = this;

    Analytics.track('back', {
      type: AnalyticsTypes.BEHAV,
    });

    if (this.get('ecod')) {
      $('#footer').hide();
      $('#wallets input:checked').prop('checked', false);
      $(this.el).addClass('notopbar');
      tab = 'wallet';
    } else if (this.screen === 'otp' && this.tab !== 'card') {
      tab = this.tab;
    } else if (this.tab === 'card' && /^magic/.test(this.screen)) {
      if (confirmedCancel === true) {
        tab = 'card';
        this.clearRequest();
      } else {
        return Confirm.show({
          message:
            'Your payment is ongoing. ' +
            'Are you sure you want to cancel the payment?',
          heading: 'Cancel Payment?',
          positiveBtnTxt: 'Yes, cancel',
          negativeBtnTxt: 'No',
          onPositiveClick: function() {
            self.back(true);
          },
        });
      }
    } else if (/^emandate/.test(this.screen)) {
      if (this.emandateView.back()) {
        return;
      }
    } else {
      if (this.get('theme.close_method_back')) {
        return this.modal.hide();
      }
      tab = '';
    }

    if (tab === 'wallet' && this.screen === 'otp') {
      if (!confirmClose()) {
        return;
      }
      this.clearRequest();
    }

    this.switchTab(tab);
  },

  switchTab: function(tab) {
    // initial screen
    if (!this.tab) {
      if (this.checkInvalid('#pad-common')) {
        return;
      }
    }

    Analytics.track('tab:switch', {
      data: {
        from: this.tab,
        to: tab,
      },
    });
    Analytics.setMeta('tab', tab);
    Analytics.setMeta('timeSince.tab', discreet.timer());

    if (tab) {
      if (tab === 'credit_card' || tab === 'debit_card') {
        this.cardTab = tab;
        tab = 'card';
      } else {
        this.cardTab = null;
      }
      var contact = getPhone();
      if (
        (!contact && !this.optional.contact) ||
        this.get('method.' + tab) === false
      ) {
        return;
      }
      this.customer = getCustomer(contact);
      if (this.customer.logged && !this.local) {
        $('#top-right').addClass('logged');
      }
      $('#user').html(contact);
    } else {
      this.payload = null;
      this.clearRequest();
    }

    if (/^emandate/.test(tab)) {
      return this.emandateView.showTab(tab);
    }

    this.body.attr('tab', tab);
    this.tab = tab;

    if (tab === 'ecod') {
      send_ecod_link.call(this);
    }

    if (tab === 'card' || tab === 'emi') {
      this.showCardTab(tab);
    } else {
      this.setScreen(tab);
      if (ua_iPhone) {
        Razorpay.sendMessage({ event: 'blur' });
      }
    }
  },

  toggleEMIRequiredAttrib: function(tab) {
    var isEmiTab = tab === 'emi';

    /**
     * If theme.emi_mode is true, and this is the EMI tab,
     * we would want the emi_duration select element to be required
     * as you cannot proceed without it.
     *
     * If this is the regular cards tab, the select should not be a required field.
     */
    if (this.get('theme.emi_mode')) {
      each($$('.elem-savedcards-emi select[name=emi_duration]'), function(
        index,
        node
      ) {
        $(node).attr('required', isEmiTab);
      });

      /**
       * Set each invalid saved-card w/ EMI as valid.
       */
      each($$('.elem-savedcards-emi'), function(index, node) {
        toggleInvalid($(node), true);
      });
    }
  },

  showCardTab: function(tab) {
    var isEmiTab = tab === 'emi';
    $('#elem-emi select')[0].required = $('#emi-bank')[0].required = isEmiTab;

    if (!isEmiTab) {
      $('#emi-bank')
        .parent()
        .removeClass('invalid');
      $('#elem-emi .elem').removeClass('invalid');
    }

    this.toggleEMIRequiredAttrib(tab);

    $('#otp-elem').removeClass('fourdigit');
    $('#otp').attr('maxlength', 6);

    var self = this;
    var customer = self.customer;
    var remember = self.get('remember_customer');
    $('#form-card').toggleClass('save-enabled', remember);

    if (!remember) {
      return self.setScreen('card');
    }

    tab_titles.otp = tab_titles.card;
    $('#otp-sec').html('Skip saved cards');

    if (!customer.logged && !this.wants_skip) {
      self.commenceOTP('saved cards', true);
      customer.checkStatus(function() {
        /**
         * 1. If this is a recurring payment and customer doesn't have saved cards,
         *    create and ask for OTP.
         * 2. If customer has saved cards and is not logged in, ask for OTP.
         * 3. If customer doesn't have saved cards, show cards screen.
         */
        if (self.recurring && !customer.saved && !customer.logged) {
          self.customer.createOTP(function() {
            askOTP(
              'Enter OTP sent on ' +
                getPhone() +
                '<br>to save your Card for future payments'
            );
          });
        } else if (customer.saved && !customer.logged) {
          askOTP();
        } else {
          self.showCards();
        }
      });
    } else {
      self.showCards();
    }
  },

  showCards: function() {
    this.setSavedCards();
    this.setScreen('card');
  },

  deleteCard: function(e) {
    var target = $(e.target);
    if (!target.hasClass('delete')) {
      return;
    }
    var parent = target.parent().parent();
    if (confirm('Press OK to delete card.')) {
      this.customer.deleteCard(
        parent.find('[type=radio]')[0].value,
        function() {
          parent.remove();
        }
      );
    }
  },

  setSavedCard: function(e) {
    var $savedCard = $(e.delegateTarget);
    if (this.tab === 'emi' && !isString($savedCard.attr('emi'))) {
      return;
    }

    // If it's the same card, do nothing.
    if (e.delegateTarget === $('#saved-cards-container .checked')[0]) {
      return;
    }

    $('#saved-cards-container .checked').removeClass('checked');
    $savedCard.addClass('checked');
    var cardtype = $savedCard.$('.cardtype').attr('cardtype');
    if (
      !e.target ||
      e.target !== $savedCard.find('select[name="emi_duration"]')[0]
    ) {
      $savedCard.$('.saved-cvv').focus();
    }

    if ($savedCard.$('.flow-selection-container')[0]) {
      Analytics.track('atmpin:saved_card:select', {
        type: AnalyticsTypes.BEHAV,
        data: {
          default_auth_type: defaultAuthTypeRadioVal,
        },
      });
    }
  },

  setSavedCards: function() {
    var customer = this.customer;
    var tokens = customer && customer.tokens && customer.tokens.count;
    var cardTab = $('#form-card');
    var delegator = this.delegator;

    if (!delegator) {
      delegator = this.delegator = Razorpay.setFormatter(this.el);
    }

    if (tokens) {
      if ($$('.saved-card').length !== customer.tokens.items.length) {
        try {
          customer.tokens.items.sort(function(a, b) {
            return b.card && !!b.card.emi;
          });
        } catch (e) {}

        var savedCardsCount = customer.tokens.items.filter(function(item) {
          return item.method === 'card';
        }).length;

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

        gel('saved-cards-container').innerHTML = templates.savedcards({
          tokens: customer.tokens,
          emi_mode: this.get('theme.emi_mode'),
          amount: this.get('amount'),
          session: this,
          emi: this.methods.emi,
          emi_options: this.emi_options,
          recurring: this.recurring,
        });

        this.toggleEMIRequiredAttrib(this.tab);
      }
    }

    if (tokens) {
      this.setSavedCard({ delegateTarget: qs('.saved-card') });
    }

    this.savedCardScreen = tokens;
    this.toggleSavedCards(!!tokens);
    $('#form-card').toggleClass('has-cards', tokens);

    each($$('.saved-cvv'), function(i, input) {
      delegator.add('number', input);
    });
  },

  toggleSavedCards: function(saveScreen) {
    var tabCard = $('#form-card');
    var saveClass = 'saved-cards';
    if (typeof saveScreen !== 'boolean') {
      saveScreen = !tabCard.hasClass(saveClass);

      Analytics.track('saved_cards:toggle', {
        type: AnalyticsTypes.BEHAV,
        data: {
          from: tabCard.hasClass(saveClass) ? 'saved' : 'new',
        },
      });
    }

    $('#elem-emi').removeClass('hidden');
    unsetEmiBank();

    var $savedContainer = $('#saved-cards-container');

    if (saveScreen) {
      this.setSavedCard({ delegateTarget: qs('.saved-card') });
      invoke('addClass', $savedContainer, 'scroll', 300);
    } else {
      try {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      } catch (e) {}
      $savedContainer.removeClass('scroll');
    }

    this.savedCardScreen = saveScreen;
    tabCard.toggleClass(saveClass, saveScreen);
  },

  switchBank: function(e) {
    var val = e.target.value;

    Analytics.track('bank:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        bank: val,
      },
    });

    this.checkDown(val);
    this.checkBankRadio(val);
    this.proceedAutomaticallyAfterSelectingBank();
  },

  /**
   * Checks the bank radio corresponding to the value.
   * @param {String} val
   */
  checkBankRadio: function(val) {
    each($$('#netb-banks input'), function(i, radio) {
      $(radio.parentNode).removeClass('active');
      if (radio.value === val) {
        $(radio.parentNode).addClass('active');
        radio.checked = true;
      } else if (radio.checked) {
        $(radio.parentNode).removeClass('active');
        radio.checked = false;
      }
    });
  },

  checkDown: function(val) {
    $('.down')
      .toggleClass('vis', indexOf(this.down, val) !== -1)
      .$('.text')
      .html((this.methods.netbanking || this.methods.emandate)[val]);
  },

  validateOffers: function(selectedVal, selectedEl) {
    if (!this.offers || !this.offers.appliedOffer) {
      return true;
    }

    return this.offers.appliedOffer.issuer === selectedVal;
  },

  selectBankRadio: function(e) {
    if (ua_iPhone) {
      Razorpay.sendMessage({ event: 'blur' });
    }
    var val = e.target.value;

    Analytics.track('bank:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        bank: val,
      },
    });

    this.checkDown(val);
    var select = gel('bank-select');
    select.value = val;
    this.input(select);
    this.proceedAutomaticallyAfterSelectingBank();
  },

  /**
   * Deselects bank.
   */
  deselectBank: function(e) {
    var select = gel('bank-select');

    if (select) {
      select.value = '';
    }

    this.checkBankRadio('');
  },

  /**
   * Once the bank is selected in the banks list,
   * proceed automatically if some conditions are met.
   */
  proceedAutomaticallyAfterSelectingBank: function() {
    if ($(this.el).hasClass('emandate') && this.emandateView) {
      if (this.checkInvalid()) {
        return;
      }

      return this.emandateView.showBankOptions($('#bank-select').val());
    }
  },

  checkInvalid: function(parent) {
    if (!parent) {
      parent = this.getActiveForm();
      var payload = this.payload;
      if (payload && payload.method === 'wallet' && !payload.wallet) {
        return $('#wallets').addClass('invalid');
      }
    }
    var invalids = $(parent).find('.invalid');
    if (invalids && invalids[0]) {
      this.shake();
      var invalidInput = $(invalids[0]).find('.input')[0];
      if (invalidInput) {
        invalidInput.focus();
      }

      each(invalids, function(i, field) {
        $(field).addClass('mature');
      });
      return true;
    }
  },

  getActiveForm: function() {
    var form = this.tab || 'common';
    if (form === 'card' || form === 'emi') {
      var whichCardTab = this.savedCardScreen ? 'saved-cards' : 'add-card';
      return '#' + whichCardTab + '-container';
    }
    if (form === 'emandate') {
      form = 'netbanking';
    }
    return '#form-' + form;
  },

  getFormData: function() {
    var tab = this.tab;
    var data = {};

    fillData('#pad-common', data);

    var prefillEmail = this.get('prefill.email');
    var prefillContact = this.get('prefill.contact');

    var optional = this.optional;

    if (optional) {
      if (
        optional.contact &&
        !(prefillContact && contactPattern.test(prefillContact))
      ) {
        delete data.contact;
      } else if (data.contact) {
        data.contact = data.contact.replace(/\ /g, '');
      }

      if (optional.email && !(prefillEmail && emailPattern.test(data.email))) {
        delete data.email;
      }
    }

    if (tab) {
      data.method = tab;
      fillData(this.getActiveForm(), data);

      // Delete all the auth_type-* keys
      each(data, function(key, val) {
        if (key.indexOf('auth_type-') === 0) {
          delete data[key];
        }
      });

      if (this.screen === 'card') {
        if (this.savedCardScreen) {
          var $checkedCard = $('.saved-card.checked');
          data.token = $checkedCard.attr('token');
          data['card[cvv]'] = $checkedCard.$('.saved-cvv').val();

          // Set auth_type for Debit+PIN for saved cards.
          var authType = $checkedCard.$('.flow.input-radio input:checked');
          authType = authType[0] && authType.val();
          if (authType) {
            data['auth_type'] = authType;
          }
        } else {
          if (tab === 'emi') {
            data.emi_duration = $('#elem-emi .input').val();
          }
          var cardNumberKey = 'card[number]';
          data[cardNumberKey] = data[cardNumberKey].replace(/\ /g, '');
        }
        if (!data.emi_duration) {
          data.method = 'card';
          delete data.emi_duration;
        }
      }

      if (this.screen === 'upi') {
        if (data.upi_app && data.upi_app === 'directpay') {
          data['_[flow]'] = 'directpay';
          delete data.upi_app;
        }
        if (data['_[flow]'] !== 'directpay') {
          if (data['_[flow]'] === 'tez' && this.tezMode === 'desktop') {
            data.vpa = data.tez_username + '@' + data.tez_bank;
          } else {
            delete data.vpa;
          }
        }

        if ('tez_username' in data) {
          delete data.tez_username;
          delete data.tez_bank;
        }
      }
    }
    return data;
  },

  hide: function(confirmedCancel) {
    var self = this;
    if (this.isOpen) {
      if (
        confirmedCancel !== true &&
        this.r._payment &&
        this.r._payment.isMagicPayment
      ) {
        return Confirm.show({
          message: 'Your payment is ongoing. Press OK to cancel the payment.',
          heading: 'Cancel Payment?',
          positiveBtnTxt: 'Yes, cancel',
          negativeBtnTxt: 'No',
          onPositiveClick: function() {
            self.close(true);
          },
        });
      }

      $('#modal-inner').removeClass('shake');
      hideOverlayMessage();
      this.modal.hide();
      this.savedCardScreen = undefined;
    }
  },

  showLoadError: function(text, error) {
    var actionState;
    var loadingState = 'addClass';
    if (error) {
      if (
        (this.screen === 'upi' || this.get('ecod')) &&
        text === discreet.cancelMsg
      ) {
        if (this.payload['_[flow]'] === 'intent') {
          return;
        }
        return this.hideErrorMessage();
      }
      actionState = loadingState;
      loadingState = 'removeClass';
    } else {
      actionState = 'removeClass';
    }

    if (!text) {
      text = strings.process;
    }

    if (this.screen === 'otp') {
      this.body.removeClass('sub');
      setOtpText(text);
      var formOtp = $('#form-otp');
      formOtp[actionState]('action');
      formOtp[loadingState]('loading');
    } else {
      $('#fd-t').html(text);
      showOverlay($('#error-message')[loadingState]('loading'));
    }
  },

  commenceOTP: function(text, partial) {
    this.setScreen('otp');
    $('#add-funds').removeClass('show');

    invoke(
      function() {
        if (this.screen === 'otp' && (this.tab !== 'card' || !this.payload)) {
          $('#footer').addClass('otp');
        }
      },
      this,
      null,
      300
    );

    if (text) {
      if (partial) {
        text = 'Looking for ' + text + ' associated with ';
      }
      this.showLoadError(text + getPhone());
    }
  },

  onOtpSubmit: function() {
    if (this.checkInvalid('#form-otp')) {
      return;
    }

    Analytics.track('otp:submit', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: this.tab === 'wallet',
      },
    });

    this.showLoadError('Verifying OTP');
    var otp = gel('otp').value.replace(/\D/g, '');

    if (this.tab === 'wallet') {
      return this.r.submitOTP(otp);
    }

    // card tab only past this
    var callback;
    // card filled by logged out user + remember me
    if (this.payload) {
      var isRedirect = this.get('redirect');
      if (!isRedirect) {
        this.submit();
      }
      callback = function(msg) {
        if (this.customer.logged) {
          this.setScreen('card');
          if (isRedirect) {
            this.submit();
          } else {
            this.r.emit('payment.resume');
          }
          this.showLoadError();
        } else {
          this.r.emit('payment.error', discreet.error(msg));
          Analytics.track('behav:otp:incorrect', {
            wallet: this.tab === 'wallet',
          });
          askOTP(msg);
        }
      };
    } else {
      var self = this;
      callback = function(msg) {
        if (self.customer.logged) {
          self.showCardTab();
        } else {
          Analytics.track('behav:otp:incorrect', {
            wallet: self.tab === 'wallet',
          });
          askOTP(msg);
        }
      };
    }
    this.customer.submitOTP(
      {
        otp: otp,
        email: gel('email').value,
      },
      bind(callback, this)
    );
  },

  clearRequest: function(extra) {
    var powerotp = gel('powerotp');
    if (powerotp) {
      powerotp.value = '';
    }

    if (this.r._payment) {
      hideOverlayMessage();
      this.r.emit('payment.cancel', extra);
    }

    this.destroyMagic();

    this.isResumedPayment = false;

    var params = {};
    params[Constants.UPI_POLL_URL] = '';
    params[Constants.PENDING_PAYMENT_TS] = '0';
    this.setParamsInStorage(params);

    abortAjax(this.ajax);

    clearTimeout(this.requestTimeout);
    this.requestTimeout = null;
  },

  preSubmit: function(e) {
    if (this.extraFields && !$(this.el).hasClass('show-methods') && !this.tab) {
      return this.extraNext();
    }
    if (this.oneMethod && !this.tab) {
      setTimeout(function() {
        window.scrollTo(0, 100);
      });
      return this.switchTab(this.oneMethod);
    }

    preventDefault(e);
    var screen = this.screen;

    if (!this.tab && !this.order) {
      return;
    }

    if (screen === 'otp') {
      return this.onOtpSubmit();
    }

    if (/^magic/.test(screen)) {
      var magicData = {};
      fillData('#form-' + screen, magicData);
      this.magicView.submit(screen, magicData);
      return;
    }

    this.refresh();
    var data = (this.payload = this.getPayload());

    if (data.auth_type && data.auth_type === 'c3ds') {
      /**
       * Deleting this from data manually because c3ds is just for Checkout,
       * API takes 3DS, which is the default anyway.
       */
      delete data.auth_type;
    }

    if (this.order && this.order.bank) {
      if (this.checkInvalid('#pad-common')) {
        return;
      }
      data.method = this.order.method || data.method || 'netbanking';
      data.bank = this.order.bank;
    } else if (screen) {
      if (screen === 'card') {
        var formattingDelegator = this.delegator;

        // Do not proceed with amex cards if amex is disabled for merchant
        // also without this, cardsaving is triggered before API returning unsupported card error
        if (
          !preferences.methods.amex &&
          formattingDelegator.card.type === 'amex'
        ) {
          return this.showLoadError('AMEX cards are not supported', true);
        }
        var nocvv_el = $('#nocvv-check [type=checkbox]')[0];
        if (!this.savedCardScreen) {
          // handling add new card screen
          formattingDelegator.card.format();
          formattingDelegator.expiry.format();

          // if maestro card is active
          if (nocvv_el.checked && !nocvv_el.disabled) {
            $('.elem-expiry').removeClass('invalid');
            $('.elem-cvv').removeClass('invalid');
            data['card[cvv]'] = '000';

            // explicitly remove, else it'll override month/year later
            delete data['card[expiry]'];
            data['card[expiry_month]'] = '12';
            data['card[expiry_year]'] = '21';
          }
        } else {
          if (!data['card[cvv]']) {
            var checkedCard = $('.checked');
            if (checkedCard.$('.cardtype').attr('cardtype') !== 'maestro') {
              // no saved card was selected
              this.shake();
              return $('.checked .saved-cvv').focus();
            }
          }
        }
      } else if (/^emandate/.test(screen)) {
        if (this.screen === 'emandate') {
          screen = 'netbanking';
          data.bank = $('#bank-select').val();
          data.method = 'emandate';
        }
        return this.emandateView.submit(data);
      }

      // perform the actual validation
      if (screen === 'upi') {
        if (this.checkInvalid('#form-upi input:checked + label')) {
          return;
        }
      } else if (this.checkInvalid()) {
        return;
      }
    } else if (this.oneMethod === 'netbanking') {
      data.bank = this.get('prefill.bank');
    } else {
      return;
    }
    this.submit();
  },

  submit: function() {
    if (this.r._payment) {
      return;
    }

    var data = this.payload;
    var that = this;
    var request = {
      fees: preferences.fee_bearer,
      sdk_popup: this.sdk_popup,
      magic: this.magic,
    };
    // ask user to verify phone number if not logged in and wants to save card
    if (data.save && !this.customer.logged) {
      if (this.screen === 'card') {
        $('#otp-sec').html('Skip saving card');
        this.commenceOTP(strings.otpsend);
        debounceAskOTP();
        return this.customer.createOTP();
      } else {
        request.message = 'Verifying OTP...';
        request.paused = true;
      }
    }
    delete data.app_token;

    var $address = $('#address');

    if ($address[0]) {
      var notes = (data.notes = clone(this.get('notes')) || {});
      notes.address = $address.val();
      notes.pincode = $('#pincode').val();
      notes.state = $('#state').val();
      if (Object.keys(notes).length > 15) {
        delete notes.pincode;
        delete notes.state;
        notes.address +=
          ', ' + Constants.STATES[notes.state] + ' - ' + notes.pincode;
      }
    }

    // If there's a package name, the flow is intent.
    if (data.upi_app) {
      if (this.shouldAskUPI2FPermission) {
        this.askUPI2FPermission(data.upi_app);
        return;
      }
      data['_[flow]'] = 'intent';
    }

    if (data['_[flow]'] === 'tez') {
      if (this.tezMode === 'desktop') {
        data['_[flow]'] = 'directpay';
        Analytics.track('tez:collect_request');
      } else {
        request.tez = true;
        data['_[flow]'] = 'intent';
      }
    }

    var appliedOffer = this.getAppliedOffer();

    if (appliedOffer) {
      data.offer_id = appliedOffer.id;
      this.r.display_amount = appliedOffer.amount;
      Analytics.track('offers:applied_with_payment', {
        data: appliedOffer,
      });
    } else {
      delete this.r.display_amount;
    }

    Razorpay.sendMessage({
      event: 'submit',
      data: data,
    });

    var wallet = data.wallet;
    var walletObj;
    if (data.method === 'wallet') {
      walletObj = freqWallets[wallet];

      if (!walletObj || walletObj.custom) {
        return;
      }

      if (this.hasAmazonpaySdk && wallet === 'amazonpay') {
        request.amazonpay = true;
      }
    }

    if (this.modal) {
      this.modal.options.backdropclose = false;
    }

    if (
      discreet.WalletUtils.isPowerWallet(wallet) &&
      !request.fees &&
      data.contact &&
      data.email
    ) {
      this.powerwallet = true;
      $('#otp-sec').html('Resend OTP');
      tab_titles.otp =
        '<img src="' + walletObj.logo + '" height="' + walletObj.h + '">';
      this.commenceOTP(wallet + ' account', true);
    } else {
      this.showLoadError();
    }

    if (wallet === 'freecharge') {
      $('#otp-elem').addClass('fourdigit');
      $('#otp').attr('maxlength', 4);
    } else {
      $('#otp-elem').removeClass('fourdigit');
      $('#otp').attr('maxlength', 6);
    }

    var payment = this.r.createPayment(data, request);
    payment
      .on('payment.success', bind(successHandler, this))
      .on('payment.error', bind(errorHandler, this))
      .on('payment.cancel', bind(cancelHandler, this));

    this.attemptCount++;

    var sub_link = $('#error-message .link');

    if (this.r._payment && this.r._payment.isMagicPayment) {
      window.handleRelay = handleRelayFn.bind(this);
    }

    payment.on('payment.magic.init', function() {
      that.setMagic();
      that.magicView.track('init');
      that.showLoadError('Please wait while we fetch your transaction details');

      if (that.r._payment && that.r._payment.isMagicPayment) {
        sub_link.html('View bank page');
        sub_link[0].style = '';
        sub_link.on('click', function() {
          if (that.magicView) {
            that.magicView.track('user_cancel');
            that.magicView.showPaymentPage({
              otpelf: true,
              magic: false,
            });
          }
        });
      }
    });

    var iosCheckoutBridgeNew = Bridge.getNewIosBridge();

    if (request.amazonpay) {
      payment.on('payment.amazonpay.process', function(data) {
        /* invoke amazonpay sdk via our SDK */
        if (CheckoutBridge && CheckoutBridge.processPayment) {
          that.showLoadError();
          CheckoutBridge.processPayment(JSON.stringify(data));
        } else if (iosCheckoutBridgeNew) {
          iosCheckoutBridgeNew.postMessage({
            action: 'processPayment',
            body: data,
          });
        }
      });
    }

    if (this.powerwallet) {
      this.showLoadError(strings.otpsend + getPhone());
      this.r.on('payment.otp.required', debounceAskOTP);
      this.r.on(
        'payment.wallet.topup',
        bind(function() {
          var insufficient_text = 'Insufficient balance in your wallet';
          if (this.get('ecod')) {
            this.back();
            this.clearRequest();
            defer(
              bind(function() {
                this.showLoadError(insufficient_text, true);
              }, this),
              400
            );
          }
          if (
            this.payload &&
            this.payload.wallet === 'payumoney' &&
            this.r._payment
          ) {
            if (!window.localStorage) {
              return this.r._payment.complete(
                discreet.error(insufficient_text)
              );
            }
          }
          $('#form-otp').removeClass('loading');
          $('#add-funds').addClass('show');
          setOtpText(insufficient_text);
        }, this)
      );
    } else if (data.method === 'upi' && !this.multiTpv) {
      sub_link.html('Cancel Payment');

      this.r.on('payment.upi.noapp', function(data) {
        that.showLoadError(
          'No UPI App on this device. Select other UPI option to proceed.',
          true
        );

        that.body.addClass('upi-noapp');
      });

      this.r.on('payment.upi.selectapp', function(data) {
        that.showLoadError('Select UPI App in your device', false);
      });

      this.r.on('payment.upi.coproto_response', function(request) {
        var params = {};
        params[Constants.UPI_POLL_URL] = request.url;
        params[Constants.PENDING_PAYMENT_TS] = now() + '';
        that.setParamsInStorage(params);
      });

      this.r.on('payment.upi.pending', function(data) {
        if (data && data.flow === 'upi-intent') {
          return that.showLoadError('Waiting for payment confirmation.');
        }

        /* Otherwise it's directpay */
        that.showLoadError(
          "Please accept the request from Razorpay's VPA on your UPI app"
        );
      });
    } else {
      sub_link.html('Go to payment');
      this.r.on(
        'payment.cancel',
        bind('showLoadError', this, discreet.cancelMsg, true)
      );
    }
  },

  getPayload: function() {
    var data = this.getFormData();

    if (this.screen === 'card') {
      setEmiBank(data, this.savedCardScreen);
      if (this.recurring) {
        var recurringValue = this.get('recurring');
        data.recurring = isString(recurringValue) ? recurringValue : 1;
      }
    }

    // data.amount needed by external libraries relying on `onsubmit` postMessage
    data.amount = this.get('amount');
    return data;
  },

  close: function() {
    if (this.prefCall) {
      this.prefCall.abort();
      this.prefCall = null;
    }

    if (this.isOpen) {
      abortAjax(this.ajax);
      this.clearRequest();
      this.isOpen = false;
      clearTimeout(fontTimeout);

      try {
        this.delegator.destroy();
        invokeEach(this.listeners);
      } catch (e) {}
      invokeOnEach('off', this.bits);
      this.listeners = [];
      this.bits = [];
      if (this.modal) {
        this.modal.destroy();
      }
      $(this.el).remove();

      this.tab = this.screen = '';

      if (this.emi) {
        this.emi.unbind();
      }

      clearInterval(this.closeTimer);
      clearTimeout(this.closeTimeout);

      this.tab = this.screen = '';
      this.modal = this.emi = this.el = this.card = null;
      this.isOpen = false;
      window.setPaymentID = window.onComplete = null;
    }
  },

  saveAndClose: function() {
    if (this.isOpen) {
      this.data = this.getFormData();
      this.close();
    }
  },

  checkFlows: function(iin, isPrefilledCardNumber) {
    // Hide and uncheck checkboxes.
    showFlowRadioButtons(false);

    if (this.recurring) {
      return;
    }

    var self = this;

    this.flowIIN = iin;

    if (this.recurring) {
      return;
    }

    this.r.getCardFlows(iin, function(flows) {
      Analytics.track('card_flows:fetched', {
        data: {
          iin: iin,
          prefilled_card: isPrefilledCardNumber || null,
          default_auth_type: defaultAuthTypeRadioVal,
        },
      });

      // Sanity-check
      if (self.flowIIN !== iin) {
        return;
      }

      if (flows && flows.pin) {
        Analytics.track('atmpin:flows', {
          type: AnalyticsTypes.RENDER,
          data: {
            iin: iin,
            prefilled_card: isPrefilledCardNumber || null,
            default_auth_type: defaultAuthTypeRadioVal,
          },
        });
        showFlowRadioButtons(true);
      } else {
        showFlowRadioButtons(false);
      }
    });
  },

  setEmiOptions: function() {
    var emiBanks = {};
    var preferences = this.preferences;
    var prefEmiOptions = preferences.methods.emi_options;

    each(Bank.emiBanks, function(i, bank) {
      var emiBank = {
        name: bank.name,
        patt: bank.patt,
        code: bank.code,
        plans: {},
      };

      if (prefEmiOptions) {
        each(prefEmiOptions[bank.code], function(j, plan) {
          emiBank.plans[plan.duration] = plan.interest;
        });

        if (prefEmiOptions[bank.code]) {
          emiBanks[bank.code] = emiBank;
        }
      }
    });

    var emiOptions = {
      banks: emiBanks,
    };

    /* TODO: remove common min and use bank specific min_amounts */
    emiOptions.min = 3000 * 100 - 1; /* min 3k */
    emiOptions.amex_min = 5000 * 100 - 1; /* min 5k */
    emiOptions.selected = 'KKBK'; /* default bank to select in EMI plans view */

    this.emi_options = emiOptions;
  },

  setPaymentMethods: function(preferences) {
    var recurring = this.recurring;
    var international = this.get('currency') !== 'INR';
    var availMethods = preferences.methods;
    var amount = this.get('amount');
    var bankMethod = 'netbanking';
    var passedWallets = this.get('method.wallet');
    var self = this;
    var emi_options = this.emi_options;

    var methods = (this.methods = {
      count: 0,
    });
    /* Set recurring payment methods*/
    if (recurring) {
      availMethods = availMethods.recurring;
      var banks = {};

      /* emandate recurring */
      if (availMethods.emandate) {
        bankMethod = 'emandate';
        this.emandate = true;
        each(availMethods[bankMethod], function(bankCode, bankObj) {
          banks[bankCode] = bankObj.name;
        });
        this.emandateBanks = availMethods[bankMethod];
        availMethods[bankMethod] = banks;
      }

      /* card recurring */
      if (availMethods.card) {
        if (availMethods.card.credit instanceof Array) {
          this.recurring_card_text =
            availMethods.card.credit.join(' and ') + ' credit cards';
        }
        availMethods.debit_card = availMethods.card.debit;
        availMethods.credit_card = availMethods.card.credit;
        if (!amount) {
          delete availMethods.card;
        }
      }
    }

    /* evaluate enabled methods form preferences and merchant options */
    each(availMethods, function(method, enabled) {
      if (enabled && self.get('method.' + method) !== false) {
        methods[method] = enabled;
      }
    });

    /**
     * disable EMI if:
     * - Non INR payment
     * - Recurring payment
     * - EMI not enabled
     * - Card not enabled
     * - amount is less than EMI threshold
     */
    var emiMethod = this.get('theme.emi_mode');
    if (
      !((emiMethod && methods.emi) || methods.card) ||
      recurring ||
      international ||
      amount <= emi_options.min
    ) {
      methods.emi = false;
    }

    /* set tab_titles for card method */
    if (methods.emi && !emiMethod) {
      tab_titles.card = 'Card/EMI';
    } else {
      if (availMethods.debit_card && !availMethods.credit_card) {
        tab_titles.card = tab_titles.debit_card;
      } else {
        tab_titles.card = 'Card';
      }
    }

    /**
     *  disable UPI if:
     * - amount > 1 Lac
     * - Recurring payment
     * - Non INR payment
     */
    if (amount > 1e7 || recurring || international) {
      methods.upi = false;
    }

    /**
     * disable wallets if:
     * - amount > 20k
     * - Wallets not enabled by backend
     * - Recurring payment
     * - Non INR payment
     *
     * Also, enable/disable wallets on the basis of merchant options
     */
    if (
      amount >= 100 * 20000 ||
      /* php encodes blank object as blank array */
      methods.wallet instanceof Array ||
      recurring ||
      international
    ) {
      methods.wallet = {};
    } else if (typeof passedWallets === 'object') {
      each(passedWallets, function(wallet, enabled) {
        if (enabled === false) {
          delete methods.wallet[wallet];
        }
      });
    }

    /* Emandate only works on amount of 0 as of now */
    if (amount > 0 && methods.emandate) {
      methods.emandate = false;
    }

    /* enable or disable netbanking tab on the basis of preferences */
    if (
      !methods[bankMethod] ||
      methods[bankMethod] instanceof Array ||
      international
    ) {
      methods[bankMethod] = false;
    } else {
      methods.count = 1;
      this.down = getDownBanks(preferences);
      this.netbanks = getPreferredBanks(
        preferences,
        this.get('method.netbanking')
      );
    }

    if (methods.card) {
      methods.count++;
    }

    if (emiMethod) {
      methods.count++;
    }

    if (methods.upi) {
      methods.count++;
    }

    /* set external wallets */
    each(this.get('external.wallets'), function(i, externalWallet) {
      if (externalWallet in freqWallets) {
        methods.wallet[externalWallet] = true;
        freqWallets[externalWallet].custom = true;
      }
    });

    /* set other wallets */
    var wallets = [];
    each(methods.wallet, function(code) {
      var freqWallet = freqWallets[code];
      if (freqWallet) {
        wallets.push(freqWallet);
      }
    });

    if (wallets.length) {
      methods.count++;
    }

    wallets.sort(function(walletA, walletB) {
      return walletB.custom ? 1 : -1;
    });

    methods.wallet = wallets;
  },

  setOffers: function(preferences) {
    var hasOffers = (this.hasOffers = isArray(preferences.offers)),
      forcedOffer = (this.forcedOffer =
        hasOffers && preferences.force_offer && preferences.offers[0]);

    if (forcedOffer) {
      var paymentMethod =
        forcedOffer.payment_method === 'emi'
          ? 'card'
          : forcedOffer.payment_method;

      if (['card', 'wallet'].indexOf(paymentMethod) >= 0) {
        // need this while preparing the template
        this[paymentMethod + 'Offer'] = preferences.offers[0];
      }

      Analytics.track('offers:forced', {
        data: forcedOffer,
      });
    }
  },

  getAppliedOffer: function() {
    return this.forcedOffer || (this.offers && this.offers.appliedOffer);
  },

  isOfferApplicableOnIssuer: function(issuer, offer) {
    issuer = issuer.toLowerCase();
    offer = offer || this.getAppliedOffer();

    if (!offer) {
      return false;
    }

    var offerIssuer = (offer.issuer || '').toLowerCase(),
      offerNetwork = (offer.payment_network || '').toLowerCase();

    if (issuer === 'amex') {
      return !offerNetwork || offerNetwork === issuer;
    }

    return !offerIssuer || offerIssuer === issuer;
  },

  getDiscountedAmount: function() {
    var appliedOffer = this.getAppliedOffer();

    return (appliedOffer && appliedOffer.amount) || this.get('amount');
  },

  showOffersError: function(cb) {
    var methodDescription = '',
      screen = this.screen;

    if (screen === 'netbanking') {
      methodDescription = 'Bank';
    } else if (screen === 'upi') {
      methodDescription = 'VPA';
    } else {
      methodDescription = titleCase(this.screen);
    }

    this.offers.showError(methodDescription, cb);
  },

  setPreferences: function(prefs) {
    /* TODO: try to make a separate module for preferences */
    this.r.preferences = prefs;
    this.preferences = prefs;
    preferences = prefs;

    this.tab_titles = tab_titles;

    this.setEmiOptions();

    var self = this,
      customer,
      saved_customer = preferences.customer,
      filters = {},
      session_options = this.get(),
      order = (this.order = preferences.order),
      invoice = (this.invoice = preferences.invoice),
      subscription = (this.subscription = preferences.subscription),
      options = preferences.options;
    this.setOffers(preferences);

    /* Set magic from preferences */
    this.magic = this.magic && preferences.magic;

    /* set empty customer in case of local card saving */
    if (preferences.global === false) {
      this.local = true;
      customer = new Customer('');
      getCustomer = function() {
        return customer;
      };
    }

    /* In case of recurring set recurring as filter in saved cards */
    if (
      session_options['prefill.method'] === 'emandate' ||
      preferences.subscription ||
      session_options.recurring
    ) {
      this.recurring = filters.recurring = true;
    }

    /* Used previously logged in customer details and saved card tokens */
    if (saved_customer) {
      /* saved card details take priority over prefill */
      if (saved_customer.contact) {
        session_options['prefill.contact'] = saved_customer.contact;
      }

      if (saved_customer.email) {
        session_options['prefill.email'] = saved_customer.email;
      }

      customer = getCustomer(saved_customer.contact);
      sanitizeTokens(saved_customer.tokens, filters);
      customer.tokens = saved_customer.tokens;

      if (saved_customer.tokens) {
        customer.logged = true;
        Analytics.setMeta('loggedIn', true);
      }

      customer.customer_id = saved_customer.customer_id;
    }

    /* enable card saving if recurring payment */
    if (this.recurring) {
      session_options.remember_customer = true;
    }

    /* disable card saving if merchant disables it in options */
    if (!this.r.get('features.cardsaving')) {
      session_options.remember_customer = false;
    }

    /* set optional fields */
    this.optional = arr2obj(preferences.optional);

    /* disable cardsaving if cookies disabled or optional contact with no
     * prefill */
    if (
      cookieDisabled ||
      (this.optional.contact && !session_options['prefill.contact'])
    ) {
      options.remember_customer = false;
    }

    /* set Razorpay instance for customer */
    Customer.prototype.r = this.r;

    /* Apply options overrides from preferences */
    Razorpay.configure(options);

    /* Amount in case of partial payments */
    var prefillAmount = session_options['prefill.amount'];
    if (prefillAmount) {
      session_options.amount = Number(Math.floor(prefillAmount));
    } else {
      if (order && order.amount) {
        session_options.amount = order.partial_payment
          ? order.amount_due
          : order.amount;
      } else if (invoice && invoice.amount) {
        session_options.amount = invoice.amount;
      } else if (subscription && subscription.amount) {
        session_options.amount = subscription.amount;
      }
    }

    /*
     * Set redirect mode if TPV and callback_url exists
     *
     * TODO: move this to payment
     */
    if (
      order &&
      order.bank &&
      this.get('callback_url') &&
      order.method !== 'upi'
    ) {
      session_options.redirect = true;
      this.tpvRedirect = true;
      return this.r.createPayment(
        {
          contact: this.get('prefill.contact') || '9999999999',
          email: this.get('prefill.email') || 'void@razorpay.com',
          bank: order.bank,
          method: 'netbanking',
        },
        {
          fee: preferences.fee_bearer,
        }
      );
    }

    /* set payment methods on the basis of preferences */
    this.setPaymentMethods(preferences);
  },

  showModal: function(preferences) {
    var qpmap = getQueryParams();

    if (!this.methods.count) {
      var message = 'No appropriate payment method found.';
      if (this.recurring && !this.get('customer_id') && this.methods.emandate) {
        message += '\nMake sure to pass customer_id for e-mandate payments';
      }
      return Razorpay.sendMessage({ event: 'fault', data: message });
    }

    this.render();

    Razorpay.sendMessage({ event: 'render' });

    if (CheckoutBridge) {
      var containerBox = $('#container')[0];
      if (containerBox) {
        var rect = containerBox.getBoundingClientRect();
        Bridge.checkout.callAndroid(
          'setDimensions',
          Math.floor(rect.width),
          Math.floor(rect.height)
        );
      }

      $('#backdrop').css('background', 'rgba(0, 0, 0, 0.6)');
    }

    if (qpmap.error) {
      errorHandler.call(this, qpmap);
    }

    if (qpmap.tab) {
      this.switchTab(qpmap.tab);
    }
  },

  fetchPrefs: function(callback) {
    var prefData = makePrefParams(this);
    var self = this;

    if (cookieDisabled) {
      prefData.checkcookie = 0;
    } else {
      /* set test cookie
       * if it is not reflected at backend while fetching prefs, disable
       * cardsaving */
      prefData.checkcookie = 1;
      document.cookie = 'checkcookie=1;path=/';
    }

    if (this.isOpen) {
      return;
    }

    this.isOpen = true;

    var timeout = this.get('timeout');
    if (timeout) {
      this.closeAt = now() + timeout * 1000;
    }

    this.prefCall = Razorpay.payment.getPrefs(prefData, function(response) {
      self.prefCall = null;
      if (response.error) {
        return Razorpay.sendMessage({
          event: 'fault',
          data: response.error.description,
        });
      }
      var preferences = response;
      self.setPreferences(preferences);

      /* pass preferences options to SDK */
      Bridge.checkout.callAndroid(
        'setMerchantOptions',
        JSON.stringify(preferences.options)
      );

      if (self.tpvRedirect) {
        return;
      }

      callback(preferences);
    });

    return this.prefCall;
  },
};

function commenceECOD(session) {
  var url = makeAuthUrl(
    session.r,
    'invoices/' + session.get('invoice_id') + '/status'
  );
  setTimeout(function() {
    session.ajax = fetch({
      url: url,
      callback: function(response) {
        if (response.error) {
          errorHandler.call(session, response);
        } else if (response.razorpay_payment_id) {
          successHandler.call(session, response);
        }
      },
    }).till(function(response) {
      return response && response.status;
    });
  }, 6000);
}

function send_ecod_link() {
  // this == session
  this.showLoadError('Sending link to ' + getPhone());
  var r = this.r;
  fetch.post({
    url: makeAuthUrl(r, 'invoices/' + r.get('invoice_id') + '/notify/sms'),
    callback: debounce(hideOverlayMessage, 4000),
  });
}

function updateTimer(timeoutEl, closeAt) {
  return function() {
    var timeLeft = Math.floor((closeAt - now()) / 1000);
    timeoutEl.innerHTML =
      'Payment will expire in ' +
      Math.floor(timeLeft / 60) +
      ':' +
      ('0' + (timeLeft % 60)).slice(-2) +
      ' minutes';
  };
}

/*
 * Call initIframe() after the session class is defined.
 */

discreet.initIframe();
