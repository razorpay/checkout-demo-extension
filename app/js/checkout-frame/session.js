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
  freqWallets = Wallet.wallets,
  contactPattern = Constants.CONTACT_REGEX,
  emailPattern = Constants.EMAIL_REGEX,
  ua_Android = discreet.UserAgent.androidBrowser,
  isMobile = discreet.UserAgent.isMobile,
  cookieDisabled = !navigator.cookieEnabled,
  getCustomer = discreet.getCustomer,
  Customer = discreet.Customer,
  Constants = discreet.Constants,
  OfferType = Constants.OfferType,
  sanitizeTokens = discreet.sanitizeTokens,
  getQueryParams = discreet.getQueryParams,
  Store = discreet.Store,
  PreferencesStore = discreet.PreferencesStore,
  DowntimesStore = discreet.DowntimesStore,
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
  Cta = discreet.Cta,
  NBHandlers = discreet.NBHandlers;

// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone|iPad/.test(ua);
var shouldFixFixed = /iPhone/.test(ua);
var ua_iPhone = shouldFixFixed;
var isIE = /MSIE |Trident\//.test(ua);
var DEMO_MERCHANT_KEY = 'rzp_live_ILgsfZCZoFIKMb';

function getStore(prop) {
  return Store.get()[prop];
}

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
    $('#form-card')[0] && $('#form-card').hasClass('saved-cards');
  var emiDuration = $('#emi_duration')[0] && $('#emi_duration').val();
  var savedCard = $('.saved-card.checked');

  if (screen === 'card' && tab === 'emi') {
    if (isSavedScreen) {
      if (savedCard[0]) {
        var emiDurationField = savedCard.$('.emi_duration');

        if (emiDurationField[0]) {
          if (!emiDurationField.val()) {
            type = 'show';
          }
        }
      }
    } else if (!emiDuration) {
      type = 'show';
    }
  } else if (screen === 'emiplans') {
    if (isSavedScreen) {
      var savedCard = $('.saved-card.checked');

      if (savedCard[0]) {
        if (!savedCard.$('.saved-cvv').val()) {
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

/**
 * Get the saved card elemnnt that should be selected
 * when the saved cards screen is shown.
 * @param {string} tab
 * @param {string} token
 *
 * @returns {Element}
 */
function getSelectableSavedCardElement(tab, token) {
  var selectors = {
    checked: '.saved-card.checked',
    saved: '.saved-card',
    token: '.saved-card',
  };

  // Add token to selectors
  if (token) {
    selectors.token += '[token="' + token + '"]';
  }

  var emiSelector = tab === 'emi' ? '[emi]' : '';

  // Add EMI selector to selectors
  selectors = _Obj.map(selectors, function(value) {
    return value + emiSelector;
  });

  var validSelector = _Arr.find(
    [selectors.checked, selectors.token, selectors.saved],
    function(selector) {
      return qs(selector);
    }
  );

  var elem = qs(validSelector);

  return elem;
}

/**
 * Add/remove a class to the saved card container
 * when EMI plan is selected.
 */
function toggleEmiPlanDetails(container, planIsSelected) {
  if (planIsSelected) {
    container.addClass('emi-selected');
  } else {
    container.removeClass('emi-selected');
  }
}

/**
 * Show appropriate EMI-details strip on the new card screen.
 */
function showAppropriateEmiDetailsForNewCard(
  tab,
  hasPlans,
  cardLength,
  methods
) {
  /**
   * tab=card
   * - plan selected: emi available
   * - does not have plans: nothing
   * - has plans: emi available
   * - default: nothing
   *
   *
   * tab=emi
   * - plan selected: plan details
   * - does not have plans: emi unavailable (with action)
   * - does not have emi plans and methods.card=false: emi unavailable (without action)
   * - has plans: pay without emi
   * - methods.card=false: nothing
   * - default: pay without emi
   */

  var emiDuration = $('#emi_duration').val();

  var emiPlanDetailsContainer = $(
    '#add-card-container .emi-plans-info-container'
  );
  var payWithoutEmi = $(
    '#add-card-container .emi-plans-trigger .emi-pay-without'
  );
  var emiPlansAvailable = $(
    '#add-card-container .emi-plans-trigger .emi-plan-unselected'
  );
  var emiPlansUnavailable = $(
    '#add-card-container .emi-plans-trigger .emi-plan-unavailable'
  );
  var emiPlanDetails = $(
    '#add-card-container .emi-plans-trigger .emi-plan-selected'
  );

  payWithoutEmi.addClass('hidden');
  emiPlansAvailable.addClass('hidden');
  emiPlansUnavailable.addClass('hidden');
  emiPlanDetails.addClass('hidden');
  emiPlanDetailsContainer.addClass('details-visible');

  if (tab === 'card') {
    if (hasPlans) {
      emiPlansAvailable.removeClass('hidden');
    } else {
      emiPlanDetailsContainer.removeClass('details-visible');
    }
  } else if (tab === 'emi') {
    if (emiDuration) {
      emiPlanDetails.removeClass('hidden');
    } else if (cardLength >= 6 && !hasPlans) {
      emiPlansUnavailable.removeClass('hidden');
    } else if (methods.card) {
      payWithoutEmi.removeClass('hidden');
    } else {
      emiPlanDetailsContainer.removeClass('details-visible');
    }
  }
}

function setEmiBank(data, savedCardScreen) {
  if (savedCardScreen) {
    var savedEmi = $('#saved-cards-container .checked input.emi_duration')[0];
    if (savedEmi && savedEmi.value) {
      data.method = 'emi';
      data.emi_duration = savedEmi.value;
    }
  } else {
    var activeEmiPlan = $('#emi_duration').val();
    if (activeEmiPlan) {
      data.method = 'emi';
      data.emi_duration = activeEmiPlan;
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

  this.emiPlansForNewCard = emiObj;

  if (emiObj) {
    $('#expiry-cvv').removeClass('hidden');
  } else {
    $('#emi_duration').val('');
  }

  showAppropriateEmiDetailsForNewCard(
    this.tab,
    emiObj,
    trimmedVal.length,
    this.methods
  );

  if (trimmedVal.length >= 6) {
    var emiBankChangeEvent;
    if (typeof Event === 'function') {
      emiBankChangeEvent = new Event('change');
    } else {
      emiBankChangeEvent = document.createEvent('Event');
      emiBankChangeEvent.initEvent('change', true, true);
    }
  }

  noCvvToggle({ target: nocvvCheck });

  var elem_emi = $('#elem-emi');
  var hiddenClass = 'hidden';

  if (isMaestro && sixDigits) {
    elem_emi.addClass(hiddenClass);
  } else if (elem_emi.hasClass(hiddenClass)) {
    invoke('removeClass', elem_emi, hiddenClass, 200);
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
      getCardTypeFromPayload(this.payload, this.transformedTokens) === 'bajaj'
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
  var qpmap = getQueryParams();
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
        allowSkip: !Boolean(thisSession.recurring),
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
                '<img class="headless-bank" src="' + bankLogo + '">';
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
  if (this.p13n && this.p13nInstrument) {
    P13n.recordSuccess(
      this.p13nInstrument,
      this.customer || this.getCustomer(this.payload.contact)
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
  this.isMobile = isMobile;

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

  track: function(event, extra) {
    Track(this.r, event, extra);
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

    if (isArray(this.methods.wallet) && this.methods.wallet.length > 0) {
      var amazonPay = 'amazonpay';

      this.methods.wallet.sort(function(item1, item2) {
        return item1.code === amazonPay ? -1 : item2.code === amazonPay ? 1 : 0;
      });
    }

    if (this.methods.emi) {
      tab_titles.card = 'Card';
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
      div.innerHTML = templates.modal(this, {
        getStore: getStore,
        cta: storeGetter(Cta.getStore()),
      });
      this.el = div.firstChild;
      this.applyFont(this.el.querySelector('#powered-link'));
      document.body.appendChild(this.el);

      this.el.appendChild(styleEl);

      this.body = $('#body');

      if (this.invoice && ecod) {
        commenceECOD(this);
      }
      if (ecod) {
        r.set('prefill.method', 'wallet');
        r.set('theme.hide_topbar', true);
      }
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
      var optional = getStore('optional');
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

    if (tab && !(this.order && this.order.bank) && this.methods[tab]) {
      this.switchTab(tab);
    } else if (tab === '') {
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

      if (data['bank']) {
        this.netbankingTab.setSelectedBank(data['bank']);
      }

      each(
        {
          contact: 'contact',
          email: 'email',
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
    Hacks.initPostRenderHacks();

    errorHandler.call(this, this.params);

    var hasOffers = this.hasOffers,
      forcedOffer = this.forcedOffer;

    if (forcedOffer) {
      if (
        'original_amount' in forcedOffer &&
        'amount' in forcedOffer &&
        forcedOffer.amount !== forcedOffer.original_amount
      ) {
        this.showDiscount();
        Analytics.track('offers:forced_with_discount', {
          data: forcedOffer,
        });
      }
    } else if (hasOffers) {
      var $offersContainer = $('#body #offers-container'),
        $offersTitle;

      if (this.eligibleOffers.length > 0) {
        // TODO: convert args to kwargs
        this.offers = initOffers(
          $offersContainer[0],
          this.eligibleOffers,
          {},
          this.handleOfferSelection.bind(this),
          this.handleOfferRemoval.bind(this),
          this.formatAmountWithCurrency.bind(this),
          $('#body')[0],
          this
        );

        this.renderOffers(this.screen);

        // For portals, this tracking snippet is present in the Svelte component of Offer Portal.
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

    if (this.get('ecod')) {
      Analytics.setMeta('ecod', true);

      if (this.invoice) {
        Analytics.setMeta('invoice', true);
      }
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

    Analytics.setMeta('maxmind', true);
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
    if (this.methods.upi) {
      this.upiTab = new discreet.UpiTab({
        target: gel('upi-svelte-wrap'),
      });
    }
  },

  setHomeTab: function() {
    this.homeTab = new discreet.HomeTab({
      target: gel('home-screen-wrap'),
    });
  },

  setNetbankingTab: function() {
    var method;

    if (this.methods.emandate) {
      method = 'emandate';
    } else if (this.methods.netbanking) {
      method = 'netbanking';
    }

    if (method) {
      var prefilledbank = this.get('prefill.bank');
      var selectedBank =
        prefilledbank && this.methods[method][prefilledbank]
          ? prefilledbank
          : '';

      this.netbankingTab = new discreet.NetbankingTab({
        target: gel('netbanking-svelte-wrap'),
        props: {
          bankOptions: this.get('method.netbanking'),
          banks: this.methods.emandate || this.methods.netbanking,
          recurring: this.recurring,
          method: method,
          selectedBankCode: selectedBank,
          downtimes: DowntimesStore.get(),
        },
      });

      // Add listener for proceeding automatically only if emandate
      if (method === 'emandate') {
        this.netbankingTab.$on(
          'bankSelected',
          this.proceedAutomaticallyAfterSelectingBank.bind(this)
        );
      }

      this.netbankingTab.$on(
        'bankSelected',
        this.removeNetbankingOfferIfNotApplicable.bind(this)
      );
    }
  },

  setSvelteComponents: function() {
    this.setHomeTab();
    this.setNetbankingTab();
    this.setEmandate();
    this.setCardlessEmi();
    this.setPayLater();
    this.setSavedCardsView();
    this.setOtpScreen();
    this.setUpiTab();
    this.setPayoutsScreen();
    this.setNach();
    this.setBankTransfer();
  },

  showTimer: function(cb) {
    this.hideTimer();
    var timeLeft = this.closeAt - now();
    var timeoutEl = $('#timeout').show()[0];
    $('#body').addClass('has-timeout');
    var timerFn = updateTimer(timeoutEl, this.closeAt);
    timerFn();
    if (this.headless && !this.get('timeout')) {
      qs('#form-otp').insertBefore(timeoutEl, qs('#otp-sec-outer'));
    } else if (isMobile()) {
      var modalEl = gel('modal');
      modalEl.insertBefore(timeoutEl, modalEl.firstChild);
    }
    var self = this;
    this.closeTimer = setInterval(timerFn, 1000);
    this.closeTimeout = setTimeout(function() {
      clearInterval(self.closeTimer);
      cb();
    }, timeLeft);
  },

  hideTimer: function() {
    $('#timeout').hide();
    $('#body').removeClass('has-timeout');
    clearInterval(this.closeTimer);
    clearTimeout(this.closeTimeout);
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
    if (!this.emi && this.methods.emi) {
      $(this.el).addClass('emi');
      this.emi = new discreet.emiView();
    }

    if (!this.emiPlansView) {
      this.emiPlansView = new discreet.emiPlansView();
    }
  },

  setSavedCardsView: function() {
    if (this.methods.card || this.methods.emi) {
      this.savedCardsView = new discreet.SavedCardsView({
        target: _Doc.querySelector('#saved-cards-container'),
      });
    }
  },

  setEmandate: function() {
    if (this.emandate && this.methods.emandate) {
      this.emandateView = new discreet.emandateView();
    }
  },

  /**
   * Equivalent of clicking a provider option from the
   * Cardless EMI homescreen.
   * @param {String} providerCode Code for the provider
   */
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

    this.preSubmit();
  },

  setCardlessEmi: function() {
    var self = this;

    if (this.methods.cardless_emi) {
      this.emiOptionsView = new discreet.emiOptionsView({
        target: _Doc.querySelector('#emi-options-wrapper'),
      });

      var providers = [];

      if (this.methods.emi) {
        providers.push(CardlessEmi.createProvider('cards', 'EMI on Cards'));
      }

      each(this.methods.cardless_emi, function(provider) {
        var providerObj = CardlessEmi.getProvider(provider);

        if (!providerObj) {
          return;
        }

        providers.push(CardlessEmi.createProvider(provider, providerObj.name));
      });

      this.emiOptionsView.$set({
        providers: providers,

        on: {
          select: function(event) {
            var providerCode = event.detail.code;

            self.selectCardlessEmiProvider(providerCode);
          },
        },
      });
    }
  },

  /**
   * Equivalent of clicking a provider option from the
   * PayLater homescreen.
   * @param {String} providerCode Code for the provider
   */
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

    this.preSubmit();
  },

  /**
   * Adds the Nach screen to DOM
   */
  setNach: function() {
    var isNachEnabled = this.nach;

    if (isNachEnabled) {
      this.nachScreen = new discreet.NachScreen({
        target: _Doc.querySelector('#nach-wrap'),
      });
    }
  },

  setBankTransfer: function() {
    if (this.methods.bank_transfer) {
      this.bankTransferView = new discreet.BankTransferScreen({
        target: _Doc.querySelector('#bank-transfer-svelte-wrap'),
      });
    }
  },

  setPayLater: function() {
    var self = this;
    var isPayLaterEnabled =
      this.methods.paylater && !_Obj.isEmpty(this.methods.paylater);

    if (!isPayLaterEnabled) {
      return;
    }

    this.payLaterView = new PayLaterView({
      target: _Doc.querySelector('#paylater-wrapper'),
    });

    var providers = [];

    each(this.methods.paylater, function(provider) {
      var providerObj = PayLater.getProvider(provider);

      if (!providerObj) {
        return;
      }

      providers.push(PayLater.createProvider(provider, providerObj.name));
    });

    this.payLaterView.$set({
      providers: providers,

      on: {
        select: function(event) {
          var providerCode = event.detail.code;
          self.selectPayLaterProvider(providerCode);
        },
      },
    });
  },

  setEmiScreen: function() {
    var session = this;

    if (
      !(
        session.methods.emi &&
        session.emi_options &&
        session.emi_options.banks &&
        session.emi_options.banks['BAJAJ']
      )
    ) {
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
      target: gel('payouts-svelte-wrap'),
      props: {
        amount: this.formatAmountWithCurrency(this.get('amount')),
        upiAccounts: upiAccounts,
        bankAccounts: bankAccounts,
      },
    });

    this.payoutsAccountView = new discreet.PayoutAccount({
      target: gel('payout-account-svelte-wrap'),
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

    this.commenceOTP(cardlessEmiProviderObj.name + ' account', true);

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
    var provider = params.provider;
    var data = params.data;
    var phone = params.contact;

    this.customer.checkStatus(
      function(response) {
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

    if (action === 'incorrect') {
      self.otpView.setText(discreet.wrongOtpMsg);
      return;
    } else if (action === 'resend') {
      this.commenceOTP('Resending OTP...');
    } else if (action === 'verify') {
      this.commenceOTP('Verifying OTP...');
    } else {
      this.commenceOTP(payLaterProviderObj.name + ' account', true);
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
        target: gel('otp-screen-wrapper'),

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
    if (this.methods.count === 1) {
      var self = this;
      /* Please don't change the order, this code is order senstive */
      [
        'card',
        'emi',
        'netbanking',
        'emandate',
        'nach',
        'upi',
        'wallet',
        'paypal',
      ].some(function(methodName) {
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
    if (prefilledMethod === 'emi' && prefilledProvider === 'bajaj') {
      this.set('prefill.method', 'cardless_emi');
    }
  },

  /**
   * Anything related to prefilled that needs to be done
   * once everything has rendered,
   * goes into this function.
   */
  prefillPostRender: function() {
    var prefilledMethod = this.get('prefill.method');
    var prefilledProvider = this.get('prefill.provider');

    if (prefilledMethod === 'cardless_emi') {
      this.selectCardlessEmiProvider(prefilledProvider);
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
    $('.omnichannel').hide(); // Hide the Google Pay logo
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
      this.customer.createOTP(function(message) {
        debounceAskOTP(self.otpView, message, true);
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
      this.showLoadError();
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

  handlePartialAmount: function() {
    this.setPaymentMethods(this.preferences);
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

    this.setSavedCards();

    _El.removeClass(_Doc.querySelector('#top-right'), 'logged');

    this.homeTab.updateCustomer();
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
    var emi_options = this.emi_options;
    var thisEl = this.el;

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
    this.on('submit', '#form', this.preSubmit);

    var enabledMethods = this.methods;

    if (enabledMethods.card || enabledMethods.emi) {
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

    discreet.UserHandlers.attachLogoutListeners(this);

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
                  power: discreet.Wallet.isPowerWallet(value),
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
    }

    if (enabledMethods.emi) {
      this.on('click', '#add-card-container', 'emi-plans-trigger', function(e) {
        var $target = $(e.delegateTarget);
        var eventName = 'emi:plans:';
        var eventData = {
          from: self.tab,
        };

        self.removeAndCleanupOffers();

        if ($target.$('.emi-plan-unselected:not(.hidden)')[0]) {
          self.showEmiPlans('new')(e);
          eventName += 'view';
        } else if ($target.$('.emi-plan-selected:not(.hidden)')[0]) {
          self.showEmiPlans('new')(e);
          eventName += 'edit';
        } else if ($target.$('.emi-pay-without:not(.hidden)')[0]) {
          if (enabledMethods.card) {
            self.setScreen('card');
            self.switchTab('card');
            self.offers && self.renderOffers(this.tab);

            eventName = 'emi:pay_without';
          }
        } else if ($target.$('.emi-plan-unavailable:not(.hidden)')[0]) {
          if (enabledMethods.card) {
            self.setScreen('card');
            self.switchTab('card');
            self.toggleSavedCards(false);
            self.offers && self.renderOffers(this.tab);

            eventName = 'emi:pay_without';
          }
        }

        Analytics.track(eventName, {
          type: AnalyticsTypes.BEHAV,
          data: eventData,
        });
      });

      this.on('click', '#form-card', 'saved-card-pay-without-emi', function(e) {
        self.removeAndCleanupOffers();

        self.switchTab('card');
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
    this.click('#overlay-close', this.hideErrorMessage);

    this.on('click', '#form-upi.collapsible .item', function(e) {
      $('#form-upi.collapsible .item.expanded').removeClass('expanded');
      $(e.currentTarget).addClass('expanded');
    });
  },

  onUpiAppSelect: function(packageName) {
    $('#body').toggleClass('sub', packageName);

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
          discreet.Flows.performCardFlowActionsAndValidate(
            gel('elem-card'),
            this.el,
            gel('card_expiry')
          );
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

    delegator.otp = delegator
      .add('number', gel('otp'))
      .on('change', function() {
        self.input(this.el);
      });
  },

  setScreen: function(screen) {
    var isGPayScreen = false;

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

    if (screen === 'gpay' && this.separateGPay) {
      screen = 'upi';
      isGPayScreen = true;
    }

    setEmiPlansCta(screen, this.tab);

    if (screen === this.screen) {
      return;
    }

    if (screen === 'qr') {
      this.currentScreen = new discreet.QRScreen({
        target: qs('#form-qr'),
        props: {
          paymentData: this.getFormData(),
          onSuccess: bind(successHandler, this),
        },
      });
    } else if (this.currentScreen) {
      this.currentScreen.$destroy();
      this.currentScreen = null;
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
    if (this.screen === 'otp' && screen !== 'card' && screen !== 'emi') {
      this.preSelectedOffer = null;
    }

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
    } else {
      this.body.toggleClass('sub', showPaybtn);
    }

    if (screen === 'upi') {
      var isIntentFlow = this.upiTab.intent;

      if (isIntentFlow) {
        var data = this.upiTab.getPayload();

        if (data['_[flow]'] === 'intent' && !data.upi_app) {
          $('#body').removeClass('sub');
        }
      } else if (typeof this.upiTab.selectedApp === 'undefined') {
        $('#body').removeClass('sub');
      }
    }

    if (this.upiTab) {
      if (isGPayScreen) {
        this.upiTab.$set({ selectedApp: 'gpay' });
        this.upiTab.onUpiAppSelection({
          detail: {
            id: 'gpay',
          },
        });
      }

      /**
       * TODO: when more tabs are ported to Svelte, move current `tab` state to
       *       Store
       */
      this.upiTab.$set({ tab: this.tab });
    }

    return this.offers && this.renderOffers(this.tab);
  },

  /**
   * Renders offers
   * @param {string} tab
   */
  renderOffers: function(tab) {
    /**
     * Going to the OTP screen resets the offers
     * Prevent that by not rendering offers there
     * and aborting early.
     */
    if (this.screen === 'otp' || tab === 'otp') {
      return this.offers.display(false);
    }

    // EMI plans should have the same offers as EMI
    // TODO: Fix for Cardless EMI
    if (tab === 'emiplans') {
      tab = 'emi';
    }

    // Allow offers only on certain tabs
    if (
      [
        '',
        'card',
        'emi',
        'netbanking',
        'wallet',
        'upi',
        'cardless_emi',
      ].indexOf(tab) < 0
    ) {
      $('#body').removeClass('has-offers');
      return this.offers.display(false);
    }

    // reset offers UI
    if (this.offers.appliedOffer || this.offers.selectedOffer) {
      this.offers.removeOffer();
      // Explicitly call this because we removed the offer explicitly
      this.handleOfferRemoval();
    }

    var paymentMethod = tab;

    var filters = (tab && { payment_method: paymentMethod }) || {};

    /**
     * For every Cardless EMI screen other than
     * the Cardless EMI homescreen,
     * set the provider in the filters.
     *
     * Side-effect: We won't be able to show
     * provider-less offers for Cardless EMI
     * until Offers code is refactored.
     */
    if (tab === 'cardless_emi') {
      if (this.screen !== 'cardless_emi') {
        filters.provider = CardlessEmiStore.providerCode;
      }
    }

    /**
     * Offers have a 'homescreen' attribute that tells
     * whether or not we want to show that offer on the homescreen.
     *
     * `tab` being '' means we are on the homescreen.
     */
    if (tab === '') {
      filters.homescreen = tab === '';
    }

    this.offers.applyFilter(filters);

    if (this.preSelectedOffer) {
      this.offers.selectOffer(this.preSelectedOffer);
      // Explicitly call this because we selected the offer explicitly
      this.offers.applyOffer();
      this.handleOfferSelection(this.preSelectedOffer, tab);

      /* Don't set preSelectedOffer to null if it's on card OTP screen  */
      if (this.screen === 'otp' && tab !== 'card' && tab !== 'emi') {
        this.preSelectedOffer = null;
      }
    }

    /**
     * On some screens, there might be an offers portal available.
     * We render the Offers strip inside that portal.
     *
     * If a portal is available, use that portal.
     * Otherwise, fall back to the default container.
     */
    var usingPortal = false;
    var offersPortal = _Doc.querySelector(
      this.getActiveForm() + ' .offers-portal'
    );
    var offersContainer = _Doc.querySelector('#offers-container');
    var hasOffers = this.offers.numVisibleOffers > 0;

    usingPortal = Boolean(offersPortal);

    if (usingPortal) {
      offersContainer = offersPortal;
    }

    this.offers.updateContainerRef(offersContainer);

    $('#body').toggleClass('has-offers', hasOffers);
    $('#body').toggleClass('using-offers-portal', usingPortal);
  },

  /**
   * Handles offer selection
   * @param {Offer} offer
   * @param {string} screen
   */
  handleOfferSelection: function(offer, screen) {
    var offerInstance = offer;
    var emiBanks = this.emi_options.banks;

    offer = offer.data;

    // Show discount if it is not a cashback offer
    if (
      offer.type !== OfferType.DEFERRED &&
      offer.original_amount > offer.amount
    ) {
      this.showDiscount();
    }

    var savedCards =
      this.customer && this.customer.tokens && this.customer.tokens.items;

    screen = screen || this.screen;

    // Show only those cards on which the offer is eligible
    if (savedCards && savedCards.length > 0) {
      var filteredTokens = [];
      each(savedCards, function(index, token) {
        var card = token.card;
        if (card && offer.payment_method === 'emi' && offer.emi_subvention) {
          /* Merchant subvention EMI */
          var bank = card.issuer;
          var emiBank = emiBanks[bank];

          if (bank && emiBank) {
            var plans = emiBank.plans;
            if (typeof plans !== 'object') {
              return;
            }

            var hasOffer = false;

            each(plans, function(duration, plan) {
              if (plan.offer_id === offer.id) {
                hasOffer = true;
                return;
              }
            });

            if (hasOffer) {
              filteredTokens.push(token);
            }
          }
        } else {
          filteredTokens.push(token);
        }
      });
      this.setSavedCards({
        entity: 'collection',
        count: filteredTokens.length,
        items: filteredTokens,
      });
    }

    // Go to the offer's method if we're on homescreen
    if (!screen) {
      this.preSelectedOffer = offerInstance;
      this.switchTab(offer.payment_method);
      return this.handleOfferSelection(offerInstance, offer.payment_method);
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
      var emiDuration = $('#emi_duration').val();
      var bank = this.emiPlansForNewCard && this.emiPlansForNewCard.code;
      var emiBank = emiBanks[bank];

      if (emiDuration && emiBank && typeof emiBank.plans === 'object') {
        var plan = emiBank.plans[emiDuration];
        if (
          plan &&
          offer.id &&
          offer.emi_subvention &&
          plan.offer_id !== offer.id
        ) {
          // Clear duration
          $('#emi_duration').val('');
        }
      }

      //TODO: WIP try to see if the card exists in the saved cards and focus
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
    } else if (screen === 'cardless_emi' && this.screen !== 'otp') {
      var provider = offer.provider;

      if (provider) {
        this.selectCardlessEmiProvider(provider);
      }
    }
  },

  /**
   * Removes offer
   */
  handleOfferRemoval: function() {
    this.hideDiscount();

    if (this.customer && this.customer.tokens && this.customer.tokens.count) {
      this.setSavedCards(this.customer.tokens);
    }
  },

  /**
   * Show the discount amount.
   */
  showDiscount: function() {
    var offer = this.getAppliedOffer();

    if (!offer) {
      return;
    }

    $('#content').addClass('has-discount');

    var discountAmount = this.formatAmountWithCurrency(offer.amount);

    //TODO: optimise queries
    $('#amount .discount')[0].innerHTML = discountAmount;
    Cta.showAmountInCta();
  },
  hideDiscount: function() {
    $('#content').removeClass('has-discount');
    //TODO: optimise queries
    $('#amount .discount').html('');
    if (this.tab !== '') {
      Cta.showAmountInCta();
    }
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

    if (this.get('ecod')) {
      $('#footer').hide();
      $('#wallets input:checked').prop('checked', false);
      $(this.el).addClass('notopbar');
      tab = 'wallet';
    } else if (
      this.screen === 'otp' &&
      thisTab !== 'card' &&
      thisTab !== 'emi'
    ) {
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
      this.methods.cardless_emi
    ) {
      tab = 'cardless_emi';
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

    this.preSelectedOffer = null;
    this.switchTab(tab);

    BackStore = null;
  },

  switchTabAnalytics: function(tab) {
    if (tab === 'upi') {
      var upiData = this.upiTab;

      if (upiData.intent) {
        /**
         * If intent, track UPI apps installed and eligible
         */
        Analytics.track('upi:intent', {
          type: AnalyticsTypes.RENDER,
          data: {
            count: {
              eligible: _.lengthOf(this.upi_intents_data),
              all: _.lengthOf(this.all_upi_intents_data),
            },
            list: {
              eligible: _Arr.join(
                _Arr.map(this.upi_intents_data, function(app) {
                  return app.package_name;
                }),
                ','
              ),
              all: _Arr.join(
                _Arr.map(this.all_upi_intents_data, function(app) {
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

      _Arr.loop(fields, function(field) {
        invalidFields[field.name] = true;
      });

      Analytics.track('homescreen:fields:invalid', {
        data: {
          fields: invalidFields,
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
        (!contact && !getStore('optional').contact && !this.isPayout) ||
        this.get('method.' + tab) === false
      ) {
        return;
      }
      this.customer = this.getCustomer(contact);
      if (this.customer.logged && !this.local) {
        $('#top-right').addClass('logged');
      }
      $('#user').html(contact);
    } else {
      this.payload = null;
      this.clearRequest();
    }

    if (tab === 'netbanking') {
      this.netbankingTab.onShown();
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

    if (tab === 'ecod') {
      send_ecod_link.call(this);
    }

    if (tab === 'card' || (tab === 'emi' && this.screen !== 'emi')) {
      this.showCardTab(tab);

      setEmiPlansCta(this.screen, tab);
    } else {
      this.setScreen(tab);
      if (ua_iPhone) {
        Razorpay.sendMessage({ event: 'blur' });
      }
    }

    if (!tab) {
      var selectedInstrument = this.getSelectedP13nInstrument();

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

    onSixDigits.call(this, {
      target: gel('card_number'),
    });

    var self = this;
    var customer = self.customer;
    var remember = self.get('remember_customer');
    $('#form-card').toggleClass('save-enabled', remember);

    if (!remember) {
      return self.setScreen('card');
    }

    tab_titles.otp = tab_titles.card;
    this.otpView.updateScreen({
      skipText: 'Skip Saved Cards',
    });

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
              self.otpView,
              'Enter OTP sent on ' +
                getPhone() +
                '<br>to save your card for future payments',
              true
            );
          });
        } else if (customer.saved && !customer.logged) {
          askOTP(self.otpView, undefined, true);
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
    // TODO: Return from here if we are selecting the same selected card

    var $savedCard = $(e.delegateTarget);
    if (this.tab === 'emi' && !isString($savedCard.attr('emi'))) {
      return;
    }

    if (!e.target || e.target !== $savedCard.find('.elem-savedcards-emi')[0]) {
      $savedCard.$('.saved-cvv').focus();
    }

    $('#saved-cards-container .checked').removeClass('checked');
    $savedCard.addClass('checked');

    this.selectedSavedCardToken = $savedCard.attr('token');

    if (this.offers && !this.offers.offerSelectedByDrawer) {
      this.offers.removeOffer();
    }

    // If EMI is supported on saved card
    if (this.tab === 'emi' && $savedCard.$('.emi-plans-trigger')[0]) {
      var $trigger = $savedCard.$('.emi-plans-trigger');
      var issuer = $trigger.attr('data-bank');
      var duration = $savedCard.$('.emi_duration').val();

      // Set offer in case it is applicable.
      if (issuer && duration) {
        var emi_options = this.emi_options;
        var plans = (emi_options.banks[issuer] || {}).plans;

        if (
          plans &&
          plans[duration] &&
          plans[duration].offer_id &&
          this.offers
        ) {
          this.offers.selectOfferById(plans[duration].offer_id);
        }
      }

      // Add class manually in case svelte rerendered.
      if (duration) {
        $savedCard.addClass('emi-selected');
      }
    }

    setEmiPlansCta(this.screen, this.tab);

    if ($savedCard.$('.flow-selection-container')[0]) {
      Analytics.track('atmpin:saved_card:select', {
        type: AnalyticsTypes.BEHAV,
        data: {
          default_auth_type: Constants.DEFAULT_AUTH_TYPE_RADIO,
        },
      });
    }
  },

  /**
   * @param {Array} tokens
   *
   * @return {Array} tokens
   */
  transformTokens: function(tokens) {
    return Token.transform(tokens, {
      amount: this.get('amount'),
      emi: this.methods.emi,
      emiOptions: this.emi_options,
      recurring: this.recurring,
    });
  },

  /**
   * Returns the EMI plans for a given bank.
   * @param {String} bank
   *
   * @returns {Array}
   */
  getEmiPlans: function(bank) {
    var emi_options = this.emi_options;
    var plans = (emi_options.banks[bank] || {}).plans;
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
   * Do things to offers when an EMI plan is selected.
   *
   * @param {Object} plan
   */
  processOffersOnEmiPlanSelection: function(plan) {
    if (plan && plan.offer_id) {
      if (this.offers) {
        this.preSelectedOffer = this.offers.selectOfferById(plan.offer_id);
      }
    } else {
      if (
        this.offers &&
        this.offers.appliedOffer &&
        this.offers.appliedOffer.emi_subvention
      ) {
        this.offers.removeOffer();
      }
    }
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
    var emi_options = this.emi_options;
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

        var trigger = e.delegateTarget;
        var $trigger = $(trigger);
        var bank = self.emiPlansForNewCard && self.emiPlansForNewCard.code;
        var plans = (emi_options.banks[bank] || {}).plans;

        if (self.isOfferApplicableOnIssuer(bank)) {
          amount = self.getDiscountedAmount();
        } else {
          self.removeAndCleanupOffers();
        }

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
              self.toggleSavedCards(false);

              return true;
            }),

            payWithoutEmi: function() {
              trackEmi('emi:pay_without', {
                from: prevTab,
              });

              $('#emi_duration').val('');

              self.switchTab('card');
              self.setScreen('card');
              self.toggleSavedCards(false);

              self.processOffersOnEmiPlanSelection();
            },

            select: function(value) {
              var plan = plans[value];
              var text = getEmiText(self, amount, plan) || '';

              trackEmi('emi:plan:select', {
                from: prevTab,
                value: value,
              });

              $('#emi_duration').val(value);
              $trigger.$(
                '.emi-plan-selected .emi-plans-text'
              )[0].innerHTML = text;

              self.switchTab('emi');
              self.toggleSavedCards(false);

              self.processOffersOnEmiPlanSelection(plan);

              self.preSubmit();
            },

            viewAll: viewAllPlans(prevTab),
          },

          actions: {
            viewAll: true,
            payWithoutEmi: self.methods.card,
          },
        });

        if (self.offers) {
          if (!self.offers.selectedOffer && !self.offers.appliedOffer) {
            self.preSelectedOffer = null;
          }
        }

        self.switchTab('emiplans');
        $('#body').removeClass('sub');
      };
    } else if (type === 'saved') {
      return function(e) {
        tab_titles.emiplans = tabTitle;

        var trigger = e.currentTarget;
        var $trigger = $(trigger);
        var bank = $trigger.attr('data-bank');
        var plans = (emi_options.banks[bank] || {}).plans;
        var emiPlans = self.getEmiPlans(bank);
        var $savedCard = $('.saved-card.checked');
        var savedCvv = $savedCard.$('.saved-cvv').val();

        if (self.isOfferApplicableOnIssuer(bank)) {
          amount = self.getDiscountedAmount();
        } else {
          self.removeAndCleanupOffers();
        }

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

              $trigger.$('.emi_duration').val('');
              toggleEmiPlanDetails($trigger.parent().parent(), false);

              self.switchTab('card');
              self.setScreen('card');
              self.toggleSavedCards(true);

              self.processOffersOnEmiPlanSelection();
            },

            select: function(value) {
              var plan = plans[value];
              var text = getEmiText(self, amount, plan) || '';

              trackEmi('emi:plan:select', {
                from: prevTab,
                value: value,
              });

              $trigger.$('.emi_duration').val(value);
              $trigger.$(
                '.emi-plan-selected .emi-plans-text'
              )[0].innerHTML = text;
              toggleEmiPlanDetails($trigger.parent().parent(), true);

              self.switchTab('emi');
              self.setScreen('card');
              self.toggleSavedCards(true);

              self.processOffersOnEmiPlanSelection(plan);

              if (savedCvv) {
                self.preSubmit();
              } else {
                self.switchTab('emi');
                self.setScreen('card');
                self.toggleSavedCards(true);
              }
            },

            viewAll: viewAllPlans(prevTab),
          },

          actions: {
            viewAll: true,
            payWithoutEmi: self.methods.card,
          },
        });

        if (self.offers) {
          if (!self.offers.selectedOffer && !self.offers.appliedOffer) {
            self.preSelectedOffer = null;
          }
        }

        self.switchTab('emiplans');
        $('#body').removeClass('sub');
      };
    } else if (type === 'bajaj') {
      return function() {
        tab_titles.emiplans = tabTitle;

        var bank = 'BAJAJ';
        var plans = emi_options.banks[bank].plans;
        var emiPlans = self.getEmiPlans(bank);

        if (self.isOfferApplicableOnIssuer(bank)) {
          amount = self.getDiscountedAmount();
        } else {
          self.removeAndCleanupOffers();
        }

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
              var plan = plans[value];
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
   * Removes offers and cleans up all the corresponding variables
   */
  removeAndCleanupOffers: function() {
    if (this.offers) {
      this.preSelectedOffer = null;
      this.offers.removeOffer();
      this.hideDiscount();
    }
  },

  setSavedCards: function(providedTokens) {
    var customer = this.customer;
    var tokens =
      (providedTokens && providedTokens.count) ||
      (customer && customer.tokens && customer.tokens.count);
    var cardTab = $('#form-card');
    var delegator = this.delegator;
    var self = this;

    if (!delegator) {
      delegator = this.delegator = Razorpay.setFormatter(this.el);
    }

    if (tokens) {
      var tokensList = providedTokens || customer.tokens;
      if (
        providedTokens ||
        $$('.saved-card').length !== tokensList.items.length
      ) {
        try {
          // Keep EMI cards at the end
          tokensList.items.sort(function(a, b) {
            if (a.card && b.card) {
              if (a.card.emi && b.card.emi) {
                return 0;
              } else if (a.card.emi) {
                return 1;
              } else if (b.card.emi) {
                return -1;
              }
            }
          });
        } catch (e) {}

        var savedCardsCount = discreet.Token.getSavedCards(tokensList.items)
          .length;

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

        this.transformedTokens = this.transformTokens(tokensList.items);

        this.savedCardsView.$set({
          cards: this.transformedTokens,
          on: {
            viewPlans: function(event) {
              Analytics.track('saved_card:emi:plans:view', {
                type: AnalyticsTypes.BEHAV,
                data: {
                  from: self.tab,
                },
              });

              self.showEmiPlans('saved')(event.detail);
            },
          },
        });

        var totalSavedCards = discreet.Token.getSavedCards(
          this.transformedTokens
        ).length;

        if (totalSavedCards) {
          var selectorsForSavedCardText = [
            '#form-card .saved-card-pay-without-emi',
            '#add-card-container .emi-pay-without',
          ];
          each(selectorsForSavedCardText, function(index, selector) {
            var stripEl = $(selector);
            if (stripEl[0]) {
              var emiTextEl = stripEl.$('.emi-plans-text .count-text');

              emiTextEl.html(' (' + totalSavedCards + ' cards available)');
            }
          });
        }
      }
    }

    var selectableSavedCard = getSelectableSavedCardElement(
      this.tab,
      this.selectedSavedCardToken
    );
    if (tokens && selectableSavedCard) {
      this.setSavedCard({ delegateTarget: selectableSavedCard });
    }

    this.savedCardScreen = tokens;

    var emiCards = [];

    if (this.transformedTokens) {
      emiCards = this.transformedTokens.filter(function(token) {
        return token.plans;
      });
    }

    if (this.tab === 'card') {
      this.toggleSavedCards(!!tokens);
    } else if (this.tab === 'emi') {
      this.toggleSavedCards(emiCards.length > 0);
    }
    $('#form-card').toggleClass('has-cards', tokens);
    $('#form-card').toggleClass('no-emi-cards', !emiCards.length);

    each($$('.saved-cvv'), function(i, input) {
      delegator.add('number', input);
    });
  },

  toggleSavedCards: function(saveScreen) {
    var tabCard = $('#form-card');
    var saveClass = 'saved-cards';

    /**
     * If offer was auto-applied from the
     * emi plans screen.
     * TODO: Validate this.
     */
    if (
      this.offers &&
      !this.offers.offerSelectedByDrawer &&
      this.offers.appliedOffer
    ) {
      this.offers.removeOffer();
    }

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

    var $savedContainer = $('#saved-cards-container');

    if (saveScreen) {
      this.setSavedCard({
        delegateTarget: getSelectableSavedCardElement(
          this.tab,
          this.selectedSavedCardToken
        ),
      });
      invoke('addClass', $savedContainer, 'scroll', 300);
    } else {
      try {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      } catch (e) {}
      $savedContainer.removeClass('scroll');
    }

    $('#form-card .saved-card-pay-without-emi').toggleClass(
      'hidden',
      !saveScreen
    );

    this.savedCardScreen = saveScreen;
    tabCard.toggleClass(saveClass, saveScreen);

    setEmiPlansCta(this.screen, this.tab);
  },

  checkDown: function(val) {
    $('.down')
      .toggleClass('vis', indexOf(this.down, val) !== -1)
      .$('.text')
      .html((this.methods.netbanking || this.methods.emandate)[val]);
  },

  /**
   * Validates that the issuer of the offer is same as the selected value
   * @param {string} selectedVal
   * @param {Element} selectedEl
   *
   * @returns {boolean}
   */
  validateOffers: function(selectedVal, selectedEl) {
    if (!this.offers || !this.offers.appliedOffer) {
      return true;
    }

    return this.offers.appliedOffer.issuer === selectedVal;
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

  removeNetbankingOfferIfNotApplicable: function(event) {
    var code = event.detail.bank.code;
    var offerIssuer = _Obj.getSafely(this, 'offers.appliedOffer.issuer');
    var self = this;

    // If the issuer is missing, the offer should be applied regardless of the
    // bank selected. Do not validate in that case.
    if (!offerIssuer) {
      return;
    }

    if (offerIssuer !== code) {
      this.showOffersError(function(offerRemoved) {
        if (!offerRemoved) {
          // If the offer was not removed, revert to the bank in offer issuer
          self.netbankingTab.setSelectedBank(offerIssuer);
        }
      });
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
    if (form === 'card' || form === 'emi') {
      var whichCardTab = 'add-card';
      if (this.savedCardScreen) {
        whichCardTab = 'saved-cards';
      }

      if (form === 'emi' && this.screen === 'emi') {
        whichCardTab = 'add-emi';
      }

      return '#' + whichCardTab + '-container';
    }
    if (form === 'emandate') {
      form = 'netbanking';
    }

    if (form === 'gpay') {
      form = 'upi';
    }
    return '#form-' + form;
  },

  retryWithOmnichannel: function() {
    this.upiTab.setOmnichannelAsRetried();
  },

  getFormData: function() {
    var tab = this.tab;
    var data = {};

    data.contact = getPhone();
    data.email = getEmail();

    var prefillEmail = this.get('prefill.email');
    var prefillContact = this.get('prefill.contact');

    var optional = getStore('optional');

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

    if (tab) {
      data.method = tab;
      var activeForm = this.getActiveForm();

      if (activeForm !== '#form-upi') {
        fillData(activeForm, data);
      }

      // Delete all the auth_type-* keys
      each(data, function(key, val) {
        if (key.indexOf('auth_type-') === 0) {
          delete data[key];
        }
      });

      if (this.screen === 'card') {
        if (this.savedCardScreen) {
          var $checkedCard = $('.saved-card.checked');
          if ($checkedCard[0]) {
            var $emiPlans = $checkedCard.$('.elem-savedcards-emi');
            var $emiDuration = $checkedCard.$('.emi_duration');
            var appliedOffer = this.offers && this.offers.offerSelectedByDrawer;
            appliedOffer = appliedOffer || {};
            data.token = $checkedCard.attr('token');
            data['card[cvv]'] = $checkedCard.$('.saved-cvv').val();

            // Set auth_type for Debit+PIN for saved cards.
            var authType = $checkedCard.$('.flow.input-radio input:checked');
            authType = authType[0] && authType.val();
            if (authType) {
              data['auth_type'] = authType;
            }

            if (
              (tab === 'emi' || appliedOffer.payment_method === 'emi') &&
              !$emiDuration.val()
            ) {
              $emiPlans
                .addClass('mature')
                .addClass('invalid')
                .focus();
            } else {
              $emiPlans.removeClass('mature').removeClass('invalid');
            }
          }
        } else {
          if (tab === 'emi') {
            var emiDuration = $('#emi_duration').val();
            if (emiDuration) {
              data.emi_duration = emiDuration;
            }
          }
          var cardNumberKey = 'card[number]';
          data[cardNumberKey] = data[cardNumberKey].replace(/\ /g, '');
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
    }

    if (Analytics.getMeta('maxmind')) {
      data['_[maxmind]'] = 1;
    }

    return data;
  },

  hide: function(confirmedCancel) {
    var self = this;
    if (this.isOpen) {
      if (confirmedCancel !== true && this.r._payment) {
        return Confirm.show({
          message: 'Your payment is ongoing. Press OK to cancel the payment.',
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
      this.savedCardScreen = undefined;
      discreet.Bridge.stopListeningForBackPresses();
    }
  },

  showOmnichannelLoader: function(text) {
    setTimeout(function() {
      $('#error-message .link').html('');
    }, 100);

    $('.omnichannel').show();
    $('#overlay-close').show();

    this.showLoadError(text, false);
  },

  /**
   * Get the message to be shown in the omnichannel loader.
   * @return {string}
   */
  getOmnichannelMessage: function() {
    return (
      'Please accept the request of ' +
      this.formatAmountWithCurrency(this.get('amount')) +
      ' in your Google Pay app linked with +91' +
      this.payload.contact
    );
  },

  showLoadError: function(text, error) {
    if (this.headless && this.screen === 'card') {
      return;
    }
    var actionState;
    var loadingState = true;
    if (error) {
      if (
        (this.screen === 'upi' || this.get('ecod')) &&
        text === discreet.cancelMsg
      ) {
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

    var isOmnichannel = this.isOmnichannel();
    if (isOmnichannel && error) {
      this.retryWithOmnichannel();
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

  commenceOTP: function(text, partial) {
    this.setScreen('otp');

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
          if (this.customer.logged) {
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
          }
        };
      } else {
        var self = this;
        callback = function(msg) {
          if (self.customer.logged) {
            // OTP verification successful
            OtpService.resetCount('razorpay');

            self.showCardTab();
          } else {
            Analytics.track('behav:otp:incorrect', {
              wallet: self.tab === 'wallet',
            });
            askOTP(this.otpView, msg, true);
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

    this.customer.submitOTP(submitPayload, bind(callback, this), queryParams);
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
    this.doneByP13n = false;
    this.payload = null;

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

    /**
     * The CTA for home screen is visible only on the new design. If it was
     * clicked, switch to the new payment methods screen.
     */
    if (!screen) {
      if (this.checkCommonValid()) {
        // switch to methods tab
        if (this.homeTab.onDetailsScreen()) {
          if (this.homeTab.shouldGoNext()) {
            return this.homeTab.next();
          }
        }
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

    if (!this.recurring && this.order && this.order.bank) {
      if (!this.checkCommonValid()) {
        return;
      }
      data.method = this.order.method || data.method || 'netbanking';
      data.bank = this.order.bank;

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
              this.shake();
              return $('.checked .saved-cvv').focus();
            }
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
        var formSelector = '#form-upi';
        var omnichannelType = this.upiTab.omnichannelType;

        if (data['_[flow]'] === 'intent') {
          if (!omnichannelType) {
            formSelector = '#svelte-collect-in-intent';
          } else {
            if (omnichannelType === 'vpa') {
              formSelector = '#upi-gpay-vpa';
            }

            if (omnichannelType === 'phone') {
              formSelector = '#upi-gpay-phone';
            }
          }
        }

        if (
          data['_[flow]'] === 'directpay' &&
          this.upiTab.selectedApp === 'gpay'
        ) {
          if (omnichannelType === 'vpa') {
            formSelector = '#upi-gpay-vpa';
          }

          if (omnichannelType === 'phone') {
            formSelector = '#upi-gpay-phone';
          }
        }

        if (this.checkInvalid(formSelector)) {
          return;
        }

        if (this.isOmnichannel()) {
          $('.omnichannel').show();
        } else {
          $('.omnichannel').hide();
        }
      } else if (this.checkInvalid()) {
        return;
      }
    } else if (this.oneMethod === 'netbanking') {
      data.bank = this.get('prefill.bank');
    } else if (this.p13n) {
      if (!this.checkCommonValid()) {
        return;
      }

      var selectedInstrument = this.getSelectedP13nInstrument();

      if (selectedInstrument && selectedInstrument.method === 'card') {
        /*
         * Add cvv to data from the currently selected method (p13n)
         * TODO: figure out a better way to do this.
         */
        var $cvvEl = _Doc.querySelector(
          '#instruments-list > .selected input.input'
        );

        if ($cvvEl) {
          if ($cvvEl.value.length === $cvvEl.maxLength) {
            data['card[cvv]'] = $cvvEl.value;
          } else {
            $cvvEl.focus();
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

  getSelectedP13nInstrument: function() {
    if (!this.p13n) {
      return;
    }

    return this.homeTab.getSelectedInstrument();
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
      .catch(function() {
        self.showLoadError(
          'Invalid VPA, please try again with correct VPA',
          true
        );
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

    if (!shouldContinue) {
      return;
    }

    var session = this;
    var request = {
      feesRedirect: preferences.fee_bearer && !('fee' in data),
      optional: getStore('optional'),
      external: {},
      paused: this.get().paused,
    };

    if (!this.screen) {
      var selectedInstrument = this.getSelectedP13nInstrument();

      if (selectedInstrument) {
        this.doneByP13n = P13n.addInstrumentToPaymentData(
          data,
          selectedInstrument,
          this.getCustomer(getPhone())
        );

        /* TODO: the following code is the hack for ftx (2018), fix it properly */
        if (this.doneByP13n) {
          Analytics.setMeta('doneByP13n', true);
          if (
            ['card', 'emi', 'wallet'].indexOf(selectedInstrument.method) > -1
          ) {
            this.switchTab(selectedInstrument.method);
          } else if (
            selectedInstrument.method === 'upi' &&
            selectedInstrument['_[upiqr]'] === '1'
          ) {
            return this.switchTab('qr');
          }
        }
      }
    }

    if (data.method === 'paypal') {
      data.method = 'wallet';
      data.wallet = 'paypal';
    }

    // ask user to verify phone number if not logged in and wants to save card
    if (data.save && !this.customer.logged) {
      if (this.screen === 'card') {
        this.otpView.updateScreen({
          skipText: 'Skip saving card',
        });
        this.commenceOTP(strings.otpsend);
        debounceAskOTP(this.otpView, undefined, true);
        return this.customer.createOTP();
      } else if (!this.headless) {
        request.message = 'Verifying OTP...';
        request.paused = true;
      }
    }
    delete data.app_token;

    if (this.get('address') && !(this.order && this.order.partial_payment)) {
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

    /**
     * Wallets might need to go through intent flow too
     * TODO: Add a feature check here
     */
    if (data.method === 'wallet') {
      var shouldTurnWalletToIntent = discreet.Wallet.shouldTurnWalletToIntent(
        data.wallet,
        this.upi_intents_data
      );

      if (shouldTurnWalletToIntent) {
        data.upi_app = discreet.Wallet.getPackageNameForWallet(data.wallet);
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

    if (appliedOffer) {
      // Set offer ID based on offer type
      switch (appliedOffer._type) {
        case 'api':
          data.offer_id = appliedOffer.id;
          break;

        case 'local':
          data['notes[offer_id]'] = appliedOffer.id;
          break;
      }
      this.r.display_amount = appliedOffer.amount;
      Analytics.track('offers:applied_with_payment', {
        data: appliedOffer,
      });
    } else {
      delete this.r.display_amount;
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

    if (data.method === 'card' || data.method === 'emi') {
      this.nativeotp = !!this.shouldUseNativeOTP();

      var cardType = getCardTypeFromPayload(data, this.transformedTokens);
      var shouldUseNativeOTP = false;
      if (data.method === 'card') {
        if (
          this.nativeotp &&
          discreet.Flows.shouldUseNativeOtpForCardPayment(
            data,
            this.transformedTokens
          )
        ) {
          shouldUseNativeOTP = true;
        }
      } else if (data.method === 'emi') {
        if (cardType === 'bajaj') {
          shouldUseNativeOTP = true;

          BackStore = {
            tab: 'emi',
            screen: 'emi',
          };
        } else if (
          getIssuerForEmiFromPayload(data, this.transformedTokens) === 'HDFC_DC'
        ) {
          // Skip Native OTP for EMI with HDFC Debit Cards
          shouldUseNativeOTP = false;
        }
      }

      if (shouldUseNativeOTP) {
        this.headless = true;
        Analytics.track('native_otp:attempt');
        this.setScreen('otp');
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
      this.commenceOTP(wallet + ' account', true);
    } else if (this.isOmnichannel()) {
      this.showOmnichannelLoader(strings.gpay_omnichannel);
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

    if (this.p13n) {
      this.p13nInstrument = P13n.processInstrument(data, this);
    }

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
        debounceAskOTP(that.otpView, message);
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

        if (that.isOmnichannel()) {
          that.showOmnichannelLoader(that.getOmnichannelMessage());
        } else {
          that.showLoadError(
            "Please accept the request from Razorpay's VPA on your UPI app"
          );
        }
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
      setEmiBank(data, this.savedCardScreen);
      if (this.recurring) {
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

  close: function() {
    if (this.prefCall) {
      this.prefCall.abort();
      this.prefCall = null;
    }

    if (this.isOpen) {
      var cancelReason = this.getCancelReason();

      this.hideTimer();
      abortAjax(this.ajax);
      this.clearRequest(cancelReason);
      this.isOpen = false;
      clearTimeout(fontTimeout);

      // TODO: refactor this into cleanupSvelteComponents.
      if (this.otpView) {
        this.otpView.$destroy();
      }

      if (this.payoutsView) {
        this.payoutsView.$destroy();
      }

      if (this.payoutsAccountView) {
        this.payoutsAccountView.$destroy();
      }

      if (this.netbankingTab) {
        this.netbankingTab.$destroy();
      }

      if (this.upiTab) {
        this.upiTab.$destroy();
      }

      if (this.emiScreenView) {
        this.emiScreenView.$destroy();
      }

      if (this.nachScreen) {
        this.nachScreen.$destroy();
      }

      if (this.bankTransferView) {
        this.bankTransferView.$destroy();
      }

      if (this.savedCardsView) {
        this.savedCardsView.$destroy();
      }

      if (this.feeBearerView) {
        this.feeBearerView.$destroy();
      }

      if (this.payLaterView) {
        this.payLaterView.$destroy();
      }

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

      this.tab = this.screen = '';
      this.modal = this.emi = this.el = this.card = null;
      this.upiTab = this.otpView = this.netbankingTab = null;
      this.payoutsView = this.payoutsAccountView = null;
      this.savedCardsView = this.feeBearerView = this.payLaterView = null;
      this.nachScreen = null;

      this.isOpen = false;
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

  setEmiOptions: function() {
    var emiBanks = {};
    var preferences = this.preferences;
    var prefEmiOptions = preferences.methods.emi_options;
    var amount = this.get('amount');
    var eligibleEmiOptions = discreet.EmiUtils.getEligibleBanksBasedOnMinAmount(
      amount,
      prefEmiOptions
    );

    each(Bank.emiBanks, function(i, bank) {
      var emiBank = {
        name: bank.name,
        patt: bank.patt,
        code: bank.code,
        plans: {},
        min_amount: Infinity,
      };

      if (eligibleEmiOptions) {
        each(eligibleEmiOptions[bank.code], function(j, plan) {
          emiBank.plans[plan.duration] = plan;
        });

        if (eligibleEmiOptions[bank.code]) {
          emiBank.min_amount = discreet.EmiUtils.getMinimumAmountFromPlans(
            eligibleEmiOptions[bank.code]
          );

          emiBanks[bank.code] = emiBank;
        }
      }
    });

    var emiOptions = {
      banks: emiBanks,
    };

    // Minimum amount for BAJAJ is sent from API
    if (emiOptions.banks['BAJAJ']) {
      CardlessEmi.extendConfig('bajaj', {
        min_amount: emiOptions.banks['BAJAJ'].min_amount,
      });
    }

    this.emi_options = emiOptions;
  },

  setPaymentMethods: function(preferences) {
    var recurring = this.recurring;
    var international = this.international;
    var availMethods = preferences.methods;
    var amount = this.get('amount');
    var bankMethod = 'netbanking';
    var passedWallets = this.get('method.wallet');
    var self = this;
    var session = this;
    var emi_options = this.emi_options;
    var qrEnabled =
      this.get('method.qr') &&
      !window.matchMedia(discreet.UserAgent.mobileQuery).matches;

    var methods = (this.methods = {
      count: 0,
    });

    /* Set recurring payment methods*/
    if (recurring) {
      availMethods = availMethods.recurring || {};
      var banks = {};

      /* emandate recurring */
      if (availMethods.emandate) {
        bankMethod = 'emandate';
        this.emandate = true;

        var emandateBanks = {};

        /**
         * There may be multiple auth types present for each bank
         * but right now, we'll only support those that have
         * netbanking and debitcard as auth types.
         */
        var emandateSupportedAuthTypes = ['netbanking', 'debitcard'];
        var authTypeFromOrder = session.order && session.order.auth_type;

        /**
         * If an auth_type is there in order,
         * we only show banks with that auth_type
         */
        if (authTypeFromOrder) {
          emandateSupportedAuthTypes = [authTypeFromOrder];
        }

        each(availMethods[bankMethod], function(bankCode, bankObj) {
          var eligibleAuthTypesOfBank = [];

          /**
           * Determine if the bank has any of the supported auth types
           */
          if (bankObj.auth_types) {
            eligibleAuthTypesOfBank = _Arr.filter(bankObj.auth_types, function(
              authType
            ) {
              return _Arr.contains(emandateSupportedAuthTypes, authType);
            });
          }

          if (eligibleAuthTypesOfBank.length) {
            emandateBanks[bankCode] = _Obj.clone(bankObj);
            emandateBanks[bankCode].auth_types = eligibleAuthTypesOfBank;
          }
        });

        // Set available banks
        this.emandateBanks = emandateBanks;

        // Update the list of banks to available banks
        _Obj.loop(emandateBanks, function(bankDetails, bankCode) {
          banks[bankCode] = bankDetails.name;
        });
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

      /* paper nach */
      if (
        availMethods.nach &&
        preferences.order &&
        preferences.order.method === 'nach'
      ) {
        availMethods = {
          nach: true,
          count: 1,
        };
        this.nach = true;
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
     * - No EMI banks are present
     * - Either of Card or EMI methods are disabled
     */
    if (
      international ||
      recurring ||
      _Obj.isEmpty(emi_options.banks) ||
      !(methods.emi || methods.card)
    ) {
      methods.emi = false;
    }

    if (availMethods.debit_card && !availMethods.credit_card) {
      tab_titles.card = tab_titles.debit_card;
    } else {
      tab_titles.card = 'Card';
    }

    /**
     * If forced offer has method EMI
     * - Show only EMI Screen
     * - Trigger oneMethod
     */

    var forcedOffer =
      this.forcedOffer ||
      discreet.Offers.getForcedOffer({
        preferences: preferences,
      });
    if (forcedOffer) {
      var paymentMethod = forcedOffer.payment_method;
      if (paymentMethod === 'emi') {
        delete methods.card;
        methods.count++;
      }
    }

    /**
     *  disable UPI if:
     * - amount > 1 Lac
     * - Recurring payment
     * - Non INR payment
     * - international
     */
    if (amount > 1e7 || recurring || international) {
      methods.upi = false;
    }

    if (emi_options.banks['BAJAJ']) {
      /**
       * methods.cardless_emi will be undefined in case cardless EMI is not enabled.
       * methods.cardless_emi will be [] in case no provider is enabled.
       */
      if (!methods.cardless_emi || _.isArray(methods.cardless_emi)) {
        methods.cardless_emi = {
          bajaj: true,
        };
      } else {
        methods.cardless_emi.bajaj = true;
      }

      /**
       * If merchant wanted cardless EMI to be disabled,
       * but Bajaj Finserv was enabled,
       * it would need to be enabled again.
       */
      this.set('method.cardless_emi', methods.cardless_emi);
    }

    /**
     * Get eligible cardless EMI providers
     */
    methods.cardless_emi = CardlessEmi.getEligibleProvidersBasedOnMinAmount(
      amount,
      methods.cardless_emi
    );
    /**
     * Disable Cardless EMI if
     * - no providers
     * - international
     */
    if (_Obj.isEmpty(methods.cardless_emi) || international) {
      methods.cardless_emi = null;
    }

    /**
     * Disable PayLater if either:
     * - Empty array
     * - international
     * TODO: Allow this for prefill and logged in users.
     */
    if (_Obj.isEmpty(methods.paylater) || international) {
      methods.paylater = null;
    }

    var isPayPalAvailable = Boolean(methods.wallet && methods.wallet.paypal);

    /**
     * disable wallets if:
     * - amount > 20k
     * - Wallets not enabled by backend
     * - Recurring payment
     * - Non INR payment
     * - international
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
    } else if (typeof passedWallets === 'object' && methods.wallet) {
      each(passedWallets, function(wallet, enabled) {
        if (enabled === false) {
          delete methods.wallet[wallet];
        }
      });
    }

    /**
     * PayPal wallet becomes a method
     * for international payments
     */
    if (international && isPayPalAvailable) {
      methods.paypal = true;
      methods.count++;
    }

    /**
     * Emandate and Paper Nach only work on amount of 0
     */
    if (amount > 0) {
      if (methods.emandate) {
        methods.emandate = false;
      }

      if (methods.nach) {
        methods.nach = false;
      }
    }

    /* enable or disable netbanking tab on the basis of preferences */
    if (
      !methods[bankMethod] ||
      methods[bankMethod] instanceof Array ||
      international
    ) {
      methods[bankMethod] = false;
    } else {
      methods.count++;
    }

    if (methods.bank_transfer) {
      if (this.get('order_id')) {
        methods.count++;
      } else {
        methods.bank_transfer = false;
      }
    }

    if (methods.card) {
      methods.count++;
    }

    if (methods.emi || methods.cardless_emi) {
      methods.count++;
    }

    if (methods.upi) {
      methods.count++;
      if (qrEnabled) {
        methods.qr = true;

        /**
         * Do not increase the count since we don't
         * want to show QR in intial list of
         * payment options anymore.
         */
        // methods.count++;
      }

      if (this.separateGPay) {
        methods.count++;
        methods.gpay = true;
      }
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

    if (_.isArray(methods.wallet) && methods.wallet.length === 0) {
      methods.wallet = null;
    }

    if (methods.paylater) {
      methods.count++;
    }
  },

  /**
   * Sets offers for this session
   * @param {Object} preferences
   */
  setOffers: function(preferences) {
    var allOffers = discreet.Offers.createOffers({
      preferences: preferences,
      session: this,
    });

    this.eligibleOffers = allOffers.offers;

    this.hasOffers = allOffers.offers.length > 0;
    this.forcedOffer = allOffers.forcedOffer;

    if (this.hasOffers) {
      Analytics.setMeta('hasOffers', true);
    }

    if (this.forcedOffer) {
      Analytics.setMeta('forcedOffer', true);
    }

    if (this.forcedOffer) {
      var paymentMethod = this.forcedOffer.payment_method;

      if (['emi', 'card', 'wallet'].indexOf(paymentMethod) >= 0) {
        // need this while preparing the template
        this[paymentMethod + 'Offer'] = preferences.offers[0];
      }

      Analytics.track('offers:forced', {
        data: this.forcedOffer,
      });
    }
  },

  /**
   * Returns the currently applied offer
   *
   * @returns {Offer}
   */
  getAppliedOffer: function() {
    return this.forcedOffer || (this.offers && this.offers.appliedOffer);
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
      methodDescription = 'Bank';
    } else if (screen === 'upi') {
      methodDescription = 'VPA';
    } else {
      methodDescription = titleCase(this.screen);
    }

    this.offers.showError(methodDescription, cb);
  },

  getCustomer: function() {
    return getCustomer.apply(null, arguments);
  },
  isOmnichannel: function() {
    return (
      this.preferences.features &&
      this.preferences.features.google_pay_omnichannel &&
      this.upiTab &&
      this.upiTab.selectedApp === 'gpay' &&
      this.upiTab.omnichannelType === 'phone'
    );
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
        _Arr.loop(['ifsc', 'name', 'account_number'], function(key) {
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
    PreferencesStore.set(prefs);
    DowntimesStore.set(discreet.Downtimes.getDowntimes(prefs));
    this.r.preferences = prefs;
    this.preferences = prefs;
    preferences = prefs;

    this.tab_titles = tab_titles;

    var self = this,
      customer,
      saved_customer = preferences.customer,
      filters = {},
      session_options = this.get(),
      order = (this.order = preferences.order),
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

    this.isPayout = Boolean(this.get('payout'));

    if (this.isPayout) {
      Analytics.setMeta('payout', true);

      // We are disabling retries for payouts for now.
      this.set('retry', false);
    }

    /* In case of recurring set recurring as filter in saved cards */
    if (
      (session_options['prefill.method'] === 'emandate' &&
        (preferences.methods || {}).recurring) ||
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

      customer = this.getCustomer(saved_customer.contact);
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

    /* disable cardsaving if cookies disabled or optional contact with no
     * prefill */
    if (
      cookieDisabled ||
      (getStore('optional').contact && !session_options['prefill.contact'])
    ) {
      options.remember_customer = false;
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

    // Non-INR payments are considered international
    this.international =
      (session_options.currency || this.get('currency')) !== 'INR';

    // Amount and currency have been updated, set EMI options
    this.setEmiOptions();
    // set orderid as it is required while creating payments
    if (prefs.invoice) {
      this.r.set('order_id', prefs.invoice.order_id);
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
      order.method !== 'upi' &&
      order.method !== 'emandate' // Should these just be a check for order.method=netbanking?
    ) {
      session_options.redirect = true;
      this.tpvRedirect = true;

      var paymentPayload = {
        amount: session_options.amount,
        bank: order.bank,
        contact: this.get('prefill.contact') || '9999999999',
        email: this.get('prefill.email') || 'void@razorpay.com',
        method: 'netbanking',
      };

      return this.r.createPayment(paymentPayload, {
        fee: preferences.fee_bearer,
      });
    }

    if (IRCTC_KEYS.indexOf(this.get('key')) !== -1) {
      this.irctc = true;
      this.separateGPay = true;
    }

    try {
      discreet.validateOverrides(this);
    } catch (e) {
      return {
        error: e.message,
      };
    }

    /* set payment methods on the basis of preferences */
    this.setPaymentMethods(preferences);

    // Set Offers
    this.setOffers(preferences);

    // Set optional fields in meta
    Analytics.setMeta(
      'optional.contact',
      _Arr.contains(preferences.optional || [], 'contact')
    );
    Analytics.setMeta(
      'optional.email',
      _Arr.contains(preferences.optional || [], 'email')
    );

    return {};
  },

  showModal: function(preferences) {
    var qpmap = _Obj.unflatten(getQueryParams());

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
          data: response.error,
        });
      }

      var preferences = response;

      var validation = self.setPreferences(preferences);

      /* pass preferences options to SDK */
      Bridge.checkout.callAndroid(
        'setMerchantOptions',
        JSON.stringify(preferences.options)
      );

      if (self.tpvRedirect) {
        return;
      }

      callback({
        preferences: preferences,
        validation: validation,
      });
    });

    /* Start listening for back presses */
    discreet.Bridge.setHistoryAndListenForBackPresses();

    return this.prefCall;
  },

  fetchFundAccounts: function() {
    return Payouts.fetchFundAccounts(this.get('contact_id'));
  },

  hideOverlayMessage: hideOverlayMessage,
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
