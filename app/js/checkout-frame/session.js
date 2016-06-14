// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone|iPad/.test(ua);

// iphone/ipad restrict non user initiated focus on input fields
var shouldFocusNextField = !/iPhone|iPad/.test(ua);

var loadingMessage = 'Your payment is being processed';

var fontTimeout;

function validateCardNumber(el){
  if(el){
    if(!(el instanceof Element)){
      el = el.target;
    }
    $(el.parentNode)[Card.validateCardNumber(el.value, el.getAttribute('cardtype')) ? 'removeClass' : 'addClass']('invalid');
  }
}

// switches cvv help text between 3-4 characters for amex and non-amex cards
function formatCvvHelp(el_cvv, cvvlen){
  el_cvv.maxLength = cvvlen;
  el_cvv.pattern = '[0-9]{'+cvvlen+'}';
  $(el_cvv.parentNode)[el_cvv.value.length === cvvlen ? 'removeClass' : 'addClass']('invalid');
}

function fillData(container, returnObj) {
  each(
    $(container).find('input[name],select[name]'),
    function(i, el){
      if(/radio|checkbox/.test(el.getAttribute('type')) && !el.checked) {
        return;
      }
      if(!el.disabled) {
        returnObj[el.name] = el.value;
      }
    }
  )
}

function makeEmiDropdown(emiObj, session){
  var h = '';
  each(
    emiObj.plans,
    function(length, rate){
      h += '<div class="option" value="'+length+'">'
        + length + ' month EMI @ ' + rate + '% (&#xe600; '
        + emi_options.installment(length, rate, session.get('amount'))/100
        + ' per month)</div>';
    }
  )
  $('#emi-plans-wrap').html(h);
}

function setEmiBank(data){
  var activeEmiPlan = $('#emi-plans-wrap .active')[0];
  if(activeEmiPlan){
    data.method = 'emi';
    data.emi_duration = activeEmiPlan.getAttribute('value');
  }
}

function onSixDigits(e){
  var el = e.target;
  var val = el.value;
  var isMaestro = gel('elem-card').getAttribute('cardtype') === 'maestro';
  var sixDigits = val.length > 5;
  $(el.parentNode).toggleClass('six', sixDigits);
  var emiObj;

  var nocvvCheck = gel('nocvv');

  if(sixDigits){
    if(isMaestro){
      if(nocvvCheck.disabled){
        $('#nocvv-check').addClass('shown');
        nocvvCheck.disabled = false;
      }
    }
    else {
      each(
        emi_options.banks,
        function(bank, emiObjInner){
          if(emiObjInner.patt.test(val.replace(/ /g,''))){
            emiObj = emiObjInner;
          }
        }
      )
    }
  }
  else {
    $('#nocvv-check').removeClass('shown');
    nocvvCheck.disabled = true;
  }

  var emi_parent = $('#emi-check-label')[emiObj ? 'removeClass' : 'addClass']('disabled');
  if(emiObj){
    $('#expiry-cvv').removeClass('hidden');
    makeEmiDropdown(emiObj, this);
  }
  else {
    emi_parent.removeClass('checked');
    $(emi_parent.find('.active')[0]).removeClass('active');
  }
  noCvvToggle({target: nocvvCheck});

  var elem_emi = $('#elem-emi');
  var hiddenClass = 'hidden';

  if(isMaestro && sixDigits){
    elem_emi.addClass(hiddenClass);
  }
  else if(elem_emi.hasClass(hiddenClass)) {
    invoke('removeClass', elem_emi, hiddenClass, 200);
  }
}

function noCvvToggle(e){
  var nocvvCheck = e.target;
  var shouldHideExpiryCVV = nocvvCheck.checked && !nocvvCheck.disabled;
  $('#form-card').toggleClass('nocvv', shouldHideExpiryCVV);
}

function makeVisible(subject){
  $(subject)
    .css('display', 'block')
    .reflow()
    .addClass('shown');
}

function makeHidden(subject){
  subject = $(subject);
  if(subject[0]){
    subject.removeClass('shown');
    invoke('hide', subject, null, 200);
  }
}

function toggle(subject, showOrHide){
  (showOrHide ? makeVisible : makeHidden)(subject);
}

function showOverlay($with){
  makeVisible('#overlay');
  if($with){
    makeVisible($with[0]);
  }
}

function hideOverlay($with){
  makeHidden('#overlay');
  if($with){
    makeHidden($with[0]);
  }
}

function hideEmi(){
  var emic = $('#emi-wrap');
  var wasShown = emic.hasClass('shown');
  if(wasShown){
    hideOverlay(emic);
  }
  return wasShown;
}

function hideOverlayMessage(){
  if(!hideEmi()){
    hideOverlay($('#error-message'));
  }
}

function overlayVisible(){
  return $('#overlay').hasClass('shown');
}

// this === Session
function errorHandler(response){
  if(!response || !response.error){
    return;
  }
  var message;
  this.shake();
  this.clearRequest();
  if(this.modal){
    this.modal.options.backdropclose = this.get('modal.backdropclose');
  }

  message = response.error.description;

  var err_field = response.error.field;
  if (err_field){
    if(!err_field.indexOf('expiry')){
      err_field = 'card[expiry]';
    }
    var error_el = document.getElementsByName(err_field)[0];
    if (error_el && error_el.type !== 'hidden'){
      var help = $(error_el)
        .focus()
        .parent()
        .addClass('invalid')
        .find('help-text')[0];

      if(help){
        $(help).html(message);
      }
      return hideOverlayMessage();
    }
  }

  this.showLoadError(message || 'There was an error in handling your request', true);
  $('#fd-hide').focus();
}

function getPhone(){
  return gel('contact').value;
}

function setOtpText(text){
  gel('otp-prompt').innerHTML = text;
}

function askOTP(text){
  $('#modal').addClass('sub');
  $('#form-otp').removeClass('loading').removeClass('action');
  setOtpText(text);
}

// this === Session
function successHandler(response){
  this.clearRequest();
  // prevent dismiss event
  this.modal.options.onhide = noop;

  // sending oncomplete event because CheckoutBridge.oncomplete
  Razorpay.sendMessage({ event: 'complete', data: response });
  this.hide();
}

function Session (options) {
  this.r = Razorpay(options);
  this.get = this.r.get;
  this.listeners = [];
  this.tab = this.screen = '';
}

Session.prototype = {
  // so that accessing this.data would not produce error
  data: emo,
  params: emo,
  getClasses: function(){
    var classes = [];
    if(window.innerWidth < 450 || shouldFixFixed || (window.matchMedia && matchMedia('@media (max-device-height: 450px),(max-device-width: 450px)').matches)){
      classes.push('mobile');
    }

    if(!this.get('image')){
      classes.push('noimage');
    }

    if(shouldFixFixed){
      classes.push('ip')
    }
    return classes.join(' ');
  },

  getEl: function(){
    if(!this.el){
      var div = document.createElement('div');
      div.innerHTML = templates.modal(this);
      this.el = div.firstChild;
      this.el.appendChild(this.renderCss());
      this.applyFont(this.el.querySelector('#powered-link'));
      document.body.appendChild(this.el);
      $(this.el).addClass(this.getClasses());
    }
    return this.el;
  },

  fillData: function(){
    var tab = this.data.method || this.get('prefill.method');

    if(tab && !this.order) {
      this.switchTab(tab);
    }

    if(this.hasOwnProperty('data')){
      var data = this.data;

      var exp_m = data['card[expiry_month]'];
      var exp_y = data['card[expiry_year]']
      if(exp_m && exp_y) {
        data['card[expiry]'] = exp_m + ' / ' + exp_y;
      }

      each(
        {
          'contact': 'contact',
          'email': 'email',
          'bank': 'bank-select',
          'card[name]': 'card_name',
          'card[number]': 'card_number',
          'card[expiry]': 'card_expiry',
          'card[cvv]': 'card_cvv'
        },
        function(name, id){
          var el = gel(id);
          var val = data[name];
          if(el && val) {
            el.value = val;
          }
        }
      )
    }
  },

  render: function(){
    this.saveAndClose();
    this.isOpen = true;

    this.setUser();
    this.getEl();
    this.fillData();
    this.setSmarty();
    this.setEMI();
    this.setModal();
    this.setCard();
    this.bindEvents();
    errorHandler.call(this, this.params);

    var key = this.get('key');
  },

  setEMI: function(){
    if(!this.emi && this.methods.emi && this.get('amount') > emi_options.min){
      $(this.el).addClass('emi');
      this.emi = new emiView(this);
    }
  },

  setModal: function(){
    if(!this.modal){
      this.modal = new window.Modal(this.el, {
        escape: this.get('modal.escape') && !this.embedded,
        backdropclose: this.get('modal.backdropclose'),
        onhide: function(){
          Razorpay.sendMessage({event: 'dismiss'});
        },
        onhidden: bind(
          function(){
            this.saveAndClose();
            Razorpay.sendMessage({event: 'hidden'});
          },
          this
        )
      })
    }
  },

  setSmarty: function(){
    this.smarty = new window.Smarty(this.el);
  },

  renderCss: function(){
    var div = this.el;
    var style = document.createElement('style');
    style.type = 'text/css';
    try{
      div.style.color = this.get('theme.color');
      if(div.style.color){
        var rules = templates.theme(this.get);
        if (style.styleSheet) {
          style.styleSheet.cssText = rules;
        } else {
          style.appendChild(document.createTextNode(rules));
        }
      }
      div.style.color = '';
    } catch(e){
      roll(e.message);
    }
    return style;
  },

  applyFont: function(anchor, retryCount) {
    if(!retryCount) {
      retryCount = 0;
    }
    if(anchor.offsetWidth/anchor.offsetHeight > 5) {
      $(this.el).addClass('font-loaded');
    }
    else if(retryCount < 25) {
      var self = this;
      fontTimeout = setTimeout(function(){
        self.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    }
  },

  hideErrorMessage: function(){
    if(this.r._payment){
      if(confirm('Ongoing payment. Press OK to abort payment.')){
        this.clearRequest();
      } else {
        return;
      }
    }
    hideOverlayMessage();
  },

  shake: function(){
    if ( this.el ) {
      $(this.el.querySelector('#modal-inner'))
        .removeClass('shake')
        .reflow()
        .addClass('shake');
    }
  },

  on: function(event, selector, listener, useCapture){
    var elements = $$(selector);
    each(
      elements,
      function(i, element){
        this.listeners.push(
          $(element).on(event, listener, useCapture, this)
        );
      },
      this
    )
  },

  onOtpEnter: function(e){
    if (!ensureNumeric(e)) {
      return;
    }
  },

  secAction: function() {
    if(this.tab === 'wallet'){
      this.showLoadError('Sending OTP to ' + getPhone());
      this.r.resendOTP(this.r.emitter('payment.otp.required'));
    } else {
      this.user.wants_skip = true;
      var payload = this.payload;
      if (payload) {
        delete payload.save;
        delete payload.app_token;
        this.submit();
      } else {
        this.showCardTab();
      }
    }
  },

  addFunds: function(event) {
    setOtpText('Loading...');
    $('#add-funds').removeClass('show');
    $('#form-otp').removeClass('action').addClass('loading').css('display', 'block');
    this.r.topupWallet();
  },

  bindEvents: function(){
    if(this.get('theme.close_button')){
      this.on('click', '#modal-close', function(){
        if (this.get('modal.confirm_close') && !confirm('Press OK to cancel the payment')) {
          return;
        }
        this.hide();
      });
    }
    this.on('click', '#top-left', this.switchTab);
    this.on('click', '#user', function(e){
      e.preventDefault();
      e.stopPropagation();
    })
    this.on('click', '.payment-option', this.switchTab);
    this.on('submit', '#form', this.preSubmit);
    this.on('keypress', '#otp', this.onOtpEnter);
    this.on('click', '#otp-action', this.switchTab);
    this.on('click', '#otp-sec', this.secAction);
    this.on('click', '#add-funds-action', this.addFunds);
    this.on('click', '#choose-payment-method', function() { this.setScreen(''); });
    var enabledMethods = this.methods;

    if(enabledMethods.netbanking){
      this.on('change', '#bank-select', this.switchBank);
      this.on('change', '#netb-banks', this.selectBankRadio, true);
    }
    if(!window.addEventListener){
      this.on('click', '.radio-item', this.selectRadio);
    }

    if(enabledMethods.card){
      this.on('blur', '#card_number', validateCardNumber);
      this.on('keyup', '#card_number', onSixDigits);
      this.on('change', '#nocvv', noCvvToggle);
    }

    this.on('click', '#backdrop', this.hideErrorMessage);
    this.on('click', '#overlay', this.hideErrorMessage);
    this.on('click', '#fd-hide', this.hideErrorMessage);
  },

  setCard: function(){
    if(!this.card){
      this.card = new Card();
    }
    var card = this.card;
    var el_number = gel('card_number');
    var el_expiry = gel('card_expiry');
    var el_cvv = gel('card_cvv');
    var el_contact = gel('contact');
    var el_name = gel('card_name');

    card.setType = function(e){
      var el = e.target;
      var type = card.getType(el.value) || 'unknown';

      // card icon element
      var iconEl = el.parentNode.querySelector('.cardtype');

      var oldType = iconEl.getAttribute('cardtype');
      if(type === oldType){
        return;
      }

      iconEl.setAttribute('cardtype', type);
      validateCardNumber(el);

      if(type === 'amex' || oldType === 'amex'){
        formatCvvHelp(el_cvv, type === 'amex' ? 4 : 3)
      }
    }

    if(shouldFocusNextField){
      card.filled = function(el){
        var next;
        if (el === el_expiry) {
          if(!$(el.parentNode).hasClass('invalid')){
            next = $('.elem-name.filled input')[0];
            if (next) {
              next = el_cvv;
            } else {
              next = el_name;
            }
          }
        } else if (el === el_number) {
          next = el_expiry;
        }
        if(next){
          next.focus();
        }
      }
    }

    card.formatCardNumber(el_number);
    card.formatCardExpiry(el_expiry);
    card.ensureNumeric(el_cvv);
    card.ensurePhone(el_contact);

    var otpEl = gel('powerotp')
    if(otpEl){
      ensureNumeric(otpEl);
    }

    // check if we're in webkit
    // checking el_expiry here in place of el_cvv, as IE also returns browser unsupported attribute rules from getComputedStyle
    if ( el_cvv && window.getComputedStyle && typeof getComputedStyle(el_expiry)['-webkit-text-security'] === 'string' ) {
      el_cvv.type = 'tel';
    }
  },

  setScreen: function(screen){
    if(screen === this.screen) {
      return;
    }
    this.screen = screen;
    var $body = $('#body');
    makeHidden('.screen.shown');
    $body.toggleClass('tab', screen);

    if (screen) {
      $('#tab-title').html(tab_titles[screen]);
      makeVisible('#topbar');
      makeVisible('#form-' + screen);
    } else {
      makeHidden('#topbar');
      makeVisible('#form-common');
    }

    if (screen !== 'otp'){
      this.saving_card = null;
      var $modal = $('#modal');
      if (this.tab === screen && screen === 'wallet') {
        // otp field doesn't animate and gets displayed as soon as sub class is applied
        invoke('addClass', $modal, 'sub', 300);
      } else {
        $modal.toggleClass('sub', screen);
      }
      $('#footer').removeClass('otp');
    }
  },

  switchTab: function(tab){
    if(typeof tab !== 'string'){
      tab = tab.currentTarget.getAttribute('tab') || '';
    }

    if(!(tab in tab_titles)){
      tab = '';
    }

    $('#form').attr('tab', tab);
    // initial screen
    if (!this.tab){
      if (this.checkInvalid('#form-common')) {
        return;
      }
      this.user.setPhone(getPhone());
    } else {
      if (this.screen === 'otp' && this.tab !== 'card' || this.saving_card) {
        tab = this.tab;
      }
    }

    if (tab) {
      $('#user').html(getPhone());
    } else {
      this.payload = null;
    }

    this.tab = tab;

    if (tab === 'card') {
      this.showCardTab();
    } else {
      this.setScreen(tab);
    }
  },

  showCardTab: function(message){
    var user = this.user;
    tab_titles.otp = tab_titles.card;

    if (!this.get('cardsaving')) {
      return this.setScreen('card');
    }

    if( !user.app_token && typeof user.saved !== 'boolean' ) {
      this.commenceOTP('saved cards');
      this.user.lookup(bind(this.showCardTab, this));
    } else if ( user.saved && !user.app_token && !user.wants_skip ) {
      this.verifyUser(message);
    } else {
      this.setSavedCards(user);
      this.setScreen('card');
      return true;
    }
    $('#otp-sec').html('Skip saved cards');
  },

  deleteCard: function(e) {
    var target = $(e.target);
    if (!target.hasClass('delete')) {
      return;
    }
    var parent = target.parent().parent();
    var user = this.user;
    if(confirm("Press OK to delete card.")){
      user.deleteCard(
        parent.find('[type=radio]')[0].value,
        function(){
          parent.remove();
      });
    }
  },

  setSavedCards: function(user){
    var userTokens = user && user.tokens;
    var cardTab = $('#form-card');
    if (userTokens) {
      if ($$('.saved-card').length !== userTokens.length) {
        $('#saved-cards-container').html(templates.savedcards(userTokens));
      }
    }

    // now that we've rendered the template, convert userTokens to boolean-y
    userTokens = isNonEmpty(userTokens);
    var saveScreen = this.savedCardScreen;

    // runs one time only
    if (saveScreen === undefined) {
      $('#form-card').addClass('save-enabled');
      // important to bind just once
      saveScreen = this.savedCardScreen = userTokens;
      if (saveScreen) {
        var self = this;
        this.on('click', '#show-add-card', function(){ self.toggleSavedCards(false) });
        this.on('click', '#show-saved-cards', function(){ self.toggleSavedCards(true) });
      }
    }
    this.toggleSavedCards(saveScreen);
    $('#form-card').toggleClass('has-cards', userTokens);
  },

  toggleSavedCards: function(saveScreen){
    var tabCard = $('#form-card');
    var saveClass = 'saved-cards';
    if (typeof saveScreen !== 'boolean') {
      saveScreen = !tabCard.hasClass(saveClass);
    }
    this.savedCardScreen = saveScreen;
    tabCard.toggleClass(saveClass, saveScreen);
  },

  verifyUser: function(msg){
    this.commenceOTP(msg, true);
    this.user.login();
  },

  setUser: function(){
    var options = this.get();
    var user = this.user = new User(preferences.customer, options.key);
    if (!options['prefill.contact'] && user.contact) {
      options['prefill.contact'] = user.contact;
    }
    if (!options['prefill.email'] && user.email) {
      options['prefill.email'] = user.email;
    }
  },

  switchBank: function(e){
    var val = e.target.value;
    each(
      $$('#netb-banks input'),
      function(i, radio) {
        if(radio.value === val){
          radio.checked = true;
        } else if(radio.checked){
          radio.checked = false;
        }
      }
    )
  },

  // for ie8 only, which has problems with label[for]
  selectRadio: function(e) {
    var target = e.currentTarget;
    var input = target.querySelector('input');
    var ieActiveClass = 'ie-active';
    $('.' + ieActiveClass).removeClass(ieActiveClass);
    $(target).addClass(ieActiveClass);
    input.checked = true;
    if (this.tab === 'netbanking') {
      this.selectBankRadio({target: input});
    }
  },

  selectBankRadio: function(e){
    var select = gel('bank-select');
    select.value = e.target.value;
    this.smarty.input({target: select});
  },

  checkInvalid: function(parent) {
    var invalids = $(parent).find('.invalid');
    if(invalids[0]){
      this.shake();
      var invalidInput = $(invalids[0]).find('.input')[0];
      if(invalidInput){
        invalidInput.focus();
      }

      each( invalids, function(i, field){
        $(field).addClass('mature');
      })
      return true;
    }
  },

  getActiveForm: function(){
    var form = this.tab;
    if (form === 'card') {
      var whichCardTab = this.savedCardScreen ? 'saved-cards' : 'add-card';
      return '#' + whichCardTab + '-container';
    }
    return '#form-' + form;
  },

  isCardForm: function(){
    return this.screen === 'card' || this.saving_card;
  },

  getFormData: function(){
    var tab = this.tab;
    var data = {};

    fillData('#form-common', data);

    if (tab) {
      data.method = tab;
      fillData(this.getActiveForm(), data);

      if (this.isCardForm()) {
        if (this.savedCardScreen) {
          if (data.token) {
            var cvvEl = gel('cvv-' + data.token);
            if (cvvEl) {
              data['card[cvv]'] = cvvEl.value;
            }
          }
        } else {
          var cardNumberKey = 'card[number]';
          var cardExpiryKey = 'card[expiry]';
          data[cardNumberKey] = data[cardNumberKey].replace(/\ /g, '');
          var expiry = data[cardExpiryKey].replace(/[^0-9\/]/g, '').split('/');
          data['card[expiry_month]'] = expiry[0];
          data['card[expiry_year]'] = expiry[1];
          delete data[cardExpiryKey];
        }
      }
    }
    return data;
  },

  hide: function(){
    if(this.isOpen){
      $('#modal-inner').removeClass('shake');
      hideOverlayMessage();
      this.modal.hide();
    }
  },

  showLoadError: function(text, error){
    var actionState;
    var loadingState = 'addClass';
    if (error) {
      actionState = loadingState;
      loadingState = 'removeClass'
    } else {
      actionState = 'removeClass';
    }

    if(!text){
      text = loadingMessage;
    }

    if(this.screen === 'otp'){
      $('#modal').removeClass('sub');
      setOtpText(text);
      $('#form-otp')[actionState]('action')[loadingState]('loading');
    } else {
      $('#fd-t').html(text);
      showOverlay(
        $('#error-message')[loadingState]('loading')
      );
    }
  },

  commenceOTP: function(text, immediately){
    this.setScreen('otp');
    $('#form-otp').css('display', 'block');
    $('#add-funds').removeClass('show');

    invoke(function(){
      if (this.screen === 'otp' && (this.tab !== 'card' || !this.payload)) {
        $('#footer').addClass('otp');
      }
    }, this, null, 300);

    if(immediately){
      this.sendOTP(text);
    } else {
      this.showLoadError('Looking for ' + text + ' associated with ' + getPhone());
    }
  },

  sendOTP: function(text){
    $('#otp').val('');
    var timeout;
    if(!text){
      var phone = getPhone();
      this.showLoadError('Sending OTP to ' + phone);
      timeout = 750;
      text = 'An OTP has been sent to ' + phone;
      this.requestTimeout = setTimeout(function(){
        askOTP(text);
      }, 750);
    } else {
      askOTP(text);
    }
  },

  onOtpSubmit: function(){
    if (this.checkInvalid('#form-otp')){
      return;
    }
    this.showLoadError('Verifying OTP...');
    var otp = gel('otp').value;

    if(this.tab === 'wallet'){
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
      callback = function(msg){
        var id = this.user.app_token;
        if(id){
          this.payload.app_token = id;
          this.setScreen('card');
          if (isRedirect) {
            this.submit();
          } else {
            this.r.emit('payment.resume');
          }
          this.showLoadError();
        } else {
          this.r.emit('payment.error', discreet.error(msg));
          this.sendOTP(msg);
        }
      }
    } else {
      callback = this.showCardTab;
    }
    this.user.verify(otp, bind(callback, this));
  },

  clearRequest: function(){
    var powerotp = gel('powerotp');
    if (powerotp) {
      powerotp.value = '';
    }
    if (this.r._payment) {
      this.r.emit('payment.cancel');
    }

    clearTimeout(this.requestTimeout);
    this.requestTimeout = null;
  },

  preSubmit: function(e) {
    preventDefault(e);
    var screen = this.screen;

    if (screen === 'otp') {
      return this.onOtpSubmit();
    }

    this.smarty.refresh();
    var data = this.payload = this.getPayload();
    if (this.order) {
      data.method = 'netbanking';
      data.bank = this.order.bank;
    } else if (screen) {
      if (screen === 'card') {
        if (!this.savedCardScreen) {
          // handling add new card screen
          validateCardNumber(gel('card_number'));
          var nocvv_el = gel('nocvv-check');

          // if maestro card is active
          if (nocvv_el.checked && !nocvv_el.disabled) {
            $('.elem-expiry').removeClass('invalid');
            $('.elem-cvv').removeClass('invalid');
            data['card[cvv]'] = '000';
            data['card[expiry_month]'] = '12';
            data['card[expiry_year]'] = '21';
          }
        } else {
          // no saved card was selected
          if (!data['card[cvv]']) {
            this.shake();
            return $('#cvv-' + data.token).focus();
          }
        }
      }

      if (this.checkInvalid(this.getActiveForm())) {
        return;
      }
    } else {
      return;
    }
    this.submit();
  },

  submit: function(){
    var data = this.payload;
    var request = {
      fees: preferences.fee_bearer
    };

    // ask user to verify phone number if not logged in and wants to save card
    if (('app_token' in data) && !data.app_token) {
      if (this.screen === 'card') {
        $('#otp-sec').html('Skip saving card');
        return this.verifyUser();
      } else {
        request.message = 'Verifying OTP...';
        request.paused = true;
      }
    }

    Razorpay.sendMessage({
      event: 'submit',
      data: data
    });

    var wallet = data.wallet;
    var walletObj;
    if (data.method === 'wallet') {
      walletObj = freqWallets[wallet];

      if (!walletObj || walletObj.custom) {
        return;
      }
    }

    if(this.modal){
      this.modal.options.backdropclose = false;
    }

    if((wallet === 'mobikwik' || wallet === 'payumoney') && !request.fees){
      request.powerwallet = true;
      $('#otp-sec').html('Resend OTP');
      tab_titles.otp = '<img src="'+walletObj.col+'" height="'+walletObj.h+'">';
      this.commenceOTP(wallet + ' account');
    } else {
      this.showLoadError();
    }

    this.r.createPayment(data, request)
      .on('payment.success', bind(successHandler, this))
      .on('payment.error', bind(errorHandler, this))
      .on('payment.cancel', bind(function() {
        this.showLoadError(false, 'Checking payment');
      }, this));

    if(request.powerwallet){
      this.r.on('payment.otp.required', bind(this.sendOTP, this));
      this.r.on('payment.wallet.topup', function() {
        $('#form-otp').removeClass('loading');
        $('#add-funds').addClass('show');
        setOtpText('Insufficient balance in your wallet');
      });
    }
  },

  getPayload: function(){
    var data = this.getFormData();

    if(this.screen === 'card'){
      setEmiBank(data);

      var userId = this.user.app_token;

      // set app_token if either new card or saved card (might be blank)
      if (data.save || data.token) {
        data.app_token = userId;
      }
    }

    // data.amount needed by external libraries relying on `onsubmit` postMessage
    data.amount = this.get('amount');
    return data;
  },

  close: function(){
    if(this.isOpen){
      this.clearRequest();
      this.isOpen = false;
      clearTimeout(fontTimeout);
      invokeEach(this.listeners);
      this.listeners = [];
      this.modal.destroy();
      this.smarty.off();
      this.card.unbind();
      $(this.el).remove();

      this.tab = this.screen = '';

      if(this.emi){
        this.emi.unbind();
      }

      this.tab = this.screen = '';
      this.modal =
      this.smarty =
      this.card =
      this.emi =
      this.el =
      window.setPaymentID =
      window.onComplete = null;
    }
  },

  saveAndClose: function(){
    if (this.isOpen) {
      this.data = this.getFormData();
      this.close();
    }
  }
}
