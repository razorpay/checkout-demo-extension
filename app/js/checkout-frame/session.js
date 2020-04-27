var RAZORPAY_HOVER_COLOR = '#626A74';

var ua = navigator.userAgent;

var preferences,
  CheckoutBridge = window.CheckoutBridge,
  StorageBridge = window.StorageBridge,
  isIframe = window !== parent,
  ownerWindow = isIframe ? parent : opener,
  _uid = Track.id,
  tab_titles = Constants.TAB_TITLES,
  freqWallets = Wallet.wallets,
  contactPattern = Constants.CONTACT_REGEX,
  emailPattern = Constants.EMAIL_REGEX,
  isMobile = discreet.UserAgent.isMobile,
  getCustomer = discreet.getCustomer,
  Customer = discreet.Customer,
  Constants = discreet.Constants,
  sanitizeTokens = discreet.sanitizeTokens,
  Store = discreet.Store,
  MethodStore = discreet.MethodStore,
  SessionStore = discreet.SessionStore,
  UPIUtils = discreet.UPIUtils,
  Payouts = discreet.Payouts,
  _Arr = discreet._Arr,
  _Func = discreet._Func,
  _ = discreet._,
  _Obj = discreet._Obj,
  _Doc = discreet._Doc,
  _El = discreet._El,
  Hacks = discreet.Hacks,
  CardlessEmi = discreet.CardlessEmi,
  PayLater = discreet.PayLater,
  PayLaterView = discreet.PayLaterView,
  OtpService = discreet.OtpService,
  storeGetter = discreet.storeGetter,
  HomeScreenStore = discreet.HomeScreenStore,
  CardScreenStore = discreet.CardScreenStore,
  CustomerStore = discreet.CustomerStore,
  EmiStore = discreet.EmiStore,
  Cta = discreet.Cta,
  NBHandlers = discreet.NBHandlers,
  Instruments = discreet.Instruments;

// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone|iPad/.test(ua);
var ua_iPhone = /iPhone/.test(ua);
var isIE = /MSIE |Trident\//.test(ua);
var DEMO_MERCHANT_KEY = 'rzp_live_ILgsfZCZoFIKMb';

// .shown has display: none from iOS ad-blocker
// using दृश्य, which will never be seen by tim cook
var shownClass = 'drishy';

var strings = {
  otpsend: 'Sending OTP to ',
  process: 'Your payment is being processed',
  gpay_omnichannel: 'Verifying mobile number with Google Pay..',
  redirect: 'Redirecting to Bank page',
  acs_load_delay: 'Seems like your bank page is taking time to load.',
  otp_resent: 'OTP resent',
};

var fontTimeout;

/**
 * Temp stores for Cardless EMI & PayLater.
 * Will move to Svelte Store upon migration.
 */
var CardlessEmiStore = {
  plans: {},
  duration: {},
  loanUrls: {},
  ott: {},
  lenderBranding: {},
  urls: {},
};

var PayLaterStore = {
  plans: {},
  duration: {},
  loanUrls: {},
  ott: {},
  lenderBranding: {},
};

function createCardlessEmiImage(src) {
  return '<img src="' + src + '" class="cardless_emi-topbar-image">';
}

function createCardlessEmiTopbarImages(providerCode) {
  var provider = CardlessEmi.getProvider(providerCode);

  return createCardlessEmiImage(provider.logo);
}

// TODO: Refactor and merge with Cardless EMI method
function createPayLaterImage(src) {
  return '<img src="' + src + '" class="paylater-topbar-image">';
}

function createPayLaterTopbarImages(providerCode) {
  var provider = PayLater.getProvider(providerCode);

  return createPayLaterImage(provider.logo);
}

/**
 * Store for what tab and screen
 * should be shown when back is pressed.
 */
var BackStore = null;

function confirmClose() {
  return confirm(discreet.confirmCancelMsg);
}

/**
 * A valid contact can only contain
 * - number
 * - spaces
 * - hyphens
 * - parenthesis
 * - plus
 *
 * @param {string} contact
 *
 * @returns {boolean}
 */
function doesContactHaveValidCharacters(contact) {
  return !/[^\d\+\s\-\(\)]+/.test(contact);
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

/**
 * Improvise the contact from prefill
 * @param {Session} session
 */
function improvisePrefilledContact(session) {
  var prefilledContact = session.get('prefill.contact');

  if (!prefilledContact) {
    return;
  }

  // We have some invalid charactes
  if (!doesContactHaveValidCharacters(prefilledContact)) {
    Analytics.track('prefill:invalid:chars', {
      data: {
        type: 'contact',
        value: prefilledContact,
      },
    });

    return;
  }

  var formattedContact = discreet.CountryCodesUtil.findCountryCode(
    prefilledContact
  );
  var newContact = '+' + formattedContact.code + formattedContact.phone;

  if (prefilledContact !== newContact) {
    session.set('prefill.contact', newContact);

    Analytics.setMeta('improvised.prefilledContact', true);

    Analytics.track('prefill:improvise', {
      data: {
        type: 'contact',
        from: prefilledContact,
        to: newContact,
      },
    });
  }
}

/**
 * Returns the cardType from payload
 *
 * @param {Object} payload
 * @param {Array} tokens
 *
 * @return {String} cardType
 */
function getCardTypeFromPayload(payload, tokens) {
  var cardType = '';

  if (payload.token) {
    if (tokens) {
      tokens.forEach(function(t) {
        if (t.token === payload.token) {
          cardType = t.card.networkCode;
        }
      });
    }
  } else {
    cardType = discreet.Card.getCardType(payload['card[number]']);
  }

  return cardType;
}

/**
 * Returns the issuer for EMI from Payload
 *
 * @param {Object} payload
 * @param {Array} tokens
 *
 * @return {String} issuer
 */
function getIssuerForEmiFromPayload(payload, tokens) {
  var issuer = '';

  if (payload.token) {
    if (tokens) {
      tokens.forEach(function(t) {
        if (t.token === payload.token) {
          issuer = t.card.issuer;

          // EMI code for HDFC Debit Cards is HDFC_DC
          if (issuer === 'HDFC' && t.card.type === 'debit') {
            issuer = 'HDFC_DC';
          }
        }
      });
    }
  } else {
    issuer = _Obj.getSafely(
      Bank.getBankFromCard(payload['card[number]']),
      'code',
      ''
    );
  }

  return issuer;
}

/**
 * Set the "View EMI Plans" CTA as the Pay Button
 * if all the criteria are met.
 *
 * Criteria:
 * Mandatory: tab=emi
 *
 * 1. If saved cards screen, show if selected saved card does not have a plan selected.
 * 2. If new card screen, show if no emi plan is selected.
 */
function setEmiPlansCta(screen, tab) {
  var session = SessionManager.getSession();
  var type = 'pay';

  var isSavedScreen =
    session.svelteCardTab && session.svelteCardTab.isOnSavedCardsScreen();

  var emiDuration = getEmiDurationForNewCard();
  var savedCard = $('.saved-card.checked');

  if (screen === 'card' && tab === 'emi') {
    if (isSavedScreen) {
      if (savedCard[0]) {
        var emiDurationForSavedCard = getEmiDurationForSavedCard();
        if (!emiDurationForSavedCard) {
          type = 'show';
        }
      }
    } else if (!emiDuration) {
      type = 'show';
    }
  } else if (screen === 'emiplans') {
    if (isSavedScreen) {
      var savedCard = $('.saved-card.checked');

      if (savedCard[0]) {
        if (!savedCard.$('.saved-cvv input').val()) {
          type = 'select';
        }
      }
    } else {
      type = 'pay';
    }
  } else if (screen === 'emi' && tab === 'emiplans') {
    type = 'emi';
  } else if (session.isPayout) {
    type = 'confirm-account';
  }

  switch (type) {
    case 'pay':
      Cta.setAppropriateCtaText();
      break;

    case 'show':
      Cta.updateCta('View EMI Plans');
      break;

    case 'select':
      Cta.updateCta('Select EMI Plan');
      break;

    case 'emi':
      Cta.updateCta('Enter Card Details');
      break;

    case 'confirm-account':
      Cta.updateCta('Confirm Account');
      break;
  }
}

function setEmiBank(data) {
  var activeEmiPlan = getEmiDurationForNewCard();
  if (activeEmiPlan) {
    data.method = 'emi';
    data.emi_duration = activeEmiPlan;
  }
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
  $('#overlay').toggleClass('sub', $('#body').hasClass('sub'));
}

function overlayInUse() {
  return $$('.overlay.' + shownClass).length;
}

/**
 * Hides #overlay only if:
 * Some other element with .overlay is not visible
 */
function hideOverlaySafely($with) {
  if ($with) {
    makeHidden($with[0]);
  }
  var overlay = $('#overlay');
  if (overlay[0]) {
    // Remove shown class to start transition.
    overlay.removeClass(shownClass);
    setTimeout(function() {
      if (overlayInUse()) {
        // Don't hide overlay
        // Undo adding shown class
        overlay.addClass(shownClass);
      } else {
        // Hide overlay
        overlay.hide();
      }
    }, 200);
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

function hideFeeWrap() {
  var feeWrap = $('#fee-wrap');
  var wasShown = feeWrap.hasClass(shownClass);
  if (wasShown) {
    hideOverlay(feeWrap);
  }
  return wasShown;
}

function hideOverlayMessage() {
  if (!hideEmi() && !hideFeeWrap()) {
    var session = SessionManager.getSession();

    if (session.tab === 'nach') {
      if (!session.nachScreen.shouldHideOverlay()) {
        return;
      }
    }

    if (
      $('#confirmation-dialog').hasClass('animate') ||
      gel('options-wrap').children.length
    ) {
      makeHidden(gel('error-message'));
    } else {
      hideOverlay($('#error-message'));
    }
  }
}

/**
 * Get the text to show to EMI plan.
 * @param {Number} amount
 * @param {Object} plan
 *
 * @return {Object}
 */
function getEmiText(session, amount, plan) {
  var amountPerMonth = Razorpay.emi.calculator(
    amount,
    plan.duration,
    plan.interest
  );

  return (
    plan.duration +
    ' Months (' +
    session.formatAmountWithCurrency(amountPerMonth) +
    '/mo)'
  );
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

  if (message === discreet.cancelMsg) {
    if (this.powerwallet) {
      // prevent payment canceled error
      this.powerwallet = null;
      return;
    } else if (this.nativeotp && this.tab === 'card') {
      this.markHeadlessFailed();
      return;
    }
  }

  this.clearRequest();

  Analytics.track('error', {
    data: response,
  });
  Analytics.setMeta('payment.failed', true);
  Razorpay.sendMessage({ event: 'paymenterror', data: { error: error } });

  /**
   * If retry is disabled, Checkout will be 'dismiss'ed.
   * Set the dismiss reason.
   *
   * This will work because the user won't be able
   * to dismiss it after this point.
   * If the user were able to dismiss it, we'd
   * have to clear this somehow.
   */
  if (!this.get('retry')) {
    this.dismissReason = {
      error: error,
    };
  }

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

  if (this.tab || message !== discreet.cancelMsg) {
    this.showLoadError(
      message || 'There was an error in handling your request',
      true
    );
  }

  NBHandlers.replaceRetryIfCorporateNetbanking(this, message);
}

/* bound with session */
function cancelHandler(response) {
  if (!this.payload) {
    return;
  }

  Analytics.setMeta('payment.cancelled', true);
  this.markHeadlessFailed();

  if (this.payload.method === 'upi' && this.payload['_[flow]'] === 'intent') {
    if (this.r._payment && this.r._payment.upi_app) {
      discreet.UPIUtils.trackUPIIntentFailure(this.r._payment.upi_app);
    }

    this.showLoadError('Payment did not complete.', true);
  } else if (
    /^(card|emi)$/.test(this.payload.method) &&
    this.screen &&
    this.screen !== 'card'
  ) {
    if (
      getCardTypeFromPayload(
        this.payload,
        this.svelteCardTab.getTransformedTokens()
      ) === 'bajaj'
    ) {
      this.setScreen('emi');
      this.switchTab('emi');
    } else {
      this.switchTab('card');
    }
  }
}

function getPhone() {
  return storeGetter(HomeScreenStore.contact);
}

function getEmail() {
  return storeGetter(HomeScreenStore.email);
}

function getEmiDurationForNewCard() {
  return storeGetter(EmiStore.newCardEmiDuration);
}

function setEmiDurationForNewCard(duration) {
  EmiStore.newCardEmiDuration.set(duration);
}

function getEmiDurationForSavedCard() {
  return storeGetter(EmiStore.savedCardEmiDuration);
}

function setEmiDurationForSavedCard(duration) {
  EmiStore.setEmiDurationForSavedCard(duration);
}

function setOtpText(view, text) {
  view.setText(text);
}

function elfShowOTP(otp, sender, bank) {
  window.handleOTP(otp);
}

function askOTP(view, text, shouldLimitResend, screenProps) {
  if (!screenProps) {
    screenProps = {};
  }

  var origText = text; // ಠ_ಠ
  var qpmap = _.getQueryParams();
  var thisSession = SessionManager.getSession();

  // Track if OTP was invalid
  if (origText === discreet.wrongOtpMsg) {
    Analytics.track('otp:invalid', {
      data: {
        wallet: thisSession.tab === 'wallet',
        headless: thisSession.headless,
      },
    });
  }

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

  view.updateScreen(
    _Obj.extend(
      {
        loading: false,
        action: false,
        otp: '',
        allowSkip: !Store.isRecurring(),
        allowResend: shouldLimitResend
          ? OtpService.canSendOtp('razorpay')
          : true,
      },
      screenProps
    )
  );

  $('#body').addClass('sub');

  if (!text) {
    if (thisSession.tab === 'card' || thisSession.tab === 'emi') {
      if (thisSession.headless) {
        Analytics.track('native_otp:otp:ask');
        text = 'Enter OTP to complete the payment';
        if (isNonNullObject(origText)) {
          if (origText.metadata) {
            var metadata = origText.metadata;
            thisSession.headlessMetadata = metadata;

            OtpService.markOtpSent(metadata.issuer || metadata.network);

            var bankLogo;
            if (metadata.issuer) {
              bankLogo = discreet.getFullBankLogo(metadata.issuer);
            } else if (metadata.network) {
              bankLogo = discreet.Card.getFullNetworkLogo(metadata.network);
            }

            if (bankLogo) {
              qs('#tab-title').innerHTML =
                '<img class="native-otp-bank" src="' +
                bankLogo +
                '" onerror="this.style.opacity = 0;">';
            }
          }
          if (!origText.next || origText.next.indexOf('otp_resend') === -1) {
            view.updateScreen({
              allowResend: false,
            });
          }

          view.updateScreen({
            skipText: "Complete on bank's page",
          });
          if (thisSession.headless && !origText.redirect) {
            view.updateScreen({
              allowSkip: false,
            });
          }

          if (!thisSession.get('timeout')) {
            thisSession.closeAt = now() + 3 * 60 * 1000;
            thisSession.showTimer(function() {
              thisSession.hideTimer();
              thisSession.back(true);
              setTimeout(function() {
                Analytics.track('native_otp:timeout');
                thisSession.showLoadError(
                  'Payment was not completed on time',
                  1
                );
              }, 300);
            });
          }
        }
      } else {
        text = 'Enter OTP sent on ' + getPhone() + '<br>to ';
        if (thisSession.payload) {
          text += 'save your card';
        } else {
          text += 'access Saved Cards';
        }
      }
    } else {
      text = 'An OTP has been sent on<br>' + getPhone();
    }
  }

  setOtpText(view, text);
}

function debounceAskOTP(view, msg, shouldLimitResend, screenProps) {
  debounce(askOTP, 750)(view, msg, shouldLimitResend, screenProps);
}

// this === Session
function successHandler(response) {
  if (this.preferredInstrument) {
    P13n.recordSuccess(
      this.preferredInstrument,
      this.getCurrentCustomer(this.payload && this.payload.contact)
    );
  }

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
  shouldUseNativeOTP: function() {
    // For demo merchant, if the flow is present, we want to use Native OTP without checking for network.
    var isDemoMerchant = this.get('key') === DEMO_MERCHANT_KEY;

    var redirectModeWithNativeOtp =
      this.get('nativeotp') && this.get('redirect') && this.r.isLiveMode();

    return isDemoMerchant || redirectModeWithNativeOtp;
  },

  getDecimalAmount: getDecimalAmount,

  formatAmount: function(amount) {
    var displayCurrency = this.r.get('display_currency');
    var currency = this.r.get('currency');

    return discreet.Currency.formatAmount(amount, displayCurrency || currency);
  },

  formatAmountWithCurrencyInMinor: function(amount) {
    var currency = this.get('currency');
    var config = discreet.Currency.getCurrencyConfig(currency);
    var multiplier = Math.pow(10, config.decimals);

    var value = parseInt((amount * multiplier).toFixed(config.decimals));

    return this.formatAmountWithCurrency(value);
  },

  formatAmountWithCurrency: function(amount) {
    var amountFigure = this.formatAmount(amount);
    var displayCurrency = this.r.get('display_currency');
    var currency = this.r.get('currency');

    if (displayCurrency) {
      // TODO: handle display_amount case as in modal.jst
      amount = discreet.currencies[displayCurrency] + ' ' + amount;
    } else {
      amount = discreet.currencies[currency] + ' ' + amountFigure;
    }

    return amount;
  },

  // so that accessing this.data would not produce error
  data: emo,
  params: emo,

  /**
   * Update the amount in header.
   *
   * @param {Number} amount
   */
  updateAmountInHeader: function(amount) {
    $('#amount .original-amount').rawHtml(
      this.formatAmountWithCurrency(amount)
    );
  },
  /**
   * Set the amount in header.
   *
   * @param {String} html
   */
  setRawAmountInHeader: function(html) {
    $('#amount .original-amount').html(html);
  },

  /**
   * Returns the Payment instance for the current payment.
   *
   * @return {Payment}
   */
  getPayment: function() {
    return this.r._payment;
  },

  getClasses: function() {
    var classes = [];
    if (isMobile()) {
      classes.push('mobile');
    }

    var getter = this.get;
    var setter = this.set;

    if (!this.r.isLiveMode()) {
      classes.push('test');
    }

    if (this.fontLoaded) {
      classes.push('font-loaded');
    }

    if (getter('theme.hide_topbar')) {
      classes.push('notopbar');
    }

    if (this.irctc) {
      tab_titles.upi = 'BHIM/UPI';
      tab_titles.card = 'Debit/Credit Card';
      this.r.set('theme.image_frame', false);
    }

    if (MethodStore.isMethodEnabled('emi')) {
      tab_titles.card = 'Card';
    }

    if (!getter('image')) {
      classes.push('noimage');
    }

    if (MethodStore.isEMandateEnabled()) {
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
      var classes = this.getClasses();
      var div = document.createElement('div');
      var styleEl = this.renderCss();
      div.innerHTML = templates.modal(this, {
        Store: Store,
        MethodStore: MethodStore,
        cta: storeGetter(Cta.getStore()),
      });
      this.el = div.firstChild;
      this.applyFont(this.el.querySelector('#powered-link'));
      document.body.appendChild(this.el);

      this.el.appendChild(styleEl);

      this.body = $('#body');

      $(this.el).addClass(classes);
    }
    return this.el;
  },

  fillData: function() {
    var self = this;
    var oldMethod = this.data.method;
    if (oldMethod) {
      this.wants_skip = true;
    }
    var tab = oldMethod || this.get('prefill.method');

    if (tab) {
      var optional = {
        contact: Store.isContactOptional(),
        email: Store.isEmailOptional(),
      };
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

    var order = Store.getMerchantOrder();
    if (tab && !(order && order.bank) && MethodStore.isMethodEnabled(tab)) {
      this.switchTab(tab);
    } else if (tab === '') {
      this.switchTab(tab);
    }

    var prefilledWallet = this.get('prefill.wallet');
    if (prefilledWallet) {
      var selectedWalletEl = $('#wallet-radio-' + prefilledWallet);

      if (selectedWalletEl && selectedWalletEl[0]) {
        selectedWalletEl.prop('checked', true);
        if (tab === 'wallet') {
          Cta.showCta();
        }

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

      if (data['bank']) {
        this.netbankingTab.setSelectedBank(data['bank']);
      }

      each(
        {
          contact: 'contact',
          email: 'email',
        },
        function(name, id) {
          var el = gel(id);
          var val = data[name];
          if (el && val) {
            el.value = val;
            self.input(el);
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

          if (self.r._payment && self.r._payment.upi_app) {
            discreet.UPIUtils.trackUPIIntentFailure(self.r._payment.upi_app);
          }

          self.showLoadError('Payment did not complete.', true);
          self.clearRequest(discreet.UPIUtils.upiBackCancel);
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

  setExperiments: function() {
    discreet.Experiments.clearOldExperiments();
  },

  render: function(options) {
    var that = this;

    options = options || {};

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

    this.setExperiments();
    this.setTpvBanks();
    this.getEl();
    this.setFormatting();
    this.improvisePaymentOptions();
    this.improvisePrefill();
    this.setSvelteComponents();
    this.fillData();
    this.setEMI();
    Cta.setAppropriateCtaText();
    this.setModal();
    this.completePendingPayment();
    this.bindEvents();
    this.setEmiScreen();
    this.runMaxmindScriptIfApplicable();
    this.prefillPostRender();
    this.updateCustomerInStore();
    Hacks.initPostRenderHacks();

    errorHandler.call(this, this.params);

    if (!this.tab && !this.get('prefill.contact')) {
      $('#contact').focus();
    }

    if (this.closeAt) {
      this.showTimer(function() {
        that.dismissReason = 'timeout';
        that.modal.hide();
      });
    }

    // Look for new UPI apps.
    if (this.all_upi_intents_data) {
      discreet.UPIUtils.findAndReportNewApps(this.all_upi_intents_data);
    }

    if (this.upi_intents_data) {
      discreet.UPIUtils.trackAppImpressions(this.upi_intents_data);
    }

    P13n.trackNumberOfP13nContacts();

    // Analytics related to orientation
    Analytics.setMeta('orientation', Hacks.getDeviceOrientation());
    window.addEventListener('orientationchange', function() {
      Analytics.setMeta('orientation', Hacks.getDeviceOrientation());
    });

    if (discreet.UserAgent.Safari) {
      Analytics.setMeta('safari', true);
    }

    Analytics.track('complete', {
      type: AnalyticsTypes.RENDER,
      data: {
        embedded: this.embedded,
      },
    });
    Analytics.setMeta('timeSince.render', discreet.timer());
  },

  runMaxmindScriptIfApplicable: function() {
    this.runMaxmindScript();
  },

  runMaxmindScript: function() {
    var script = _El.create('script');
    window.maxmind_user_id = '115820';
    script.async = true;
    script.src = 'https://device.maxmind.com/js/device.js';
    document.body.appendChild(script);
  },

  setUpiTab: function() {
    /**
     * This is being handled in Tab component as well,
     * condition won't be needed here once all ported to svelte
     */
    if (MethodStore.isMethodEnabled('upi')) {
      this.upiTab = new discreet.UpiTab({
        target: _Doc.querySelector('#form-fields'),
      });
    }
  },

  setHomeTab: function() {
    this.homeTab = new discreet.HomeTab({
      target: gel('form-fields'),
    });
  },

  setNetbankingTab: function() {
    var method, banks;
    var prefilledbank = this.get('prefill.bank');

    if (MethodStore.isEMandateEnabled()) {
      method = 'emandate';
      var embanks = MethodStore.getEMandateBanks();
      banks = _Obj.reduce(
        embanks,
        function(banks, bank, code) {
          banks[code] = bank.name;
          return banks;
        },
        {}
      );
    } else if (MethodStore.isMethodEnabled('netbanking')) {
      method = 'netbanking';
      banks = Store.getMerchantMethods().netbanking;
    }

    if (method) {
      this.netbankingTab = new discreet.NetbankingTab({
        target: gel('form-fields'),
        props: {
          bankOptions: this.get('method.netbanking'),
          banks: banks,
          method: method,
          selectedBankCode: prefilledbank,
        },
      });

      // Add listener for proceeding automatically only if emandate
      if (method === 'emandate') {
        this.netbankingTab.$on(
          'bankSelected',
          this.proceedAutomaticallyAfterSelectingBank.bind(this)
        );
      }

      var session = this;

      this.netbankingTab.$on('bankSelected', function(e) {
        session.validateOffers(e.detail.bank.code, function(offerRemoved) {
          if (!offerRemoved) {
            // If the offer was not removed, revert to the bank in offer issuer
            session.netbankingTab.setSelectedBank(
              session.getAppliedOffer().issuer
            );
          }
        });
      });
    }
  },

  setSvelteCardTab: function() {
    if (MethodStore.isCardOrEMIEnabled()) {
      this.svelteCardTab = new discreet.CardTab({
        target: gel('form-fields'),
        props: {
          askOTP: askOTP,
        },
      });
    }
  },

  setWalletsTab: function() {
    if (MethodStore.isMethodEnabled('wallet')) {
      this.svelteWalletsTab = new discreet.WalletTab({
        target: gel('wallet-svelte-wrap'),
        props: {},
      });
    }
  },

  setSvelteComponents: function() {
    this.setHomeTab();
    this.setSvelteCardTab();
    this.setNetbankingTab();
    this.setEmandate();
    this.setCardlessEmi();
    this.setPayLater();
    this.setOtpScreen();
    this.setUpiTab();
    this.setPayoutsScreen();
    this.setNach();
    this.setBankTransfer();
    this.setWalletsTab();
    this.setOffers();
    // make bottom the last element
    gel('form-fields').appendChild(gel('bottom'));
  },

  showTimer: function(cb) {
    this.hideTimer();
    var timeLeft = this.closeAt - now();
    var timeoutEl = $('#timeout').show()[0];
    var timerFn = updateTimer(timeoutEl, this.closeAt);
    timerFn();
    var self = this;
    this.closeTimer = setInterval(timerFn, 1000);
    this.closeTimeout = setTimeout(function() {
      clearInterval(self.closeTimer);
      cb();
    }, timeLeft);
  },

  hideTimer: function() {
    $('#timeout').hide();
    clearInterval(this.closeTimer);
    clearTimeout(this.closeTimeout);
  },

  setTpvBanks: function() {
    var options = this.get();
    var bankCode, accountNumber;
    var order = Store.getMerchantOrder();

    if (order && order.method === 'upi') {
      this.upiTpv = true;
    }

    if (options['prefill.bank'] && !options['recurring']) {
      this.tab = this.oneMethod = 'netbanking';
    }

    if (order && order.bank) {
      bankCode = order.bank;
      accountNumber = order.account_number;
      if (
        !order.method &&
        MethodStore.isMethodEnabled('upi') &&
        MethodStore.isMethodEnabled('netbanking')
      ) {
        this.multiTpv = true;
      }
    }

    var banks = Store.getMerchantMethods().netbanking;

    if (bankCode) {
      // Use bank code as name if netbanking is disabled
      var bankName;
      if (banks) {
        bankName =
          typeof banks[bankCode] === 'object'
            ? banks[bankCode].name
            : banks[bankCode];
      } else {
        bankName = bankCode + ' Bank';
      }

      this.tpvBank = {
        name: bankName,
        code: bankCode,
        account_number: accountNumber,
        image: 'https://cdn.razorpay.com/bank/' + bankCode + '.gif',
      };
    }
  },

  setEMI: function() {
    if (!this.emi && MethodStore.isMethodEnabled('emi')) {
      $(this.el).addClass('emi');
      this.emi = new discreet.emiView();
    }

    if (!this.emiPlansView) {
      this.emiPlansView = new discreet.emiPlansView();
    }
  },

  setEmandate: function() {
    if (MethodStore.isEMandateEnabled()) {
      this.emandateView = new discreet.emandateView();
    }
  },

  selectCardlessEmiProvider: function(providerCode) {
    Analytics.track('cardless_emi:provider:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        provider: providerCode,
      },
    });

    // User selected EMI on Cards
    if (providerCode === 'cards') {
      this.switchTab('emi');
      return;
    }

    if (providerCode === 'bajaj') {
      this.showEmiPlans('bajaj')();
      return;
    }

    $('#form-cardless_emi input[name=emi_duration]').val('');
    $('#form-cardless_emi input[name=provider]').val('');
    $('#form-cardless_emi input[name=ott]').val('');

    CardlessEmiStore.providerCode = providerCode;

    $('#form-cardless_emi input[name=provider]').val(providerCode);
  },

  /**
   * Equivalent of clicking a provider option from the
   * Cardless EMI homescreen.
   * @param {String} providerCode Code for the provider
   */
  selectCardlessEmiProviderAndAttemptPayment: function(provider) {
    this.selectCardlessEmiProvider(provider);
    this.preSubmit();
  },

  setCardlessEmi: function() {
    var self = this;

    if (MethodStore.isMethodEnabled('cardless_emi')) {
      this.cardlessEmiView = new discreet.CardlessEmiView({
        target: _Doc.querySelector('#form-fields'),
      });

      this.cardlessEmiView.$on('select', function(event) {
        var providerCode = event.detail.code;
        self.selectCardlessEmiProviderAndAttemptPayment(providerCode);
      });
    }
  },

  selectPayLaterProvider: function(providerCode) {
    Analytics.track('paylater:provider:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        provider: providerCode,
      },
    });

    $('#form-paylater input[name=ott]').val('');
    $('#form-paylater input[name=provider]').val(providerCode);

    PayLaterStore.providerCode = providerCode;
    PayLaterStore.userRegistered = false;
    PayLaterStore.otpVerified = false;
  },

  /**
   * Equivalent of clicking a provider option from the
   * PayLater homescreen.
   * @param {String} providerCode Code for the provider
   */
  selectPayLaterProviderAndAttemptPayment: function(providerCode) {
    this.selectPayLaterProvider(providerCode);
    this.preSubmit();
  },

  /**
   * Adds the Nach screen to DOM
   */
  setNach: function() {
    if (MethodStore.isMethodEnabled('nach')) {
      this.nachScreen = new discreet.NachScreen({
        target: _Doc.querySelector('#form-fields'),
      });
    }
  },

  setBankTransfer: function() {
    if (MethodStore.isMethodEnabled('bank_transfer')) {
      this.bankTransferView = new discreet.BankTransferScreen({
        target: _Doc.querySelector('#form-fields'),
      });
    }
  },

  setPayLater: function() {
    var self = this;
    var isPayLaterEnabled = MethodStore.isMethodEnabled('paylater');

    if (!isPayLaterEnabled) {
      return;
    }

    this.payLaterView = new PayLaterView({
      target: _Doc.querySelector('#form-fields'),
    });

    this.payLaterView.$on('select', function(event) {
      var providerCode = event.detail.code;
      self.selectPayLaterProviderAndAttemptPayment(providerCode);
    });
  },

  setEmiScreen: function() {
    var session = this;
    if (!MethodStore.getEMIBanks().BAJAJ) {
      return;
    }

    this.emiScreenView = new discreet.emiScreenView({
      target: _Doc.querySelector('#form-emi'),
    });

    this.emiScreenView.$on('editplan', this.showEmiPlans('bajaj'));
  },

  setPayoutsScreen: function() {
    var session = this;
    if (!this.isPayout) {
      return;
    }

    var accounts =
      (this.preferences.contact && this.preferences.contact.fund_accounts) ||
      [];

    var upiAccounts = _Arr.filter(accounts, function(account) {
      return account.account_type === 'vpa';
    });

    var bankAccounts = _Arr.filter(accounts, function(account) {
      return account.account_type === 'bank_account';
    });

    Analytics.setMeta('count.accounts.upi', upiAccounts.length);
    Analytics.setMeta('count.accounts.bank', bankAccounts.length);

    this.payoutsView = new discreet.PayoutsInstruments({
      target: gel('form-fields'),
      props: {
        amount: this.formatAmountWithCurrency(this.get('amount')),
        upiAccounts: upiAccounts,
        bankAccounts: bankAccounts,
      },
    });

    this.payoutsAccountView = new discreet.PayoutAccount({
      target: gel('form-fields'),
    });

    $('#top-right').addClass('hidden');

    this.payoutsView.$on('selectaccount', function(event) {
      $('#body').addClass('sub');
      Analytics.track('payout:account:select', event.detail);
    });

    this.payoutsView.$on('add', function(event) {
      var method = event.detail.method;

      if (method === 'upi') {
        session.switchTab('upi');
      } else if (method === 'bank') {
        session.switchTab('payout_account');
      }
    });

    this.switchTab('payouts');
  },

  getCardlessEmiPlans: function() {
    var providerCode = CardlessEmiStore.providerCode;
    var plans = CardlessEmiStore.plans[providerCode];

    return plans;
  },

  showCardlessEmiPlans: function() {
    var self = this;
    var providerCode = CardlessEmiStore.providerCode;
    var plans = CardlessEmiStore.plans[providerCode];

    tab_titles.emiplans = createCardlessEmiTopbarImages(providerCode);

    if (!plans) {
      this.fetchCardlessEmiPlans();
      return;
    }

    Analytics.track('cardless_emi:plans:view', {
      data: {
        provider: providerCode,
      },
    });

    var plansList = this.getCardlessEmiPlans();

    this.emiPlansView.setPlans({
      plans: plansList,

      actions: {
        showAgreement: CardlessEmiStore.providerCode === 'zestmoney',
      },

      amount: this.get('amount'),

      loanUrl: CardlessEmiStore.loanUrls[providerCode],

      provider: CardlessEmiStore.providerCode,

      // TODO: This should be picked up from Store
      branding: CardlessEmiStore.lenderBranding[providerCode],

      on: {
        back: bind(function() {
          var payment = this.r._payment;

          if (payment && confirmClose()) {
            this.clearRequest({
              '_[reason]': 'PAYMENT_CANCEL_BEFORE_PLAN_SELECT',
            });

            this.switchTab('cardless_emi');
          }

          return true;
        }, this),

        select: function(value) {
          $('#form-cardless_emi input[name=emi_duration]').val(value);
          $('#form-cardless_emi input[name=provider]').val(
            CardlessEmiStore.providerCode
          );
          $('#form-cardless_emi input[name=ott]').val(
            CardlessEmiStore.ott[CardlessEmiStore.providerCode]
          );

          Analytics.track('cardless_emi:plan:select', {
            type: AnalyticsTypes.BEHAV,
            data: {
              provider: providerCode,
              value: value,
            },
          });

          self.preSubmit();
        },
      },
    });

    this.setScreen('emiplans');
  },

  fetchCardlessEmiPlans: function(params) {
    if (!params) {
      params = {};
    }

    var providerCode = CardlessEmiStore.providerCode;
    var cardlessEmiProviderObj = CardlessEmi.getProvider(providerCode);
    var self = this;

    var incorrectOtp = params.incorrect;

    var topbarImages = createCardlessEmiTopbarImages(providerCode);
    tab_titles.otp = topbarImages;

    this.commenceOTP(
      cardlessEmiProviderObj.name + ' account',
      true,
      'cardless_emi_enter'
    );

    if (this.screen !== 'otp' && this.tab !== 'cardless_emi') {
      return;
    }

    var callback = function() {
      var otpMessage =
        'Enter the OTP sent on ' +
        getPhone() +
        '<br>' +
        ' to get EMI plans for' +
        cardlessEmiProviderObj.name;

      if (incorrectOtp) {
        otpMessage = discreet.wrongOtpMsg;
      }

      debounceAskOTP(self.otpView, otpMessage, true, {
        allowSkip: false,
      });
    };

    var resend = params.resend;
    var resendUrl =
      CardlessEmiStore.urls[providerCode] &&
      CardlessEmiStore.urls[providerCode].resend_otp;

    if (resend && resendUrl) {
      Analytics.track('otp:resend', {
        type: AnalyticsTypes.BEHAV,
        data: {
          cardless_emi: providerCode,
        },
      });

      fetch.post({
        url: resendUrl,
        data: {
          contact: getPhone(),
        },
        callback: callback,
      });

      OtpService.markOtpSent('razorpay');
    } else {
      callback();
    }
  },

  checkCustomerStatus: function(params, callback) {
    var self = this;
    var provider = params.provider;
    var data = params.data;
    var phone = params.contact;

    this.getCurrentCustomer(phone).checkStatus(
      function(response) {
        self.updateCustomerInStore();
        if (_Obj.hasOwnProp(response, 'saved')) {
          if (response.saved) {
            callback();
          } else {
            var error =
              'Could not find a ' +
              provider +
              ' account associated with ' +
              phone;

            callback(error);
          }
          return;
        }

        if (response.error && response.error.description) {
          callback(response.error.description);
          return;
        }

        callback('Something went wrong.');
      },
      data,
      phone
    );
  },

  askPayLaterOtp: function(action) {
    var providerCode = PayLaterStore.providerCode;
    var payLaterProviderObj = PayLater.getProvider(providerCode);
    var self = this;

    var topbarImages = createPayLaterTopbarImages(providerCode);
    if (tab_titles.otp !== topbarImages) {
      tab_titles.otp = topbarImages;
    }

    var params = {
      provider: payLaterProviderObj.name,
      data: {
        provider: providerCode,
        amount: self.get('amount'),
        method: 'paylater',
      },
      contact: getPhone(),
    };

    var smsHash = this.sms_hash;
    if (this.get('send_sms_hash') && smsHash) {
      params.data.sms_hash = smsHash;
    }

    if (action === 'incorrect') {
      self.otpView.setText(discreet.wrongOtpMsg);
      return;
    } else if (action === 'resend') {
      this.commenceOTP('Resending OTP...', false, 'paylater_resend');
    } else if (action === 'verify') {
      this.commenceOTP('Verifying OTP...');
      return;
    } else {
      this.commenceOTP(
        payLaterProviderObj.name + ' account',
        true,
        'paylater_enter'
      );
    }

    this.checkCustomerStatus(params, function(error) {
      if (error) {
        PayLaterStore.userRegistered = false;
        self.showLoadError(error, true);
        return;
      }

      PayLaterStore.userRegistered = true;

      var otpMessage =
        'Enter the OTP sent on ' +
        getPhone() +
        '<br>' +
        ' to continue with ' +
        payLaterProviderObj.name;

      if (action === 'resend') {
        otpMessage = 'OTP has been resent successfully.';
      }

      askOTP(self.otpView, otpMessage, true);
      self.otpView.updateScreen({
        allowSkip: false,
      });
    });
  },

  submitPayLater: function() {
    // Step 1: Check if user is registered on the given provider.
    if (!PayLaterStore.userRegistered) {
      this.askPayLaterOtp();
      return;
    }

    // Step 2: Ask for OTP
    if (!PayLaterStore.otpVerified) {
      this.askPayLaterOtp('verify');
      return;
    }

    // Step 3: Set ProviderCode & OTT in the form
    $('#form-paylater input[name=provider]').val(PayLaterStore.providerCode);
    $('#form-paylater input[name=ott]').val(
      PayLaterStore.ott[PayLaterStore.providerCode]
    );

    // Step 4: Submit
    this.preSubmit();
  },

  setOtpScreen: function() {
    if (!this.otpView) {
      this.otpView = new discreet.otpView({
        target: gel('form-fields'),

        props: {
          on: {
            chooseMethod: bind(function() {
              this.switchTab();
            }, this),
            addFunds: bind(this.addFunds, this),
            resend: bind(this.resendOTP, this),
            retry: bind(this.back, this),
            secondary: bind(this.secAction, this),
          },
        },
      });
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

    $(this.el).addClass('one-method');
  },

  improvisePaymentOptions: function() {
    var oneMethod = MethodStore.getSingleMethod();
    if (oneMethod) {
      this.setOneMethod(oneMethod);
      return true;
    }

    if (this.upiTpv) {
      this.setOneMethod('upi');
    }
  },

  /**
   * Improvise the prefill options.
   */
  improvisePrefill: function() {
    var prefilledMethod = this.get('prefill.method');
    var prefilledProvider = this.get('prefill.provider');

    /**
     * Bajaj Finserv is _technically_ EMI,
     * but we're grouping it under Cardless EMI screen
     * on Checkout.
     */
    if (
      prefilledMethod === 'emi' &&
      prefilledProvider === 'bajaj' &&
      MethodStore.isMethodEnabled('cardless_emi') // Is the method enabled?
    ) {
      this.set('prefill.method', 'cardless_emi');
    }

    improvisePrefilledContact(this);
  },

  /**
   * Anything related to prefilled that needs to be done
   * once everything has rendered,
   * goes into this function.
   */
  prefillPostRender: function() {
    var prefilledMethod = this.get('prefill.method');
    var prefilledProvider = this.get('prefill.provider');

    if (
      prefilledMethod === 'cardless_emi' &&
      prefilledProvider &&
      this.checkCommonValidAndTrackIfInvalid()
    ) {
      this.selectCardlessEmiProviderAndAttemptPayment(prefilledProvider);
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
    themeMeta.backgroundColor = colorVariations.backgroundColor;
    themeMeta.icons = _PaymentMethodIcons.getIcons(colorVariations);
  },

  applyFont: function(anchor, retryCount) {
    if (!retryCount) {
      retryCount = 0;
    }
    if (anchor.offsetWidth / anchor.offsetHeight > 3) {
      $(this.el).addClass('font-loaded');
      this.fontLoaded = true;
      this.applyPartnershipBranding();
    } else if (retryCount < 25) {
      var self = this;
      fontTimeout = setTimeout(function() {
        self.applyFont(anchor, ++retryCount);
      }, 120 + retryCount * 50);
    }
  },

  /**
   * Applies the In Partnership With branding
   */
  applyPartnershipBranding: function() {
    var brand_logo = this.get('partnership_logo');

    if (brand_logo) {
      var elem = _Doc.querySelector('#powered-by');

      _El.addClass(elem, 'branded');
      _El.setContents(
        elem,
        'In partnership with<br><img src="' + brand_logo + '">'
      );
    }
  },

  hideErrorMessage: function(confirmedCancel) {
    if (this.nocostModal) {
      var modal = this.nocostModal;
      hideOverlay($('#nocost-overlay'));
      setTimeout(function() {
        modal.$destroy();
        modal = null;
      }, 200);
      return;
    }
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
      }

      if (confirmClose()) {
        this.clearRequest();
      } else {
        return;
      }
    }

    // Prevents the overlay from closing and not allowing the user to
    // attempt payment again incase of corporate netbanking.
    if (this.isCorporateBanking) {
      return;
    }

    $('#overlay-close').hide();
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
    var otpProvider;
    var paymentExists = Boolean(this.r._payment);
    var isCardlessEmiPayment =
      this.payload && this.payload.method === 'cardless_emi';

    if (!paymentExists || isCardlessEmiPayment) {
      /**
       * If we're resending the OTP without any payment being created,
       * it's a Razorpay OTP.
       * Used for Saved Cards, Cardless EMI.
       */
      otpProvider = 'razorpay';
    } else if (this.headless && this.headlessMetadata) {
      otpProvider =
        this.headlessMetadata.issuer || this.headlessMetadata.network;
    }

    var otpSentCount = OtpService.getCount(otpProvider);
    var resendEventData = {
      wallet: this.tab === 'wallet',
      headless: this.headless,
    };

    if (otpSentCount) {
      resendEventData.count = otpSentCount;
    }

    Analytics.track('otp:resend', {
      type: AnalyticsTypes.BEHAV,
      data: resendEventData,
    });

    if (this.headless) {
      this.showLoadError('Resending OTP');
      if (!this.get('timeout')) {
        this.hideTimer();
      }

      if (this.headlessMetadata) {
        var metadata = this.headlessMetadata;

        OtpService.markOtpSent(metadata.issuer || metadata.network);
      }

      return this.r.resendOTP(this.r.emitter('payment.otp.required'));
    }

    this.showLoadError(strings.otpsend + getPhone());
    if (this.tab === 'cardless_emi') {
      this.fetchCardlessEmiPlans({
        resend: true,
      });
    } else if (this.tab === 'paylater') {
      this.askPayLaterOtp('resend');
    } else if (this.tab === 'wallet') {
      this.r.resendOTP(this.r.emitter('payment.otp.required'));
    } else {
      var self = this;
      this.getCurrentCustomer().createOTP(function(message) {
        debounceAskOTP(self.otpView, message, true);
        self.updateCustomerInStore();
      });
    }
  },

  secAction: function() {
    if (this.headless && this.r._payment) {
      if (!this.get('timeout')) {
        Analytics.track('native_otp:gotobank', {
          type: AnalyticsTypes.BEHAV,
          immediately: true,
        });
        this.hideTimer();
      }
      this.showLoadError('Waiting for payment to complete on bank page');
      return this.r._payment.gotoBank();
    }
    var payload = this.payload;
    Analytics.track('saved_cards:skip', {
      type: AnalyticsTypes.BEHAV,
      data: {
        while_submitting: !!payload,
      },
    });
    $('#save').attr('checked', 0);
    this.wants_skip = true;
    if (payload) {
      delete payload.save;
      delete payload.app_token;
      this.submit();
      this.setScreen('card');
      if (!this.preferences.fee_bearer) {
        this.showLoadError();
      }
    } else {
      this.showCardTab();
    }
  },

  addFunds: function(event) {
    Analytics.track('wallet:balance:add', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: this.payload && this.payload.wallet,
      },
    });

    setOtpText(this.otpView, 'Loading...');
    this.otpView.updateScreen({
      action: false,
      loading: true,
      addFunds: false,
    });
    this.powerwallet = false;
    this.r.topupWallet();
  },

  setAmount: function(amount) {
    this.get().amount = amount;
    this.updateAmountInHeader(amount);
  },

  fixLandscapeBug: function() {
    function shiftUp() {
      $(this.el.querySelector('#footer'))
        .removeClass('shift-footer-down')
        .addClass('shift-footer-up');
      $(this.el.querySelector('#should-save-card'))
        .removeClass('shift-ssc-down')
        .addClass('shift-ssc-up');
    }
    function shiftDown() {
      $(this.el.querySelector('#footer'))
        .removeClass('shift-footer-up')
        .addClass('shift-footer-down');
      $(this.el.querySelector('#should-save-card'))
        .removeClass('shift-ssc-up')
        .addClass('shift-ssc-down');
    }
    if (discreet.UserAgent.iOS) {
      this.on('focus', '#card_name', shiftUp);
      this.on('blur', '#card_name', shiftDown);
      this.on('focus', '#card_cvv', shiftUp);
      this.on('blur', '#card_cvv', shiftDown);
    }
  },

  /**
   * Logs the user out
   * @param {boolean} outOfAllDevices
   */
  _logUserOut: function(customer, outOfAllDevices) {
    if (customer) {
      customer.logged = false;
      customer.tokens = null;

      customer.logout(outOfAllDevices);
    }

    _El.removeClass(_Doc.querySelector('#top-right'), 'logged');

    CustomerStore.customer.set({});
    if (this.svelteCardTab) {
      this.svelteCardTab.showLandingView();
    }
  },

  /**
   * Logs user out of this device.
   * @param {Customer} customer
   */
  logUserOut: function(customer) {
    this._logUserOut(customer);
  },

  /**
   * Logs user out of all devices.
   * @param {Customer} customer
   */
  logUserOutOfAllDevices: function(customer) {
    this._logUserOut(customer, true);
  },

  bindEvents: function() {
    var self = this;

    // cultgear.com bug: no events register unless
    // https://stackoverflow.com/questions/41869122/touch-events-within-iframe-are-not-working-on-ios
    document.addEventListener('touchstart', noop);
    this.listeners.push(function() {
      document.removeEventListener('touchstart', noop);
    });

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

    this.on(
      'focus',
      '#body',
      'selector',
      function(e) {
        $(e.target).addClass('focused');
      },
      true
    );

    this.on(
      'blur',
      '#body',
      'selector',
      function(e) {
        $(e.target).removeClass('focused');
      },
      true
    );

    if (this.get('theme.close_button')) {
      this.click('#modal-close', function() {
        if (this.get('modal.confirm_close') && !confirmClose()) {
          return;
        }
        this.hide();
      });
    }
    this.click('#top-left', this.back);
    this.on('submit', '#form', this.preSubmit);

    if (MethodStore.isCardOrEMIEnabled()) {
      /**
       * On iOS, unlike Android, the height of the browser
       * does not change when the keyboard is open. 🙄
       * On Android, the footer CTA shifts because the browser
       * resizes.
       * To simulate the same on iOS, we shift footer and some elements
       * on the card screen.
       *
       * This _has_ to be fixed in v4, so we'll remove it then.
       */
      if (Hacks.isDeviceLandscape() && isMobile()) {
        this.fixLandscapeBug();
      }
    }

    discreet.UserHandlers.attachLogoutListeners(this);

    if (MethodStore.isMethodEnabled('wallet')) {
      try {
        this.on(
          'change',
          '#wallets',
          function(e) {
            if (ua_iPhone) {
              Razorpay.sendMessage({ event: 'blur' });
            }
          },
          true
        );
      } catch (e) {}
    }

    if (MethodStore.isMethodEnabled('upi')) {
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
    }

    if (MethodStore.isMethodEnabled('emi')) {
      this.on('click', '#form-card', 'saved-card-pay-without-emi', function(e) {
        self.switchTab('card');
      });
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
    this.click('#overlay-close', this.hideErrorMessage);

    this.on('click', '#form-upi.collapsible .item', function(e) {
      $('#form-upi.collapsible .item.expanded').removeClass('expanded');
      $(e.currentTarget).addClass('expanded');
    });
  },

  onUpiAppSelect: function(packageName) {
    Analytics.track('upi:app:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        flow: 'intent',
        package_name: packageName,
        showRecommended: Boolean(this.showRecommendedUPIApp),
        recommended: Boolean(
          this.showRecommendedUPIApp &&
            discreet.UPIUtils.isPreferredApp(packageName)
        ),
      },
    });
  },

  focus: function(e) {
    if (_El.hasClass(e.target, 'no-focus')) {
      return;
    }

    $(e.target.parentNode).addClass('focused');
    setTimeout(function() {
      $(e.target).scrollIntoView();
    }, 1000);
    if (ua_iPhone) {
      Razorpay.sendMessage({ event: 'focus' });
    }
  },

  blur: function(e) {
    if (_El.hasClass(e.target, 'no-blur')) {
      return;
    }

    $(e.target.parentNode)
      .removeClass('focused')
      .addClass('mature');
    this.input(e.target);
    if (ua_iPhone) {
      Razorpay.sendMessage({ event: 'blur' });
    }
  },

  input: function(el) {
    if (_El.hasClass(el, 'no-validate')) {
      return;
    }

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
    each($$('.input:not(.no-refresh)'), function(i, el) {
      self.input(el);
    });
  },

  setFormatting: function() {
    var self = this;
    self.refresh();
    var bits = self.bits;
    var delegator = (self.delegator = Razorpay.setFormatter(self.el));
    delegator.otp = delegator
      .add('number', gel('otp'))
      .on('change', function() {
        self.input(this.el);
      });
  },

  setScreen: function(screen, params) {
    var extraProps = params && params.extraProps;
    if (screen) {
      var screenTitle =
        this.tab === 'emi'
          ? tab_titles[this.tab]
          : tab_titles[this.cardTab || screen];

      if (screen === 'upi' && this.isPayout) {
        screenTitle = tab_titles.payout_upi;
      }

      if (screenTitle) {
        gel('tab-title').innerHTML = screenTitle;
      }
    }

    if (screen !== 'otp') {
      this.headless = false;
    }

    setEmiPlansCta(screen, this.tab);

    if (screen === this.screen) {
      return;
    }

    if (screen === 'qr') {
      this.currentScreen = new discreet.QRScreen({
        target: qs('#form-fields'),
        props: {
          paymentData: this.getFormData(),
          onSuccess: bind(successHandler, this),
        },
      });
    } else if (this.currentScreen) {
      this.currentScreen.$destroy();
      this.currentScreen = null;
    }

    var trackingData = {
      from: this.screen,
      to: screen,
    };

    if (extraProps) {
      trackingData = _Obj.extend(trackingData, extraProps);
    }

    Analytics.track('screen:switch', {
      data: trackingData,
    });
    Analytics.setMeta('screen', screen);
    Analytics.setMeta('timeSince.screen', discreet.timer());

    this.screen = screen;
    $('#body').attr('screen', screen);
    makeHidden('.screen.' + shownClass);

    if (screen && !(this.isPayout && screen === 'payouts')) {
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

    /**
     * On the new homescreen,
     * we want to focus only if the user
     * is on the details screen.
     *
     * Temp check, will be fixed when old homescreen is removed.
     */
    if (screen === '') {
      if (this.homeTab && this.homeTab.onDetailsScreen()) {
        invoke('focus', qs(screenEl + ' .invalid input'));
      }
    } else if (!(screen === 'upi' && this.upi_intents_data)) {
      invoke('focus', qs(screenEl + ' .invalid input'));
    }

    var showPaybtn = screen;
    if (
      screen === 'cardless_emi' ||
      (this.tab === 'cardless_emi' && screen === 'emiplans') ||
      screen === 'paylater' ||
      screen === 'qr' ||
      (screen === 'wallet' && !$('.wallet :checked')[0]) ||
      screen === 'bank_transfer'
    ) {
      showPaybtn = false;
    }

    if (screen === 'payouts') {
      var selectedInstrument = this.payoutsView.getSelectedInstrument();
      showPaybtn = Boolean(selectedInstrument);
    }

    if (screen === '' && this.homeTab) {
      this.homeTab.onShown();
    } else if (screen !== 'upi') {
      this.body.toggleClass('sub', showPaybtn);
    }

    return this.offers && this.offers.renderTab(this.tab);
  },

  /**
   * Handles offer selection
   * @param {Offer} offer
   * @param {string} screen
   */
  handleOfferSelection: function(offer, screen) {
    screen = screen || this.screen;

    // Go to the offer's method if we're on homescreen
    if (screen !== offer.payment_method) {
      this.switchTab(offer.payment_method);
      return this.handleOfferSelection(offer, offer.payment_method);
    }

    var issuer = offer.issuer;

    if (screen === 'wallet') {
      // Select wallet
      $('#wallet-radio-' + issuer).click();
    } else if (screen === 'netbanking') {
      // Select bank
      if (issuer) {
        this.netbankingTab.setSelectedBank(issuer);
      }
    } else if (screen === 'emi') {
      var emiDuration = getEmiDurationForNewCard();
      var bank = this.emiPlansForNewCard && this.emiPlansForNewCard.code;

      if (emiDuration) {
        var plan = _Arr.find(MethodStore.getEMIBankPlans(bank), function(p) {
          return p.duration === emiDuration;
        });
        if (
          plan &&
          offer.id &&
          offer.emi_subvention &&
          plan.offer_id !== offer.id
        ) {
          // Clear duration
          setEmiDurationForNewCard('');
        }
      }
    } else if (screen === 'cardless_emi' && this.screen !== 'otp') {
      var provider = offer.provider;

      if (provider) {
        this.selectCardlessEmiProviderAndAttemptPayment(provider);
      }
    }
  },

  /**
   * Show the discount amount.
   */
  handleDiscount: function() {
    var offer = this.getAppliedOffer();
    var hasDiscount = offer && offer.amount !== offer.original_amount;
    $('#content').toggleClass('has-discount', hasDiscount);
    $('#amount .discount').html(
      hasDiscount ? this.formatAmountWithCurrency(offer.amount) : ''
    );
    Cta.showAmountInCta();
  },

  back: function(confirmedCancel) {
    var tab = '';
    var payment = this.r._payment;
    var thisTab = this.tab;
    var self = this;

    Analytics.track('back', {
      type: AnalyticsTypes.BEHAV,
    });

    var confirm = function() {
      Confirm.show({
        message: discreet.confirmCancelMsg,
        heading: 'Cancel Payment?',
        positiveBtnTxt: 'Yes, cancel',
        negativeBtnTxt: 'No',
        onPositiveClick: function() {
          self.back(true);
        },
      });
    };

    if (this.screen === 'otp' && thisTab !== 'card' && thisTab !== 'emi') {
      tab = thisTab;
    } else if (
      (thisTab === 'qr' && this.r._payment) ||
      (this.headless && payment)
    ) {
      if (confirmedCancel === true) {
        if (thisTab === 'qr') {
          tab = 'upi';
        } else {
          tab = thisTab;
        }
        this.clearRequest();
      } else {
        return confirm();
      }
    } else if (this.headless) {
      if (BackStore && BackStore.tab) {
        tab = BackStore.tab;
      } else {
        tab = 'card';
      }
    } else if (/^emandate/.test(this.screen)) {
      if (this.emandateView.back()) {
        return;
      }
    } else if (/^emiplans/.test(this.screen)) {
      if (this.emiPlansView.back()) {
        return;
      }
    } else if (/^emi$/.test(this.screen)) {
      tab = 'cardless_emi';
    } else if (
      /**
       * If back is pressed from the Card EMI screen,
       * and cardless EMI is available as a payment method,
       * take to the Cardless EMI list screen,
       * which also has the Pay using Card EMI option.
       */
      this.screen === 'card' &&
      this.tab === 'emi' &&
      MethodStore.isMethodEnabled('cardless_emi')
    ) {
      tab = 'cardless_emi';
    } else if (this.tab === 'card') {
      if (this.svelteCardTab.onBack()) {
        return;
      }
    } else if (this.tab === 'netbanking') {
      if (this.netbankingTab.onBack()) {
        return;
      }
    } else if (this.tab === 'nach') {
      if (this.nachScreen.onBack()) {
        return;
      }
    } else if (this.tab === 'bank_transfer') {
      if (this.bankTransferView.onBack()) {
        return;
      }
    } else {
      if (this.get('theme.close_method_back')) {
        return this.modal.hide();
      }
      tab = '';
    }

    var walletOtpPage =
      tab === 'wallet' && this.screen === 'otp' && this.r._payment;
    var cardlessEmiOtpPage =
      tab === 'cardless_emi' && this.screen === 'otp' && this.r._payment;
    if (walletOtpPage || cardlessEmiOtpPage) {
      if (!confirmClose()) {
        return;
      }
      this.clearRequest({
        '_[reason]': 'PAYMENT_CANCEL_BEFORE_OTP_VERIFY',
      });
    }

    if (BackStore && BackStore.screen) {
      this.setScreen(BackStore.screen);
    }

    this.switchTab(tab);

    BackStore = null;
  },

  switchTabAnalytics: function(tab) {
    if (tab === 'upi') {
      var upiData = this.upiTab;

      if (upiData && upiData.intent) {
        /**
         * If intent, track UPI apps installed and eligible
         */
        Analytics.track('upi:intent', {
          type: AnalyticsTypes.RENDER,
          data: {
            count: {
              eligible: _.lengthOf(this.upi_intents_data || []),
              all: _.lengthOf(this.all_upi_intents_data || []),
            },
            list: {
              eligible: _Arr.join(
                _Arr.map(this.upi_intents_data || [], function(app) {
                  return app.package_name;
                }),
                ','
              ),
              all: _Arr.join(
                _Arr.map(this.all_upi_intents_data || [], function(app) {
                  return app.package_name;
                }),
                ','
              ),
            },
          },
        });
      }
    }
  },

  /**
   * Checks if the fields on the homepage are valid or not.
   *
   * @returns {boolean} valid
   */
  checkCommonValid: function() {
    // Only check if we're on the homescreen
    if (!this.homeTab.onDetailsScreen()) {
      return true;
    }

    var selector = '#form-common';

    var valid = !this.checkInvalid(selector);

    return valid;
  },

  /**
   * Checks if fields are invalid.
   * And if they are invalid, tracks them.
   *
   * @returns {boolean} valid
   */
  checkCommonValidAndTrackIfInvalid: function() {
    var valid = this.checkCommonValid();

    if (!valid) {
      var fields = _Doc.querySelectorAll('#form-common .invalid [name]');

      var invalidFields = {};
      var invalidValues = {};

      _Arr.loop(fields, function(field) {
        invalidFields[field.name] = true;
        invalidValues[field.name] = field.value;
      });

      Analytics.track('homescreen:fields:invalid', {
        data: {
          fields: invalidFields,
          values: invalidValues,
        },
      });
    }

    return valid;
  },

  switchTab: function(tab) {
    /**
     * Validate fields on common screen. Do not do this for payouts as payouts
     * tab itself is the initial screen, and we want to switch to it unconditionally.
     */
    if (!this.tab && !this.isPayout) {
      if (!this.checkCommonValidAndTrackIfInvalid()) {
        return;
      }
    }

    /**
     * `tab` being empty means that we want to go to the homescreen.
     * In the case of Payouts, "payouts" is the homescreen.
     */
    if (!tab && this.isPayout) {
      tab = 'payouts';
    }

    Analytics.track('tab:switch', {
      data: {
        from: this.tab,
        to: tab,
      },
    });

    Analytics.setMeta('tab', tab);
    Analytics.setMeta('timeSince.tab', discreet.timer());

    if (tab === '') {
      this.homeTab.onShown();
    }

    if (tab) {
      this.switchTabAnalytics(tab);

      if (tab === 'credit_card' || tab === 'debit_card') {
        this.cardTab = tab;
        tab = 'card';
      } else {
        this.cardTab = null;
      }

      Razorpay.sendMessage({
        event: 'event',
        data: {
          event: 'method_selection',
          data: {
            method: tab,
          },
        },
      });

      var contact = getPhone();
      /**
       * Validate contact only if it isn't a payout.
       */
      if (
        (!contact && !Store.isContactOptional() && !this.isPayout) ||
        this.get('method.' + tab) === false
      ) {
        return;
      }
      var customer = this.getCustomer(contact);
      this.updateCustomerInStore();

      if (this.getCurrentCustomer().logged && !this.local) {
        $('#top-right').addClass('logged');
      }
      $('#user').html(contact);

      var offer = this.getAppliedOffer();
      if (
        this.offers &&
        offer &&
        discreet.Offers.getOfferMethodForTab(tab) !== offer.payment_method
      ) {
        this.offers.clearOffer();
      }
    } else {
      this.payload = null;
      this.clearRequest();
    }
    if (tab === 'netbanking') {
      this.netbankingTab.onShown();
    }

    if (tab === 'upi') {
      this.updateCustomerInStore();
      this.upiTab.onShown();
    }

    if (/^emandate/.test(tab)) {
      return this.emandateView.showTab(tab);
    }

    if (tab === '' && this.tab === 'upi') {
      if (this.upiTab.onBack()) {
        return;
      }
    }

    this.body.attr('tab', tab);
    this.tab = tab;

    if (tab === 'wallet') {
      this.setScreen('wallet');
      this.svelteWalletsTab.onShown();
    }

    if (tab === 'card' || (tab === 'emi' && this.screen !== 'emi')) {
      // If we are switching from home tab or cardless emi tab (after choosing
      // "EMI on Cards"), the customer might have changed.
      if (this.screen === '' || this.screen === 'cardless_emi') {
        this.updateCustomerInStore();
        this.svelteCardTab.showLandingView();
      }
      this.showCardTab(tab);
      setEmiPlansCta(this.screen, tab);
    } else {
      this.setScreen(tab);
      if (ua_iPhone) {
        Razorpay.sendMessage({ event: 'blur' });
      }
    }

    if (!tab) {
      var selectedInstrument = this.getSelectedPaymentInstrument();

      if (selectedInstrument) {
        $('#body').addClass('sub');
      }
    }

    if (tab === 'nach') {
      this.nachScreen.onShown();
    }

    if (tab === 'bank_transfer') {
      this.bankTransferView.onShown();
    }

    if (!tab && this.multiTpv) {
      $('#body').addClass('sub');
    }
  },

  showCardTab: function(tab) {
    this.otpView.updateScreen({
      maxlength: 6,
    });

    this.svelteCardTab.onShown();

    var self = this;
    var customer = self.getCurrentCustomer();
    var remember = Store.shouldRememberCustomer();

    if (!remember) {
      return self.setScreen('card');
    }

    tab_titles.otp = tab_titles.card;
    this.otpView.updateScreen({
      skipText: 'Skip Saved Cards',
    });

    if (!customer.logged && !this.wants_skip) {
      self.commenceOTP('saved cards', true, 'saved_cards_access');
      var smsHash = this.get('send_sms_hash') && this.sms_hash;
      var params = {};
      if (smsHash) {
        params.sms_hash = smsHash;
      }
      customer.checkStatus(function() {
        /**
         * 1. If this is a recurring payment and customer doesn't have saved cards,
         *    create and ask for OTP.
         * 2. If customer has saved cards and is not logged in, ask for OTP.
         * 3. If customer doesn't have saved cards, show cards screen.
         */
        if (Store.isRecurring() && !customer.saved && !customer.logged) {
          self.getCurrentCustomer().createOTP(function() {
            Analytics.track('saved_cards:access:otp:ask');
            askOTP(
              self.otpView,
              'Enter OTP sent on ' +
                getPhone() +
                '<br>to save your card for future payments',
              true
            );
            self.updateCustomerInStore();
          });
        } else if (customer.saved && !customer.logged) {
          askOTP(self.otpView, undefined, true);
        } else {
          self.setScreen('card');
        }
      }, params);
    } else {
      self.setScreen('card');
    }
  },

  /**
   * Returns the EMI plans for a given bank.
   * @param {String} bank
   *
   * @returns {Array}
   */
  getEmiPlans: function(bank, cardType) {
    var plans = MethodStore.getEMIBankPlans(bank, cardType);
    var appliedOffer = this.offers && this.offers.offerSelectedByDrawer;

    var emiPlans = [];
    _Obj.loop(plans, function(plan, duration) {
      if (
        !appliedOffer ||
        (appliedOffer && !appliedOffer.emi_subvention) ||
        (appliedOffer && appliedOffer.id && appliedOffer.id === plan.offer_id)
      ) {
        emiPlans.push(
          _Obj.extend(
            {
              duration: duration,
              nocost: plan.subvention === 'merchant',
            },
            plan
          )
        );
      }
    });

    return emiPlans;
  },

  /**
   * Returns a closure to handle showing of EMI plans screen.
   *
   * @param {String} type
   *
   * @return {Function}
   */
  showEmiPlans: function(type) {
    var self = this;
    var amount = this.get('amount');
    var tabTitle = 'EMI Plans';

    var trackEmi = function(name, data) {
      Analytics.track(name, {
        type: AnalyticsTypes.BEHAV,
        data: data,
      });
    };

    var viewAllPlans = function(tab) {
      return function() {
        trackEmi('emi:plans:view:all', {
          from: tab,
        });

        showOverlay($('#emi-wrap'));
      };
    };

    if (type === 'new') {
      return function(e) {
        tab_titles.emiplans = tabTitle;

        var bank = self.emiPlansForNewCard && self.emiPlansForNewCard.code;
        var plans = MethodStore.getEMIBankPlans(bank);
        var emiPlans = self.getEmiPlans(bank);
        var prevTab = self.tab;
        var prevScreen = self.screen;

        self.emiPlansView.setPlans({
          amount: amount,
          plans: emiPlans,
          bank: bank,
          on: {
            back: bind(function() {
              self.switchTab(prevTab);
              self.setScreen(prevScreen);
              self.svelteCardTab.showAddCardView();

              return true;
            }),

            payWithoutEmi: function() {
              trackEmi('emi:pay_without', {
                from: prevTab,
              });

              setEmiDurationForNewCard('');

              self.switchTab('card');
              self.setScreen('card');
              self.svelteCardTab.showAddCardView();
            },

            select: function(value) {
              var plan = _Arr.find(plans, function(p) {
                return p.duration === value;
              });

              var text = getEmiText(self, amount, plan) || '';

              trackEmi('emi:plan:select', {
                from: prevTab,
                value: value,
              });

              setEmiDurationForNewCard(value);
              EmiStore.selectedPlanTextForNewCard.set(text);

              self.switchTab('emi');
              self.svelteCardTab.showAddCardView();

              self.preSubmit();
            },

            viewAll: viewAllPlans(prevTab),
          },

          actions: {
            viewAll: true,
            payWithoutEmi: MethodStore.isMethodEnabled('card'),
          },
        });

        self.switchTab('emiplans');
        $('#body').removeClass('sub');
      };
    } else if (type === 'saved') {
      return function(e) {
        tab_titles.emiplans = tabTitle;

        var trigger = e.currentTarget;
        var $trigger = $(trigger);
        var bank = $trigger.attr('data-bank');
        var cardType = $trigger.attr('data-card-type');
        var plans = MethodStore.getEMIBankPlans(bank, cardType);
        var emiPlans = self.getEmiPlans(bank, cardType);
        var $savedCard = $('.saved-card.checked');
        var savedCvv = $savedCard.$('.saved-cvv input').val();
        var prevTab = self.tab;
        var prevScreen = self.screen;

        self.emiPlansView.setPlans({
          amount: amount,
          plans: emiPlans,
          bank: bank,
          on: {
            back: function() {
              self.switchTab(prevTab);
              self.setScreen(prevScreen);

              return true;
            },

            payWithoutEmi: function() {
              trackEmi('emi:pay_without', {
                from: prevTab,
              });

              setEmiDurationForSavedCard('');
              EmiStore.selectedPlanTextForSavedCard.set('');

              self.switchTab('card');
              self.setScreen('card');
              self.svelteCardTab.showSavedCardsView();

              self.processOffersOnEmiPlanSelection();
            },

            select: function(value) {
              var plan = _Arr.find(plans, function(p) {
                return p.duration === value;
              });
              var text = getEmiText(self, amount, plan) || '';

              trackEmi('emi:plan:select', {
                from: prevTab,
                value: value,
              });

              setEmiDurationForSavedCard(value);
              EmiStore.selectedPlanTextForSavedCard.set(text);

              self.switchTab('emi');
              self.setScreen('card');
              self.svelteCardTab.showSavedCardsView();

              self.processOffersOnEmiPlanSelection(plan);

              if (savedCvv) {
                self.preSubmit();
              } else {
                self.switchTab('emi');
                self.setScreen('card');
                self.svelteCardTab.showSavedCardsView();
              }
            },

            viewAll: viewAllPlans(prevTab),
          },

          actions: {
            viewAll: true,
            payWithoutEmi: MethodStore.isMethodEnabled('card'),
          },
        });

        self.switchTab('emiplans');
        $('#body').removeClass('sub');
      };
    } else if (type === 'bajaj') {
      return function() {
        tab_titles.emiplans = tabTitle;

        var bank = 'BAJAJ';
        var plans = MethodStore.getEMIBankPlans(bank);
        var emiPlans = self.getEmiPlans(bank);
        var prevTab = self.tab;
        var prevScreen = self.screen;

        self.emiPlansView.setPlans({
          amount: amount,
          plans: emiPlans,
          bank: bank,
          on: {
            back: function() {
              self.switchTab(prevTab);
              self.setScreen(prevScreen);
              return true;
            },

            select: function(value) {
              var plan = _Arr.find(plans, function(plan) {
                return plan.duration === value;
              });

              var text = getEmiText(self, amount, plan) || '';

              self.emiScreenView.setPlan({
                duration: plan.duration,
                text: text,
              });

              self.setScreen('emi');
              self.switchTab('emi');
            },

            actions: {
              viewAll: false,
              payWithoutEmi: false,
            },
          },
        });

        self.switchTab('emiplans');
        $('#body').removeClass('sub');
        setEmiPlansCta('emi', 'emiplans');
      };
    }
  },

  /**
   * Validates that the issuer of the offer is same as the selected value
   * @param {string} selectedVal
   *
   * @returns {boolean}
   */
  validateOffers: function(selectedIssuer, callback) {
    var offer = this.getAppliedOffer();
    if (offer && offer.issuer && selectedIssuer !== offer.issuer) {
      return this.showOffersError(callback);
    }
    return true;
  },

  /**
   * Once the bank is selected in the banks list,
   * proceed automatically if some conditions are met.
   */
  proceedAutomaticallyAfterSelectingBank: function(event) {
    var bank = event.detail.bank;

    if (this.checkInvalid()) {
      return;
    }

    return this.emandateView.showBankDetailsForm(bank.code);
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
      Analytics.track('shake:invalid', {
        data: {
          class: $(invalids[0]).attr('class'),
          id: $(invalids[0]).attr('id'),
        },
      });
      this.shake();
      var invalidInput = $(invalids[0]).find('.input')[0];
      if (invalidInput) {
        invalidInput.focus();
      } else if ($(invalids[0]).hasClass('selector')) {
        $(invalids[0]).focus();
      }

      each(invalids, function(i, field) {
        $(field).addClass('mature');
      });
      return true;
    }
  },

  getActiveForm: function() {
    var form = this.tab || 'common';
    // TODO: get rid of this
    if (form === 'emi') {
      if (form === 'emi' && this.screen === 'emi') {
        return '#add-emi-container';
      } else {
        form = 'card';
      }
    }
    if (form === 'emandate') {
      form = 'netbanking';
    }

    if (form === 'gpay') {
      form = 'upi';
    }
    return '#form-' + form;
  },

  getFormData: function() {
    var tab = this.tab;
    var data = {};
    if (!preferences) {
      return data;
    }

    data.contact = getPhone();
    data.email = getEmail();

    // If it's the default contact details, do not send them
    if (data.contact === Constants.INDIA_COUNTRY_CODE || data.contact === '+') {
      delete data.contact;
    }

    var prefillEmail = this.get('prefill.email');
    var prefillContact = this.get('prefill.contact');

    if (
      Store.isContactOptional() &&
      !(prefillContact && contactPattern.test(prefillContact))
    ) {
      delete data.contact;
    } else if (data.contact) {
      data.contact = data.contact.replace(/\ /g, '');
    }

    if (
      Store.isEmailOptional() &&
      !(prefillEmail && emailPattern.test(data.email))
    ) {
      delete data.email;
    }

    if (tab) {
      data.method = tab;
      var activeForm = this.getActiveForm();

      if (
        !_Arr.contains(['#form-upi', '#form-card', '#form-wallet'], activeForm)
      ) {
        fillData(activeForm, data);
      }

      // Delete all the auth_type-* keys
      each(data, function(key, val) {
        if (key.indexOf('auth_type-') === 0) {
          delete data[key];
        }
      });

      if (this.screen === 'card') {
        _Obj.extend(data, this.svelteCardTab.getPayload());
        if (tab === 'emi') {
          var emiDuration = getEmiDurationForNewCard();
          if (emiDuration) {
            data.emi_duration = emiDuration;
          }
        }
        if (!data.emi_duration) {
          data.method = 'card';
          delete data.emi_duration;
        }
      }

      if (this.screen === 'upi' && this.tab !== 'qr') {
        /* All tabs should be responsible for their subdata */
        var upiData = this.upiTab.getPayload();

        each(upiData, function(key, value) {
          data[key] = value;
        });
      }

      if (this.screen === 'wallet') {
        /* Wallet tab being responsible for its subdata */
        if (this.svelteWalletsTab.isAnyWalletSelected()) {
          _Obj.extend(data, this.svelteWalletsTab.getPayload());
        }
      }
    }

    return data;
  },

  hide: function(confirmedCancel) {
    var self = this;
    if (this.isOpen) {
      if (confirmedCancel !== true && this.r._payment) {
        return Confirm.show({
          message: discreet.confirmCancelMsg,
          heading: 'Cancel Payment?',
          positiveBtnTxt: 'Yes, cancel',
          negativeBtnTxt: 'No',
          onPositiveClick: function() {
            self.hide(true);
          },
        });
      }

      $('#modal-inner').removeClass('shake');
      hideOverlayMessage();
      this.modal.hide();
      discreet.Bridge.stopListeningForBackPresses();
    }
  },

  showLoadError: function(text, error) {
    if (this.headless && this.screen === 'card') {
      return;
    }
    var actionState;
    var loadingState = true;
    if (error) {
      if (this.screen === 'upi' && text === discreet.cancelMsg) {
        if (this.payload && this.payload['_[flow]'] === 'intent') {
          return;
        }
        return this.hideErrorMessage();
      }
      actionState = loadingState;
      loadingState = false;
    } else {
      actionState = false;
    }

    if (!text) {
      text = strings.process;
    }

    if (this.screen === 'otp') {
      this.body.removeClass('sub');
      setOtpText(this.otpView, text);

      this.otpView.updateScreen({
        action: actionState,
        loading: loadingState,
      });
    } else {
      $('#fd-t').html(text);
      showOverlay(
        $('#error-message')[loadingState ? 'addClass' : 'removeClass'](
          'loading'
        )
      );
    }
  },

  commenceOTP: function(text, partial, reason) {
    var params = {
      extraProps: {},
    };

    if (reason) {
      params.extraProps.reason = reason;
    }

    this.setScreen('otp', params);

    this.otpView.updateScreen({
      addFunds: false,
    });

    invoke(
      function() {
        if (this.screen === 'otp' && (this.tab !== 'card' || !this.payload)) {
          Cta.updateCta('Verify');
        }
      },
      this,
      null,
      200
    );

    if (text) {
      if (partial) {
        text = 'Looking for ' + text + ' associated with ' + getPhone();
      }
      this.showLoadError(text);
    }
  },

  /**
   * Show fees UI if `fee` is missing in payload and return whether the UI was
   * shown or not.
   *
   * It will internally create an instance of `FeeBearerView` if not created
   * and use the existing instance if already created.
   *
   * @return {Boolean} Whether or not the UI was shown
   */
  showFeesUi: function() {
    var session = this;
    var data = session.payload;
    var isFeeMissing = !('fee' in data);

    /**
     * Check here if 'fee' is set in payload,
     * If it is present then we have shown the fee breakup to the user,
     * and we have accounted for additional fees,
     * so no changes in payload are required.
     * Otherwise, show the fee breakup.
     */
    if (isFeeMissing) {
      var paymentData = clone(this.payload);

      // Create fees route in API doesn't like this.
      delete paymentData.upi_app;

      if (this.feeBearerView) {
        this.feeBearerView.fetchFees(paymentData);
      } else {
        this.feeBearerView = new discreet.FeeBearerView({
          target: gel('fee-wrap'),
          props: {
            paymentData: paymentData,
          },
        });

        // When user clicks "Continue" in Fee Breakup View
        this.feeBearerView.$on('continue', function(event) {
          var bearer = event.detail;

          hideOverlaySafely($('#fee-wrap'));

          // Set the updated amount & fee
          session.payload.amount = bearer.amount;
          session.payload.fee = bearer.fee;

          // Don't redirect to fees route now
          session.feesRedirect = false;

          session.submit();
        });

        this.feeBearerView.$on('error', function() {
          makeHidden('#fee-wrap');
        });
      }

      showOverlay($('#fee-wrap'));

      return true;
    }

    return false;
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
    var otp = storeGetter(discreet.OTPScreenStore.otp);

    if (this.tab === 'wallet' || this.headless) {
      return this.r.submitOTP(otp);
    }

    var queryParams;
    var callback;

    var isCardlessEmi = this.payload && this.payload.method === 'cardless_emi';

    if (!isCardlessEmi) {
      // card tab only past this
      // card filled by logged out user + remember me
      if (this.payload) {
        var isRedirect = this.get('redirect');
        if (!isRedirect) {
          this.submit();
        }
        callback = function(msg) {
          if (this.getCurrentCustomer().logged) {
            // OTP verification successful
            OtpService.resetCount('razorpay');

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
            askOTP(this.otpView, msg, true);
            this.updateCustomerInStore();
          }
        };
      } else {
        var self = this;

        if (this.payload) {
          // OTP verification for saving card
          Analytics.track('saved_cards:save:otp:submit');
        } else {
          // OTP verification for accessing saved cards
          Analytics.track('saved_cards:access:otp:submit');
        }

        callback = function(msg) {
          if (self.getCurrentCustomer().logged) {
            // OTP verification successful
            OtpService.resetCount('razorpay');

            self.updateCustomerInStore();
            self.svelteCardTab.showLandingView().then(function() {
              self.showCardTab();
            });
          } else {
            Analytics.track('behav:otp:incorrect', {
              wallet: self.tab === 'wallet',
            });
            askOTP(this.otpView, msg, true);
            self.updateCustomerInStore();
          }
        };
      }
    }

    var submitPayload = {
      otp: otp,
      email: getEmail(),
    };

    if (this.tab === 'cardless_emi') {
      var providerCode = CardlessEmiStore.providerCode;

      submitPayload = _Obj.extend(submitPayload, {
        provider: providerCode,
        method: 'cardless_emi',
        payment_id: this.r._payment.payment_id,
      });

      callback = function(msg, data) {
        if (msg) {
          this.fetchCardlessEmiPlans({
            incorrect: true,
          });
        } else {
          // OTP verification successful
          OtpService.resetCount('razorpay');

          CardlessEmiStore.plans[providerCode] = data.emi_plans;
          CardlessEmiStore.loanUrls[providerCode] = data.loan_url;
          CardlessEmiStore.ott[providerCode] = data.ott;
          CardlessEmiStore.lenderBranding[providerCode] =
            data.lender_branding_url;

          this.showCardlessEmiPlans();
        }
      };
    }

    if (this.tab === 'paylater') {
      var providerCode = PayLaterStore.providerCode;

      queryParams = {
        provider: providerCode,
        method: 'paylater',
      };

      callback = function(msg, data) {
        this.otpView.updateScreen({ loading: false });
        $('#body').addClass('sub');
        if (msg) {
          this.askPayLaterOtp('incorrect');
        } else {
          if (data.ott) {
            // OTP verification successful
            OtpService.resetCount('razorpay');

            PayLaterStore.otpVerified = true;
            PayLaterStore.ott[providerCode] = data.ott;
            PayLaterStore.contact = data.contact;
            this.switchTab('paylater');
            this.submitPayLater();
          }
        }
      };
      this.commenceOTP('Verifying OTP...');
    }
    this.getCurrentCustomer().submitOTP(
      submitPayload,
      bind(callback, this),
      queryParams
    );
  },

  getCurrentCustomer: function(phone) {
    return this.getCustomer(phone || getPhone());
  },

  clearRequest: function(extra) {
    if (!this.get('timeout') && this.closeAt) {
      this.hideTimer();
      this.closeAt = null;
    }
    var powerotp = gel('powerotp');
    if (powerotp) {
      powerotp.value = '';
    }

    if (this.r._payment) {
      hideOverlayMessage();
      this.r.emit('payment.cancel', extra);
    }

    if (this.payload && this.payload.method === 'cardless_emi') {
      this.resetCardlessEmiStoreForProvider(this.payload.provider);
    }

    this.isResumedPayment = false;
    this.payload = null;

    Analytics.removeMeta('doneByInstrument');
    Analytics.removeMeta('doneByP13n');

    var params = {};
    params[Constants.UPI_POLL_URL] = '';
    params[Constants.PENDING_PAYMENT_TS] = '0';
    this.setParamsInStorage(params);

    abortAjax(this.ajax);

    clearTimeout(this.requestTimeout);
    this.requestTimeout = null;
  },

  /**
   * Removes items from the CardlessEmiStore
   * corresponding to the given provider.
   * @param {string} provider
   */
  resetCardlessEmiStoreForProvider: function(provider) {
    if (!provider) {
      return;
    }

    _Obj.loop(CardlessEmiStore, function(value, key) {
      delete value[provider];
    });
  },

  /**
   * Attempts a payment
   * @param {Event} e
   * @param {Object} payload Overridden payload
   */
  preSubmit: function(e, payload) {
    preventDefault(e);
    var screen = this.screen;
    var tab = this.tab;

    var isOffersVisible = this.offers && this.offers.isListShown();
    if (isOffersVisible) {
      this.offers.onSubmit();
      if (screen) {
        return;
      }
    }

    /**
     * The CTA for home screen is visible only on the new design. If it was
     * clicked, switch to the new payment methods screen.
     */
    if (!screen) {
      if (this.checkCommonValidAndTrackIfInvalid()) {
        // switch to methods tab
        if (this.homeTab.onDetailsScreen()) {
          if (this.homeTab.shouldGoNext()) {
            return this.homeTab.next();
          }
        }
      } else {
        this.offers && this.offers.clearOffer();
        return;
      }
      if (isOffersVisible) {
        return;
      }
    }

    if (screen === 'otp') {
      return this.onOtpSubmit();
    }

    this.refresh();
    var data = payload;

    if (!data) {
      data = this.getPayload();
    }

    this.payload = data;

    if (data.auth_type && data.auth_type === 'c3ds') {
      /**
       * Deleting this from data manually because c3ds is just for Checkout,
       * API takes 3DS, which is the default anyway.
       */
      delete data.auth_type;
    }

    /**
     * For Paper Nach, we need to send auth_type=physical
     * for now.
     */
    if (data.method === 'nach' && !data.auth_type) {
      data.auth_type = 'physical';
    }

    if (data.partial_payment) {
      delete data.partial_payment;
    }

    var merchantOrder = Store.getMerchantOrder();
    var selectedInstrument = this.getSelectedPaymentInstrument();

    if (merchantOrder && merchantOrder.bank && !Store.isRecurring()) {
      if (!this.checkCommonValidAndTrackIfInvalid()) {
        return;
      }
      data.method = merchantOrder.method || data.method || 'netbanking';
      data.bank = merchantOrder.bank;

      if (data.method === 'upi' && this.multiTpv) {
        if (tab !== 'upi') {
          return this.switchTab('upi');
        }
        if (this.checkInvalid('#form-upi input:checked + label')) {
          return;
        }
      }
    } else if (screen) {
      if (screen === 'card') {
        // TODO: simplify conditions
        // Do not proceed with amex cards if amex is disabled for merchant
        // also without this, cardsaving is triggered before API returning unsupported card error
        if (!this.svelteCardTab.isOnSavedCardsScreen()) {
          var cardType = discreet.storeGetter(CardScreenStore.cardType);
          if (!MethodStore.isAMEXEnabled() && cardType === 'amex') {
            return this.showLoadError('AMEX cards are not supported', true);
          }
        } else if (!data['card[cvv]']) {
          var checkedCard = $('.saved-card.checked');

          /**
           * When CVV is missing, allow to go ahead only if:
           * 1. Card is a not Maestro card
           * OR
           * 2. tab=emi and saved card supports emi and emi duration is not selected
           */
          if (
            !(
              checkedCard.$('.cardtype').attr('cardtype') === 'maestro' ||
              (checkedCard.attr('emi') &&
                this.tab === 'emi' &&
                !data.emi_duration)
            )
          ) {
            // no saved card was selected
            Analytics.track('shake:saved-cvv');
            this.shake();
            return $('.checked .saved-cvv input').focus();
          }
        }

        if (screen === 'card') {
          if (tab === 'emi') {
            /**
             * For when EMI duration is missing.
             */

            /**
             * If this is a new card and no EMI plans are available,
             * this is a validation error.
             */
            if (!data.token && !this.emiPlansForNewCard) {
              Analytics.track('shake:no-emi-plans');
              this.shake();
              return $('#card_number').focus();
            }

            if (!data.emi_duration) {
              /**
               * If this is a saved ard and no EMI duration is selected,
               * show the EMI plans.
               */
              if (data.token) {
                this.showEmiPlans('saved')({
                  currentTarget: $(
                    '.saved-card[token="' + data.token + '"] .emi-plans-trigger'
                  )[0],
                });
              } else {
                /**
                 * If this is a new card and no EMI duration is selected,
                 * show the EMI plans.
                 */
                this.showEmiPlans('new')({
                  delegateTarget: $(
                    '#add-card-container .emi-plans-trigger'
                  )[0],
                });
              }

              return;
            }

            // Set method explicitly.
            data.method = 'emi';
          } else {
            // This is not the EMI tab, delete duration if it exists.
            delete data.emi_duration;
          }
        }
      } else if (/^emandate/.test(screen)) {
        if (this.screen === 'emandate') {
          // TODO: looks like dead code, see if this can be removed
          screen = 'netbanking';
          data.bank = this.netbankingTab.getSelectedBank();
          data.method = 'emandate';
        }
        return this.emandateView.submit(data);
      } else if (/^emiplans/.test(screen)) {
        if (!(data.method === 'cardless_emi' && data.emi_duration)) {
          return this.emiPlansView.submit();
        }
      }

      // perform the actual validation
      if (screen === 'upi') {
        var formSelector = '#vpa';

        if (data['_[flow]'] === 'directpay') {
          if (data.upi_provider === 'google_pay') {
            formSelector = '#gpay-phone';
          }
        }

        if (this.checkInvalid(formSelector)) {
          return;
        }
      } else if (this.checkInvalid()) {
        return;
      }
    } else if (this.oneMethod === 'netbanking') {
      data.bank = this.get('prefill.bank');
    } else if (selectedInstrument) {
      if (!this.checkCommonValidAndTrackIfInvalid()) {
        return;
      }

      if (selectedInstrument.method === 'card') {
        /*
         * Add cvv to data from the currently selected instrument
         */
        var instrumentInDom = _El.closest(
          _Doc.querySelector(
            '.home-methods input[value="' + selectedInstrument.id + '"]'
          ),
          '.instrument'
        );
        var cvvInput = instrumentInDom.querySelector('.cvv-input');

        if (cvvInput) {
          if (cvvInput.value.length === cvvInput.maxLength) {
            data['card[cvv]'] = cvvInput.value;
          } else {
            cvvInput.focus();
            return this.shake();
          }
        }
      }
    } else if (data.method === 'paypal') {
      // Let method=paypal payments go through directly
    } else {
      return;
    }

    this.submit();
  },

  getSelectedPaymentInstrument: function() {
    return storeGetter(HomeScreenStore.selectedInstrument);
  },

  verifyVpaAndContinue: function(data, params) {
    var self = this;
    self.showLoadError('Verifying your VPA');
    $('#overlay-close').hide();

    var vpa = data.vpa;

    /**
     * Payouts has a different payload format. Extract vpa from payload if it
     * a payout.
     */
    if (this.isPayout) {
      vpa = data.vpa.address;
    }

    self.r
      /**
       * set a timeout of 10s, if the API is taking > 10s to resolove;
       * attempt payment regardless of verification
       */
      .verifyVpa(vpa, 10000)
      .then(function() {
        $('#overlay-close').show();
        hideOverlaySafely($('#error-message'));
        setTimeout(function() {
          self.submit({
            vpaVerified: true,
          });
        }, 200);
      })
      .catch(function(vpaValidationError) {
        var vpaValidationDescription = _Obj.getSafely(
          vpaValidationError,
          'error.description',
          'Invalid VPA, please try again with correct VPA'
        );

        self.showLoadError(vpaValidationDescription, true);
      });
  },

  submit: function(props) {
    if (!props) {
      props = {};
    }
    var vpaVerified = props.vpaVerified;
    var data = this.payload;

    if (this.r._payment) {
      /**
       * For Cardless EMI, payments are created at the first step,
       * before the user gets to select a plan.
       * Thus, we would need to submit again after the
       * user has created a plan, even though the payment
       * is already created.
       *
       * This does not happen for any other method.
       */
      if (data.method === 'cardless_emi') {
        data.payment_id = this.r._payment.payment_id;

        /**
         * If emi_duration is present, this is the final
         * payment submit request.
         * Clear existing payments.
         */
        if (data.emi_duration) {
          this.r._payment.clear();
        }
      } else {
        return;
      }
    }

    var that = this;

    var shouldContinue = true;

    if (this.tab === 'nach') {
      shouldContinue = this.nachScreen.shouldSubmit();
    }

    if (this.tab === 'bank_transfer') {
      shouldContinue = this.bankTransferView.shouldSubmit();
    }

    if (this.tab === 'card') {
      // shouldContinue = this.svelteCardTab.shouldSubmit();
    }

    if (!shouldContinue) {
      return;
    }

    var session = this;
    var request = {
      feesRedirect: preferences.fee_bearer && !('fee' in data),
      optional: Store.getOptionalObject(),
      external: {},
      paused: this.get().paused,
    };

    if (!this.screen) {
      var selectedInstrument = this.getSelectedPaymentInstrument();

      if (selectedInstrument) {
        data = Instruments.addInstrumentToPaymentData(
          selectedInstrument,
          data,
          this.getCustomer(getPhone())
        );
        this.payload = data;

        Analytics.setMeta('doneByInstrument', true);

        if (_Obj.getSafely(selectedInstrument, 'meta.preferred')) {
          Analytics.setMeta('doneByP13n', true);
        }

        switch (selectedInstrument.method) {
          case 'card':
          case 'emi': {
            this.switchTab(selectedInstrument.method);
            break;
          }

          case 'upi': {
            /**
             * UPI QR is a built on Checkout like a method in itself with method=upi and flow=qr.
             * And the payment happens from within the tab.
             * So, let's switch to it instead of continuing from here.
             */
            if (selectedInstrument._ungrouped[0].flow === 'qr') {
              this.switchTab('qr');
              return;
            }
            break;
          }

          case 'cardless_emi': {
            session.selectCardlessEmiProvider(
              selectedInstrument._ungrouped[0].provider
            );

            break;
          }

          case 'paylater': {
            session.selectPayLaterProvider(
              selectedInstrument._ungrouped[0].provider
            );

            break;
          }
        }
      }
    }

    if (data.method === 'paypal') {
      data.method = 'wallet';
      data.wallet = 'paypal';
    }

    if (this.get('address') && !Store.isPartialPayment()) {
      var notes = (data.notes = clone(this.get('notes')) || {});

      // Add address
      notes.address = storeGetter(HomeScreenStore.address);
      notes.pincode = storeGetter(HomeScreenStore.pincode);
      notes.state = storeGetter(HomeScreenStore.state);

      if (Object.keys(notes).length > 15) {
        delete notes.pincode;
        delete notes.state;
        notes.address +=
          ', ' + Constants.STATES[notes.state] + ' - ' + notes.pincode;
      }
    }

    // If there's a package name, the flow is intent.
    if (data.upi_app) {
      data['_[flow]'] = 'intent';
      data['_[app]'] = data.upi_app;
    }

    if (data['_[flow]'] === 'gpay') {
      request.gpay = true;
      data['_[flow]'] = 'intent';
    }

    var appliedOffer = this.getAppliedOffer();

    if (appliedOffer && (!this.offers || this.offers.shouldSendOfferToApi())) {
      data.offer_id = appliedOffer.id;
      this.r.display_amount = appliedOffer.amount;
      Analytics.track('offers:applied_with_payment', {
        data: appliedOffer,
      });
    } else {
      delete this.r.display_amount;
      var selectedPlan = this.emiPlansView.selectedPlan;
      if (data.emi_duration && selectedPlan && selectedPlan.offer_id) {
        data.offer_id = selectedPlan.offer_id;
      }
    }

    if (data.method === 'cardless_emi') {
      if (data.provider === 'flexmoney') {
        delete data.ott;
      }

      if (data.payment_id) {
        if (data.contact && !data.emi_duration) {
          this.showCardlessEmiPlans();
          return;
        }

        /**
         * If contact is optional, we want to open a popup and take ott and emi_duration there.
         */
        if (!data.contact) {
          delete data.ott;
          delete data.emi_duration;
        }
      } else {
        delete data.ott;
        delete data.emi_duration;
      }

      this.r.on('payment.process', function(paymentData) {
        var request = paymentData.request;
        var response = paymentData.response;

        var content = request.content;
        var method = content && content.method;
        var provider = content && content.provider;
        var emi_duration = content && content.emi_duration;

        // Abort if not Cardless EMI
        if (method !== 'cardless_emi') {
          return;
        }

        // Handle receiving emi_plans in the pilot payment create request
        if (response.emi_plans && response.emi_plans[provider]) {
          CardlessEmiStore.plans[provider] = response.emi_plans[provider];

          CardlessEmiStore.lenderBranding[provider] =
            response.lender_branding_url;
        }

        // Store the Resend URL
        if (response.resend_url) {
          // Init empty store if one doesn't exist
          if (!CardlessEmiStore.urls[provider]) {
            CardlessEmiStore.urls[provider] = {};
          }

          CardlessEmiStore.urls[provider].resend_otp = response.resend_url;
        }

        // Increase OTP sent count
        OtpService.markOtpSent('razorpay');

        if (!emi_duration) {
          hideOverlayMessage();
          return session.showCardlessEmiPlans();
        }
      });
    }

    if (!data.contact) {
      delete data.contact;
    }

    if (data.provider === 'epaylater') {
      if (data.contact) {
        if (!data.ott) {
          this.submitPayLater();
          return;
        }
        // If contact & ott are available, then this is the final submit() call,
        // If the contact doesn't start with +91, then make it.
        if (!data.contact.match(/^\+91/)) {
          data.contact = '+91' + data.contact;
        }
      } else {
        delete data.contact;
        delete data.ott;
      }
    }

    /* VPA verification */
    if (data.vpa && !vpaVerified) {
      return this.verifyVpaAndContinue(data, request);
    }

    if (preferences.fee_bearer && this.showFeesUi()) {
      return;
    }

    /**
     * - Ask user to verify phone number if not logged in and wants to save card
     * - Show OTP screen after user agrees to fees
     */
    if (data.save && !this.getCurrentCustomer().logged) {
      if (this.screen === 'card') {
        this.otpView.updateScreen({
          skipText: 'Skip saving card',
        });
        Analytics.track('saved_cards:save:otp:ask');
        this.commenceOTP(strings.otpsend, false, 'saved_cards_save');
        debounceAskOTP(this.otpView, undefined, true);
        this.getCurrentCustomer().createOTP(function() {
          session.updateCustomerInStore();
        });
        return;
      } else if (!this.headless) {
        request.message = 'Verifying OTP...';
        request.paused = true;
      }
    }
    delete data.app_token;

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
        request.external.amazonpay = true;
      }
    }

    if (data.method === 'upi') {
      if (
        this.hasGooglePaySdk &&
        data.upi_app === UPIUtils.GOOGLE_PAY_PACKAGE_NAME
      ) {
        request.external.gpay = true;
        request['_[flow]'] = 'intent';
      }
    }

    if (this.modal) {
      this.modal.options.backdropclose = false;
    }

    if (data.method === 'card' && Store.isDCCEnabled()) {
      data.currency_request_id = discreet.storeGetter(
        CardScreenStore.currencyRequestId
      );
      data.dcc_currency = discreet.storeGetter(CardScreenStore.dccCurrency);
    }

    if (data.method === 'card' || data.method === 'emi') {
      this.nativeotp = !!this.shouldUseNativeOTP();

      var cardType = getCardTypeFromPayload(
        data,
        this.svelteCardTab.getTransformedTokens()
      );
      var shouldUseNativeOTP = false;
      if (data.method === 'card') {
        if (
          this.nativeotp &&
          discreet.Flows.shouldUseNativeOtpForCardPayment(
            data,
            this.svelteCardTab.getTransformedTokens()
          )
        ) {
          shouldUseNativeOTP = true;
        }
      } else if (data.method === 'emi') {
        if (cardType === 'bajaj' && this.r.isLiveMode()) {
          shouldUseNativeOTP = true;

          BackStore = {
            tab: 'emi',
            screen: 'emi',
          };
        } else if (
          getIssuerForEmiFromPayload(
            data,
            this.svelteCardTab.getTransformedTokens()
          ) === 'HDFC_DC'
        ) {
          // Skip Native OTP for EMI with HDFC Debit Cards
          shouldUseNativeOTP = false;
        }
      }

      if (shouldUseNativeOTP) {
        var params = {
          extraProps: {
            reason: 'native_otp_enter',
          },
        };

        this.headless = true;
        Analytics.track('native_otp:attempt');
        this.setScreen('otp', params);
        this.r.on('payment.otp.required', function(data) {
          askOTP(that.otpView, data);
        });

        request.nativeotp = true;

        // Only demo merchant supports iframe for now.
        if (this.get('key') === DEMO_MERCHANT_KEY) {
          request.iframe = true;
          Analytics.track('iframe:attempt');
        }
      }
    }

    if (
      discreet.Wallet.isPowerWallet(wallet) &&
      !request.feesRedirect &&
      data.contact &&
      data.email
    ) {
      this.powerwallet = true;
      this.otpView.updateScreen({
        skipText: 'Resend OTP', // TODO
        allowSkip: false,
      });
      tab_titles.otp =
        '<img src="' + walletObj.logo + '" height="' + walletObj.h + '">';
      this.commenceOTP(wallet + ' account', true, 'wallet_enter');
    } else if (!this.isPayout) {
      this.showLoadError();
    } else {
      this.showLoadError('Processing...');
    }

    if (wallet === 'freecharge') {
      this.otpView.updateScreen({
        maxlength: 4,
      });
    } else if (this.headless) {
      // OTP of length 8 is only required for Headless OTP.
      this.otpView.updateScreen({
        maxlength: 8,
      });
    } else {
      this.otpView.updateScreen({
        maxlength: 6,
      });
    }

    this.preferredInstrument = P13n.processInstrument(data, this);

    if (this.isPayout) {
      Analytics.track('payout:create:start');

      if (this.screen === 'payouts') {
        /**
         * If we are on the payouts screen when the submission happened, it
         * means that the user selected an existing fund account.
         */
        var selectedAccount = this.payoutsView.getSelectedInstrument();

        Analytics.track('submit', {
          data: {
            account: Payouts.makeTrackingDataFromAccount(selectedAccount),
            existing: true,
          },
          immediately: true,
        });

        Analytics.track('payout:create:success', {
          data: Payouts.makeTrackingDataFromAccount(selectedAccount),
          immediately: true,
        });

        successHandler.call(session, {
          razorpay_fund_account_id: selectedAccount.id,
        });
      } else {
        /**
         * If we are not on the payouts screen, create the fund account using
         * the payload.
         */

        Analytics.track('submit', {
          data: {
            account: Payouts.makeTrackingDataFromAccount(data),
            existing: false,
          },
          immediately: true,
        });

        Payouts.createFundAccount(data)
          .then(function(account) {
            Analytics.track('payout:create:success', {
              data: {
                account: Payouts.makeTrackingDataFromAccount(account),
                existing: false,
              },
              immediately: true,
            });

            successHandler.call(session, {
              razorpay_fund_account_id: account.id,
            });
          })
          .catch(bind(errorHandler, this));
      }
      return;
    }

    var payment = this.r.createPayment(data, request);
    payment
      .on('payment.success', bind(successHandler, this))
      .on('payment.error', bind(errorHandler, this))
      .on('payment.cancel', bind(cancelHandler, this));

    this.attemptCount++;

    var sub_link = $('#error-message .link');

    var iosCheckoutBridgeNew = Bridge.getNewIosBridge();

    if (request.external.amazonpay || request.external.gpay) {
      payment.on('payment.externalsdk.process', function(data) {
        /* invoke external sdk via our SDK */
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

    /**
     * For Cardless EMI payments,
     * if this is the final payment request,
     * take the user back to the cardless EMI screen
     * from the plans screen
     */
    if (data.method === 'cardless_emi' && data.emi_duration) {
      this.switchTab('cardless_emi');
    }

    if (this.powerwallet) {
      this.showLoadError(strings.otpsend + getPhone());
      this.r.on('payment.otp.required', function(message) {
        debounceAskOTP(that.otpView, message, false, {
          allowSkip: false,
        });
      });
      this.r.on(
        'payment.wallet.topup',
        bind(function() {
          Analytics.track('wallet:balance:insufficient', {
            data: {
              wallet: this.payload && this.payload.wallet,
            },
          });

          var insufficient_text = 'Insufficient balance in your wallet';
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

          this.otpView.updateScreen({
            loading: false,
            addFunds: true,
          });
          setOtpText(this.otpView, insufficient_text);
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

      this.r.on('payment.upi.coproto_response', function(response) {
        var params = {};
        params[Constants.UPI_POLL_URL] = response.request.url;
        params[Constants.PENDING_PAYMENT_TS] = now() + '';
        that.setParamsInStorage(params);
      });

      this.r.on('payment.upi.pending', function(data) {
        if (data && data.flow === 'upi-intent') {
          return that.showLoadError('Waiting for payment confirmation.');
        }

        that.showLoadError(
          "Please accept the request from Razorpay's VPA on your UPI app"
        );
      });
    } else {
      if (!this.headless) {
        sub_link.html('Go to payment');
        this.r.on(
          'payment.cancel',
          bind('showLoadError', this, discreet.cancelMsg, true)
        );
      }
    }
  },

  getPayload: function() {
    var data = this.getFormData();

    if (this.isPayout && this.screen === 'upi') {
      return {
        contact_id: this.get('contact_id'),
        account_type: 'vpa',
        vpa: {
          address: data.vpa,
        },
      };
    }

    if (this.isPayout && this.screen === 'payout_account') {
      return {
        contact_id: this.get('contact_id'),
        account_type: 'bank_account',
        bank_account: {
          name: data.name,
          ifsc: data.ifsc,
          account_number: data.account_number,
        },
      };
    }

    if (this.screen === 'card' && this.tab === 'emi') {
      if (!this.svelteCardTab.isOnSavedCardsScreen()) {
        setEmiBank(data);
      }
      if (Store.isRecurring()) {
        var recurringValue = this.get('recurring');
        data.recurring = isString(recurringValue) ? recurringValue : 1;
      }
    }

    // data.amount needed by external libraries relying on `onsubmit` postMessage
    data.amount = this.get('amount');

    if (this.oneMethod && this.oneMethod === 'paypal') {
      data.method = 'paypal';
    }

    return data;
  },

  /**
   * Returns the object to be passed while
   * cancelling a payment
   *
   * @returns {Object}
   */
  getCancelReason: function() {
    var reason;

    if (this.payload && this.payload.method === 'cardless_emi') {
      reason = {
        '_[reason]': 'PAYMENT_CANCEL_BEFORE_OTP_VERIFY',
      };

      if (!this.payload.emi_duration) {
        reason = {
          '_[reason]': 'PAYMENT_CANCEL_BEFORE_PLAN_SELECT',
        };
      }
    }

    return reason;
  },

  /**
   * Cleans up all the Svelte components that were added.
   */
  cleanUpSvelteComponents: function() {
    var views = [
      'bankTransferView',
      'cardlessEmiView',
      'currentScreen',
      'emandateView',
      'emi',
      'emiPlansView',
      'emiScreenView',
      'feeBearerView',
      'homeTab',
      'nachScreen',
      'netbankingTab',
      'otpView',
      'payLaterView',
      'payoutsAccountView',
      'payoutsView',
      'savedCardsView',
      'svelteCardTab',
      'svelteWalletsTab',
      'upiTab',
    ];

    var session = this;

    _Arr.loop(views, function(_view) {
      var view = session[_view];

      if (view) {
        try {
          if (_.isFunction(view.$destroy)) {
            view.$destroy();
          }

          if (_.isFunction(view.destroy)) {
            view.destroy();
          }
        } catch (err) {}

        session[_view] = null;
      }
    });
  },

  close: function() {
    if (this.prefCall) {
      this.prefCall.abort();
      this.prefCall = null;
    }

    if (this.isOpen) {
      Analytics.track('modal:close', {
        immediately: true,
      });

      var cancelReason = this.getCancelReason();

      this.hideTimer();
      abortAjax(this.ajax);
      this.clearRequest(cancelReason);
      this.isOpen = false;
      clearTimeout(fontTimeout);

      this.cleanUpSvelteComponents();

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
      this.modal = this.emi = this.el = this.card = null;
      window.setPaymentID = window.onComplete = null;
      this.isCorporateBanking = null;
    }
  },

  saveAndClose: function() {
    if (this.isOpen) {
      this.data = this.getFormData();
      this.close();
    }
  },

  closeAndDismiss: function() {
    var wasShown = this.modal && this.modal.isShown;
    this.saveAndClose();

    if (wasShown) {
      Razorpay.sendMessage({
        event: 'dismiss',
        data: this.dismissReason,
      });
    }
  },

  showNoCostExplainer: function(plan) {
    this.nocostModal = new discreet.NoCostExplainer({
      target: gel('nocost-overlay'),
      props: {
        plan: plan,
        formatter: this.formatAmountWithCurrency.bind(this),
      },
    });
    showOverlay($('#nocost-overlay'));
  },

  setOffers: function() {
    var forcedOffer = discreet.Offers.getForcedOffer();
    var allOffers = discreet.Offers.getOffersForTab();

    // we show offers from backend + zestmoney offer which is
    // universally enabled
    if (forcedOffer || allOffers.length > 0) {
      Analytics.setMeta('hasOffers', true);
    } else if (!MethodStore.isZestMoneyEnabled()) {
      // if zestmoney isn't enabled, and backend also hasn't sent
      // any offers, don't proceed to initialize offers.
      return;
    }

    if (forcedOffer) {
      if (forcedOffer.payment_method === 'wallet') {
        this.walletOffer = forcedOffer;
      }
      Analytics.setMeta('forcedOffer', true);
    } else {
      var appliedOffer;
      this.getAppliedOffer = function() {
        return appliedOffer;
      };
      var session = this;
      this.offers = new discreet.OffersView({
        target: gel('bottom'),
        props: {
          applicableOffers: allOffers,
          setAppliedOffer: function(offer, shouldNavigate) {
            if (appliedOffer !== offer) {
              appliedOffer = offer;
              if (offer && shouldNavigate) {
                session.handleOfferSelection(offer);
              }
              session.handleDiscount();
            }
          },
          onShown: function() {
            Analytics.track(
              'offers:list_view:screen:' + (session.screen || 'home'),
              {
                data: session.getAppliedOffer(),
              }
            );
          },
        },
      });
    }
  },

  /**
   * Returns the currently applied offer
   *
   * @returns {Offer}
   */
  getAppliedOffer: function() {
    return discreet.Offers.getForcedOffer();
  },

  /**
   * Says whether or not the offer is applicable
   * on the provided offer.
   * @param {string} issuer
   * @param {Offer} offer
   *
   * @return {boolean}
   */
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

  /**
   * Returns the discounted amount if there's
   * an amount with the offer applied.
   *
   * @returns {Number}
   */
  getDiscountedAmount: function() {
    var appliedOffer = this.getAppliedOffer();

    return (appliedOffer && appliedOffer.amount) || this.get('amount');
  },

  /**
   * Show an error with the offer.
   * @param {Function} cb callback
   */
  showOffersError: function(cb) {
    var methodDescription = '',
      screen = this.screen;

    if (screen === 'netbanking') {
      methodDescription = 'selected bank';
    } else if (screen === 'upi') {
      methodDescription = 'entered VPA';
    } else if (screen === 'emi' || screen === 'emiplans') {
      methodDescription = 'selected plan';
    } else {
      methodDescription = 'selected ' + this.screen;
    }

    this.offers.showError(methodDescription, cb);
  },

  getCustomer: function() {
    return getCustomer.apply(null, arguments);
  },

  updateCustomerInStore: function() {
    var customer = this.getCustomer(getPhone());
    CustomerStore.customer.set(customer);
  },

  /**
   * Mark headless as failed and perform cleanup
   */
  markHeadlessFailed: function() {
    Analytics.removeMeta('headless');
    this.headless = false;

    if (this.headlessMetadata) {
      var metadata = this.headlessMetadata;
      OtpService.resetCount(metadata.issuer || metadata.network);

      this.headlessMetadata = null;
    }
  },

  /**
   * Sets some prefill values from preferences.
   * Modifies `options` in place, not a pure func.
   * @param {Object} preferences
   * @param {Object} options
   */
  setPrefillFromPreferences: function(preferences, options) {
    var order = preferences.order;

    // emandate
    if (order) {
      if (order.bank_account) {
        _Arr.loop(['ifsc', 'name', 'account_number', 'account_type'], function(
          key
        ) {
          if (order.bank_account[key]) {
            options['prefill.bank_account[' + key + ']'] =
              order.bank_account[key];
          }
        });

        if (order.bank) {
          options['prefill.bank'] = order.bank;
        }
      }

      if (order.auth_type) {
        options['prefill.auth_type'] = order.auth_type;
      }
    }
  },

  setPreferences: function(prefs) {
    this.r.preferences = prefs;
    Store.setRazorpayInstance(this.r);
    this.preferences = prefs;
    preferences = prefs;

    this.tab_titles = tab_titles;

    var self = this,
      customer,
      saved_customer = preferences.customer,
      session_options = this.get(),
      order = preferences.order,
      invoice = (this.invoice = preferences.invoice),
      subscription = (this.subscription = preferences.subscription),
      options = preferences.options;

    /* set empty customer in case of local card saving */
    if (preferences.global === false) {
      this.local = true;
      customer = new Customer('');
      this.getCustomer = function() {
        return customer;
      };
    }

    this.setPrefillFromPreferences(preferences, session_options);

    this.isPayout = Store.isPayout();

    if (this.isPayout) {
      Analytics.setMeta('payout', true);

      // We are disabling retries for payouts for now.
      this.set('retry', false);
    }

    Analytics.setMeta('features', preferences.features);

    /* Used previously logged in customer details and saved card tokens */
    if (saved_customer) {
      /* saved card details take priority over prefill */
      if (saved_customer.contact) {
        session_options['prefill.contact'] = saved_customer.contact;
      }

      if (saved_customer.email) {
        session_options['prefill.email'] = saved_customer.email;
      }

      customer = this.getCustomer(saved_customer.contact);
      sanitizeTokens(saved_customer.tokens);
      customer.tokens = saved_customer.tokens;

      if (saved_customer.tokens) {
        customer.logged = true;
        Analytics.setMeta('loggedIn', true);
      }

      customer.customer_id = saved_customer.customer_id;
    }

    /* set Razorpay instance for customer */
    Customer.prototype.r = this.r;

    /* Apply options overrides from preferences */
    Razorpay.configure(options);

    // Get amount
    var entityWithAmount = _Arr.filter([order, invoice, subscription], function(
      entity
    ) {
      return entity && _Obj.hasProp(entity, 'amount');
    })[0];

    if (entityWithAmount) {
      session_options.amount = entityWithAmount.partial_payment
        ? entityWithAmount.amount_due
        : entityWithAmount.amount;
    }

    // Get currency
    var entityWithCurrency = _Arr.filter(
      [order, invoice, subscription],
      function(entity) {
        return entity && _Obj.hasProp(entity, 'currency');
      }
    )[0];

    if (entityWithCurrency) {
      session_options.currency = entityWithCurrency.currency;
    }

    // set orderid as it is required while creating payments
    if (prefs.invoice) {
      this.r.set('order_id', prefs.invoice.order_id);
    }

    // Set optional fields in meta
    Analytics.setMeta(
      'optional.contact',
      _Arr.contains(preferences.optional || [], 'contact')
    );
    Analytics.setMeta(
      'optional.email',
      _Arr.contains(preferences.optional || [], 'email')
    );
  },

  showModal: function(preferences) {
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

    var qpmap = _Obj.unflatten(_.getQueryParams());
    if (qpmap.error) {
      errorHandler.call(this, qpmap);
    }

    if (qpmap.tab) {
      this.switchTab(qpmap.tab);
    }
  },

  fetchFundAccounts: function() {
    return Payouts.fetchFundAccounts(this.get('contact_id'));
  },

  hideOverlayMessage: hideOverlayMessage,
};

function updateTimer(timeoutEl, closeAt) {
  return function() {
    var timeLeft = Math.floor((closeAt - now()) / 1000);
    timeoutEl.innerHTML =
      '<i>&#x2139;</i>This page will timeout in ' +
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
