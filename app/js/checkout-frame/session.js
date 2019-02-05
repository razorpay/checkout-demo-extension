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
  ua_Android = discreet.UserAgent.androidBrowser,
  isMobile = discreet.UserAgent.isMobile,
  cookieDisabled = !navigator.cookieEnabled,
  getCustomer = discreet.getCustomer,
  Customer = discreet.Customer,
  sanitizeTokens = discreet.sanitizeTokens,
  getQueryParams = discreet.getQueryParams,
  OptionsList = discreet.OptionsList;

// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone|iPad/.test(ua);
var shouldFixFixed = /iPhone/.test(ua);
var ua_iPhone = shouldFixFixed;
var isIE = /MSIE |Trident\//.test(ua);

function getStore(prop) {
  return discreet.Store.get()[prop];
}

function gotoAmountScreen() {
  discreet.Store.set({ screen: 'amount' });
}

function shouldEnableP13n(keyId) {
  if (
    keyId === 'rzp_live_Oeieme2CjQmyTQ' ||
    keyId === 'rzp_live_ILgsfZCZoFIKMb'
  ) {
    return true;
  }

  return /^rzp_live_[0-9a-z]/.test(keyId);
}

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

/**
 * Temp store for Cardless EMI.
 * Will move to Svelte Store upon migration.
 */
var CardlessEmiStore = {
  plans: {},
  duration: {},
  loanUrls: {},
  ott: {},
};

function initIosQuirks() {
  if (discreet.UserAgent.iPhone && discreet.UserAgent.Safari) {
    window.addEventListener('resize', function() {
      if (window.innerHeight > 550) {
        return;
      }

      // Shift footer
      if (window.screen.height - window.innerHeight >= 64) {
        $('#footer').addClass('shift-ios');
      } else {
        $('#footer').removeClass('shift-ios');
      }
    });
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
  }

  $('.select-plan-btn').addClass('invisible');
  $('.view-plans-btn').addClass('invisible');
  $('.pay-btn').addClass('invisible');

  switch (type) {
    case 'pay':
      $('.pay-btn').removeClass('invisible');
      break;

    case 'show':
      $('.view-plans-btn').removeClass('invisible');
      break;

    case 'select':
      $('.select-plan-btn').removeClass('invisible');
      break;
  }
}

/**
 * Get the saved card elemnnt that should be selected
 * when the saved cards screen is shown.
 */
function getSelectableSavedCardElement(tab) {
  if (tab === 'emi') {
    return qs('.saved-card.checked[emi]') || qs('.saved-card[emi]');
  } else {
    return qs('.saved-card.checked') || qs('.saved-card');
  }
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
  $('#overlay').toggleClass('sub', $('#body').hasClass('sub'));
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
 *
 * @param {Number} amount
 * @param {Object} plan
 *
 * @return {Object}
 */
function getEmiText(amount, plan) {
  var amountPerMonth = Razorpay.emi.calculator(
    amount,
    plan.duration,
    plan.interest
  );

  amountPerMonth = (amountPerMonth / 100).toFixed(2);

  return {
    info:
      plan.duration +
      ' Months (₹' +
      amountPerMonth +
      '/mo) @ ' +
      plan.interest +
      '%',
    short: plan.duration + ' Months (₹' + amountPerMonth + '/mo)',
  };
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
      Analytics.removeMeta('headless');
      return;
    }
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
  Analytics.removeMeta('headless');

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
    this.switchTab('card');
  }
}

function getPhone() {
  return gel('contact').value;
}

function setOtpText(view, text) {
  view.setText(text);
}

function elfShowOTP(otp, sender, bank) {
  window.handleOTP(otp);
}

function askOTP(view, text) {
  var origText = text; // ಠ_ಠ
  var qpmap = getQueryParams();
  var thisSession = SessionManager.getSession();
  var isMagicPayment = ((thisSession.r || {})._payment || {}).isMagicPayment;

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

  view.updateScreen({
    loading: false,
    action: false,
    otp: '',
    allowSkip: !Boolean(thisSession.recurring),
    allowResend: true,
  });

  $('#body').addClass('sub');

  if (!text) {
    if (thisSession.tab === 'card' || thisSession.tab === 'emi') {
      if (thisSession.headless || isMagicPayment) {
        Analytics.track('headless:otp:ask');
        text = 'Enter OTP to complete the payment';
        if (isNonNullObject(origText)) {
          if (origText.metadata && origText.metadata.issuer) {
            var bankLogo = discreet.getFullBankLogo(origText.metadata.issuer);
            qs('#tab-title').innerHTML =
              '<img class="headless-bank" src="' + bankLogo + '">';
          }
          if (!origText.next || origText.next.indexOf('otp_resend') === -1) {
            view.updateScreen({
              allowResend: false,
            });
          }

          view.updateScreen({
            skipText: "Complete on bank's page",
          });
          if (!thisSession.get('timeout')) {
            thisSession.closeAt = now() + 3 * 60 * 1000;
            thisSession.showTimer(function() {
              thisSession.hideTimer();
              thisSession.back(true);
              setTimeout(function() {
                Analytics.track('headless:timeout');
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

function debounceAskOTP(view, msg) {
  debounce(askOTP, 750)(view, msg);
}

// this === Session
function successHandler(response) {
  if (this.methodsList) {
    P13n.recordSuccess(this.customer || getCustomer(this.payload.contact));
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
  nativeOtpPossible: function() {
    var optionPresent = this.get('nativeotp');
    var randomness = Math.random() < 0.3;

    var key = this.get('key');
    if (key === 'rzp_live_ILgsfZCZoFIKMb') {
      return true;
    }

    return optionPresent && key && /[a-z]/.test(key.slice(-1)) && randomness;
  },

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
      displayCurrency = this.r.get('display_currency'),
      currency = this.r.get('currency');

    if (displayCurrency) {
      // TODO: handle display_amount case as in modal.jst
      discountAmount = discreet.currencies[displayCurrency] + discountAmount;
    } else if (this.r.get('currency') === 'INR') {
      discountAmount =
        "&#x20B9;<span class='amount-figure'>" + discountFigure + '</span>';
    } else {
      discountAmount = discreet.currencies[currency] + discountFigure;
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
    if (isMobile) {
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
      if (getStore('isPartialPayment')) {
        classes.push('extra');
      } else {
        classes.push('address extra');
      }
      setter('address', true);
    }

    if (getStore('isPartialPayment')) {
      classes.push('partial');
    }

    if (getStore('contactEmailOptional')) {
      classes.push('no-details');
    }

    if (this.irctc) {
      tab_titles.upi = 'BHIM/UPI';
      tab_titles.card = 'Debit/Credit Card';
      classes.push('long');
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

    if (this.methods.emi) {
      tab_titles.card = 'Card';
      classes.push('emi-method');
    }

    if (this.methods.count >= 5) {
      classes.push('long');
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

    if (getStore('isPartialPayment')) {
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
      if (getStore('isPartialPayment')) {
        gotoAmountScreen();
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
      div.innerHTML = templates.modal(this, getStore);
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

          if (self.r._payment && self.r._payment.upi_app) {
            discreet.UPIUtils.trackUPIIntentFailure(self.r._payment.upi_app);
          }

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

    this.tezMode = 'desktop';

    if (this.preferences.fee_bearer) {
      return;
    }

    if (window.CheckoutBridge) {
      return;
    }

    if (!(hasFeature || Tez.checkKey(self.get('key')))) {
      return;
    }

    var $upiForm = $('#form-upi'),
      $tezUPIForm = $('#upi-tez');

    $upiForm.addClass('show-tez');

    this.r.isTezAvailable(function() {
      self.tezMode = 'mobile';
      /* This is success callback */
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
      /* disable intent if fee_bearer */

      if (this.preferences.fee_bearer) {
        delete this.upi_intents_data;
        delete this.all_upi_intents_data;
      } else {
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
    }

    this.isOpen = true;

    this.setTpvBanks();
    this.getEl();
    this.setFormatting();
    this.setEmandate();
    this.setCardlessEmi();
    this.setSavedCardsView();
    this.setOtpScreen();
    this.checkTez();
    this.fillData();
    this.setEMI();
    this.improvisePaymentOptions();
    this.setModal();
    this.completePendingPayment();
    this.bindEvents();
    this.setP13n();
    initIosQuirks();

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
      this.showTimer(function() {
        that.dismissReason = 'timeout';
        that.modal.hide();
      });
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
      data: {
        embedded: this.embedded,
      },
    });
    Analytics.setMeta('timeSince.render', discreet.timer());
  },

  setP13n: function() {
    if (
      shouldEnableP13n(this.get('key')) &&
      this.get().personalization !== false
    ) {
      this.set('personalization', true);
    }

    if (!this.get('personalization')) {
      return;
    }

    if (
      this.hasOffers ||
      this.oneMethod ||
      getStore('optional').contact ||
      getStore('isPartialPayment') ||
      this.tpvBank ||
      this.upiTpv ||
      this.multiTpv
    ) {
      return;
    }

    if (!this.methodsList) {
      this.methodsList = new discreet.MethodsList({
        target: '#methods-list',
        data: {
          session: this,
          animate: false,
        },
      });

      Analytics.track('p13n:set');
    }
  },

  showTimer: function(cb) {
    var isMagicPayment = ((this.r || {})._payment || {}).isMagicPayment;

    this.hideTimer();
    var timeLeft = this.closeAt - now();
    var timeoutEl = $('#timeout').show()[0];
    $('#body').addClass('has-timeout');
    var timerFn = updateTimer(timeoutEl, this.closeAt);
    timerFn();
    if ((this.headless || isMagicPayment) && !this.get('timeout')) {
      qs('#form-otp').insertBefore(timeoutEl, qs('#otp-sec-outer'));
    } else if (isMobile) {
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

    if (!this.emiPlansView) {
      this.emiPlansView = new discreet.emiPlansView(this);
    }
  },

  setSavedCardsView: function() {
    this.savedCardsView = new discreet.SavedCardsView(this);
  },

  setEmandate: function() {
    if (this.emandate && this.methods.emandate) {
      this.emandateView = new discreet.emandateView(this);
    }
  },

  setCardlessEmi: function() {
    var self = this;

    if (this.methods.cardless_emi) {
      this.emiOptionsView = new discreet.emiOptionsView(this);

      var providers = [];

      if (this.methods.emi) {
        providers.push({
          data: {
            code: 'cards',
          },
          icon: 'https://cdn.razorpay.com/cardless_emi-sq/cards.svg',
          title: 'EMI on Cards',
        });
      }

      each(this.methods.cardless_emi, function(provider) {
        var providerObj = discreet.CardlessEmi.getProvider(provider);

        providers.push({
          data: {
            code: provider,
          },
          icon: 'https://cdn.razorpay.com/cardless_emi-sq/' + provider + '.svg',
          title: providerObj.name,
        });
      });

      this.emiOptionsView.setOptions({
        providers: providers,

        on: {
          select: function(event) {
            var providerCode = event.option.code;

            // User selected EMI on Cards
            if (providerCode === 'cards') {
              self.switchTab('emi');
              return;
            }

            $('#form-cardless_emi input[name=emi_duration]').val('');
            $('#form-cardless_emi input[name=provider]').val('');
            $('#form-cardless_emi input[name=ott]').val('');

            CardlessEmiStore.providerCode = providerCode;

            $('#form-cardless_emi input[name=provider]').val(providerCode);

            self.preSubmit();
          },
        },
      });
    }
  },

  makeCardlessEmiDetailText: function(duration, monthly) {
    return (
      '<ul>' +
      '<li>Monthly Installment: ₹' +
      this.formatAmount(monthly) +
      '</li>' +
      '<li>Total Amount: ₹' +
      this.formatAmount(duration * monthly) +
      ' (₹' +
      this.formatAmount(monthly) +
      ' x ' +
      duration +
      ')' +
      '</li>' +
      '</ul>'
    );
  },

  getCardlessEmiPlans: function() {
    var self = this;
    var providerCode = CardlessEmiStore.providerCode;
    var plans = CardlessEmiStore.plans[providerCode];

    var plansList = [];

    each(plans, function(index, p) {
      plansList.push({
        text:
          p.duration +
          ' Months @ ₹' +
          self.formatAmount(p.amount_per_month) +
          '/mo',
        value: p.duration,
        detail: self.makeCardlessEmiDetailText(p.duration, p.amount_per_month),
      });
    });

    return plansList;
  },

  showCardlessEmiPlans: function() {
    var self = this;
    var providerCode = CardlessEmiStore.providerCode;
    var plans = CardlessEmiStore.plans[providerCode];

    if (!plans) {
      this.fetchCardlessEmiPlans();
      return;
    }

    var plansList = this.getCardlessEmiPlans(plans);

    this.emiPlansView.setPlans({
      plans: plansList,

      actions: {
        showAgreement: CardlessEmiStore.providerCode === 'zestmoney',
      },

      amount: this.get('amount'),

      loanUrl: CardlessEmiStore.loanUrls[providerCode],

      provider: CardlessEmiStore.providerCode,

      on: {
        back: bind(function() {
          self.switchTab('cardless_emi');

          return true;
        }),

        select: function(value) {
          $('#form-cardless_emi input[name=emi_duration]').val(value);
          $('#form-cardless_emi input[name=provider]').val(
            CardlessEmiStore.providerCode
          );
          $('#form-cardless_emi input[name=ott]').val(
            CardlessEmiStore.ott[CardlessEmiStore.providerCode]
          );

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
    var cardlessEmiProviderObj = discreet.CardlessEmi.getProvider(providerCode);
    var self = this;

    tab_titles.otp = cardlessEmiProviderObj.name;
    this.commenceOTP(cardlessEmiProviderObj.name + ' account', true);
    this.customer.checkStatus(
      function(response) {
        if (self.screen !== 'otp' && self.tab !== 'cardless_emi') {
          return;
        }

        if (!response.saved || (response.error && response.error.description)) {
          var errorDesc =
            'Could not find a ' +
            cardlessEmiProviderObj.name +
            ' account associated with ' +
            getPhone();

          if (response.error && response.error.description) {
            errorDesc = response.error.description;
          }

          self.showLoadError(errorDesc, true);
          return;
        }

        var otpMessage =
          'Enter the OTP sent on ' +
          getPhone() +
          '<br>' +
          ' to get EMI plans for' +
          cardlessEmiProviderObj.name;

        askOTP(self.otpView, otpMessage);

        self.otpView.updateScreen({
          allowSkip: false,
        });
      },
      {
        provider: providerCode,
        amount: self.get('amount'),
      },
      getPhone()
    );
  },

  setOtpScreen: function() {
    if (!this.otpView) {
      this.otpView = new discreet.otpView({
        target: gel('otp-screen-wrapper'),

        on: {
          chooseMethod: bind(function() {
            this.switchTab();
          }, this),
          addFunds: bind(this.addFunds, this),
          resend: bind(this.resendOTP, this),
          retry: bind(this.back, this),
          secondary: bind(this.secAction, this),
        },
      });
    }
  },

  setMagic: function() {
    if (!this.magicView && this.magic) {
      var MagicView = discreet.MagicView;
      $(this.el).addClass('magic');
      this.magicView = new MagicView(this);
      this.magicView.setTimeout(Constants.TIMEOUT_MAGIC_NO_ACTION, {
        timeout: Constants.TIMEOUT_MAGIC_NO_ACTION,
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
      } else if (this.r._payment && this.r._payment.isMagicPayment) {
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
    var isMagicPayment = this.r._payment && this.r._payment.isMagicPayment;

    if (isMagicPayment) {
      return this.magicView.resendOtp();
    }

    Analytics.track('otp:resend', {
      type: AnalyticsTypes.BEHAV,
      data: {
        wallet: this.tab === 'wallet',
        headless: this.headless,
      },
    });
    if (this.headless) {
      this.showLoadError('Resending OTP');
      if (!this.get('timeout')) {
        this.hideTimer();
      }
      return this.r.resendOTP(this.r.emitter('payment.otp.required'));
    }

    this.showLoadError(strings.otpsend + getPhone());
    if (this.tab === 'cardless_emi') {
      this.fetchCardlessEmiPlans();
    } else if (this.tab === 'wallet') {
      this.r.resendOTP(this.r.emitter('payment.otp.required'));
    } else {
      var self = this;
      this.customer.createOTP(function(message) {
        debounceAskOTP(self.otpView, message);
      });
    }
  },

  secAction: function() {
    var isMagicPayment = ((this.r || {})._payment || {}).isMagicPayment;

    if (isMagicPayment) {
      this.hideTimer();
      return this.magicView.cancelMagic();
    }

    if (this.headless && this.r._payment) {
      if (!this.get('timeout')) {
        Analytics.track('headless:gotobank', {
          type: AnalyticsTypes.BEHAV,
          immediately: true,
        });
        this.hideTimer();
      }
      return this.r._payment.gotoBank();
    }
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
    setOtpText(this.otpView, 'Loading...');
    this.otpView.updateScreen({
      action: false,
      loading: true,
      addFunds: false,
    });
    this.powerwallet = false;
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
      this.setPaymentMethods(this.preferences);
      this.render({ forceRender: true });
    }
    $(this.el).addClass('show-methods');
    discreet.Store.set({ screen: '' });
    if (this.methods.count >= 4) {
      $(this.el).addClass('long');
    }
    if (this.methods.count >= 5) {
      $(this.el).addClass('x-long');
    }
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
      gotoAmountScreen();
    });

    this.on('change', 'input[name=partial_payment]', function(e) {
      var parentEle = $('#amount-value').parent();
      var optionEle = $('.minimum-amount-select');
      var value = e.target.value;

      if (!e.target.checked || value === 'pay_full') {
        var amount = this.order.amount_due;
        $('#amount-value').val(this.getDecimalAmount(amount));
        toggleInvalid(parentEle, true); // To unset 'invalid' class on 'partial amount input' field's parent

        this.get().amount = amount;
        $('#amount .amount-figure').html(this.formatAmount(amount));

        var minAmountField = gel('minimum-amount-select');

        if (minAmountField) {
          minAmountField.checked = false;
        }

        var infoEle = $('.partial-payment-block .subtitle--help');
        /* Reset text in info element */
        if (infoEle) {
          infoEle.html('Pay some amount now and remaining later.');
        }
        /* Hide keyboard */
        if (document.activeElement) {
          document.activeElement.blur();
        }
      } else {
        $('#amount-value').val(null);
        $('#amount-value').focus();

        parentEle.addClass('mature'); // mature class helps show tooltip if input is invalid
      }
    });

    if (
      self.order &&
      self.order.partial_payment &&
      self.order.first_payment_min_amount &&
      Number(self.order.amount_paid) === 0
    ) {
      this.on('change', '#minimum-amount-select', function(e) {
        var el_amount = gel('amount-value');

        if (!el_amount) {
          return;
        }

        var amount;
        if (!e.target.checked) {
          amount = '';
          el_amount.focus();
        } else {
          amount = self.formatAmount(self.order.first_payment_min_amount);
        }

        el_amount.value = amount;

        if ('createEvent' in document) {
          var evt = document.createEvent('HTMLEvents');
          evt.initEvent('change', false, true);
          el_amount.dispatchEvent(evt);
        } else {
          el_amount.fireEvent('onchange');
        }
      });
    }

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

    if (enabledMethods.emi) {
      this.on('click', '#add-card-container', 'emi-plans-trigger', function(e) {
        var $target = $(e.delegateTarget);

        self.removeAndCleanupOffers();

        if ($target.$('.emi-plan-unselected:not(.hidden)')[0]) {
          self.showEmiPlans('new')(e);
        } else if ($target.$('.emi-plan-selected:not(.hidden)')[0]) {
          self.showEmiPlans('new')(e);
        } else if ($target.$('.emi-pay-without:not(.hidden)')[0]) {
          if (enabledMethods.card) {
            self.setScreen('card');
            self.switchTab('card');
            self.offers && self.renderOffers(this.tab);
          }
        } else if ($target.$('.emi-plan-unavailable:not(.hidden)')[0]) {
          if (enabledMethods.card) {
            self.setScreen('card');
            self.switchTab('card');
            self.toggleSavedCards(false);
            self.offers && self.renderOffers(this.tab);
          }
        }
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

      OptionsList.hide();

      this.hideErrorMessage(e);
    });
    this.click('#fd-hide', this.hideErrorMessage);

    this.on('click', '#form-upi.collapsible .item', function(e) {
      $('#form-upi.collapsible .item.expanded').removeClass('expanded');
      $(e.currentTarget).addClass('expanded');
    });

    if (gel('methods-list')) {
      this.on('click', '#methods-list', 'option', function(e) {
        var $cvvEl = $(e.delegateTarget).$('.cvv-input');
        if ($cvvEl) {
          $cvvEl.focus();
        }
      });
    }
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
          var optionEle = $('#minimum-amount-select')[0];

          var firstPaymentMinAmount;
          if (
            self.order &&
            self.order.partial_payment &&
            self.order.first_payment_min_amount &&
            Number(self.order.amount_paid) === 0
          ) {
            firstPaymentMinAmount = self.order.first_payment_min_amount;
          }

          if (
            optionEle &&
            firstPaymentMinAmount &&
            Number(self.formatAmount(firstPaymentMinAmount)) !==
              Number(this.value)
          ) {
            optionEle.checked = false;
          }

          self.input(el_amount);
          var value = this.value * 100;
          var maxAmount =
            self.order && self.order.partial_payment
              ? self.order.amount_due
              : self.order.amount;

          var minAmount = firstPaymentMinAmount || 100;
          var isValid = minAmount <= value && value <= maxAmount;
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
              } else if (value < minAmount) {
                helpEle.html(
                  'Minimum payable amount is ₹' + self.formatAmount(minAmount)
                );
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
          var instruments = [];
          self.input(this.el);

          Analytics.removeMeta('p13n');

          if (!self.methodsList) {
            return;
          }

          if (this.isValid()) {
            instruments = P13n.listInstruments(getCustomer(this.value)) || [];

            if (instruments.length) {
              Analytics.track('p13:instruments:fetch', {
                data: {
                  length: instruments.length,
                },
              });

              Analytics.setMeta('p13n', true);
            }
          }

          self.methodsList.set({
            instruments: instruments,
            customer: getCustomer(this.value),
            tpvBank: this.tpvBank,
            animate: true,
          });
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
    if (screen) {
      var screenTitle =
        this.tab === 'emi'
          ? tab_titles[this.tab]
          : tab_titles[this.cardTab || screen];

      screenTitle = /^magic/.test(screen) ? tab_titles.card : screenTitle;

      if (screenTitle) {
        gel('tab-title').innerHTML = screenTitle;
      }
    }

    if (screen !== 'otp') {
      this.headless = false;
    }

    if (this.separateTez) {
      if (screen === 'tez' || screen === 'upi') {
        var tez = false;
        if (screen === 'tez') {
          tez = true;
          screen = 'upi';
        }

        $('#upi-directpay .checkbox').css('display', 'none');
        $('#upi-tez .checkbox').css('display', 'none');

        gel('radio-tez').checked = tez;
        $('#upi-tez').css('display', tez ? 'block' : 'none');
        $('#upi-tez').toggleClass('expanded', tez);

        gel('radio-directpay').checked = !tez;
        $('#upi-directpay').toggleClass('expanded', !tez);
        $('#upi-directpay').css('display', !tez ? 'block' : 'none');
      }
    }

    setEmiPlansCta(screen, this.tab);

    if (screen === this.screen) {
      return;
    }

    if (screen === 'qr') {
      this.currentScreen = new discreet.QRScreen({
        target: qs('#form-qr'),
        data: {
          paymentData: this.getFormData(),
          session: this,
          onSuccess: bind(successHandler, this),
        },
      });
    } else if (this.currentScreen) {
      this.currentScreen.destroy();
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

    if (screen) {
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
      screen === 'cardless_emi' ||
      (this.tab === 'cardless_emi' && screen === 'emiplans') ||
      screen === 'qr' ||
      (screen === 'wallet' && !$('.wallet :checked')[0]) ||
      (screen === 'upi' &&
        this.upi_intents_data &&
        !$('#form-upi .item :checked')[0]) ||
      (screen === 'magic-choice' && !$('#form-magic-choice .item :checked')[0])
    ) {
      showPaybtn = false;
    }
    this.body.toggleClass('sub', showPaybtn);

    return this.offers && this.renderOffers(this.tab);
  },
  renderOffers: function(screen) {
    if (screen === 'emiplans') {
      screen = 'emi';
    }

    if (
      ['', 'card', 'emi', 'netbanking', 'wallet', 'upi'].indexOf(screen) < 0
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

    var paymentMethod = screen;

    this.offers.applyFilter(
      (screen && { payment_method: paymentMethod }) || {}
    );

    // Pre-select offer if there is only one visible offer
    var defaultOffer = this.offers.defaultOffer;
    if (defaultOffer && screen) {
      this.preSelectedOffer = defaultOffer;
    }

    if (this.preSelectedOffer) {
      this.offers.selectOffer(this.preSelectedOffer);
      // Explicitly call this because we selected the offer explicitly
      this.handleOfferSelection(this.preSelectedOffer, screen);
      this.offers.applyOffer();

      /* Don't set preSelectedOffer to null if it's on card OTP screen  */
      if (this.screen === 'otp' && screen !== 'card' && screen !== 'emi') {
        this.preSelectedOffer = null;
      }
    }

    $('#body').toggleClass('has-offers', this.offers.numVisibleOffers > 0);
  },

  handleOfferSelection: function(offer, screen) {
    var offerInstance = offer;
    var emiBanks = this.emi_options.banks;

    offer = offer.data;

    if (offer.original_amount > offer.amount) {
      this.showDiscount(offer);
    }

    var savedCards =
      this.customer && this.customer.tokens && this.customer.tokens.items;

    screen = screen || this.screen;

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
    }
  },
  handleOfferRemoval: function() {
    this.hideDiscount();

    if (this.customer && this.customer.tokens && this.customer.tokens.count) {
      this.setSavedCards(this.customer.tokens);
    }
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
    var payment = this.r._payment;
    var thisTab = this.tab;
    var self = this;

    Analytics.track('back', {
      type: AnalyticsTypes.BEHAV,
    });

    var confirm = function() {
      Confirm.show({
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
    };

    var isMagicPayment = ((this.r || {})._payment || {}).isMagicPayment;

    if (this.get('ecod')) {
      $('#footer').hide();
      $('#wallets input:checked').prop('checked', false);
      $(this.el).addClass('notopbar');
      tab = 'wallet';
    } else if (
      this.screen === 'otp' &&
      (thisTab !== 'card' && thisTab !== 'emi')
    ) {
      tab = thisTab;
    } else if (
      (thisTab === 'qr' && this.r._payment) ||
      (this.headless && payment) ||
      ((thisTab === 'card' || thisTab === 'emi') &&
        (/^magic/.test(this.screen) || isMagicPayment))
    ) {
      if (confirmedCancel === true) {
        if (thisTab === 'qr') {
          tab = '';
        } else {
          tab = thisTab;
        }
        this.clearRequest();
      } else {
        return confirm();
      }
    } else if (this.headless) {
      tab = 'card';
    } else if (/^emandate/.test(this.screen)) {
      if (this.emandateView.back()) {
        return;
      }
    } else if (/^emiplans/.test(this.screen)) {
      if (this.emiPlansView.back()) {
        return;
      }
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

    this.preSelectedOffer = null;
    this.switchTab(tab);
  },

  switchTab: function(tab) {
    // initial screen
    if (!this.tab) {
      if (this.checkInvalid('#pad-common')) {
        if (this.methodsList) {
          this.methodsList.hideOtherMethods();
        }
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
        (!contact && !getStore('optional').contact) ||
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

      setEmiPlansCta(this.screen, tab);
    } else {
      this.setScreen(tab);
      if (ua_iPhone) {
        Razorpay.sendMessage({ event: 'blur' });
      }
    }

    if (!tab && this.methodsList) {
      var selectedInstrument = this.methodsList.getSelectedInstrument();
      if (selectedInstrument) {
        $('#body').addClass('sub');
      }
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
      skipText: null,
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
                '<br>to save your card for future payments'
            );
          });
        } else if (customer.saved && !customer.logged) {
          askOTP(self.otpView);
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

    if (!e.target || e.target !== $savedCard.find('.elem-savedcards-emi')[0]) {
      $savedCard.$('.saved-cvv').focus();
    }

    $('#saved-cards-container .checked').removeClass('checked');
    $savedCard.addClass('checked');

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
   *
   * @param {String} bank
   *
   * @return {Array}
   */
  getEmiPlans: function(bank) {
    var emi_options = this.emi_options;
    var plans = (emi_options.banks[bank] || {}).plans;
    var listItems = [];
    var amount = this.get('amount');
    var appliedOffer = this.offers && this.offers.offerSelectedByDrawer;

    if (this.isOfferApplicableOnIssuer(bank)) {
      amount = this.getDiscountedAmount();
    }

    each(plans, function(duration, plan) {
      if (
        !appliedOffer ||
        (appliedOffer && !appliedOffer.emi_subvention) ||
        (appliedOffer && appliedOffer.id && appliedOffer.id === plan.offer_id)
      ) {
        listItems.push({
          text: getEmiText(amount, plan).info,
          value: duration,
          badge: plan.subvention === 'merchant' ? 'No cost EMI' : false,
          detail:
            'Full amount of ₹' +
            (amount / 100).toFixed(2) +
            ' will be deducted from your account, which will be converted into EMI by your bank in 3-4 days.',
        });
      }
    });

    return listItems;
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
   * @param {String} tyoe
   *
   * @return {Function}
   */
  showEmiPlans: function(type) {
    var self = this;
    var emi_options = this.emi_options;
    var amount = this.get('amount');
    var viewAllPlans = function() {
      showOverlay($('#emi-wrap'));
    };

    if (type === 'new') {
      return function(e) {
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
          plans: emiPlans,
          on: {
            back: bind(function() {
              self.switchTab(prevTab);
              self.setScreen(prevScreen);
              self.toggleSavedCards(false);

              return true;
            }),

            payWithoutEmi: function() {
              $('#emi_duration').val('');

              self.switchTab('card');
              self.setScreen('card');
              self.toggleSavedCards(false);

              self.processOffersOnEmiPlanSelection();
            },

            select: function(value) {
              var plan = plans[value];
              var text = getEmiText(amount, plan).short || '';

              $('#emi_duration').val(value);
              $trigger.$(
                '.emi-plan-selected .emi-plans-text'
              )[0].innerHTML = text;

              self.switchTab('emi');
              self.toggleSavedCards(false);

              self.processOffersOnEmiPlanSelection(plan);

              $('.select-plan-btn').addClass('invisible');
              self.preSubmit();
            },

            viewAll: viewAllPlans,
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
          plans: emiPlans,
          on: {
            back: function() {
              self.switchTab(prevTab);
              self.setScreen(prevScreen);

              return true;
            },

            payWithoutEmi: function() {
              $trigger.$('.emi_duration').val('');
              toggleEmiPlanDetails($trigger.parent().parent(), false);

              self.switchTab('card');
              self.setScreen('card');
              self.toggleSavedCards(true);

              self.processOffersOnEmiPlanSelection();
            },

            select: function(value) {
              var plan = plans[value];
              var text = getEmiText(amount, plan).short || '';

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
                $('.select-plan-btn').addClass('invisible');
                self.switchTab('emi');
                self.setScreen('card');
                self.toggleSavedCards(true);
              }
            },

            viewAll: viewAllPlans,
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
    }
  },

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

        this.savedCardsView.setCards({
          cards: this.transformedTokens,
          on: {
            viewPlans: this.showEmiPlans('saved'),
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

    var selectableSavedCard = getSelectableSavedCardElement(this.tab);
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
        delegateTarget: getSelectableSavedCardElement(this.tab),
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

      return this.emandateView.showBankDetailsForm($('#bank-select').val());
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
      var whichCardTab = this.savedCardScreen ? 'saved-cards' : 'add-card';
      return '#' + whichCardTab + '-container';
    }
    if (form === 'emandate') {
      form = 'netbanking';
    }

    if (form === 'tez') {
      form = 'upi';
    }
    return '#form-' + form;
  },

  getFormData: function() {
    var tab = this.tab;
    var data = {};

    fillData('#pad-common', data);

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

      if (data.method === 'tez') {
        data.method = 'upi';
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
        if (this.payload['_[flow]'] === 'intent') {
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

  commenceOTP: function(text, partial) {
    this.setScreen('otp');

    this.otpView.updateScreen({
      addFunds: false,
    });

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
    var otp = discreet.Store.get().screenData.otp.otp;

    if (this.tab === 'wallet' || this.headless) {
      return this.r.submitOTP(otp);
    }

    var queryParams;

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
          askOTP(this.otpView, msg);
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
          askOTP(this.otpView, msg);
        }
      };
    }

    var submitPayload = {
      otp: otp,
      email: gel('email').value,
    };

    if (this.tab === 'cardless_emi') {
      queryParams = {
        provider: CardlessEmiStore.providerCode,
        method: 'cardless_emi',
      };

      callback = function(msg, data) {
        if (msg) {
          this.fetchCardlessEmiPlans();
        } else {
          CardlessEmiStore.plans[CardlessEmiStore.providerCode] =
            data.emi_plans;
          CardlessEmiStore.loanUrls[CardlessEmiStore.providerCode] =
            data.loan_url;
          CardlessEmiStore.ott[CardlessEmiStore.providerCode] = data.ott;
          this.showCardlessEmiPlans();
        }
      };
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

    this.destroyMagic();

    this.isResumedPayment = false;
    this.doneByP13n = false;
    Analytics.removeMeta('doneByP13n');

    var params = {};
    params[Constants.UPI_POLL_URL] = '';
    params[Constants.PENDING_PAYMENT_TS] = '0';
    this.setParamsInStorage(params);

    abortAjax(this.ajax);

    clearTimeout(this.requestTimeout);
    this.requestTimeout = null;
  },

  preSubmit: function(e) {
    var storeScreen = getStore('screen');
    if (storeScreen === 'amount') {
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
    var tab = this.tab;
    var isMagicPayment = ((this.r || {})._payment || {}).isMagicPayment;

    if (!this.tab && !this.order && !this.methodsList) {
      return;
    }

    if (/^magic/.test(screen) || isMagicPayment) {
      var magicData = {};
      fillData('#form-' + screen, magicData);
      this.magicView.submit(screen, magicData);
      return;
    }

    if (screen === 'otp') {
      return this.onOtpSubmit();
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

    if (data.partial_payment) {
      delete data.partial_payment;
    }

    if (!this.recurring && this.order && this.order.bank) {
      if (this.checkInvalid('#pad-common')) {
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
            // This is no the EMI tab, delete duration if it exists.
            delete data.emi_duration;
          }
        }
      } else if (/^emandate/.test(screen)) {
        if (this.screen === 'emandate') {
          screen = 'netbanking';
          data.bank = $('#bank-select').val();
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
        if (this.checkInvalid('#form-upi input:checked + label')) {
          return;
        }
      } else if (this.checkInvalid()) {
        return;
      }
    } else if (this.oneMethod === 'netbanking') {
      data.bank = this.get('prefill.bank');
    } else if (this.methodsList) {
      if (this.checkInvalid('#pad-common')) {
        return;
      }

      /*
       * - If there's no method in methods-list, then dont' let it pass
       * - If even 1 method is in the list and none of them is selected don't
       *   let it pass.
       */
      if (!$('#methods-list .option')[0]) {
        return;
      } else if (!$('#methods-list .option.selected')[0]) {
        return;
      }

      var selectedInstrument = this.methodsList.getSelectedInstrument();
      if (selectedInstrument && selectedInstrument.method === 'card') {
        /*
         * Add cvv to data from the currently selected method (p13n)
         * TODO: figure out a better way to do this.
         */
        var $cvvEl = $('#methods-list .option.selected .cvv-input');

        if ($cvvEl) {
          if ($cvvEl.val().length === selectedInstrument.cvvDigits) {
            data['card[cvv]'] = $cvvEl.val();
          } else {
            $cvvEl.focus();
            return this.shake();
          }
        }
      }
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
      optional: getStore('optional'),
    };

    if (!this.screen && this.methodsList) {
      var selectedInstrument = this.methodsList.getSelectedInstrument();
      this.doneByP13n = P13n.handleInstrument(data, selectedInstrument);

      /* TODO: the following code is the hack for ftx, fix it properly */
      if (this.doneByP13n) {
        Analytics.setMeta('doneByP13n', true);
        if (['card', 'emi', 'wallet'].indexOf(selectedInstrument.method) > -1) {
          this.switchTab(selectedInstrument.method);
        } else if (
          selectedInstrument.method === 'upi' &&
          selectedInstrument['_[upiqr]'] === '1'
        ) {
          return this.switchTab('qr');
        }
      }
    }

    // ask user to verify phone number if not logged in and wants to save card
    if (data.save && !this.customer.logged) {
      if (this.screen === 'card') {
        this.otpView.updateScreen({
          skipText: 'Skip saving card',
        });
        this.commenceOTP(strings.otpsend);
        debounceAskOTP(this.otpView);
        return this.customer.createOTP();
      } else if (!this.headless) {
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

    if (data.method === 'cardless_emi') {
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

    if (data.method === 'card') {
      this.nativeotp = !!this.nativeOtpPossible();
      if (this.nativeotp) {
        var cardType;
        if (data.token) {
          if (this.transformedTokens) {
            this.transformedTokens.forEach(function(t) {
              if (t.token === data.token) {
                cardType = t.card.networkCode;
              }
            });
          }
        } else {
          cardType = this.delegator.card.type;
        }

        if (!this.magic && (cardType === 'mastercard' || cardType === 'visa')) {
          this.headless = true;
          Analytics.track('headless:attempt');
          this.setScreen('otp');
          $('#otp-sec').html("Complete on bank's page");
          this.r.on('payment.otp.required', function(data) {
            askOTP(that.otpView, data);
          });

          request.iframe = true;
          Analytics.track('iframe:attempt');
        }
      }
    }

    if (
      discreet.Wallet.isPowerWallet(wallet) &&
      !request.fees &&
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
    } else {
      this.showLoadError();
    }

    if (wallet === 'freecharge') {
      this.otpView.updateScreen({
        maxlength: 4,
      });
    } else {
      this.otpView.updateScreen({
        maxlength: 6,
      });
    }

    if (this.methodsList) {
      P13n.processInstrument(data, this);
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
      this.r.on('payment.otp.required', function(message) {
        debounceAskOTP(that.otpView, message);
      });
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

        /* Otherwise it's directpay */
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

    if (this.screen === 'card' && this.tab === 'emi') {
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
      this.hideTimer();
      abortAjax(this.ajax);
      this.clearRequest();
      this.isOpen = false;
      clearTimeout(fontTimeout);

      if (this.methodsList) {
        this.methodsList.destroy();
      }

      if (this.otpView) {
        this.otpView.destroy();
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
      this.methodsList = this.modal = this.emi = this.el = this.card = null;
      this.otpView = null;
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
          default_auth_type: Constants.DEFAULT_AUTH_TYPE_RADIO,
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
            default_auth_type: Constants.DEFAULT_AUTH_TYPE_RADIO,
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
          emiBank.plans[plan.duration] = plan;
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
    var qrEnabled =
      !getStore('isPartialPayment') &&
      !getStore('optional').contact &&
      !preferences.fee_bearer &&
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
     * - Neither of Card or EMI or Cardless EMI are enabled
     * - amount is less than EMI threshold
     */
    if (
      !(methods.emi || methods.card || methods.cardless_emi) ||
      recurring ||
      international ||
      amount <= emi_options.min
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

    if (this.forcedOffer) {
      var paymentMethod = this.forcedOffer.payment_method;
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
     */
    if (amount > 1e7 || recurring || international) {
      methods.upi = false;
    }

    /**
     * Disable Cardless EMI on amounts < 3000 INR
     */
    if (amount < 300000) {
      methods.cardless_emi = null;
    } else if (methods.cardless_emi instanceof Array) {
      /**
       * methods.cardless_emi will be [] when there are no providers enabled.
       */
      if (methods.cardless_emi.length === 0) {
        methods.cardless_emi = null;
      }
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
      methods.count++;
      this.down = getDownBanks(preferences);
      this.netbanks = getPreferredBanks(
        preferences,
        this.get('method.netbanking')
      );
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
        methods.count++;
        methods.qr = true;
      }

      if (this.separateTez) {
        methods.count++;
        methods.tez = true;
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
  },

  setOffers: function(preferences) {
    var hasOffers = (this.hasOffers = isArray(preferences.offers)),
      forcedOffer = (this.forcedOffer =
        hasOffers && preferences.force_offer && preferences.offers[0]);

    if (forcedOffer) {
      var paymentMethod = forcedOffer.payment_method;

      if (['emi', 'card', 'wallet'].indexOf(paymentMethod) >= 0) {
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
    discreet.Store.set({ preferences: prefs });
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
    this.magic = false; //this.magic && preferences.magic;

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

    if (order && order.amount) {
      session_options.amount = order.partial_payment
        ? order.amount_due
        : order.amount;
    } else if (invoice && invoice.amount) {
      session_options.amount = invoice.amount;
    } else if (subscription && subscription.amount) {
      session_options.amount = subscription.amount;
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

    if (IRCTC_KEYS.indexOf(this.get('key')) !== -1) {
      this.irctc = true;
      this.separateTez = true;
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
          data: response.error,
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
