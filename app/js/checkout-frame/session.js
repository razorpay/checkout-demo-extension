/**
 * The following are globals are defined here to avoid es-lint errors
 */

/* global discreet */
/* global Razorpay */
/* global Analytics */
/* global AnalyticsTypes */
/* global gel */
/* global P13n */

// The following are globals from app/js/lib/util
// These have to be removed while refactoring

/* global Wallet */
/* global each */
/* global abortAjax */
/* global bind */
/* global isString */
/* global clone */
/* global preventDefault */
/* global qs */
/* global invoke */
/* global noop */
/* global isNonNullObject */
/* global $$ */
/* global emo */
/* global doc */
/* global now */
/* global roll */

// from init checkout-frame
/* global SessionManager */

var ua = navigator.userAgent;

var preferences,
  $ = discreet.$,
  WebPaymentsApi = discreet.WebPaymentsApi,
  CheckoutBridge = window.CheckoutBridge,
  StorageBridge = window.StorageBridge,
  Promise = discreet.Promise,
  Bridge = discreet.Bridge,
  isIframe = window !== parent,
  ownerWindow = isIframe ? parent : opener,
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
  RazorpayHelper = discreet.RazorpayHelper,
  MethodStore = discreet.MethodStore,
  UPIUtils = discreet.UPIUtils,
  UTILS = discreet.UTILS,
  _Arr = discreet._Arr,
  _ = discreet._,
  _Obj = discreet._Obj,
  docUtil = discreet.docUtil,
  _El = discreet._El,
  Hacks = discreet.Hacks,
  Form = discreet.Form,
  CardlessEmi = discreet.CardlessEmi,
  PayLater = discreet.PayLater,
  PayLaterView = discreet.PayLaterView,
  OtpService = discreet.OtpService,
  storeGetter = discreet.storeGetter,
  HomeScreenStore = discreet.HomeScreenStore,
  CardScreenStore = discreet.CardScreenStore,
  NetbankingScreenStore = discreet.NetbankingScreenStore,
  UpiScreenStore = discreet.UpiScreenStore,
  CustomerStore = discreet.CustomerStore,
  EmiStore = discreet.EmiStore,
  Cta = discreet.Cta,
  es6components = discreet.es6components,
  cardTab = discreet.cardTab,
  NBHandlers = discreet.NBHandlers,
  CommonHandlers = discreet.CommonHandlers,
  Instruments = discreet.Instruments,
  I18n = discreet.I18n,
  NativeStore = discreet.NativeStore,
  Confirm = discreet.Confirm,
  Backdrop = discreet.Backdrop,
  FeeLabel = discreet.FeeLabel,
  rewardsStore = discreet.rewardsStore,
  BlockedDeactivatedMerchant = discreet.BlockedDeactivatedMerchant,
  updateScore = discreet.updateScore,
  trackUpiIntentInstrumentPaymentAttempted =
    discreet.trackUpiIntentInstrumentPaymentAttempted,
  CovidDonationView = discreet.CovidDonations,
  Header = discreet.Header,
  address = discreet.address,
  OneClickCheckoutStore = discreet.OneClickCheckoutStore,
  dynamicFeeObject = discreet.dynamicFeeObject,
  views = discreet.views,
  CardViews = discreet.CardViews,
  merchantAnalytics = discreet.merchantAnalytics,
  merchantAnalyticsConstant = discreet.merchantAnalyticsConstant,
  TopbarMagicCheckoutStore = discreet.TopbarMagicCheckoutStore,
  AccountTabStore = discreet.AccountTabStore,
  SecurityUtils = discreet.SecurityUtils;

// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone|iPad/.test(ua);
var ua_iPhone = /iPhone/.test(ua);

// .shown has display: none from iOS ad-blocker
// using दृश्य, which will never be seen by tim cook
var shownClass = 'drishy';

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

var METHODS = discreet.CommonConstants.METHODS;
var V1_5_EXPERIMENT_ENABLED = discreet.Constants.V1_5_EXPERIMENT_ENABLED;

/**
 * Store for what tab and screen
 * should be shown when back is pressed.
 */
var BackStore = null;

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
  each($(container).find('input[name],select[name]'), function (i, el) {
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
 * This is right place to call methods that require updated contact all time (pre-filled/edited/API-filled)
 * @param {Session} session
 */
function improvisePrefilledContact(session) {
  var prefilledContact = session.get('prefill.contact');
  var prefilledEmail = session.get('prefill.email');

  if (RazorpayHelper.shouldStoreCustomerInStorage()) {
    var storedUserDetails = discreet.ContactStorage.get();

    // Pick details from storage if not given in prefill
    if (!prefilledContact && storedUserDetails.contact) {
      prefilledContact = storedUserDetails.contact;
      Analytics.setMeta('prefilledFromStorage.contact', true);
    }
    if (!prefilledEmail && storedUserDetails.email) {
      prefilledEmail = storedUserDetails.email;
      Analytics.setMeta('prefilledFromStorage.email', true);
    }
  }

  if (prefilledContact) {
    // Do have invalid characters?
    if (doesContactHaveValidCharacters(prefilledContact)) {
      var formattedContact =
        discreet.CountryCodesUtil.findCountryCode(prefilledContact);
      var newContact = '+' + formattedContact.code + formattedContact.phone;

      if (prefilledContact !== newContact) {
        prefilledContact = newContact;

        Analytics.setMeta('improvised.prefilledContact', true);

        Analytics.track('prefill:improvise', {
          data: {
            type: 'contact',
            from: prefilledContact,
            to: newContact,
          },
        });
      }
    } else {
      Analytics.track('prefill:invalid:chars', {
        data: {
          type: 'contact',
          value: prefilledContact,
        },
      });
    }

    discreet.CRED.checkCREDEligibilityForUpdatedContact(prefilledContact);
  }

  // Update prefills
  session.set('prefill.contact', prefilledContact);
  session.set('prefill.email', prefilledEmail);
}

function setEmiBank(data) {
  var activeEmiPlan = EmiStore.getEmiDurationForNewCard();
  if (activeEmiPlan) {
    data.method = 'emi';
    data.emi_duration = activeEmiPlan;
  }
}

function makeVisible(subject) {
  $(subject)
    .attr('data-hidden', null)
    .css('display', 'block')
    .reflow()
    .addClass(shownClass);
}

function makeHidden(subject) {
  subject = $(subject);
  subject.attr('data-hidden', true);
  if (subject[0]) {
    subject.removeClass(shownClass);
    setTimeout(function () {
      if (subject.attr('data-hidden')) {
        subject.hide();
      }
    }, 200);
  }
}

function toggle(subject, showOrHide) {
  (showOrHide ? makeVisible : makeHidden)(subject);
}

function showOverlay($with) {
  Backdrop.show();
  if ($with) {
    makeVisible($with[0]);
  }
}

function hideOverlay($with) {
  Backdrop.hide();
  if ($with) {
    makeHidden($with[0]);
  }
}

function hideRecurringCardsOverlay() {
  var recurringCardsWrap = $('#recurring-cards-wrap');
  var wasShown = recurringCardsWrap.hasClass(shownClass);
  if (wasShown) {
    hideOverlay(recurringCardsWrap);
  }
  return wasShown;
}

function hideEmi() {
  var emic = $('#emi-wrap');
  var wasShown = emic.hasClass(shownClass);
  if (wasShown) {
    hideOverlay(emic);
  }
  return wasShown;
}

function hideDowntimeAlert() {
  var downtimeWrap = $('#downtime-wrap');
  if (!downtimeWrap || !downtimeWrap[0]) {
    return false;
  }
  var wasShown = downtimeWrap.hasClass(shownClass);
  if (wasShown) {
    hideOverlay(downtimeWrap);
  }
  return wasShown;
}

function hideOverlayMessage() {
  var session = SessionManager.getSession();
  session.preventErrorDismissal = false;
  if (
    !hideEmi() &&
    !hideRecurringCardsOverlay() &&
    !hideDowntimeAlert() &&
    !session.hideSvelteOverlay()
  ) {
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
  /**
   * response.error could be a json object or json string
   * in case of android mobile sdk - error is a json string inside response
   * for which one more level of parsing is required.
   * For web and other cases, error is an object
   */
  if (isString(error)) {
    try {
      error = JSON.parse(error);
    } catch (e) {
      return;
    }
  }

  var untranslatedMessage = error.description;

  var message = I18n.translateErrorDescription(
    untranslatedMessage,
    I18n.getCurrentLocale()
  );

  error.description = message;
  var cancelMsg = I18n.format('misc.payment_canceled');

  if (error.metadata) {
    this.ajaxErrorMetadata = error.metadata;
  }

  Analytics.track('error:metadata', {
    data: {
      errorMetadata: error.metadata,
    },
  });

  // Both checks are there because API still returns message in English.
  if (message === cancelMsg || message === discreet.cancelMsg) {
    if (this.powerwallet) {
      // prevent payment canceled error
      this.powerwallet = null;
      return;
    } else if (this.nativeotp && this.tab === 'card') {
      this.markHeadlessFailed();
      return;
    }
  }

  // Save payload in a variable, as it's going to get cleared and
  // we need it for something else.
  var payload = this.payload;

  this.clearRequest();
  updateScore('failedPayment');
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

  if (this.get('retry') === false && !this.get('redirect')) {
    return this.modal.hide();
  }

  var err_field = error.field;
  // TODO: Don't rely on this.tab === 'wallet'
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

      setTimeout(function () {
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
          updateScore('clickOnSubmitWithoutDetails');
          Form.shake();
          return hideOverlayMessage();
        }
      }
    }
  }

  if (this.tab || (message !== cancelMsg && message !== discreet.cancelMsg)) {
    this.showLoadError(
      message || I18n.format('misc.error_handling_request'),
      true
    );
  }

  if (this.get('retry') === false && this.get('redirect')) {
    if (this.screen === 'otp' && this.otpView) {
      this.otpView.updateScreen({
        action: 'closeAndDismiss',
      });
    }
    return CommonHandlers.updateActionAreaContentAndCTA(
      this,
      'Go Back',
      'Payment failed. Go back to initiate the payment again.',
      true
    );
  }

  NBHandlers.replaceRetryIfCorporateNetbanking(this, message);

  // Conditionally replace retry button with Pay with Paypal depending on error metadata
  CommonHandlers.addRetryPaymentMethodOnErrorModal.call(this, error.metadata);
}

/* bound with session */
function cancelHandler(response) {
  if (!this.payload) {
    return;
  }
  updateScore('cancelledPayment');
  Analytics.setMeta('payment.cancelled', true);
  this.markHeadlessFailed();

  if (this.payload.method === 'upi' && this.payload['_[flow]'] === 'intent') {
    if (this.r._payment && this.r._payment.upi_app) {
      discreet.UPIUtils.trackUPIIntentFailure(this.r._payment.upi_app);
    }
    if (!(response && response.upiNoApp)) {
      this.showLoadError(I18n.format('misc.payment_incomplete'), true);
    }
  } else if (
    /^(card|emi)$/.test(this.payload.method) &&
    this.screen &&
    this.screen !== 'card'
  ) {
    if (cardTab.getCardTypeFromPayload(this.payload) === 'bajaj') {
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

function getProxyPhone() {
  return storeGetter(HomeScreenStore.proxyContact);
}

function getEmail() {
  return storeGetter(HomeScreenStore.email);
}

function elfShowOTP(otp, sender, bank) {
  window.handleOTP(otp);
}

function askOTP(
  view,
  textView,
  shouldLimitResend,
  templateData,
  headingText,
  errorMessage,
  isRazorpayOTP
) {
  var origText = textView; // ಠ_ಠ
  var qpmap = _.getQueryParams();
  var thisSession = SessionManager.getSession();
  var session = thisSession;
  var paymentId = _Obj.getSafely(session, 'r._payment.payment_id');
  var paymentData = OtpService.getPaymentData(paymentId);

  if (paymentId && !paymentData) {
    paymentData = {
      timestamp: Date.now(),
    };
    if (isNonNullObject(origText) && !origText.error) {
      if (thisSession.headless) {
        paymentData.goToBank = origText.redirect;
      }
      if (origText.metadata) {
        paymentData.metadata = origText.metadata;
      }
    }
    OtpService.setPaymentData(paymentId, paymentData);
  }

  var isWallet = session.payload && session.payload.method === 'wallet';

  // Track if OTP was invalid
  if (textView === 'incorrect_otp_retry') {
    Analytics.track('otp:invalid', {
      data: {
        wallet: isWallet,
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
  if (isNonNullObject(textView)) {
    textView = textView.error && textView.error.description;
  }

  var otpProperties = {
    loading: false,
    action: false,
    digits: new Array(storeGetter(discreet.OTPScreenStore.maxlength)),
    otp: '',
    allowResend: shouldLimitResend ? OtpService.canSendOtp('razorpay') : true,
    errorMessage: errorMessage,
    isRazorpayOTP: !!isRazorpayOTP,
  };

  if (RazorpayHelper.isASubscription()) {
    _Obj.extend(otpProperties, {
      allowSkip: session.get('subscription_card_change') ? false : true,
    });
  }

  view.updateScreen(otpProperties);

  if (thisSession.headless) {
    if (paymentData.goToBank) {
      view.updateScreen({
        skipTextLabel: 'complete_bank_page',
      });
    }
    view.updateScreen({
      allowSkip: paymentData.goToBank,
    });
  }

  $('#body').addClass('sub');

  var isOneCC = RazorpayHelper.isOneClickCheckout();

  var isOneCCOtpScreen = isOneCC && isRazorpayOTP && thisSession.tab === 'card';

  if (!textView) {
    if (thisSession.tab === 'card' || thisSession.tab === 'emi') {
      if (thisSession.headless) {
        Analytics.track('native_otp:otp:ask');
        textView = 'otp_sent_no_phone';
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
              thisSession.setOneCCTabLogo(bankLogo);
            }

            view.updateScreen({
              ipAddress: metadata.ip,
              accessTime: paymentData.timestamp,
              resendTimeout:
                paymentData.timestamp +
                (Number(metadata.resend_timeout) + 1) * 1000,
            });

            if (metadata.contact) {
              textView = 'otp_sent_phone';
              if (!templateData) {
                templateData = {};
              }
              templateData.phone = metadata.contact;
            }
          }

          if (origText.mode === 'hdfc_debit_emi') {
            var next = _Obj.getSafely(origText, 'request.content.next');
            // HDFC Debit EMI next array is same as wallet.
            // It's "resend_otp" not "otp_resend".
            if (!next || next.indexOf('resend_otp') === -1) {
              view.updateScreen({
                allowResend: false,
              });
            }
            // Don't show secondary action like go to bank in HDFC Debit EMI
            view.updateScreen({
              allowSkip: false,
            });
          } else {
            if (!origText.next || origText.next.indexOf('otp_resend') === -1) {
              view.updateScreen({
                allowResend: false,
              });
            }
          }

          if (!thisSession.get('timeout')) {
            thisSession.timer = discreet.showTimer(
              now() + 3 * 60 * 1000,
              function () {
                thisSession.hideTimer();
                thisSession.back(true);
                setTimeout(function () {
                  Analytics.track('native_otp:timeout');
                  thisSession.showLoadError(
                    I18n.format('misc.payment_timeout'),
                    true
                  );
                }, 300);
              }
            );
          }
        }
      } else {
        if (thisSession.payload) {
          textView = isOneCC
            ? 'otp_sent_save_card_one_cc'
            : 'otp_sent_save_card';
        } else {
          textView = isOneCC
            ? 'otp_sent_access_card_one_cc'
            : 'otp_sent_access_card';
        }
      }
    } else {
      textView = isOneCC ? 'otp_sent_generic_one_cc' : 'otp_sent_generic';
    }
  } else if (isOneCCOtpScreen) {
    if (thisSession.payload) {
      textView = 'otp_sent_save_card_one_cc';
    } else {
      textView = 'otp_sent_access_card_one_cc';
    }
  }

  view.updateScreen({
    headingText: headingText || isOneCCOtpScreen ? 'default_login' : '',
  });
  view.setTextView(textView, templateData);
}

// this === Session
function successHandler(response) {
  if (this.preferredInstrument) {
    updateScore('savedInstrument');
    P13n.recordSuccess(
      this.preferredInstrument,
      this.getCurrentCustomer(this.payload && this.payload.contact)
    );
  }
  updateScore('paymentSuccess');
  this.clearRequest();
  // prevent dismiss event
  this.modal.options.onhide = UTILS.returnAsIs;

  // sending oncomplete event because CheckoutBridge.oncomplete

  function completeCheckoutFlow() {
    Razorpay.sendMessage({ event: 'complete', data: response });
    this.hide();
  }
  hideOverlayMessage();
  if (this.preferences.show_donation) {
    new CovidDonationView.render(completeCheckoutFlow.bind(this));
  } else {
    completeCheckoutFlow.call(this);
  }
  showOverlay(this.getCovidDonationDialog());
}

function cancel_upi(session) {
  $('#error-message').addClass('cancel_upi');
  session.r.on('payment.error', function () {
    $('#error-message').removeClass('cancel_upi');
  });
}

function Session(message) {
  var options = message.options;
  var v_1_5_experiment_enabled =
    message.options[V1_5_EXPERIMENT_ENABLED] || false;
  var self = this;

  this.r = Razorpay(options);
  this.get = this.r.get;
  this.set = this.r.set;
  this.tab = this.screen = '';

  this.set(V1_5_EXPERIMENT_ENABLED, v_1_5_experiment_enabled);
  Analytics.setMeta(V1_5_EXPERIMENT_ENABLED, v_1_5_experiment_enabled);

  each(message, function (key, val) {
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
  showAmountInTopBar: function () {
    $('#amount').show();
  },

  hideAmountInTopBar: function () {
    $('#amount').hide();
  },

  shouldUseNativeOTP: function () {
    return this.get('nativeotp') && this.r.isLiveMode();
  },

  formatAmount: function (amount) {
    var displayCurrency = this.r.get('display_currency');
    var currency = this.r.get('currency');

    return discreet.Currency.formatAmount(amount, displayCurrency || currency);
  },

  formatAmountWithCurrencyInMinor: function (amount) {
    var currency = this.get('currency');
    var config = discreet.Currency.getCurrencyConfig(currency);
    var multiplier = Math.pow(10, config.decimals);

    var value = parseInt((amount * multiplier).toFixed(config.decimals));

    return this.formatAmountWithCurrency(value);
  },

  formatAmountWithCurrency: function (amount) {
    var amountFigure = this.formatAmount(amount);
    var displayCurrency = this.r.get('display_currency');
    var displayAmount = this.r.get('display_amount');
    var currency = this.r.get('currency');

    if (displayCurrency && displayAmount) {
      // TODO: handle display_amount case as in modal.jst

      amount = discreet.currencies[displayCurrency] + ' ' + displayAmount;
    } else {
      amount = discreet.currencies[currency] + ' ' + amountFigure;
    }

    return amount;
  },
  setFeeLabel: function () {
    if (
      RazorpayHelper.isCustomerFeeBearer() ||
      RazorpayHelper.isOneClickCheckout()
    ) {
      FeeLabel.show();
    }
  },

  // so that accessing this.data would not produce error
  data: emo,
  params: emo,

  /**
   * Update the amount in header.
   *
   * @param {Number} amount
   */
  updateAmountInHeader: function (amount, fee) {
    if (fee) {
      $('#amount .original-amount').hide();
    } else {
      $('#amount .original-amount').rawHtml(
        this.formatAmountWithCurrency(amount)
      );
      if ($('#amount .original-amount')[0]) {
        $('#amount .original-amount')[0].removeAttribute('style');
      }
    }
    Header.updateAmountFontSize();
  },
  updateAmountInHeaderForOffer: function (amount, fee) {
    if (fee || RazorpayHelper.isOneClickCheckout()) {
      $('#amount .original-amount').hide();
    }
    $('#amount .discount').rawHtml(this.formatAmountWithCurrency(amount));
    //$('#amount .original-amount').hide();
    Header.updateAmountFontSize();
  },

  /**
   * Set the amount in header.
   *
   * @param {String} html
   */
  setRawAmountInHeader: function (html, isRawHtml) {
    if (isRawHtml) {
      $('#amount .original-amount').rawHtml(html);
    } else {
      $('#amount .original-amount').html(html);
    }
  },

  /**
   * Returns the Payment instance for the current payment.
   *
   * @return {Payment}
   */
  getPayment: function () {
    return this.r._payment;
  },

  getEl: function () {
    var r = this.r;
    if (!this.el) {
      this.setTheme();
      this.mainModal = new discreet.MainModal({ target: document.body });

      this.el = docUtil.querySelector('#container');
      this.body = $('#body');
    }
    return this.el;
  },

  fillData: function () {
    var self = this;
    var oldMethod = this.data.method;
    if (oldMethod) {
      this.wants_skip = true;
    }
    var tab = oldMethod || this.get('prefill.method');

    if (tab) {
      updateScore('hadMethodPrefilled');
    }

    if (tab) {
      var optional = {
        contact: RazorpayHelper.isContactOptional(),
        email: RazorpayHelper.isEmailOptional(),
      };
      var prefill = {
        email: this.get('prefill.email'),
        contact: this.get('prefill.contact'),
      };

      var valid = true;
      var fields = ['contact', 'email'];

      each(fields, function (optionKey, option) {
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

    /**
     * A method needs to be usable in order to prefill to that method
     */
    if (tab) {
      var usableMethod = tab;

      // We're currently bypassing prefill check for emandate and nach.
      // TODO: We'll need to fix this
      var methodsToBypassCheckFor = ['emandate', 'nach'];
      var bypassMethodCheck = methodsToBypassCheckFor.includes(usableMethod);

      // Go to homescreen if prefilled method is unusable
      if (!bypassMethodCheck && !MethodStore.isMethodUsable(usableMethod)) {
        tab = '';
      }
    }

    // Switch to the respective tab/ prefilled method if exists
    // If tab is empty, then it will switche to home
    if (tab === 'emandate' && !discreet.NetbankingHelper.getPrefillBank()) {
      // For method=emandate, we switch to the netbanking tab first if bank
      // is not prefilled.
      tab = 'netbanking';
    }

    if (tab || tab === '') {
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

        // TODO: hacky stuff , need to refactor
        // setTimeout with 200ms - waiting for checkout animation to complete
        var el = selectedWalletEl[0];
        window.setTimeout(function () {
          // scrolling to the selected wallet when checkout is opened
          // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded
          var scroll = el.scrollIntoViewIfNeeded || el.scrollIntoView;
          if (scroll) {
            scroll.call(el);
          }
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
        NetbankingScreenStore.selectedBank.set(data['bank']);
      }

      if (data.email) {
        HomeScreenStore.setEmail(data.email);
      }

      if (data.contact) {
        HomeScreenStore.setContact(data.contact);
        discreet.CRED.checkCREDEligibilityForUpdatedContact(data.contact);
      }
    }
  },

  completePendingPayment: function () {
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
        this.switchTab(self.tab);
        this.showLoadError();
        this.isResumedPayment = true;

        /*
         * TODO: fix this flow. We should not need to rewrite this entire thing
         * We should be reusing Payment object.
         */
        this.ajax = fetch({
          url: pollUrl,
          callback: function (response) {
            if (response.razorpay_payment_id) {
              invoke(successHandler, self, response);
            } else {
              var errorObj = response.error;
              if (!isNonNullObject(errorObj) && !errorObj.description) {
                response = discreet.error('Payment failed');
              }

              self.errorHandler(response);
            }
          },
        }).till(function (response) {
          return response && response.status;
        });

        var abortPaymentOnUPIIntentFailure = function () {
          self.ajax.abort();

          if (self.r._payment && self.r._payment.upi_app) {
            discreet.UPIUtils.trackUPIIntentFailure(self.r._payment.upi_app);
          }

          self.showLoadError(I18n.format('misc.payment_incomplete'), true);
          self.clearRequest(discreet.UPIUtils.upiBackCancel);
        };

        // Show error and clear request when back is pressed from PSP UPI App
        if (this.recievedUPIIntentRespOnBackBtn) {
          abortPaymentOnUPIIntentFailure();
        } else {
          this.r.once('activity_recreated_upi_intent_back_btn', function () {
            abortPaymentOnUPIIntentFailure();
          });
        }
      }
    } catch (e) {}
  },

  setParamsInStorage: function (params) {
    each(params, function (key, val) {
      try {
        StorageBridge.setString(key, val);
      } catch (e) {}
    });
  },

  setExperiments: function () {
    discreet.Experiments.clearOldExperiments();
  },

  render: function (options) {
    var that = this;

    options = options || {};

    if (NativeStore.getUPIIntentApps().filtered.length) {
      /**
       * We need to show "(Recommended)" string alongside the app name
       * when there is only 1 preferred app, and 1 or more other apps.
       */
      var count = discreet.UPIUtils.getNumberOfAppsByCategory(
        NativeStore.getUPIIntentApps().filtered
      );

      if (
        count.preferred === 1 &&
        NativeStore.getUPIIntentApps().filtered.length > 1
      ) {
        this.showRecommendedUPIApp = true;
      }
    }

    this.isOpen = true;

    this.setExperiments();
    this.getEl();
    this.setFormatting();
    this.improvisePaymentOptions();
    this.improvisePrefill();
    es6components.render();
    this.setModal();
    this.setBackdrop();
    if (RazorpayHelper.isBlockedDeactivated() && this.r.isLiveMode()) {
      new BlockedDeactivatedMerchant({
        target: docUtil.querySelector('#form-fields'),
      });
      docUtil.getElementById('header').remove();
      return;
    }
    this.setSvelteComponents();
    if (!RazorpayHelper.isPayout()) {
      this.fillData();
    }
    if (RazorpayHelper.isOneClickCheckout()) {
      discreet.fonts.loadInterFont();
      this.switchTab('home-1cc');
    }
    this.setEMI();
    Cta.init();
    this.completePendingPayment();
    this.bindEvents();
    this.setEmiScreen();
    this.prefillPostRender();
    this.updateCustomerInStore();
    Header.updateAmountFontSize();
    Hacks.initPostRenderHacks();

    this.errorHandler(this.params);

    if (!this.tab && !this.get('prefill.contact')) {
      $('#contact').focus();
    }

    // Look for new UPI apps.
    discreet.UPIUtils.findAndReportNewApps(NativeStore.getUPIIntentApps().all);

    discreet.UPIUtils.trackAppImpressions(
      NativeStore.getUPIIntentApps().filtered
    );

    P13n.trackNumberOfP13nContacts();

    // 1CC MetaProperties
    this.addOneClickCheckoutMeta();

    // Analytics related to orientation
    Analytics.setMeta('orientation', Hacks.getDeviceOrientation());
    window.addEventListener('orientationchange', function () {
      Analytics.setMeta('orientation', Hacks.getDeviceOrientation());
    });

    if (discreet.UserAgent.Safari) {
      Analytics.setMeta('safari', true);
    }

    Analytics.setMeta('is_mobile', discreet.UserAgent.isMobile());

    if (window && window.screen) {
      Analytics.setMeta('device.screen', {
        availHeight: window.screen.availHeight,
        availWidth: window.screen.availWidth,
        height: window.screen.height,
        width: window.screen.width,
        pixelDepth: window.screen.pixelDepth,
      });
    }

    Analytics.track('complete', {
      type: AnalyticsTypes.RENDER,
      data: _Obj.extend(
        {
          embedded: this.embedded,
          meta: {
            first_screen: RazorpayHelper.isOneClickCheckout()
              ? discreet.OneClickCheckoutInterface.getLandingView()
              : this.homeTab.getCurrentView(),
          },
        },
        discreet.TrustedBadgeHelper.getTrustedBadgeAnaltyicsPayload()
      ),
    });
    updateScore('timeToRender');
    Analytics.setMeta('timeSince.render', discreet.timer());
  },

  addOneClickCheckoutMeta: function () {
    // 1CC Specfic meta data
    Analytics.setMeta(
      discreet.OneClickCheckoutMetaProperties.ADDRESS_ENABLED,
      this.get('show_address')
    );
    Analytics.setMeta(
      discreet.OneClickCheckoutMetaProperties.COUPONS_ENABLED,
      this.get('show_coupons')
    );
    Analytics.setMeta(
      discreet.OneClickCheckoutMetaProperties.COD_ENABLED,
      this.get('preferences.methods.cod') || false
    );
    Analytics.setMeta(
      discreet.OneClickCheckoutMetaProperties.IS_THIRDWATCH_INSURED,
      !this.get('force_cod')
    );
    Analytics.setMeta(
      discreet.OneClickCheckoutMetaProperties.IS_MANDATORY_SIGNUP,
      this.get('mandatory_login')
    );
    Analytics.setMeta(
      discreet.OneClickCheckoutMetaProperties.IS_ONE_CLICK_CHECKOUT,
      this.get('one_click_checkout')
    );
  },

  setHomeTab: function () {
    this.homeTab = new discreet.HomeTab({
      target: gel('form-fields'),
    });
  },

  setOneClickCheckoutHome: function () {
    this.oneClickCheckoutHome = new discreet.OneClickCheckoutHomeTab({
      target: gel('form-fields'),
    });
  },

  setSvelteCardTab: function () {
    this.svelteCardTab = new cardTab.render();
  },

  setInternationalTab: function (props) {
    this.internationalTab = new discreet.internationalTab.render(props);
  },

  showInternationalTab: function () {
    this.setScreen('international');
  },

  setSvelteComponents: function () {
    this.setUpiCancelReasonPicker();
    this.setNbCancelReasonPicker();
    var isCouponsOrAddressEnabled =
      OneClickCheckoutStore.shouldShowCoupons() ||
      OneClickCheckoutStore.shouldShowAddress();
    if (RazorpayHelper.isOneClickCheckout() && isCouponsOrAddressEnabled) {
      this.setOneClickCheckoutHome();
    }
    if (!RazorpayHelper.isPayout()) {
      this.setHomeTab();
    }
    this.setSvelteCardTab();
    this.setEmandate();
    this.setCardlessEmi();
    this.setPayLater();
    this.setOtpScreen();
    this.setNach();
    this.setOffers();
    this.setLanguageDropdown();
    this.setSvelteOverlay();
    this.setFeeLabel();
    // make bottom the last element
    gel('form-fields').appendChild(gel('bottom'));
  },

  // this does not apply if options.timeout was passed
  // because in that case timer needn't be hidden while checkout is open
  // applied only for localized timers e.g headless OTP timer
  hideTimer: function () {
    if (!this.get('timeout') && this.timer) {
      this.timer.$destroy();
      this.timer = null;
    }
  },

  setEMI: function () {
    if (!this.emi && MethodStore.isMethodEnabled('emi')) {
      $(this.el).addClass('emi');
      this.emi = new discreet.emiView();
    }

    if (!this.emiPlansView) {
      this.emiPlansView = new discreet.emiPlansView();
    }
  },

  setEmandate: function () {
    if (MethodStore.isEMandateEnabled()) {
      this.emandateView = new discreet.EmandateTab({
        target: docUtil.querySelector('#form-fields'),
      });
    }
  },

  selectCardlessEmiProvider: function (providerCode) {
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
      this.showEmiPlansForBajaj();
      return;
    }

    $('#form-cardless_emi input[name=emi_duration]').val('');
    $('#form-cardless_emi input[name=provider]').val('');
    $('#form-cardless_emi input[name=ott]').val('');

    CardlessEmiStore.providerCode = providerCode;
    /**
     * Fix any cardless EMI(where EMI plan selected on checkout) provider selected from Home screen
     * this.tab is coming as empty string...but its needed cardless_emi to fetch data for payment (getPayload)
     */
    if (!this.tab) {
      this.tab = 'cardless_emi';
    }

    $('#form-cardless_emi input[name=provider]').val(providerCode);
  },

  /**
   * Equivalent of clicking a provider option from the
   * Cardless EMI homescreen.
   * @param {String} provider Code for the provider
   */
  selectCardlessEmiProviderAndAttemptPayment: function (provider) {
    this.selectCardlessEmiProvider(provider);
    /**
     * When a cardless EMI provider except "EMI on Cards" is chosen, the payment
     * should be created immediately. Selecting "EMI on cards" should take us
     * to the EMI screen, hence preSubmit should not be called.
     */
    if (provider !== 'cards') {
      this.preSubmit();
    }
  },

  setCardlessEmi: function () {
    var self = this;

    if (MethodStore.isMethodEnabled('cardless_emi')) {
      this.cardlessEmiView = new discreet.CardlessEmiView({
        target: docUtil.querySelector('#form-fields'),
      });

      this.cardlessEmiView.$on('select', function (event) {
        var providerCode = event.detail.code;
        self.selectCardlessEmiProviderAndAttemptPayment(providerCode);
      });
    }
  },

  selectPayLaterProvider: function (providerCode) {
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
  selectPayLaterProviderAndAttemptPayment: function (providerCode) {
    this.selectPayLaterProvider(providerCode);
    this.preSubmit();
  },

  /**
   * Adds the Nach screen to DOM
   */
  setNach: function () {
    if (MethodStore.isMethodEnabled('nach')) {
      this.nachScreen = new discreet.NachScreen({
        target: docUtil.querySelector('#form-fields'),
      });
    }
  },

  setPayLater: function () {
    var self = this;
    var isPayLaterEnabled = MethodStore.isMethodEnabled('paylater');

    if (!isPayLaterEnabled) {
      return;
    }

    this.payLaterView = new PayLaterView({
      target: docUtil.querySelector('#form-fields'),
    });

    this.payLaterView.$on('select', function (event) {
      var providerCode = event.detail.code;
      self.selectPayLaterProviderAndAttemptPayment(providerCode);
    });

    this.tabs[METHODS.PAYLATER] = this.payLaterView;
  },

  setOneCCTabLogo: function (logo) {
    if (RazorpayHelper.isOneClickCheckout()) {
      this.otpView.updateScreen({
        tabLogo: logo,
      });
    }
  },

  setEmiScreen: function () {
    var session = this;
    if (!MethodStore.getEMIBanks().BAJAJ) {
      return;
    }

    this.emiScreenView = new discreet.emiScreenView({
      target: docUtil.querySelector('#form-emi'),
    });

    this.emiScreenView.$on('editplan', this.showEmiPlansForBajaj.bind(this));
  },

  getCardlessEmiPlans: function () {
    var providerCode = CardlessEmiStore.providerCode;
    var plans = CardlessEmiStore.plans[providerCode];

    return plans;
  },

  showCardlessEmiPlans: function () {
    var self = this;
    var providerCode = CardlessEmiStore.providerCode;
    var plans = CardlessEmiStore.plans[providerCode];

    this.topBar.setTitleOverride(
      'emiplans',
      'image',
      CardlessEmi.getImageUrl(providerCode)
    );
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
        showAgreement: false,
      },

      amount: this.get('amount'),

      loanUrl: CardlessEmiStore.loanUrls[providerCode],

      provider: CardlessEmiStore.providerCode,

      // TODO: This should be picked up from Store
      branding: CardlessEmiStore.lenderBranding[providerCode],

      on: {
        back: bind(function (confirmedCancel) {
          var payment = self.r._payment;

          if (confirmedCancel !== true && payment) {
            self.confirmClose().then(function (confirmed) {
              if (confirmed) {
                self.clearRequest({
                  '_[reason]': 'PAYMENT_CANCEL_BEFORE_PLAN_SELECT',
                });

                self.switchTab('cardless_emi');
              }
            });
          }

          return true;
        }, this),

        select: function (value) {
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

  fetchCardlessEmiPlans: function (params) {
    if (!params) {
      params = {};
    }

    var providerCode = CardlessEmiStore.providerCode;
    var cardlessEmiProviderObj = CardlessEmi.getProvider(providerCode);
    var self = this;

    var incorrectOtp = params.incorrect;

    var topbarImages = CardlessEmi.getImageUrl(providerCode);
    this.topBar.setTitleOverride('otp', 'image', topbarImages);
    this.setOneCCTabLogo(topbarImages);

    var locale = I18n.getCurrentLocale();
    this.otpView.updateScreen({
      showCtaOneCC: false,
    });
    this.commenceOTP('cardlessemi_sending', 'cardless_emi_enter', {
      phone: getPhone(),
      provider: I18n.getCardlessEmiProviderName(providerCode, locale),
    });

    if (this.screen !== 'otp' && this.tab !== 'cardless_emi') {
      return;
    }

    var callback = function () {
      var otpMessageView = 'cardlessemi_plans';

      if (incorrectOtp) {
        otpMessageView = 'incorrect_otp_retry';
      }

      var locale = I18n.getCurrentLocale();
      askOTP(self.otpView, otpMessageView, true, {
        phone: getPhone(),
        provider: I18n.getCardlessEmiProviderName(providerCode, locale),
      });
      self.otpView.updateScreen({
        allowSkip: false,
        showCtaOneCC: true,
        ctaOneCCDisabled: false,
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

  checkCustomerStatus: function (params, callback) {
    var self = this;
    var provider = params.provider;
    var data = params.data;
    var phone = params.contact;

    this.getCurrentCustomer(phone).checkStatus(
      function (response) {
        self.updateCustomerInStore();
        if (response.hasOwnProperty('saved')) {
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

  askPayLaterOtp: function (action) {
    var providerCode = PayLaterStore.providerCode;
    var payLaterProviderObj = PayLater.getProvider(providerCode);
    var self = this;

    var topbarImages = PayLater.getImageUrl(providerCode);
    this.topBar.setTitleOverride('otp', 'image', topbarImages);
    this.setOneCCTabLogo(topbarImages);

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
      self.otpView.setTextView('incorrect_otp_retry');
      return;
    } else if (action === 'resend') {
      this.commenceOTP('resending_otp', 'paylater_resend');
    } else if (action === 'verify') {
      this.commenceOTP('verifying_otp');
      return;
    } else {
      var locale = I18n.getCurrentLocale();
      this.commenceOTP('paylater_sending', 'paylater_enter', {
        phone: getPhone(),
        provider: I18n.getPaylaterProviderName(providerCode, locale),
      });
    }

    this.checkCustomerStatus(params, function (error) {
      var locale = I18n.getCurrentLocale();
      if (error) {
        PayLaterStore.userRegistered = false;
        self.showLoadError(I18n.translateErrorDescription(error, locale), true);
        return;
      }

      PayLaterStore.userRegistered = true;

      var otpMessageView = 'paylater_continue';

      if (action === 'resend') {
        otpMessageView = 'otp_resent_successful';
      }

      askOTP(self.otpView, otpMessageView, true, {
        phone: getPhone(),
        provider: I18n.getPaylaterProviderName(providerCode, locale),
      });
      self.otpView.updateScreen({
        allowSkip: false,
      });
    });
  },

  submitPayLater: function () {
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

  /**
   * this method is being used on OTP screen
   */
  retryWithPaypal: function () {
    if (this.screen !== 'wallet') {
      // switch to wallet tab and select paypal
      if (this.svelteCardTab) {
        this.svelteCardTab.setTabVisible(false);
      }
      this.switchTab('wallet');
      if (this.walletTab) {
        this.walletTab.onWalletSelection(freqWallets.paypal.code);
      }
    } else {
      this.back();
    }

    Analytics.track('paypal_retry:paypal_click', {
      data: {
        currentScreen: this.screen,
      },
      immediately: true,
    });
  },

  setOtpScreen: function () {
    if (!this.otpView) {
      this.otpView = new discreet.otpView({
        target: gel('form-fields'),

        props: {
          addShowableClass: true,
          on: {
            closeAndDismiss: bind(this.closeAndDismiss, this),
            chooseMethod: bind(function () {
              this.switchTab();
            }, this),
            addFunds: bind(this.addFunds, this),
            resend: bind(this.resendOTP, this),
            retry: bind(this.back, this),
            secondary: bind(this.secAction, this),
            retryWithPaypal: bind(this.retryWithPaypal, this),
            cancelRetryWithPaypal: bind(function () {
              this.back();
              Analytics.track('paypal_retry:cancel_click', {
                data: {
                  currentScreen: this.screen,
                },
              });
            }, this),
          },
        },
      });
    }
  },

  setModal: function () {
    if (!this.modal) {
      var self = this;
      this.modal = new window.Modal(this.el, {
        escape: this.get('modal.escape') && !this.embedded,
        backdropclose: this.get('modal.backdropclose'),
        handleBackdropClick: function () {
          // The same logic to close overlay using $overlayStack
          // is present for backpresses.
          // Don't forget to update it there too if you change something here.
          // TODO: DRY

          var $overlayStack = storeGetter(discreet.overlayStackStore);

          if ($overlayStack.length > 0) {
            var last = $overlayStack[$overlayStack.length - 1];

            last.back({
              from: 'overlay',
            });

            // Signal that we don't want the Modal component to handle click on backdrop
            return false;
          }

          // Signal that Modal component should hnadle backdrop click
          return true;
        },
        onhide: function () {
          Razorpay.sendMessage({ event: 'dismiss', data: self.dismissReason });
        },
        onhidden: bind(function () {
          this.saveAndClose();
          Razorpay.sendMessage({ event: 'hidden' });
        }, this),
      });
    }
  },

  setBackdrop: function () {
    var session = this;
    Backdrop.setup({
      target: docUtil.querySelector('#modal-inner'),
      props: {
        onClick: function (e) {
          if (Confirm.isVisible()) {
            return;
          }
          session.r.emit('backDropClicked');
          session.hideErrorMessage(e);
        },
      },
    });
  },

  improvisePaymentOptions: function () {
    var oneMethod = MethodStore.getSingleMethod();
    if (oneMethod) {
      this.oneMethod = oneMethod;
      $(this.el).addClass('one-method');
    }
  },

  /**
   * Improvise the prefill options.
   */
  improvisePrefill: function () {
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

    /**
     * For prefilling card apps,
     * expected options are method: app & provider,
     * however, we're showing them on cards screen,
     * so set prefill as card.
     */
    if (prefilledMethod === 'app') {
      if (MethodStore.isApplicationEnabled(prefilledProvider)) {
        this.set('prefill.method', 'card');
      }
    }

    var forcedOffer = discreet.Offers.getForcedOffer();

    if (forcedOffer) {
      var method = forcedOffer.payment_method;
      /**
       * For forced offers, we need to skip the home screen if the contact and
       * email is optional
       */
      if (forcedOffer && method && RazorpayHelper.isContactEmailOptional()) {
        this.set('prefill.method', method);
      }
    }

    improvisePrefilledContact(this);
  },

  /**
   * Anything related to prefilled that needs to be done
   * once everything has rendered,
   * goes into this function.
   */
  prefillPostRender: function () {
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

  setTheme: function () {
    // update r.themeMeta based on prefs color
    this.r.postInit();

    // ThemeMeta in razorpay.js contains only
    // color, textColor, highlightColor
    discreet.Theme.setThemeColor(this.r.themeMeta.color);
  },

  hideErrorMessage: function (confirmedCancel) {
    if (
      RazorpayHelper.isCustomerFeeBearer() &&
      !RazorpayHelper.isDynamicFeeBearer()
    ) {
      this.setAmount(this.get('amount'));
    }

    if (this.nocostModal) {
      var modal = this.nocostModal;
      hideOverlay($('#nocost-overlay'));
      setTimeout(function () {
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

    var beforeReturn = function () {
      // Prevents the overlay from closing and not allowing the user to
      // attempt payment again incase of corporate netbanking.
      if (self.isCorporateBanking) {
        return;
      }

      $('#overlay-close').hide();
      hideOverlayMessage();
    };

    if (this.r._payment || this.isResumedPayment) {
      if (confirmedCancel === true) {
        return this.clearRequest();
      }

      if (
        this.payload &&
        this.payload.method === 'netbanking' &&
        _Obj.getSafely(this.r, '_payment.popup.window.closed')
      ) {
        // Called when the popup for netbanking has been closed by the user
        // and the netbanking cancellation modal is open
        // returning from this point prevents confirmClose from being called because it's not needed
        return;
      }

      var paymentMethod = this.payload && this.payload.method;

      self.confirmClose().then(function (close) {
        if (paymentMethod == 'netbanking' && close) {
          self.r._payment.popup.onClose();
          return;
        }
        if (close) {
          // close the iframe as payment is cancelled
          var payment = self.r._payment;
          if (
            payment &&
            payment.forceIframeElement &&
            payment.forceIframeElement.window &&
            payment.forceIframeElement.window.destroy
          ) {
            self.r._payment.forceIframeElement.window.destroy();
          }

          self.clearRequest();
          if (Bridge.checkout.platform === 'ios') {
            Bridge.checkout.callIos('hide_nav_bar');
          }
          beforeReturn();
        } else {
          // move focus to popup or iframe
          self.r.focus();
        }
      });
    } else {
      beforeReturn();
    }
  },

  click: function (selector, delegateClass, listener, useCapture) {
    this.on('click', selector, delegateClass, listener, useCapture);
  },

  on: function (event, selector, delegateClass, listener, useCapture) {
    var listeners = this.listeners;
    if (!listener || listener === true) {
      each(
        $$(selector),
        function (i, element) {
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
          function (e) {
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

  resendOTP: function () {
    var otpProvider;
    var paymentExists = Boolean(this.r._payment);
    var isCardlessEmiPayment =
      this.payload && this.payload.method === 'cardless_emi';
    var isWallet = this.payload && this.payload.method === 'wallet';

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
      wallet: isWallet,
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
      this.otpView.updateScreen({
        showCtaOneCC: false,
      });
      this.commenceOTP('resending_otp');
      this.hideTimer();

      if (this.headlessMetadata) {
        var metadata = this.headlessMetadata;

        OtpService.markOtpSent(metadata.issuer || metadata.network);
      }

      return this.r.resendOTP(this.r.emitter('payment.otp.required'));
    }

    this.commenceOTP('otp_sending_generic', undefined, { phone: getPhone() });
    if (this.tab === 'cardless_emi') {
      this.fetchCardlessEmiPlans({
        resend: true,
      });
    } else if (this.tab === 'paylater') {
      this.askPayLaterOtp('resend');
    } else if (isWallet) {
      this.otpView.updateScreen({
        showCtaOneCC: false,
      });
      this.r.resendOTP(this.r.emitter('payment.otp.required'));
    } else {
      var self = this;
      var otpTemplate = discreet.OtpTemplatesHelper.getDefaultOtpTemplate();
      this.getCurrentCustomer().createOTP(
        function (message) {
          // TODO: check how message is being consumed. Possible bug.
          askOTP(
            self.otpView,
            message,
            true,
            { phone: getPhone() },
            undefined,
            undefined,
            true
          );
          self.updateCustomerInStore();
        },
        null,
        otpTemplate
      );
    }
  },

  secAction: function () {
    if (this.headless && this.r._payment) {
      Analytics.track('native_otp:gotobank', {
        type: AnalyticsTypes.BEHAV,
        immediately: true,
      });
      this.hideTimer();
      this.showLoadError(I18n.format('misc.payment_waiting_on_bank'));
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

      if (!this.headless) {
        this.setScreen('card');
      }
      if (!this.preferences.fee_bearer) {
        this.commenceOTP('payment_processing');
      }
    } else {
      this.showCardTab();
    }
  },

  addFunds: function (event) {
    Analytics.track('wallet:balance:add', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: this.payload && this.payload.wallet,
      },
    });

    this.otpView.setTextView('loading');
    this.otpView.updateScreen({
      action: false,
      loading: true,
      addFunds: false,
    });
    this.powerwallet = false;
    this.r.topupWallet();
  },

  setAmount: function (amount) {
    this.get().amount = amount;

    var offer = this.getAppliedOffer();
    this.updateAmountInHeader(amount);
    if (offer && offer.amount) {
      if (RazorpayHelper.isOneClickCheckout()) {
        this.updateAmountInHeaderForOffer(amount);
      } else {
        this.updateAmountInHeaderForOffer(offer.amount);
      }
    }
  },

  fixLandscapeBug: function () {
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
   * logout the customer instance on client by removing logged in status and clearing existing tokens
   * @param {Customer} customer The customer to be logged out
   */
  logoutUserOnClient: function (customer) {
    if (customer) {
      customer.logged = false;
      customer.tokens = null;
    }

    this.topBar.setLogged(false);
  },

  /**
   * Logs the user out
   * Once the user state is changed to logged out, p13n will be triggered for logged out user.
   * we want p13n api to use the logged out cookie (and to prevent race condition), which is why we update the customer
   * instance as a callback to logout api sucess.
   * @param {Customer} customer Customer to be logged out
   * @param {boolean} outOfAllDevices Whether customer session should be logged out for all devices?
   * @param {function} callback Callback to invoke after logout is success.
   */
  _logUserOut: function (customer, outOfAllDevices, callback) {
    this.topBar.setLogged(false);

    function logoutSuccessCallback(data) {
      this.logoutUserOnClient(customer);

      callback && callback(data);

      CustomerStore.customer.set(customer);

      if (this.svelteCardTab) {
        this.svelteCardTab.showLandingView();
      }
    }

    if (customer) {
      customer.logout(outOfAllDevices, logoutSuccessCallback.bind(this));
    }
  },

  /**
   * Logs user out of this device.
   * @param {Customer} customer
   */
  logUserOut: function (customer, callback) {
    this._logUserOut(customer, false, callback);
  },

  /**
   * Logs user out of all devices.
   * @param {Customer} customer
   */
  logUserOutOfAllDevices: function (customer, callback) {
    this._logUserOut(customer, true, callback);
  },

  bindEvents: function (selector) {
    selector = selector || '#body';

    var self = this;

    // cultgear.com bug: no events register unless
    // https://stackoverflow.com/questions/41869122/touch-events-within-iframe-are-not-working-on-ios
    document.addEventListener('touchstart', UTILS.returnAsIs);
    this.listeners.push(function () {
      document.removeEventListener('touchstart', UTILS.returnAsIs);
    });

    this.on('focus', selector, 'input', 'focus', true);
    this.on('blur', selector, 'input', 'blur', true);
    this.on(
      'input',
      selector,
      'input',
      function (e) {
        this.input(e.target);
      },
      true
    );

    this.on(
      'focus',
      selector,
      'selector',
      function (e) {
        $(e.target).addClass('focused');
      },
      true
    );

    this.on(
      'blur',
      selector,
      'selector',
      function (e) {
        $(e.target).removeClass('focused');
      },
      true
    );

    if (this.get('theme.close_button')) {
      this.click('#modal-close', function () {
        var beforeReturn = function () {
          self.hide();
        };

        if (self.get('modal.confirm_close')) {
          self.confirmClose().then(function (close) {
            if (close) {
              beforeReturn();
            }
          });
        } else {
          beforeReturn();
        }
      });
    }
    this.on('submit', '#form', this.preSubmit);
    this.on('click', '#footer-cta', this.preSubmit);

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

    if (MethodStore.isMethodEnabled('wallet')) {
      try {
        this.on(
          'change',
          '#wallets',
          function (e) {
            if (ua_iPhone) {
              Razorpay.sendMessage({ event: 'blur' });
            }
          },
          true
        );
      } catch (e) {}
    }

    if (
      MethodStore.isMethodEnabled('upi') ||
      MethodStore.isMethodEnabled('upi_otm')
    ) {
      this.click('#cancel_upi .btn', function () {
        var upi_radio = $('#cancel_upi input:checked');
        if (!upi_radio[0]) {
          return;
        }
        var metaParam = {};
        metaParam[upi_radio.prop('name')] = upi_radio.val();
        this.clearRequest(metaParam);
        $('#error-message').removeClass('cancel_upi');
      });
      this.click('#cancel_upi .back-btn', function () {
        $('#error-message').removeClass('cancel_upi');
      });
    }

    if (MethodStore.isMethodEnabled('emi')) {
      this.on(
        'click',
        '#form-card',
        'saved-card-pay-without-emi',
        function (e) {
          self.switchTab('card');
        }
      );
    }

    var goto_payment = '#error-message .link';

    this.click(goto_payment, function () {
      if (this.payload && this.payload.method === 'upi') {
        if (this.payload['_[flow]'] === 'directpay') {
          return cancel_upi(this);
        } else if (this.payload['_[flow]'] === 'intent') {
          if (Confirm.isVisible()) {
            return;
          }
          this.hideErrorMessage();
        }
      }
      this.r.focus();
    });

    this.click('#backdrop', this.hideErrorMessage);
    this.click('#fd-hide', this.hideErrorMessage);
    this.click('#overlay-close', this.hideErrorMessage);

    this.on('click', '#form-upi.collapsible .item', function (e) {
      $('#form-upi.collapsible .item.expanded').removeClass('expanded');
      $(e.currentTarget).addClass('expanded');
    });
  },

  onUpiAppSelect: function (packageName) {
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

  focus: function (e) {
    if (_El.hasClass(e.target, 'no-focus')) {
      return;
    }

    $(e.target.parentNode).addClass('focused');
    setTimeout(function () {
      $(e.target).scrollIntoView();
    }, 1000);
    if (ua_iPhone) {
      Razorpay.sendMessage({ event: 'focus' });
    }
  },

  blur: function (e) {
    if (_El.hasClass(e.target, 'no-blur')) {
      return;
    }

    $(e.target.parentNode).removeClass('focused').addClass('mature');
    this.input(e.target);
    if (ua_iPhone) {
      Razorpay.sendMessage({ event: 'blur' });
    }
  },

  input: function (el) {
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
    $parent.toggleClass('invalid', !valid);
  },

  refresh: function () {
    var self = this;
    each($$('.input:not(.no-refresh)'), function (i, el) {
      self.input(el);
    });
  },

  setFormatting: function () {
    var self = this;
    self.refresh();
    var bits = self.bits;
    var delegator = (self.delegator = Razorpay.setFormatter(self.el));
    delegator.otp = delegator
      .add('number', gel('otp'))
      .on('change', function () {
        self.input(this.el);
      });
  },

  setScreen: function (screen, params) {
    var extraProps = params && params.extraProps;

    // Remove CTA for all cases, if moving away from otp screen
    if (screen !== 'otp' && this.screen === 'otp') {
      this.otpView.updateScreen({
        showCtaOneCC: false,
      });
    }

    if (screen) {
      var tabForTitle = this.tab === 'emi' ? this.tab : this.cardTab || screen;

      if (tabForTitle && this.topBar) {
        this.topBar.setTab(tabForTitle);
      }
    }
    /**
     * onShown is different from tabVisible. As in case of card onShown trigger even we are asking for saved card OTP.
     * tabVisible will trigger on actual tab shown only.
     */
    if (screen === 'card' && this.svelteCardTab) {
      this.svelteCardTab.setTabVisible(true);
    }

    if (screen !== 'otp') {
      this.headless = false;
    }

    // TODO remove this from here
    // check cardTab.setEmiPlansCta for details
    if (screen !== 'upi') {
      cardTab.setEmiPlansCta(screen, this.tab);
    }

    if (this.offers) {
      this.offers.renderTab(this.tab);
    }

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
      from: this.screen || '',
      to: screen || '',
    };

    // removed causing issue during OTP screen & non OTP screen
    // if (this.screen === 'otp' && (screen !== 'otp' && screen !== 'card')) {
    //   Store.showFeeLabel.set(false);
    // }

    // if (this.screen !== 'otp' && screen === 'otp') {
    //   Store.showFeeLabel.set(true);
    // }
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
    if (screen === 'home-1cc') {
      this.topBar.hide();
      discreet.OffersStore.showOffers.set(false);
    } else {
      discreet.OffersStore.showOffers.set(true);
      if (screen) {
        this.topBar.show();
        $('.elem-email').addClass('mature');
        $('.elem-contact').addClass('mature');
      } else if (!RazorpayHelper.isOneClickCheckout()) {
        this.topBar.hide();
      } else if (RazorpayHelper.isOneClickCheckout()) {
        this.showHomeTopBar();
      }
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
    } else if (
      !(
        (screen === 'upi' || screen === 'upi_otm') &&
        NativeStore.getUPIIntentApps().filtered.length
      )
    ) {
      var appliedOffer = this.getAppliedOffer() || {};

      if (
        !(
          appliedOffer &&
          appliedOffer.issuer === 'cred' &&
          this.tab === appliedOffer.payment_method
        )
      ) {
        invoke('focus', qs(screenEl + ' .invalid input'));
      }
    }

    var showPaybtn = screen;
    if (
      screen === 'cardless_emi' ||
      (this.tab === 'cardless_emi' && screen === 'emiplans') ||
      screen === 'paylater' ||
      screen === 'qr' ||
      (screen === 'netbanking' && RazorpayHelper.isRecurring()) ||
      screen === 'emandate'
    ) {
      showPaybtn = false;
    }

    if (screen === '' && this.homeTab) {
      this.homeTab.onShown();
    } else if (screen === 'wallet' && this.walletTab) {
      this.walletTab.onShown();
    } else if (screen !== 'upi' && screen !== 'upi_otm') {
      this.body.toggleClass('sub', showPaybtn);
    } else {
      var instance = this.getCurrentTabInstance(screen);
      if (instance && instance.onShown) {
        instance.onShown();
      }
    }

    return;
  },

  /**
   * Tries selecting the bank if netbanking offer,
   * wallet if wallet offer, and so on
   * @param {Offer} offer
   */
  _trySelectingOfferInstrument: function (offer) {
    var issuer = offer.issuer;
    var screen = offer.payment_method;
    var isEmiOffer = offer.payment_method === 'emi' && !offer.emi_subvention;

    var emiHandler = function () {
      var emiDuration = EmiStore.getEmiDurationForNewCard();
      var bank = this.emiPlansForNewCard && this.emiPlansForNewCard.code;

      if (emiDuration) {
        var plan = MethodStore.getEMIBankPlans(
          bank,
          'credit',
          !isEmiOffer
        ).find(function (p) {
          return p.duration === emiDuration;
        });
        if (
          plan &&
          offer.id &&
          offer.emi_subvention &&
          plan.offer_id !== offer.id
        ) {
          // Clear duration
          EmiStore.newCardEmiDuration.set('');
        }
      }
    };

    if (screen === 'wallet') {
      // Select wallet
      if (issuer && this.walletTab) {
        this.walletTab.onWalletSelection(issuer);
      }
    } else if (screen === 'netbanking') {
      // Select bank
      if (issuer) {
        NetbankingScreenStore.selectedBank.set(issuer);
      }
    } else if (screen === 'emi') {
      emiHandler.call(this);
    } else if (screen === 'cardless_emi' && screen !== 'otp') {
      /**
       * If EMI and Cardless EMI are clubbed, the user will land on the Cardless EMI screen
       * So, if the offer method is EMI, let's get the user on the EMI screen
       */
      if (offer.payment_method === 'emi') {
        this.selectCardlessEmiProviderAndAttemptPayment('cards');

        emiHandler.call(this);
      } else {
        var provider = offer.provider;

        if (provider) {
          this.selectCardlessEmiProviderAndAttemptPayment(provider);
        }
      }
    } else if (screen === 'card') {
      // currently in cards, we have google pay and cred apps, so based on provider code, we can select them
      if (offer && offer.issuer && offer.payment_method === 'card') {
        var cardApps = discreet.Apps.getAppsForMethod('card') || [];
        var isCardAppOffer =
          cardApps.findIndex(function (app) {
            return app === offer.issuer;
          }) !== -1;
        if (isCardAppOffer && MethodStore.isApplicationEnabled(offer.issuer)) {
          this.svelteCardTab.setSelectedApp(offer.issuer);
        }
      }
    }
  },

  /**
   * Handles offer selection
   * @param {Offer} offer
   */
  handleOfferSelection: function (offer) {
    /**
     * Get the first instrument that can work with the offer
     * and select it if not already selected
     */
    var instrument = discreet.Offers.getInstrumentToSelectForOffer(offer);

    if (!instrument) {
      Analytics.track('offer_instrument_undef', {
        type: AnalyticsTypes.DEBUG,
        data: {
          offer: offer,
        },
      });

      return;
    }

    if (storeGetter(HomeScreenStore.selectedInstrumentId) === instrument.id) {
      // Do not switch tabs
    } else if (offer && offer.payment_method === 'emi') {
      this.switchTab('emi');
    } else {
      this.switchTab('');
      if (
        offer &&
        offer.payment_method === 'card' &&
        discreet.CardExperiments.cardsSeparation.enabled()
      ) {
        // Since offers currently created using method not type ( card but not debit-card )
        // when offer is being and experiment is ON, avoid screen switch. And let the user do manually
        return;
      }
      this.homeTab.onSelectInstrument({
        detail: instrument,
      });
    }

    var session = this;

    session.offers.rerenderTab();

    // Wait for switching to be over
    setTimeout(function () {
      session._trySelectingOfferInstrument(offer);
    }, 300);
  },
  /**
   * Show the discount amount.
   */
  handleDiscount: function () {
    var offer = this.getAppliedOffer();
    var hasDiscount = offer && offer.amount !== offer.original_amount;
    var currency = this.get('currency') || 'INR';
    var amount;
    if (offer) {
      if (RazorpayHelper.isOneClickCheckout()) {
        amount = storeGetter(discreet.ChargesStore.amount);
      } else {
        amount = offer.amount;
      }
    }
    if (this.dccPayload) {
      /** value of dccPayload set via DynamicCurrencyView.svelte */
      if (this.dccPayload.enable && this.dccPayload.currency) {
        currency = this.dccPayload.currency;
      }
      /**
       * check dcc amount we have it is for discounted amount
       * as flow api may take time we can't show original amount we can show discount amount in INR
       */
      if (
        this.dccPayload.enable &&
        this.dccPayload.currencyPayload &&
        this.dccPayload.currencyPayload.all_currencies &&
        this.dccPayload.entityWithAmount.indexOf(amount) !== -1
      ) {
        amount =
          this.dccPayload.currencyPayload.all_currencies[currency].amount;
      }
    }

    // this.offers is undefined for forced offers
    if (hasDiscount && this.offers) {
      hasDiscount = this.offers.isCardApplicable();
    }

    var hasDiscountAndFee =
      offer && RazorpayHelper.isCustomerFeeBearer() && amount;

    if (hasDiscountAndFee) {
      $('#content').toggleClass('has-fee', hasDiscountAndFee);
    } else {
      $('#content').toggleClass('has-fee', false);
    }

    $('#content').toggleClass('has-discount', hasDiscount);
    $('#amount .discount').html(
      hasDiscount
        ? discreet.Currency.formatAmountWithSymbol(amount, currency)
        : ''
    );
    if (RazorpayHelper.isOneClickCheckout() && hasDiscount) {
      $('#amount .original-amount').hide();
    } else {
      $('#amount .original-amount')[0].removeAttribute('style');
    }
    Cta.setAppropriateCtaText();
    Header.updateAmountFontSize();
  },

  confirmClose: function () {
    return new Promise(function (resolve) {
      Confirm.show({
        onPositiveClick: function () {
          resolve(true);
        },
        onNegativeClick: function () {
          resolve(false);
        },
      });
    });
  },

  back: function (confirmedCancel) {
    var tab = '';
    var payment = this.r._payment;
    var thisTab = this.tab;
    var self = this;

    if (RazorpayHelper.isOneClickCheckout()) {
      TopbarMagicCheckoutStore.tabTitle.set('');
      CardScreenStore.cardScreenScrollable.set(false);
    }
    Analytics.track('back', {
      type: AnalyticsTypes.BEHAV,
    });

    var isNVSFormHomeScreenView = discreet.storeGetter(
      discreet.InternationalStores.isNVSFormHomeScreenView
    );
    if (thisTab === 'home-1cc' || this.screen === 'home-1cc') {
      discreet.OneClickCheckoutInterface.handleBack();
      return;
    }
    if (
      this.screen === 'otp' &&
      thisTab !== 'card' &&
      thisTab !== 'upi' &&
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
        this.otpView.onBack();
      } else {
        this.confirmClose().then(function (close) {
          if (close) {
            self.back(true);
            this.setOneCCTabLogo('');
          }
        });
        return;
      }
    } else if (this.headless) {
      if (BackStore && BackStore.tab) {
        tab = BackStore.tab;
      } else {
        tab = 'card';
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
      discreet.netbankingTab.destroy();
    } else if (this.tab === 'wallet') {
      discreet.walletTab.destroy();
    } else if (this.tab === 'nach') {
      if (this.nachScreen.onBack()) {
        return;
      }
    } else if (this.tab === 'bank_transfer') {
      es6components.bankTransferTab.destroy();
    } else if (this.tab === 'emandate') {
      if (this.emandateView.onBack()) {
        return;
      }
    } else if (this.tab === 'international') {
      if (
        this.internationalTab &&
        this.internationalTab.onBack() &&
        !isNVSFormHomeScreenView
      ) {
        return;
      } else {
        // destroy the international tab view
        discreet.internationalTab.destroy();
        this.internationalTab = null;
      }
    } else if (this.tab === 'offline_challan') {
      discreet.offlineChallanTab.destroy();
    } else if (!this.tab) {
      if (discreet.OneClickCheckoutInterface.historyExists()) {
        discreet.ChargesHelper.removeCodCharges();
        discreet.OneClickCheckoutInterface.handleBack();
        this.switchTab('home-1cc');
        Cta.showCta();
        this.topBar.hide();
        if ($('#amount .original-amount')[0]) {
          $('#amount .original-amount')[0].removeAttribute('style');
        }
        return;
      }
    } else {
      if (this.get('theme.close_method_back')) {
        return this.modal.hide();
      }
      tab = '';
    }

    // change view state to default from AVS
    // its required in case user select card from preferred block
    // we are using isOnAVSScreen logic in presubmit
    if (this.screen === 'card' && this.svelteCardTab.isOnAVSScreen()) {
      this.svelteCardTab.onBack();
    }

    var beforeReturn = function () {
      if (BackStore && BackStore.screen) {
        self.setScreen(BackStore.screen);
      }
      self.switchTab(tab);

      BackStore = null;
    };

    var walletOtpPage =
      tab === 'wallet' && this.screen === 'otp' && this.r._payment;
    var cardlessEmiOtpPage =
      tab === 'cardless_emi' && this.screen === 'otp' && this.r._payment;

    if (walletOtpPage || cardlessEmiOtpPage) {
      self.confirmClose().then(function (close) {
        if (close) {
          discreet.OTPScreenStore.tabLogo.set('');
          self.clearRequest({
            '_[reason]': 'PAYMENT_CANCEL_BEFORE_OTP_VERIFY',
          });
          beforeReturn();
        }
      });
    } else {
      beforeReturn();
    }
  },

  showHomeTopBar: function () {
    this.topBar.setTab(views.METHODS);
    this.topBar.setLogged(true);
    var contact = getPhone();
    this.topBar.setContact(contact);
    this.topBar.updateUserDropDown();
    this.topBar.show();
  },

  oneClickCheckoutRedirection: function () {
    this.switchTab('');
    this.homeTab.addressNext();
    this.homeTab.next(views.METHODS);
  },

  updateOrderFailure: function () {
    var errorMessage = I18n.format('address.order_update_failure');
    this.showLoadError(errorMessage, true);
  },

  /**
   * Checks if the fields on the homepage are valid or not.
   *
   * @returns {boolean} valid
   */
  checkCommonValid: function () {
    var selector = '#form-common';

    if (this.homeTab.onMethodsScreen()) {
      // Validate any additional input (like contact)
      selector = '.instrument.selected';
    }

    var valid = !this.checkInvalid(selector);

    return valid;
  },

  /**
   * Checks if fields are invalid.
   * And if they are invalid, tracks them.
   *
   * @returns {boolean} valid
   */
  checkCommonValidAndTrackIfInvalid: function () {
    var valid = this.checkCommonValid();

    if (!valid) {
      var fields = docUtil.querySelectorAll('#form-common .invalid [name]');

      var invalidFields = {};
      var invalidValues = {};

      if (Array.isArray(fields)) {
        fields.forEach(function (field) {
          invalidFields[field.name] = true;
          invalidValues[field.name] = field.value;
        });
      }

      Analytics.track('homescreen:fields:invalid', {
        data: {
          fields: invalidFields,
          values: invalidValues,
        },
      });
    }

    return valid;
  },

  trackEvent: function (eventName, data) {
    Analytics.track(eventName, data);
  },
  tabSwitchStart: 0,
  tabsCount: 0,
  switchTab: function (tab, payload) {
    /**
     * Validate fields on common screen.
     */
    /** it will be override everytime switch tab uses */
    this.switchTabPayload = payload;
    this.tabsCount++;
    if (this.tabsCount > 5) {
      updateScore('switchingTabs', { tabsCount: this.tabsCount });
    }
    var diff = 0;
    if (this.tabSwitchStart > 0) {
      diff = (Date.now() - this.tabSwitchStart) / 1000;
    }
    this.tabSwitchStart = Date.now();
    if (!this.tab) {
      if (!this.checkCommonValidAndTrackIfInvalid()) {
        return;
      }
    }

    Analytics.track('tab:switch', {
      data: {
        from: this.tab || '',
        to: tab || '',
        timeSpentInTab: diff > 0 ? diff : 'NA',
      },
    });
    Analytics.setMeta('tab', tab);
    Analytics.setMeta('timeSince.tab', discreet.timer());

    // Executes actions to be done when moving away from a screen
    if (this.tab !== tab) {
      var instance = this.getCurrentTabInstance();
      if (instance && instance.onHide) {
        instance.onHide();
      }
    }

    if (tab === '') {
      this.homeTab.onShown();
    }

    if (tab) {
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
      if (
        !RazorpayHelper.isOneClickCheckout() &&
        ((!contact && !RazorpayHelper.isContactOptional()) ||
          this.get('method.' + tab) === false)
      ) {
        return;
      }
      this.updateCustomerInStore();

      if (this.getCurrentCustomer().logged && !this.local) {
        this.topBar.setLogged(true);
      }

      this.topBar.setContact(contact);

      var offer = this.getAppliedOffer();
      if (
        this.offers &&
        offer &&
        discreet.Offers.getOfferMethodForTab(tab) !== offer.payment_method
      ) {
        this.offers.clearOffer(false);
      }
    } else {
      this.payload = null;
      this.clearRequest();
    }
    if (tab === 'netbanking') {
      discreet.netbankingTab.render();
    }
    if (tab === 'wallet') {
      discreet.walletTab.render();
    }
    if (tab === 'international') {
      this.setInternationalTab(payload);
    }

    if (tab === 'upi') {
      this.updateCustomerInStore();
      //For the new flow checkout no longer asks for OTP for UPI subscriptions.
      discreet.upiTab.render();
      this.setScreen('upi');
    }

    if (tab === 'upi_otm') {
      this.updateCustomerInStore();
      discreet.upiTab.render({ method: 'upi_otm' });
    }

    if (tab === 'emandate') {
      this.emandateView.onShown();
    }

    if (tab === '' && (this.screen === 'upi' || this.screen === 'upi_otm')) {
      if (this.upiTab.onBack()) {
        return;
      }
      discreet.upiTab.destroy();
    }

    this.body.attr('tab', tab);
    this.tab = tab;

    if (tab === 'wallet') {
      this.setScreen('wallet');
    }

    if (tab === 'international') {
      this.showInternationalTab();
    }

    if (tab === 'card' || (tab === 'emi' && this.screen !== 'emi')) {
      // If we are switching from home tab or cardless emi tab (after choosing
      // "EMI on Cards"), the customer might have changed.
      if (this.screen === '' || this.screen === 'cardless_emi') {
        this.updateCustomerInStore();
        this.svelteCardTab.showLandingView();
      }
      this.showCardTab();
      cardTab.setEmiPlansCta(this.screen, tab);
    } else {
      if (
        !(
          tab === 'upi' &&
          RazorpayHelper.isASubscription() &&
          !this.getCurrentCustomer().logged
        )
      ) {
        this.setScreen(tab);
      }
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
      es6components.bankTransferTab.render();
    }

    if (tab === 'offline_challan') {
      discreet.offlineChallanTab.render();
    }
  },

  showCardTab: function () {
    this.otpView.updateScreen({
      maxlength: 6,
    });

    this.svelteCardTab.onShown();

    var self = this;
    var customer = self.getCurrentCustomer();
    var remember = Store.shouldRememberCustomer();

    var skipOTPFlow = discreet.CardHelper.delayLoginOTPExperiment();
    /**
     * tab is selected from p13n block which says 'Use your saved cards' ask otp always
     */
    if (this.switchTabPayload && this.switchTabPayload.preferred) {
      skipOTPFlow = false;
    }

    if (!remember) {
      return self.setScreen('card');
    }

    this.topBar.setTitleOverride('otp', 'text', 'card');

    this.otpView.updateScreen({
      skipTextLabel: RazorpayHelper.isOneClickCheckout()
        ? 'skip_saved_cards_one_cc'
        : 'skip_saved_cards',
    });

    /**
     * When the user comes back to the card tab after selecting EMI plan,
     * do not commence OTP again.
     */
    if (
      !skipOTPFlow &&
      customer.haveSavedCard &&
      !customer.logged &&
      !this.wants_skip &&
      this.screen !== 'card'
    ) {
      self.askOTPForSavedCard();
    } else {
      self.setScreen('card');
    }
  },

  askOTPForSavedCard: function () {
    var self = this;
    var customer = self.getCurrentCustomer();

    this.topBar.setTitleOverride('otp', 'text', 'card');

    this.otpView.updateScreen({
      skipTextLabel: RazorpayHelper.isOneClickCheckout()
        ? 'skip_saved_cards_one_cc'
        : 'skip_saved_cards',
    });

    self.commenceOTP('saved_cards_sending', 'saved_cards_access', {
      phone: getPhone(),
    });
    var smsHash = this.get('send_sms_hash') && this.sms_hash;
    var params = {};
    if (smsHash) {
      params.sms_hash = smsHash;
    }
    if (discreet.RazorpayHelper.isOneClickCheckout()) {
      params.otp_reason = discreet.RazorpayHelper.isOneClickCheckout()
        ? discreet.OTP_TEMPLATES.access_card
        : '';
    }
    customer.checkStatus(function () {
      /**
       * 1. If customer has saved cards and is not logged in, ask for OTP.
       * 2. If customer doesn't have saved cards, show cards screen.
       */
      if (customer.saved && !customer.logged) {
        askOTP(
          self.otpView,
          undefined,
          true,
          { phone: getPhone() },
          undefined,
          undefined,
          true
        );
      } else {
        self.setScreen('card');
      }
    }, params);
  },

  /**
   * Displays the modal for all EMI plans
   * @param {string} tab the tab from which the modal was invoked
   */
  showAllEmiPlans: function (tab) {
    Analytics.track('emi:plans:view:all', {
      type: AnalyticsTypes.BEHAV,
      data: {
        from: tab,
      },
    });

    showOverlay($('#emi-wrap'));
  },

  showEmiPlansForNewCard: function () {
    var self = this;
    var amount = self.get('amount');
    var appliedOffer = self.getAppliedOffer();

    var getBankEMICode = function (issuer, type) {
      // EMI codes are different from bank codes and have _DC at the end.
      if (type === 'debit' && !issuer.endsWith('_DC')) {
        return issuer + '_DC';
      }
      return issuer;
    };

    self.topBar.resetTitleOverride('emiplans');

    var bank = self.emiPlansForNewCard && self.emiPlansForNewCard.code;
    var cardIssuer = bank.split('_')[0];
    var cardType = bank.endsWith('_DC') ? 'debit' : 'credit';
    var isEmiOfferApplied = Boolean(
      appliedOffer &&
        appliedOffer.payment_method === 'emi' &&
        !appliedOffer.emi_subvention
    );

    bank = getBankEMICode(bank, cardType);

    var contactRequiredForEMI = MethodStore.isContactRequiredForEMI(
      bank,
      cardType
    );

    // We need to show plans without no-cost EMI if the applied offer is an
    // EMI offer because No cost EMI cannot be applied with regular EMI offers.
    var plans = MethodStore.getEMIBankPlans(bank, 'credit', !isEmiOfferApplied);
    var emiPlans = MethodStore.getEligiblePlansBasedOnMinAmount(plans);
    var prevTab = self.tab;
    var prevScreen = self.screen;

    self.emiPlansView.setPlans({
      type: 'new',
      amount: amount,
      plans: emiPlans,
      bank: bank,
      card: {
        issuer: cardIssuer,
        type: cardType,
      },
      contactRequiredForEMI: contactRequiredForEMI,
      on: {
        back: bind(function () {
          self.switchTab(prevTab);
          self.setScreen(prevScreen);
          self.svelteCardTab.showAddCardView();

          return true;
        }),

        payWithoutEmi: function () {
          Analytics.track('emi:pay_without', {
            type: AnalyticsTypes.BEHAV,
            data: {
              from: prevTab,
            },
          });

          EmiStore.newCardEmiDuration.set('');

          self.switchTab('card');
          self.setScreen('card');
          self.svelteCardTab.showLandingView();
        },

        select: function (value, contact) {
          var plan = plans.find(function (p) {
            return p.duration === value;
          });
          EmiStore.selectedPlan.set(plan);

          var text = cardTab.getEmiText(amount, plan) || '';

          Analytics.track('emi:plan:select', {
            type: AnalyticsTypes.BEHAV,
            data: {
              from: prevTab,
              value: value,
            },
          });

          EmiStore.newCardEmiDuration.set(value);
          EmiStore.selectedPlanTextForNewCard.set(text);

          self.switchTab('emi');
          self.svelteCardTab.showAddCardView();

          if (contactRequiredForEMI) {
            HomeScreenStore.emiContact.set(contact);
          }

          self.preSubmit();
        },

        viewAll: function () {
          self.showAllEmiPlans(prevTab);
        },
      },

      actions: {
        viewAll: true,
        payWithoutEmi: MethodStore.isMethodEnabled('card'),
      },
    });

    self.switchTab('emiplans');
    $('#body').removeClass('sub');
  },

  showEmiPlansForSavedCard: function (e) {
    var self = this;
    var amount = self.get('amount');
    var appliedOffer = self.getAppliedOffer();

    var getBankEMICode = function (issuer, type) {
      // EMI codes are different from bank codes and have _DC at the end.
      if (type === 'debit' && !issuer.endsWith('_DC')) {
        return issuer + '_DC';
      }
      return issuer;
    };

    self.topBar.resetTitleOverride('emiplans');

    var trigger = e.currentTarget;
    var $trigger = $(trigger);
    var bank = $trigger.attr('data-bank');
    var cardIssuer = bank;
    var cardType = $trigger.attr('data-card-type');
    var isEmiOfferApplied = Boolean(
      appliedOffer &&
        appliedOffer.payment_method === 'emi' &&
        !appliedOffer.emi_subvention
    );

    bank = getBankEMICode(bank, cardType);

    var contactRequiredForEMI = MethodStore.isContactRequiredForEMI(
      bank,
      cardType
    );

    // We need to show plans without no-cost EMI if the applied offer is an
    // EMI offer because No cost EMI cannot be applied with regular EMI offers.
    var plans = MethodStore.getEMIBankPlans(bank, cardType, !isEmiOfferApplied);
    var emiPlans = MethodStore.getEligiblePlansBasedOnMinAmount(plans);
    var $savedCard = $('.saved-card.checked');
    var savedCvv = $savedCard.$('.saved-cvv input').val();
    var prevTab = self.tab;
    var prevScreen = self.screen;

    self.emiPlansView.setPlans({
      type: 'saved',
      amount: amount,
      plans: emiPlans,
      card: {
        issuer: cardIssuer,
        type: cardType,
      },
      bank: bank,
      contactRequiredForEMI: contactRequiredForEMI,
      on: {
        back: function () {
          self.switchTab(prevTab);
          self.setScreen(prevScreen);

          return true;
        },

        payWithoutEmi: function () {
          Analytics.track('emi:pay_without', {
            type: AnalyticsTypes.BEHAV,
            data: {
              from: prevTab,
            },
          });

          EmiStore.setEmiDurationForSavedCard('');
          EmiStore.selectedPlanTextForSavedCard.set();

          self.switchTab('card');
          self.setScreen('card');
          self.svelteCardTab.showSavedCardsView();
        },

        select: function (value, contact) {
          var plan = plans.find(function (p) {
            return p.duration === value;
          });
          EmiStore.selectedPlan.set(plan);

          var text = cardTab.getEmiText(amount, plan) || '';

          Analytics.track('emi:plan:select', {
            type: AnalyticsTypes.BEHAV,
            data: {
              from: prevTab,
              value: value,
            },
          });

          EmiStore.setEmiDurationForSavedCard(value);
          EmiStore.selectedPlanTextForSavedCard.set(text);

          self.switchTab('emi');
          self.setScreen('card');
          self.svelteCardTab.showSavedCardsView();

          if (contactRequiredForEMI) {
            HomeScreenStore.emiContact.set(contact);
          }

          if (savedCvv) {
            self.preSubmit();
          } else {
            self.switchTab('emi');
            self.setScreen('card');
            self.svelteCardTab.showSavedCardsView();
          }
        },

        viewAll: function () {
          self.showAllEmiPlans(prevTab);
        },
      },

      actions: {
        viewAll: true,
        payWithoutEmi: MethodStore.isMethodEnabled('card'),
      },
    });

    self.switchTab('emiplans');
    $('#body').removeClass('sub');
  },

  showEmiPlansForBajaj: function () {
    var self = this;
    var amount = self.get('amount');
    var appliedOffer = self.getAppliedOffer();
    var isEmiOfferApplied = Boolean(
      appliedOffer &&
        appliedOffer.method === 'emi' &&
        !appliedOffer.emi_subvention
    );

    self.topBar.resetTitleOverride('emiplans');

    var bank = 'BAJAJ';

    // We need to show plans without no-cost EMI if the applied offer is an
    // EMI offer because No cost EMI cannot be applied with regular EMI offers.
    var plans = MethodStore.getEMIBankPlans(bank, 'credit', !isEmiOfferApplied);
    var emiPlans = MethodStore.getEligiblePlansBasedOnMinAmount(plans);
    var prevTab = self.tab;
    var prevScreen = self.screen;

    self.emiPlansView.setPlans({
      type: 'bajaj',
      amount: amount,
      plans: emiPlans,
      bank: bank,
      on: {
        back: function () {
          self.switchTab(prevTab);
          self.setScreen(prevScreen);
          return true;
        },

        select: function (value) {
          var plan = plans.find(function (plan) {
            return plan.duration === value;
          });

          var text = cardTab.getEmiText(amount, plan) || '';

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
    cardTab.setEmiPlansCta('emi', 'emiplans');
  },

  /**
   * Validates that the issuer of the offer is same as the selected value
   * @param {string} selectedVal
   *
   * @returns {boolean}
   */
  validateOffers: function (selectedIssuer, callback) {
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
  proceedAutomaticallyAfterSelectingBank: function (event) {
    if (this.checkInvalid()) {
      return;
    }

    this.switchTab('emandate');
  },

  checkInvalid: function (parent) {
    if (!parent) {
      parent = this.getActiveForm();
      var payload = this.payload;
      if (payload && payload.method === 'wallet' && !payload.wallet) {
        return $('#wallets').addClass('invalid');
      } else if (payload && payload.method === 'app') {
        // In "Add new card" screen, if we're selecting any application,
        // Card fields maybe invalid, however,  they should be ignored.
        return false;
      }
    }
    var invalids = $(parent).find('.invalid');
    if (invalids && invalids[0]) {
      updateScore('clickOnSubmitWithoutDetails');
      Form.shake();
      var invalidInput =
        $(invalids[0]).find('.input')[0] ||
        $(invalids[0]).find('input[type=checkbox]')[0];
      if (invalidInput) {
        invalidInput.focus();
      } else if ($(invalids[0]).hasClass('selector')) {
        $(invalids[0]).focus();
      }

      var culprit = invalidInput || invalids[0];
      Analytics.track('shake:invalid', {
        data: {
          class: $(culprit).attr('class'),
          id: $(culprit).attr('id'),
        },
      });

      each(invalids, function (i, field) {
        $(field).addClass('mature');
      });
      return true;
    }
  },

  getActiveForm: function () {
    var form = this.tab || 'common';
    // TODO: get rid of this
    if (form === 'emi') {
      if (form === 'emi' && this.screen === 'emi') {
        return '#add-emi-container';
      } else {
        form = 'card';
      }
    }
    if (form === 'gpay') {
      form = 'upi';
    }
    return '#form-' + form;
  },

  getFormData: function () {
    var tab = this.tab;
    if (!preferences) {
      return {};
    }
    var data = HomeScreenStore.getCustomerDetails();

    if (tab) {
      data.method = tab;
      var activeForm = this.getActiveForm();

      if (
        ![
          '#form-upi',
          '#form-card',
          '#form-wallet',
          '#form-emandate',
          '#form-upi_otm',
          '#form-international',
        ].includes(activeForm)
      ) {
        fillData(activeForm, data);
      }

      // Delete all the auth_type-* keys
      each(data, function (key, val) {
        if (key.indexOf('auth_type-') === 0) {
          delete data[key];
        }
      });

      if (this.screen === 'card') {
        _Obj.extend(data, this.svelteCardTab.getPayload());
        if (tab === 'emi') {
          var emiDuration = EmiStore.getEmiDurationForNewCard();
          if (emiDuration) {
            data.emi_duration = emiDuration;
          }
        }
        if (!data.emi_duration) {
          data.method = 'card';
          delete data.emi_duration;
        }
      }

      if (
        (this.screen === 'upi' || this.screen === 'upi_otm') &&
        this.tab !== 'qr'
      ) {
        /* All tabs should be responsible for their subdata */
        var upiData;

        if (this.screen === 'upi' || this.screen === 'upi_otm') {
          upiData = this.upiTab.getPayload();
        }

        each(upiData, function (key, value) {
          data[key] = value;
        });
      }

      // For a QR Payment in 1CC Flow, set the amount.
      if (this.tab === 'qr' && RazorpayHelper.isOneClickCheckout()) {
        var offer = this.getAppliedOffer();
        var hasDiscount = offer && offer.amount !== offer.original_amount;

        if (this.payload && this.payload.amount) {
          data.amount = this.payload.amount;
        } else if (hasDiscount) {
          data.amount =
            this.get('amount') + storeGetter(discreet.ChargesStore.offerAmount);
        } else {
          data.amount = this.get('amount');
        }
      }

      if (this.screen === 'wallet') {
        /* Wallet tab being responsible for its subdata */
        if (this.walletTab.isAnyWalletSelected()) {
          _Obj.extend(data, this.walletTab.getPayload());
        }
      }

      if (this.tab === 'emandate') {
        _Obj.extend(data, this.emandateView.getPayload());
      }

      if (this.tab === 'netbanking') {
        _Obj.extend(
          data,
          discreet.es6components.getView('netbankingTab').getPayload()
        );
      }
    }

    return data;
  },

  hide: function (confirmedCancel) {
    var self = this;
    if (this.isOpen) {
      if (confirmedCancel !== true && this.r._payment) {
        // confirm close returns a promise which is resolved/rejected as per uder's confirmation to close
        self.confirmClose().then(function (confirmed) {
          if (confirmed) {
            self.back(true);
          }
        });
        return;
      }

      $('#modal-inner').removeClass('shake');
      hideOverlayMessage();
      this.modal.hide();
      discreet.stopListeningForBackPresses();
    }
  },

  showLoadError: function (text, error, preventDismissal) {
    this.preventErrorDismissal = preventDismissal;
    if (this.headless && this.screen === 'card') {
      return;
    }

    var actionState;
    var loadingState = true;

    var cancelMsg = I18n.format('misc.payment_canceled');

    if (error) {
      if (
        (this.screen === 'upi' || this.screen === 'upi_otm') &&
        (text === cancelMsg || text === discreet.cancelMsg)
      ) {
        if (
          this.payload &&
          (this.payload['_[flow]'] === 'intent' ||
            this.payload.provider === 'google_pay')
        ) {
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
      text = I18n.format('misc.payment_processing');
    }

    if (this.screen === 'otp') {
      if (
        CommonHandlers.hasPaypalOptionInErrorMetadata(this.ajaxErrorMetadata)
      ) {
        return this.commenceOTP(text, undefined, {}, 'paypal', loadingState);
      }
      return this.commenceOTP(text, undefined, {}, actionState, loadingState);
    }

    // Break sentences into new lines
    var formattedText = UTILS.escapeHtml(text).replace(/\.\s/g, '.<br/>');

    $('#fd-t').rawHtml(formattedText);
    showOverlay($('#error-message').toggleClass('loading', loadingState));
  },

  commenceOTP: function (
    textView,
    reason,
    templateData,
    action,
    loading,
    headingText
  ) {
    if (typeof loading === 'undefined') {
      loading = true;
    }

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

    if (!action) {
      invoke(
        function () {
          if (this.screen === 'otp' && (this.tab !== 'card' || !this.payload)) {
            Cta.showVerify();
          }
        },
        this,
        null,
        200
      );
    }

    if (this.screen === 'otp') {
      this.body.removeClass('sub');
      this.otpView.setTextView(textView, templateData);
      this.otpView.updateScreen({
        headingText: headingText,
      });

      this.otpView.updateScreen({
        action: action,
        loading: loading,
      });
    } else {
      var locale = I18n.getCurrentLocale();
      var text = I18n.getOtpScreenTitle(textView, templateData, locale);
      this.showLoadError(text);
    }
  },

  setUpiCancelReasonPicker: function () {
    this.upiCancelReasonPicker = new discreet.UpiCancelReasonPicker({
      target: docUtil.querySelector('#cancel_upi'),
    });
  },

  setNbCancelReasonPicker: function () {
    this.nbCancelReasonPicker = new discreet.NetbankingCancelReasonPicker({
      target: docUtil.querySelector('#error-message'),
    });
  },

  getDowntimeAlertDialog: function () {
    return $('#downtime-wrap');
  },

  getCovidDonationDialog: function () {
    return $('#covid-wrap');
  },

  setSvelteOverlay: function () {
    this.svelteOverlay = new discreet.Overlay({
      target: docUtil.querySelector('#modal-inner'),
    });
  },

  showSvelteOverlay: function () {
    if (!this.svelteOverlay) {
      this.setSvelteOverlay();
    }
    showOverlay();
    this.svelteOverlay.show();
  },

  hideSvelteOverlay: function () {
    if (this.svelteOverlay) {
      this.svelteOverlay.hide();
    }
  },

  /**
   * Show fees UI if `fee` is missing in payload
   */
  showFeesUi: function () {
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
      var paymentData = _Obj.clone(this.payload);

      // Create fees route in API doesn't like this.
      delete paymentData.upi_app;

      discreet.showFeeBearer({
        paymentData: paymentData,
        onContinue: function (bearer) {
          // Set the updated amount & fee
          session.payload.amount = bearer.amount;
          session.payload.fee = bearer.fee;

          // Don't redirect to fees route now
          session.feesRedirect = false;
          session.submit();
        },
      });
    }
  },

  closeModal: function () {
    var session = this;

    if (session.get('modal.confirm_close')) {
      session.confirmClose().then(function (close) {
        if (close) {
          session.hide();
        }
      });
    } else {
      session.hide();
    }
  },

  onOtpSubmit: function () {
    if (this.checkInvalid('#form-otp')) {
      return;
    }

    var isWallet = this.payload && this.payload.method === 'wallet';

    Analytics.track('otp:submit', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: isWallet,
      },
    });

    var otp =
      storeGetter(discreet.OTPScreenStore.otp) ||
      storeGetter(discreet.OTPScreenStore.digits).join('');

    if (
      otp.length > 0 &&
      (!RazorpayHelper.isOneClickCheckout() ||
        !storeGetter(discreet.OTPScreenStore.isRazorpayOTP) ||
        otp.length === storeGetter(discreet.OTPScreenStore.digits).length)
    ) {
      this.commenceOTP('verifying_otp');

      if (isWallet || this.headless) {
        this.otpView.updateScreen({
          showCtaOneCC: false,
        });
        return this.r.submitOTP(otp);
      }

      var queryParams;
      var callback;

      var isCardlessEmi =
        this.payload && this.payload.method === 'cardless_emi';

      if (!isCardlessEmi && this.tab !== 'upi') {
        // card tab only past this
        // card filled by logged out user + remember me
        if (this.payload) {
          var isRedirect = this.get('redirect');
          if (!isRedirect) {
            this.submit();
          }
          callback = function (msg) {
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
                wallet: isWallet,
              });

              askOTP(
                this.otpView,
                msg,
                true,
                { phone: getPhone() },
                undefined,
                msg,
                true
              );
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

          callback = function (msg) {
            if (self.getCurrentCustomer().logged) {
              // OTP verification successful
              OtpService.resetCount('razorpay');

              self.updateCustomerInStore();
              self.svelteCardTab.showLandingView().then(function () {
                self.showCardTab();
                /**
                 * In case p13n from storage we store token_id if we after otp verify select other card in presubmit it pick storage card data
                 */
                HomeScreenStore.selectedInstrumentId.set(null);
              });
            } else {
              Analytics.track('behav:otp:incorrect', {
                wallet: isWallet,
              });
              askOTP(
                this.otpView,
                msg,
                true,
                { phone: getPhone() },
                undefined,
                msg,
                true
              );
              self.updateCustomerInStore();
            }
          };
        }
      }

      var submitPayload = {
        otp: otp,
        email: getEmail(),
      };

      if (this.tab === 'cardless_emi' || isCardlessEmi) {
        var providerCode = CardlessEmiStore.providerCode;

        submitPayload = _Obj.extend(submitPayload, {
          provider: providerCode,
          method: 'cardless_emi',
          payment_id: this.r._payment.payment_id,
        });

        callback = function (msg, data) {
          if (msg) {
            this.otpView.updateScreen({
              showCtaOneCC: true,
            });
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

        this.otpView.updateScreen({
          showCtaOneCC: false,
        });
      }

      if (this.tab === 'upi') {
        callback = function (msg, data) {
          if (msg) {
            Analytics.track('behav:otp:incorrect');
            askOTP(this.otpView, msg, true);
            this.updateCustomerInStore();
          } else {
            discreet.upiTab.render();
            this.setScreen('upi');
          }
        };
      }

      if (this.tab === 'paylater') {
        var providerCode = PayLaterStore.providerCode;

        queryParams = {
          provider: providerCode,
          method: 'paylater',
        };

        callback = function (msg, data) {
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
        this.commenceOTP('verifying');
      }
      this.getCurrentCustomer().submitOTP(
        submitPayload,
        bind(callback, this),
        queryParams
      );
    } else {
      updateScore('clickOnSubmitWithoutDetails');
      Form.shake();
    }
  },

  getCurrentCustomer: function (phone) {
    return this.getCustomer(phone || getPhone());
  },

  clearRequest: function (extra) {
    this.hideTimer();
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
    this.powerwallet = false;

    Analytics.removeMeta('doneByInstrument');
    Analytics.removeMeta('instrumentMeta');
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
  resetCardlessEmiStoreForProvider: function (provider) {
    if (!provider) {
      return;
    }

    _Obj.loop(CardlessEmiStore, function (value, key) {
      delete value[provider];
    });
  },

  showConversionChargesCallout: function () {
    var locale = I18n.getCurrentLocale();

    this.svelteOverlay.$set({
      component: discreet.UserConfirmationOverlay,
      props: {
        buttonText: I18n.formatMessageWithLocale('cta.continue', locale),
        callout: I18n.formatMessageWithLocale(
          'card.international_currency_charges',
          locale
        ),
      },
    });

    var that = this;

    this.showSvelteOverlay();
    var clearActionListener = that.svelteOverlay.$on(
      'action',
      function (event) {
        var action = event.detail.action;
        if (action === 'confirm') {
          that.hideSvelteOverlay();
          Backdrop.hide();
          that.submit();
        }
      }
    );
    var clearHideListener = that.svelteOverlay.$on('hidden', function () {
      clearActionListener();
      clearHideListener();
    });
  },

  getAVSPayload: function (selectedInstrument) {
    var isOnAVSScreen = this.svelteCardTab.isOnAVSScreen() || false;

    var isAVSScreenFromHomeScreen =
      selectedInstrument &&
      selectedInstrument.method === 'card' &&
      selectedInstrument.token_id &&
      isOnAVSScreen;

    return {
      isOnAVSScreen: isOnAVSScreen,
      isAVSScreenFromHomeScreen: isAVSScreenFromHomeScreen,
    };
  },

  isOnNVSForm: function () {
    return this.internationalTab && this.internationalTab.isOnNVSForm();
  },

  /**
   * Attempts a payment
   * @param {Event} e
   * @param {Object} payload Overridden payload
   */
  preSubmit: function (e, payload) {
    if (this.tab === 'home-1cc') {
      return;
    }
    preventDefault(e);
    // let <CTA> handle click, if present
    // used for keyboard submit in payout screen
    var cta = docUtil.querySelector('#footer-cta + span');
    if (cta && e && e.type === 'submit') {
      return cta.click();
    }
    var screen = this.screen;
    var tab = this.tab;
    var selectedInstrument = this.getSelectedPaymentInstrument();

    if (selectedInstrument) {
      merchantAnalytics({
        event: merchantAnalyticsConstant.ACTIONS.PAY_NOW_CLICKED,
        category: merchantAnalyticsConstant.CATEGORIES.PAYMENT_METHODS,
      });
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
            this.homeTab.next();
            return discreet.CRED.checkCREDEligibilityForUpdatedContact();
          }
        }
      } else {
        this.offers && this.offers.clearOffer();
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

    var AVSRequired = false;
    var AVSRequiredForEntity = null;
    var AVSMap = discreet.storeGetter(CardScreenStore.AVSScreenMap) || {};
    var AVSData = this.getAVSPayload(selectedInstrument || {}) || {};
    var isOnAVSScreen = AVSData.isOnAVSScreen;
    var isAVSScreenFromHomeScreen = AVSData.isAVSScreenFromHomeScreen;

    // NVS (Name address Verification System)
    var NVSRequired = false;
    var NVSEntities =
      discreet.storeGetter(discreet.InternationalStores.NVSEntities) || {};
    var isOnNVSForm = this.isOnNVSForm();
    var isNVSFormHomeScreenView = discreet.storeGetter(
      discreet.InternationalStores.isNVSFormHomeScreenView
    );

    var tpv = MethodStore.getTPV();
    if (tpv && tpv.invalid && this.homeTab && this.homeTab.validateTPVOrder) {
      return this.homeTab.validateTPVOrder(tpv, true);
    }

    if (tpv) {
      if (!this.checkCommonValidAndTrackIfInvalid()) {
        // TODO check multi TPV with UPI prefill
        return;
      }
      /**
       * This logic gets executed only if TPV order is valid
       * tpv.method can be undefined if both UPI & NB enabled
       * - for this case we will be auto-selecting NB in radio list in home screen defaults for TPV
       * - if user directly clicks pay in home screen, data.method will be undefined and
       * - getSelectedTPVOrderMethod returns the approriate method chosen
       */

      data.method = data.method || this.homeTab.getSelectedTPVOrderMethod();
      data.bank = tpv.code;

      if (data.method === 'upi') {
        if (tab !== 'upi') {
          return this.switchTab('upi');
        }
        if (this.checkInvalid('#form-upi input:checked + label')) {
          return;
        }
      }
      // from home page to AVS screen transition set screen = card
    } else if (
      screen &&
      !isAVSScreenFromHomeScreen &&
      !isNVSFormHomeScreenView
    ) {
      if (screen === 'card') {
        // AVS check
        var isSavedCardScreen = this.svelteCardTab.isOnSavedCardsScreen();
        var cardIin = discreet.storeGetter(CardScreenStore.cardIin);
        var selectedCard = discreet.storeGetter(CardScreenStore.selectedCard);
        /**
         * if new card is added then get cardIin
         * else if saved card selected on cards screen then get tokenId
         */
        AVSRequiredForEntity = discreet.CardHelper.getEntityForAVSMap({
          currentView: isSavedCardScreen ? CardViews.SAVED_CARDS : '',
          iin: cardIin,
          selectedCard: selectedCard,
        });
        AVSRequired = AVSRequiredForEntity
          ? Boolean(AVSMap[AVSRequiredForEntity])
          : false;
        // get card number & token id

        if (data.provider) {
          // Validate any additional input (like contact).
          if (this.checkInvalid('.selected.instrument')) {
            return;
          }
          // Set method as "app"
          // By default the method is set to whatever screen you're on. -_-
          data.method = 'app';
          // We don't want to validate card fields if we're paying via application.
          // Do nothing.
        } else if (!isSavedCardScreen) {
          // TODO: simplify conditions
          // Do not proceed with amex cards if amex is disabled for merchant
          // also without this, cardsaving is triggered before API returning unsupported card error
          var cardType = discreet.storeGetter(CardScreenStore.cardType);
          if (!MethodStore.isAMEXEnabled() && cardType === 'amex') {
            return this.showLoadError(
              I18n.format('card.card_number_help_amex'),
              true
            );
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
            updateScore('clickOnSubmitWithoutDetails');
            Form.shake();
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
              updateScore('clickOnSubmitWithoutDetails');
              Form.shake();
              return $('#card_number').focus();
            }

            if (this.checkInvalid()) {
              return;
            }

            if (!data.emi_duration) {
              /**
               * If this is a saved ard and no EMI duration is selected,
               * show the EMI plans.
               */
              if (data.token) {
                this.showEmiPlansForSavedCard({
                  currentTarget: $(
                    '.saved-card[token="' + data.token + '"] .emi-plans-trigger'
                  )[0],
                });
              } else {
                /**
                 * If this is a new card and no EMI duration is selected,
                 * show the EMI plans.
                 */
                this.showEmiPlansForNewCard({
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
        var forcedOffer = discreet.Offers.getForcedOffer();
        var offer = this.getAppliedOffer();
        if (forcedOffer && offer) {
          var isCardOfferValid = discreet.storeGetter(
            discreet.OffersStore.isCardValidForOffer
          );
          // check if its valid offer or not
          if (!isCardOfferValid) {
            Form.shake();
            // if saved card screen
            $('.checked .saved-cvv input').focus();
            return $('#card_number').focus();
          }
        }
      } else if (/^emiplans/.test(screen)) {
        if (!(data.method === 'cardless_emi' && data.emi_duration)) {
          return this.emiPlansView.submit();
        }
      }

      if (screen === 'international') {
        var selectedInternationalProvider = discreet.storeGetter(
          discreet.InternationalStores.selectedInternationalProvider
        );
        if (selectedInternationalProvider) {
          NVSRequired = NVSEntities[selectedInternationalProvider];
        }
      }

      // perform the actual validation
      if (screen === 'upi' || screen === 'upi_otm') {
        // Event triggered when user enters UPI ID and clicks submit
        Analytics.track('checkoutUpiVpaSubmitted');
        var formSelector = '#user-new-vpa-container-' + screen;

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

      //
      // 1. If Payment is Recurring &&
      // 2. Customer is Indian
      // 3. If on add card screen and save card checkbox is not checked
      // 4. If on saved card screen and consent is not already taken for saved card && checkbox is also not checked
      // ==> Shake the form and show tooltip on checkbox
      var isRecurring = RazorpayHelper.isRecurring();
      var isDomesticCustomer = discreet.storeGetter(Store.isIndianCustomer);
      var isSavedCardScreen = this.svelteCardTab.isOnSavedCardsScreen();

      // For saved card screen consent is maintained elsewhere
      var rememberCardCheck = discreet.storeGetter(
        isSavedCardScreen
          ? CardScreenStore.userConsentForTokenization
          : CardScreenStore.remember
      );

      var selectedCard = discreet.storeGetter(CardScreenStore.selectedCard);
      var selectedCardConsent = selectedCard && selectedCard.consent_taken;
      var isSavedCardScreenAndConsentAlreadyTaken =
        isSavedCardScreen && selectedCardConsent;

      if (
        isRecurring &&
        isDomesticCustomer &&
        !rememberCardCheck &&
        !isSavedCardScreenAndConsentAlreadyTaken
      ) {
        var showSavedCardTooltip = CardScreenStore.showSavedCardTooltip;
        Form.shake();
        showSavedCardTooltip.update(function () {
          return true;
        });

        return;
      }
    } else if (selectedInstrument) {
      if (
        selectedInstrument.method === 'card' &&
        isOnAVSScreen &&
        this.checkInvalid('#form-card')
      ) {
        return;
      }

      if (!isOnAVSScreen && !this.checkCommonValidAndTrackIfInvalid()) {
        return;
      }

      if (selectedInstrument.method === 'card' && !isOnAVSScreen) {
        // in AVS screen there is no cvv input
        AVSRequiredForEntity = selectedInstrument.token_id;
        AVSRequired = Boolean(AVSMap[AVSRequiredForEntity]);
        /*
         * Add cvv to data from the currently selected instrument
         */
        var instrumentInDom = _El.closest(
          docUtil.querySelector(
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
            updateScore('clickOnSubmitWithoutDetails');
            return Form.shake();
          }
        }
      } else if (selectedInstrument.method === 'cod') {
        // Show order summary when payment method=cod
        discreet.OneClickCheckoutInterface.showOrderSummary();
        return;
      }

      // check for NVS form validations
      if (
        isOnNVSForm &&
        isNVSFormHomeScreenView &&
        this.checkInvalid('#form-international')
      ) {
        return;
      }
      if (
        !isOnNVSForm &&
        discreet.isInternationalInPreferredInstrument(selectedInstrument)
      ) {
        NVSRequired = NVSEntities[selectedInstrument.providers[0]];
        this.switchTab('international', {
          directlyToNVS: NVSRequired,
        });
      }
    } else if (data.method === 'paypal') {
      // Let method=paypal payments go through directly
    } else {
      return;
    }

    if (
      discreet.storeGetter(CardScreenStore.internationalCurrencyCalloutNeeded)
    ) {
      this.showConversionChargesCallout();
      return;
    }
    var payload = this.payload;
    // checking if the method selected is from the preferred method or from the method screen as this.payload is null in preferred methods
    if (
      selectedInstrument &&
      selectedInstrument.id &&
      selectedInstrument.id.indexOf('rzp.cluster') === -1 &&
      !payload.downtimeSeverity
    ) {
      payload = selectedInstrument;
    }
    this.downtimeSeverity = payload.downtimeSeverity;
    var downtimeInstrument = discreet.downtimeUtils.checkForDowntime(payload);
    if (!isOnAVSScreen) {
      CardScreenStore.isAVSEnabledForEntity.set(AVSRequiredForEntity);
    }

    // meta for tracking AVS
    if (AVSRequired || isOnAVSScreen) {
      Analytics.setMeta('avs', true);
    } else {
      Analytics.removeMeta('avs');
    }
    // meta for tracking NVS
    if (NVSRequired || isOnNVSForm) {
      Analytics.setMeta('nvs', true);
    } else {
      Analytics.removeMeta('nvs');
    }
    if (!isOnAVSScreen && AVSRequired) {
      var directlyToAVS = false;
      if (screen !== 'card') {
        // change to card screen
        this.showCardTab();
        directlyToAVS = true;
      }
      // verify AVS needed
      this.svelteCardTab.showAVSView(directlyToAVS);
    } else if (!isOnNVSForm && NVSRequired && this.internationalTab) {
      if (screen !== 'international') {
        this.showInternationalTab();
      }
      this.internationalTab.showNVSForm(screen !== 'international');
    } else if (!downtimeInstrument) {
      this.submit();
    } else {
      discreet.downtimeUtils.showDowntimeAlert(downtimeInstrument);
      showOverlay(this.getDowntimeAlertDialog());
    }
  },

  getSelectedPaymentInstrument: function () {
    return storeGetter(HomeScreenStore.selectedInstrument);
  },

  verifyVpa: function (vpa) {
    /**
     * set a timeout of 10s, if the API is taking > 10s to resolove;
     * attempt payment regardless of verification
     */
    return this.r.verifyVpa(vpa, 10000);
  },

  verifyVpaAndContinue: function (data) {
    var self = this;
    self.showLoadError(I18n.format('upi.verifying_vpa_info'));
    $('#overlay-close').hide();

    self
      .verifyVpa(data.vpa)
      .then(function () {
        $('#overlay-close').show();
        hideOverlay($('#error-message'));
        setTimeout(function () {
          self.submit({
            vpaVerified: true,
          });
        }, 200);
      })
      .catch(function (vpaValidationError) {
        var errorDescription = _Obj.getSafely(
          vpaValidationError,
          'error.description'
        );

        var errorMessage = errorDescription
          ? I18n.translateErrorDescription(
              errorDescription,
              I18n.getCurrentLocale()
            )
          : I18n.format('upi.invalid_vpa_default_message');

        self.showLoadError(errorMessage, true);
      });
  },

  submit: function (props) {
    var locale = I18n.getCurrentLocale();
    if (!props) {
      props = {};
    }
    var vpaVerified = props.vpaVerified;
    var data = this.payload;
    // deleting downtimeSeverity & downtimeInstrument from data & saving downtimeSeverity for analytics
    delete data.downtimeSeverity;
    delete data.downtimeInstrument;

    var goto_payment = '#error-message .link';
    var redirectableMethods = ['card', 'netbanking', 'wallet'];
    if (
      this.get('redirect') &&
      redirectableMethods.includes(this.payload.method)
    ) {
      $(goto_payment).hide();
    }

    if (this.data && this.data.method === 'netbanking' && !this.data.bank) {
      Analytics.track('netbanking:bank:empty', {
        type: AnalyticsTypes.DEBUG,
      });
    }

    // [ANALYTICS]
    if (data && data.method === 'upi') {
      trackUpiIntentInstrumentPaymentAttempted(
        discreet.storeGetter(UpiScreenStore.intentVpaPrefilledFromPreferences)
      );
    }

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
          this.r._payment.off();
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

    if (this.tab === 'upi') {
      shouldContinue = this.upiTab.shouldSubmit();
      if (!shouldContinue) {
        this.upiTab.updateStep();
      }
    }

    if (!shouldContinue) {
      return;
    }

    var session = this;
    var request = {
      feesRedirect: preferences.fee_bearer && !('fee' in data),
      optional: RazorpayHelper.getOptionalObject(),
      external: {},
      paused: this.get().paused,
      downtimeSeverity: this.downtimeSeverity,
    };

    var session_options = this.get();
    if (session_options.force_terminal_id) {
      data.force_terminal_id = session_options.force_terminal_id;
    }
    if (this.tab === 'emandate' && RazorpayHelper.isASubscription('emandate')) {
      // recurring token
      data.recurring_token =
        preferences.subscription && preferences.subscription.recurring_token;
      data.amount = 0;
    }

    var selectedInstrument = this.getSelectedPaymentInstrument();

    var AVSData = this.getAVSPayload(selectedInstrument || {}) || {};
    // if AVS is on then screen is set to card but for saved card from home screen requires processing like home screen
    var isAVSScreenFromHomeScreen = AVSData.isAVSScreenFromHomeScreen;

    // AVS check
    var AVSMap = discreet.storeGetter(CardScreenStore.AVSScreenMap) || {};
    var selectedCard = discreet.storeGetter(CardScreenStore.selectedCard);
    var avsEntity = storeGetter(CardScreenStore.isAVSEnabledForEntity);

    var AVSRequired = avsEntity ? Boolean(AVSMap[avsEntity]) : false;

    var NVSEntity = discreet.storeGetter(
      discreet.InternationalStores.selectedInternationalProvider
    );

    var isNVSFormHomeScreenView = discreet.storeGetter(
      discreet.InternationalStores.isNVSFormHomeScreenView
    );

    /**
     * If user selects the card from p13n user will be auto-redirected to saved cards screen
     * And in both cases i.e, p13n card selection and saved card selection both will have
     * isSavedCardScreen:true and selectedInstrumnet.method=card.
     *
     * if card is selected from p13n then
     * isSavedCardScreen:true,
     * selectedCard:null,
     * tokenId:null,
     * selectedInstrument: { method: 'card', token_id:XXXXX, consent_taken }
     *
     * if selected from savedCards Screen then
     * isSavedCardScreen:true,
     * selectedCard:{ consent_taken, id: //here is the actual token_id , and tokenisation status(consent_taken) will be available here },
     * selectedInstrument: { method: 'card', token_id:undefined }
     * tokenId: XXXXX,
     *
     * since consent_taken param from token item is required to add consent to payload,
     */
    var isSavedCardScreen = this.svelteCardTab.isOnSavedCardsScreen();
    var isCardRelatedPayment =
      isSavedCardScreen && (data.method === 'card' || data['card[cvv]']);
    var addTokenizationConsentToPayload = false;
    // when card is selected from saved card screen
    var consentPendingForSelectedCardInSavedCardScreen =
      selectedCard && !selectedCard.consent_taken;
    // when card is selected from p13n block
    var consentPendingForSelectedCardInP13n =
      selectedInstrument &&
      selectedCard === null &&
      !selectedInstrument.consent_taken;
    if (
      isCardRelatedPayment &&
      (consentPendingForSelectedCardInSavedCardScreen ||
        consentPendingForSelectedCardInP13n)
    ) {
      addTokenizationConsentToPayload = true;
      if (this.screen) {
        // other than homescreen/p13n block
        // home screen case is handled little lower to this block
        data.user_consent_for_tokenisation = Number(
          discreet.storeGetter(CardScreenStore.userConsentForTokenization)
        );
      }
    }

    if (!this.screen || isAVSScreenFromHomeScreen || isNVSFormHomeScreenView) {
      if (selectedInstrument) {
        data = Instruments.addInstrumentToPaymentData(
          selectedInstrument,
          data,
          this.getCustomer(getPhone())
        );

        NVSEntity =
          this.screen === 'international' && isNVSFormHomeScreenView
            ? data.provider
            : null;

        /** This logic is intended for cards tokenization feature and
         * can be removed after 31st December 2021 once whole rzp saved cards
         * are undergoing tokenization by default
         **/
        var user_consent_for_tokenisation = discreet.storeGetter(
          CardScreenStore.userConsentForTokenization
        );
        if (
          data.method === 'card' &&
          data.token &&
          addTokenizationConsentToPayload
        ) {
          data.user_consent_for_tokenisation = Number(
            user_consent_for_tokenisation
          );
        }
        this.payload = data;
        Analytics.setMeta('doneByInstrument', true);
        Analytics.setMeta(
          'instrumentMeta',
          discreet.getInstrumentMeta(selectedInstrument)
        );

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

          case 'app': {
            // TODO: Check if it's possible to move this to instruments-config
            if (selectedInstrument._ungrouped[0].provider === 'cred') {
              _Obj.extend(this.payload, MethodStore.getPayloadForCRED());

              if (RazorpayHelper.isContactOptional()) {
                // For contact optional case, we ask for contact separately
                // which is present in proxyPhone.
                this.payload.contact = getProxyPhone();
              }
            }
          }
        }
      }
    }

    if (data.method === 'wallet') {
      /**
       * Wallets might need to go through intent flow too
       * TODO: Add a feature check here
       */
      var shouldTurnWalletToIntent = discreet.Wallet.shouldTurnWalletToIntent(
        data.wallet,
        NativeStore.getUPIIntentApps().filtered
      );

      if (shouldTurnWalletToIntent) {
        data.upi_app = discreet.Wallet.getPackageNameForWallet(data.wallet);
      }
    }

    var session = this;

    // For these conditions use google pay card + upi merged flow,
    // so make google pay intent call same as app so that
    // only one thing is managed from here on
    if (
      data.method === 'upi' &&
      data.upi_app === UPIUtils.GOOGLE_PAY_PACKAGE_NAME &&
      this.hasGooglePaySdk &&
      MethodStore.isGpayMergedFlowEnabled() &&
      (this.googlePayWrapperVersion === '2' ||
        this.googlePayWrapperVersion === 'both')
    ) {
      data.method = 'app';
      data.provider = 'google_pay';

      delete data.upi;
      delete data.upi_app;
      delete data['_[flow]'];
    }

    // For these condition use google pay upi half screen flow,
    // we are doing so many conditions because we want to
    // have back support for upi half screen flow in
    // multiple scenarios
    if (
      data.method === 'upi' &&
      data.upi_app === UPIUtils.GOOGLE_PAY_PACKAGE_NAME &&
      this.hasGooglePaySdk &&
      (this.googlePayWrapperVersion === '1' ||
        (this.googlePayWrapperVersion === 'both' &&
          !MethodStore.isGpayMergedFlowEnabled()))
    ) {
      request.external.gpay = true;
      request['_[flow]'] = 'intent';
    }

    // This is for Google pay card + upi merged flow, so this will
    // always happen via external google pay sdk. Payment started
    // from card screen will always have this method and provider
    // and we are converting upi payment to merged flow and
    // updating method to `app` and provider to `google_pay`
    if (
      this.hasGooglePaySdk &&
      data.method === 'app' &&
      data.provider === 'google_pay'
    ) {
      request.external.gpay = true;
    }

    if (data.method === 'paypal') {
      data.method = 'wallet';
      data.wallet = 'paypal';
    }
    if (RazorpayHelper.isAddressEnabled()) {
      var notes = (data.notes = _Obj.clone(this.get('notes')) || {});
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

    if (
      data.method === 'upi' &&
      data['_[flow]'] === 'intent' &&
      WebPaymentsApi.appsThatSupportWebPayments.find(function (app) {
        return app.package_name === data.upi_app;
      }) &&
      WebPaymentsApi.isWebPaymentsApiAvailable(data.upi_app)
    ) {
      request.gpay = true;
    }

    // added rewardIds to the create payment request
    var reward = storeGetter(rewardsStore);
    if (reward && reward.reward_id && !RazorpayHelper.isEmailOptional()) {
      data.reward_ids = [reward.reward_id];
    }

    var appliedOffer = this.getAppliedOffer();
    if (appliedOffer && (!this.offers || this.offers.shouldSendOfferToApi())) {
      if (appliedOffer.type !== 'read_only') {
        data.offer_id = appliedOffer.id;
        this.r.display_amount = RazorpayHelper.isOneClickCheckout()
          ? this.get('amount')
          : appliedOffer.amount;
        updateScore('affordability_offers');
        Analytics.track('offers:applied_with_payment', {
          data: appliedOffer,
        });
      }
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

      this.r.on('payment.process', function (paymentData) {
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
      return this.verifyVpaAndContinue(data);
    }

    if (request.feesRedirect) {
      this.showFeesUi();
      return;
    }

    /**
     * - Ask user to verify phone number if not logged in and wants to save card
     * - Show OTP screen after user agrees to fees
     */
    if (data.save && !this.getCurrentCustomer().logged) {
      if (this.screen === 'card') {
        this.otpView.updateScreen({
          skipTextLabel: RazorpayHelper.isOneClickCheckout()
            ? 'skip_saving_card_one_cc'
            : 'skip_saving_card',
        });
        Analytics.track('saved_cards:save:otp:ask');
        this.commenceOTP('otp_sending_generic', 'saved_cards_save', {
          phone: getPhone(),
        });
        askOTP(
          this.otpView,
          undefined,
          true,
          { phone: getPhone() },
          undefined,
          undefined,
          true
        );
        var otpTemplate = discreet.OtpTemplatesHelper.getDefaultOtpTemplate();
        this.getCurrentCustomer().createOTP(
          function () {
            session.updateCustomerInStore();
          },
          null,
          otpTemplate
        );
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

    if (this.modal) {
      this.modal.options.backdropclose = false;
    }

    if (data.method === 'international' && NVSEntity) {
      data.provider = NVSEntity;
    }

    // for paypal and trustly dcc enable is not required
    if (
      discreet.storeGetter(CardScreenStore.currencyRequestId) &&
      ((data.method === 'card' && RazorpayHelper.isDCCEnabled()) ||
        (data.method === 'wallet' && data.wallet === 'paypal') ||
        (data.method === 'international' && data.provider === NVSEntity))
    ) {
      data.currency_request_id = discreet.storeGetter(
        CardScreenStore.currencyRequestId
      );
      data.dcc_currency = discreet.storeGetter(CardScreenStore.dccCurrency);
      data.default_dcc_currency = discreet.storeGetter(
        CardScreenStore.defaultDCCCurrency
      );

      // These are undefined/empty if the user uses an Indian card
      if (!data.currency_request_id) {
        delete data.currency_request_id;
        delete data.dcc_currency;
        delete data.default_dcc_currency;
      }
    }

    /**
     * For AVS if method is card && currency is not INR i.e. DCC or MCC flow enabled
     */
    if (data.method === 'card' && AVSRequired) {
      // AVS
      AVSData = discreet.storeGetter(CardScreenStore.AVSBillingAddress) || {};
      // AVS will submit only on AVS screen
      if (this.svelteCardTab.isOnAVSScreen() && AVSData && AVSData.line1) {
        if (AVSData._country) {
          // onretry we already updated the payload
          AVSData.country = AVSData._country;
          delete AVSData._country;
        }
        data.billing_address = {
          city: AVSData.city,
          country: AVSData.country,
          line1: AVSData.line1,
          line2: AVSData.line2,
          postal_code: AVSData.postal_code,
          state: AVSData.state,
        };
        Analytics.track('card:avsdata', {
          data: AVSData,
        });
      }
    }

    if (data.method === 'international') {
      data.method = 'app';
      if (this.isOnNVSForm() && NVSEntity) {
        var NVSEntitiesMap =
          discreet.storeGetter(discreet.InternationalStores.NVSEntities) || {};
        var NVSFormData =
          discreet.storeGetter(discreet.InternationalStores.NVSFormData) || {};
        var NVSRequired = NVSEntitiesMap[NVSEntity];

        /**
         * International method namespace is only used on frontend. On backend it is treated as "app".
         */

        if (NVSRequired && NVSFormData) {
          if (NVSFormData._country) {
            // onretry we already updated the payload
            NVSFormData.country = NVSFormData._country;
            delete NVSFormData._country;
          }
          data.billing_address = NVSFormData;
          Analytics.track('card:nvsformdata', {
            data: NVSFormData,
          });
        }
      }
    }

    var emiCode, emiContact, isHDFCDebitEMI;
    if (data.method === 'emi') {
      emiCode = cardTab.getIssuerForEmiFromPayload(data);
      isHDFCDebitEMI = emiCode === 'HDFC_DC';
      emiContact = discreet.storeGetter(HomeScreenStore.emiContact);
      if (isHDFCDebitEMI && emiContact) {
        data.contact = emiContact;
      }
      if (isHDFCDebitEMI) {
        data['_[mode]'] = 'hdfc_debit_emi';
      }
    }

    if (data.method === 'app') {
      var provider = data.provider;
      Analytics.track('app:attempt', {
        data: {
          method: data.method,
          provider: provider,
        },
      });

      if (provider === 'cred') {
        if (RazorpayHelper.isContactOptional()) {
          // For contact optional case, we ask for contact separately
          // which is present in proxyPhone.
          this.payload.contact = getProxyPhone();
        }
        var userEligibleDetails =
          discreet.CRED.isUserEligible(this.payload.contact) || {};
        if (userEligibleDetails.eligible === undefined) {
          session.showLoadError(I18n.format('card.checking_cred_eligibility'));
          discreet.CRED.checkCREDEligibility(this.payload.contact)
            .then(function (res) {
              session.hideErrorMessage();
              session.submit();
            })
            .catch(function (e) {
              var userFacingError = I18n.format('card.no_cred_account');
              if (e.error && e.error.description) {
                userFacingError = e.error.description;
              }
              session.showLoadError(userFacingError, true);
            });
          return;
        } else if (!userEligibleDetails.eligible) {
          var userFacingError = I18n.format('card.no_cred_account');
          session.showLoadError(userFacingError, true);
          return;
        }
      }
    } else if (data.method === 'card' || data.method === 'emi') {
      this.nativeotp = !!this.shouldUseNativeOTP();

      var cardType = cardTab.getCardTypeFromPayload(data);
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
          if (EmiStore.getBajajTCAccepted() === false) {
            EmiStore.setBajajTCAcceptedConsent();
            return;
          }
        } else if (isHDFCDebitEMI) {
          // Skip Native OTP for EMI with HDFC Debit Cards
          shouldUseNativeOTP = true;
        }
      }

      if (shouldUseNativeOTP) {
        var session = this;
        var params = {
          extraProps: {
            reason: 'native_otp_enter',
          },
        };

        this.headless = true;
        Analytics.track('native_otp:attempt');
        session.tabs.card.onHide();
        this.setScreen('otp', params);
        this.r.on('payment.otp.required', function (data) {
          session.otpView.updateScreen({
            showCtaOneCC: true,
          });
          askOTP(that.otpView, data);
        });
        this.r.on('payment.3ds.required', function () {
          that.svelteOverlay.$set({
            component: discreet.AuthOverlay,
          });

          that.showSvelteOverlay();
          Analytics.track('native_otp:3ds_required:prompt');

          var clearActionListener = that.svelteOverlay.$on(
            'action',
            function (event) {
              var action = event.detail.action;
              if (action === 'continue') {
                Analytics.track('native_otp:3ds_required:click', {
                  type: AnalyticsTypes.BEHAV,
                });
                that.r._payment.gotoBank();
                that.hideSvelteOverlay();
              }
            }
          );
          var clearHideListener = that.svelteOverlay.$on('hidden', function () {
            clearActionListener();
            clearHideListener();
          });
        });

        request.nativeotp = true;
      }
    }
    var isDynamicWalletFlow = discreet.WalletHelper.isDynamicWalletFlow();

    if (
      !isDynamicWalletFlow &&
      discreet.Wallet.isPowerWallet(wallet) &&
      !request.feesRedirect &&
      data.contact &&
      data.email
    ) {
      this.powerwallet = true;
      this.otpView.updateScreen({
        skipTextLabel: 'resend_otp',
        allowSkip: false,
      });
      this.topBar.setTitleOverride('otp', 'image', walletObj.logo);
      this.setOneCCTabLogo(walletObj.logo);
      this.commenceOTP('wallet_sending', 'wallet_enter', {
        wallet: I18n.getWalletName(walletObj.code, locale),
      });
    } else {
      if (this.screen === 'otp') {
        this.commenceOTP('payment_processing');
      } else {
        this.showLoadError();
      }
    }

    if (!isDynamicWalletFlow && wallet === 'freecharge') {
      this.otpView.updateScreen({
        maxlength: 4,
        digits: new Array(4),
      });
    } else if (isHDFCDebitEMI) {
      this.otpView.updateScreen({
        maxlength: 6,
        digits: new Array(6),
        mode: emiCode,
      });
    } else if (this.headless) {
      // OTP of length 8 is only required for Headless OTP.
      this.otpView.updateScreen({
        maxlength: 8,
        digits: new Array(8),
      });
    } else {
      this.otpView.updateScreen({
        maxlength: 6,
        digits: new Array(6),
      });
    }

    this.preferredInstrument = P13n.processInstrument(data, this);

    var payment = this.r.createPayment(data, request);
    payment
      .on('payment.success', bind(successHandler, this))
      .on('payment.error', bind(errorHandler, this))
      .on('payment.cancel', bind(cancelHandler, this));

    if (data.method === 'wallet' && isDynamicWalletFlow) {
      /**
       * Register payment api otp.response callback, to trigger otp view.
       */
      this.r.on('payment.createPayment.responseType', function (type) {
        if (type === 'otp') {
          hideOverlayMessage();
          that.otpView.updateScreen({
            skipTextLabel: 'resend_otp',
            allowSkip: false,
          });
          that.topBar.setTitleOverride('otp', 'image', walletObj.logo);
          that.setOneCCTabLogo(walletObj.logo);
          if (wallet === 'freecharge') {
            that.otpView.updateScreen({
              maxlength: 4,
            });
          }
          that.commenceOTP('otp_sending_generic', undefined, {
            phone: getPhone(),
          });
        }
      });
    }

    this.attemptCount++;

    var sub_link = $('#error-message .link');

    var iosCheckoutBridgeNew = Bridge.getNewIosBridge();

    // When the payment is handled by an external sdk that razorapy sdk interacts with,
    // this passes on the coproto or the payment data to the razorpay sdk
    if (request.external.amazonpay || request.external.gpay) {
      payment.on('payment.externalsdk.process', function (data) {
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
      this.commenceOTP('otp_sending_generic', undefined, {
        phone: getPhone(),
      });
    }

    if (data.method === 'wallet' && (this.powerwallet || isDynamicWalletFlow)) {
      this.r.on('payment.otp.required', function (message) {
        askOTP(that.otpView, message, false, { phone: getPhone() });
        that.otpView.updateScreen({
          showCtaOneCC: true,
          ctaOneCCDisabled: false,
          allowSkip: false,
        });
      });
      this.r.on(
        'payment.wallet.topup',
        bind(function () {
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
          this.otpView.setTextView('wallet_insufficient_balance');
        }, this)
      );
    } else if (data.method === 'upi') {
      sub_link.html(I18n.format('misc.cancel_action'));

      this.r.on('payment.upi.noapp', function (data) {
        that.showLoadError(I18n.format('upi.intent_no_apps_error'), true);

        that.body.addClass('upi-noapp');
      });

      this.r.on('payment.upi.selectapp', function (data) {
        that.showLoadError(I18n.format('upi.intent_select_app'), false);
      });

      this.r.on('payment.upi.coproto_response', function (response) {
        var params = {};
        params[Constants.UPI_POLL_URL] = response.request.url;
        params[Constants.PENDING_PAYMENT_TS] = now() + '';
        that.setParamsInStorage(params);

        /**
         * When the payment response is for intent mweb using deeplink (without specific app)
         * Invoke the flow where upi intent url is opened using deeplink
         */
        if (data.upi_app === null && response.data.intent_url) {
          that.upiTab.processIntentOnMWeb(response.data.intent_url);
        }
      });

      this.r.on('payment.upi.pending', function (data) {
        if (data && data.flow === 'upi-intent') {
          Analytics.track('upi_pending', {
            data: {
              data: data,
              message: 'misc.payment_waiting_confirmation',
            },
            immediately: true,
          });
          return that.showLoadError(
            I18n.format('misc.payment_waiting_confirmation')
          );
        }

        that.showLoadError(I18n.format('upi.intent_accept_request'));
      });
    } else if (data.method === 'app') {
      var appName = 'app';
      if (data.provider === 'cred') {
        appName = 'CRED app';
      }

      if (data.provider === 'trustly') {
        // Show goto payment popup link in loader
        sub_link.html(I18n.format('misc.go_to_payment'));
      }

      var locale = I18n.getCurrentLocale();

      this.r.on('payment.app.pending', function (coprotoResponse) {
        // Collect flow
        // Message: Please complete the payment on the {app}
        var message = I18n.formatTemplateWithLocale(
          'misc.complete_payment_on_app',
          { app: appName },
          locale
        );
        return that.showLoadError(message);
      });

      this.r.on('payment.app.coproto_response', function (coprotoResponse) {
        // Intent flow
        // Message: Redirecting you to the {app}...
        Analytics.track('app_coproto_response', {
          data: {
            data: coprotoResponse,
            message: 'misc.checking_payment_status',
          },
        });
        var message = I18n.formatTemplateWithLocale(
          'misc.redirecting_to_app',
          { app: appName },
          locale
        );
        return that.showLoadError(message);
      });

      this.r.on('payment.app.intent_response', function (intentResponse) {
        // Message: Checking the payment status...

        Analytics.track('app_intent_response', {
          data: {
            data: intentResponse,
            message: 'misc.checking_payment_status',
          },
        });
        var message = I18n.formatMessageWithLocale(
          'misc.checking_payment_status',
          locale
        );
        return that.showLoadError(message);
      });

      // Message: Your payment is being processed
      return that.showLoadError();
    } else {
      if (!this.headless) {
        sub_link.html(I18n.format('misc.go_to_payment'));
        this.r.on('payment.cancel', function () {
          that.showLoadError(I18n.format('misc.payment_canceled'), true);
        });
      }
    }
  },

  getPayload: function () {
    var data = this.getFormData();
    var selectedInstrument = this.getSelectedPaymentInstrument();

    if (this.screen === 'card' && this.tab === 'emi') {
      if (!this.svelteCardTab.isOnSavedCardsScreen()) {
        setEmiBank(data);
      }
      if (RazorpayHelper.isRecurring()) {
        var recurringValue = this.get('recurring');
        data.recurring = isString(recurringValue) ? recurringValue : 1;
      }
    }

    // data.amount needed by external libraries relying on `onsubmit` postMessage
    data.amount = this.get('amount');
    var offer = this.getAppliedOffer();
    var hasDiscount = offer && offer.amount !== offer.original_amount;

    if (RazorpayHelper.isOneClickCheckout() && hasDiscount) {
      data.amount =
        data.amount + storeGetter(discreet.ChargesStore.offerAmount);
    }
    if (this.oneMethod && this.oneMethod === 'paypal') {
      data.method = 'paypal';
    }

    if (selectedInstrument && selectedInstrument.method === 'cod') {
      data.method = 'cod';
    }

    return data;
  },

  /**
   * Returns the object to be passed while
   * cancelling a payment
   *
   * @returns {Object}
   */
  getCancelReason: function () {
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
  cleanUpSvelteComponents: function () {
    var views = [
      'cardlessEmiView',
      'currentScreen',
      'emandateView',
      'emi',
      'emiPlansView',
      'emiScreenView',
      'homeTab',
      'nachScreen',
      'otpView',
      'payLaterView',
      'savedCardsView',
      'languageSelectionView',
      'svelteOverlay',
      'upiCancelReasonPicker',
      'nbCancelReasonPicker',
      'timer',
      'oneClickCheckoutHome',
    ];

    var session = this;

    views.forEach(function (_view) {
      var view = session[_view];

      if (view) {
        try {
          if (typeof view.$destroy === 'function') {
            view.$destroy();
          }

          if (typeof view.destroy === 'function') {
            view.destroy();
          }
        } catch (err) {}

        session[_view] = null;
      }
    });
  },

  close: function () {
    if (this.prefCall) {
      this.prefCall.abort();
      this.prefCall = null;
    }

    if (this.isOpen) {
      Analytics.track('modal:close', {
        immediately: true,
      });

      var cancelReason = this.getCancelReason();

      abortAjax(this.ajax);
      this.clearRequest(cancelReason);
      this.isOpen = false;

      es6components.destroyAll();
      this.cleanUpSvelteComponents();

      try {
        this.delegator.destroy();
        this.listeners.forEach(function (unlisten) {
          unlisten();
        });
      } catch (e) {}
      this.bits.forEach(function (bit) {
        bit.off();
      });
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

  saveAndClose: function () {
    if (this.isOpen) {
      this.data = this.getFormData();
      this.close();
    }
  },

  closeAndDismiss: function () {
    var wasShown = this.modal && this.modal.isShown;
    this.saveAndClose();

    if (wasShown) {
      Razorpay.sendMessage({
        event: 'dismiss',
        data: this.dismissReason,
      });
    }
  },

  showNoCostExplainer: function (plan) {
    this.nocostModal = new discreet.NoCostExplainer({
      target: gel('nocost-overlay'),
      props: {
        plan: plan,
        formatter: this.formatAmountWithCurrency.bind(this),
      },
    });
    showOverlay($('#nocost-overlay'));
  },

  setOffers: function () {
    var forcedOffer = discreet.Offers.getForcedOffer();
    var allOffers = discreet.Offers.getOffersForTab();

    /**
     * Since setOffers is called on render (render => setSvelteComponents=> setOffers) and also by CRED utilities
     * By this execution, an instance of offers may present in DOM
     * Hence offers view has to be destroyed with clearing offer first (else new offer screen gets effect of applied offer)
     * And as screen/switchTab updates offer screen accordingly, setting session.offers to undefined is necessary to avoid them.
     */
    if (this.offers && this.offers.$destroy) {
      if (this.offers.getAppliedOffer && this.offers.getAppliedOffer()) {
        this.offers.clearOffer();
      }
      this.offers.$destroy();
      this.offers = undefined;
    }

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
      // Set $appliedOffer for Offer Validations to take place
      discreet.OffersStore.appliedOffer.set(forcedOffer);

      if (forcedOffer.payment_method === 'wallet') {
        this.walletOffer = forcedOffer;
      }

      Analytics.setMeta('forcedOffer', true);

      this.handleDiscount();
    } else {
      var appliedOffer;
      this.getAppliedOffer = function () {
        return appliedOffer;
      };
      var session = this;
      this.offers = new discreet.OffersView({
        target: gel('bottom'),
        props: {
          applicableOffers: allOffers,
          setAppliedOffer: function (offer, shouldNavigate) {
            appliedOffer = offer;
            if (offer && shouldNavigate) {
              session.handleOfferSelection(offer);
            }
            session.handleDiscount();
          },
          onShown: function () {
            if (session.screen === 'otp') {
              session.otpView.updateScreen({
                showCtaOneCC: false,
              });
            } else {
              var instance = session.getCurrentTabInstance();
              if (instance && instance.onHide) {
                instance.onHide();
              }
            }
            Analytics.track(
              'offers:list_view:screen:' + (session.screen || 'home'),
              {
                data: session.getAppliedOffer(),
              }
            );
          },
          onHide: function () {
            if (session.screen === 'otp') {
              session.otpView.updateScreen({
                showCtaOneCC: true,
              });
            } else {
              var instance = session.getCurrentTabInstance();
              if (instance && instance.onShown) {
                instance.onShown();
              }
            }
          },
        },
      });
    }
  },

  setLanguageDropdown: function () {
    var target = docUtil.querySelector('#language-dropdown');
    this.languageSelectionView = new discreet.languageSelectionView({
      target: target,
    });
  },

  /**
   * Returns the currently applied offer
   *
   * @returns {Offer}
   */
  getAppliedOffer: function () {
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
  isOfferApplicableOnIssuer: function (issuer, offer) {
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
  getDiscountedAmount: function () {
    var appliedOffer = this.getAppliedOffer();

    return (appliedOffer && appliedOffer.amount) || this.get('amount');
  },

  /**
   * Show an error with the offer.
   * @param {Function} cb callback
   */
  showOffersError: function (cb) {
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

  getCustomer: function () {
    return getCustomer.apply(null, arguments);
  },

  updateCustomerInStore: function () {
    var customer = this.getCustomer(getPhone());
    CustomerStore.customer.set(customer);
  },

  /**
   * Mark headless as failed and perform cleanup
   */
  markHeadlessFailed: function () {
    Analytics.removeMeta('headless');
    this.headless = false;

    if (this.headlessMetadata) {
      var metadata = this.headlessMetadata;
      OtpService.resetCount(metadata.issuer || metadata.network);

      this.headlessMetadata = null;
    }
  },

  setPreferences: function (prefs) {
    this.preferences = prefs;
    preferences = prefs;

    if (preferences.order && RazorpayHelper.isOneClickCheckout()) {
      discreet.ChargesHelper.initializeAndReset(
        parseInt(preferences.order.line_items_total)
      );
    }

    var self = this;
    var customer;
    var saved_customer = preferences.customer;
    if (saved_customer && saved_customer.addresses) {
      address.setSavedAddresses(saved_customer.addresses);
    }
    var session_options = this.get();

    this.invoice = preferences.invoice;
    this.subscription = preferences.subscription;

    /* set empty customer in case of local card saving */
    if (preferences.global === false) {
      this.local = true;
      customer = new Customer('');
      this.getCustomer = function () {
        return customer;
      };
    }
    Analytics.setMeta('global', preferences.global);
    // Track prefill validity before setting customer
    var prefilledContact = session_options['prefill.contact'];
    var prefilledEmail = session_options['prefill.email'];

    if (prefilledContact) {
      var isContactValid = true;

      if (prefilledContact.indexOf('+91') === 0) {
        isContactValid = Constants.PHONE_REGEX_INDIA.test(
          prefilledContact.replace('+91', '')
        );
      } else {
        isContactValid = Constants.CONTACT_REGEX.test(prefilledContact);
      }

      if (!isContactValid) {
        Analytics.track('prefill:contact:invalid', {
          data: {
            contact: prefilledContact,
          },
        });
      }
    }

    if (prefilledEmail) {
      var isEmailValid = Constants.EMAIL_REGEX.test(prefilledEmail);

      if (!isEmailValid) {
        Analytics.track('prefill:email:invalid', {
          data: {
            email: prefilledEmail,
          },
        });
      }
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

      customer = this.getCustomer(saved_customer.contact, true);
      sanitizeTokens(saved_customer.tokens);
      customer.tokens = saved_customer.tokens;

      if (saved_customer.tokens) {
        customer.logged = true;
        Analytics.setMeta('loggedIn', true);
      }

      customer.customer_id = saved_customer.customer_id;
    }
    // Setting rtb_experiment based on prefs call for logged in users
    discreet.TrustedBadgeHelper.setTrustedBadgeVariant(
      preferences.rtb_experiment || {}
    );
    /* set Razorpay instance for customer */
    Customer.prototype.r = this.r;
  },

  getCurrentTabInstance: function (override_tab) {
    var tab = override_tab || this.tab;
    if (tab === '') {
      return this.homeTab;
    }
    return this.tabs[tab];
  },

  tabs: {},

  hideOverlayMessage: hideOverlayMessage,
  hideOverlay: hideOverlay,
  hideRecurringCardsOverlay: hideRecurringCardsOverlay,
  showOverlay: showOverlay,
  errorHandler: errorHandler,
  successHandler: successHandler,
  getProxyPhone: getProxyPhone,
};

/*
 * Call initIframe() after the session class is defined.
 */

discreet.initIframe();
