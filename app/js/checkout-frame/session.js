// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone/.test(ua);

// iphone/ipad restrict non user initiated focus on input fields
var shouldFocusNextField = !/iPhone|iPad/.test(ua);

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

function fillData($container, returnObj) {
  each(
    $container.find('input[name],select[name]'),
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
  if(getSession().tab === 'card' && activeEmiPlan){
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

  var nocvvCheck = gel('nocvv-check');

  if(sixDigits){
    if(isMaestro){
      if(nocvvCheck.disabled){
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
  $('#expiry-cvv').toggleClass('hidden', shouldHideExpiryCVV);
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

function showErrorMessage(message){
  $('#fd-t').html(message);
  showOverlay(
    $('#error-message').removeClass('loading')
  );
}

function showLoadingMessage(){
  $('#fd-t').html('Loading, please wait...');
  showOverlay(
    $('#error-message').addClass('loading')
  );
}

function setDefaultError(){
  var msg = discreet.defaultError();
  msg.id = _uid;
  setCookie('onComplete', stringify(msg));
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

  showErrorMessage(message || 'There was an error in handling your request');
  $('#fd-hide').focus();
}

// this === Session
function otpErrorHandler(response){
  this.clearRequest();
  this.requestTimeout = invoke(
    'showOTPScreen',
    this,
    {
      error: true,
      actionText: 'Retry',
      text: response.error.description
    },
    200
  )
}

function getTab(tab){
  return $('#tab-' + tab);
}

function getPhone(){
  return gel('contact').value;
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

function insufficientFundsHandler() {
  $('#tab-otp').css('display', 'none');
  $('#add-funds').toggleClass('shown');

  gel('add-funds-desc').innerHTML = 'Insufficient balance in your wallet';
}

// this === Session
function secondfactorHandler(done, tab){
  this.secondfactorCallback = done;
  this.showOTPScreen({
    text: 'Sending OTP to',
    loading: true,
    number: true
  })
  $('#otp').val('');
  this.requestTimeout = invoke(
    'showOTPScreen',
    this,
    {
      verify: true,
      text: 'An OTP has been sent to',
      number: true,
      otp: true
    },
    750
  )
}

function Session (options) {
  this.get = Options(options).get;
  this.listeners = [];
  this.tab = '';
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
    if(tab){
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
    if(this.isOpen){
      this.saveAndClose();
    }
    else {
      this.isOpen = true;
    }

    this.getEl();
    this.setSmarty();
    this.fillData();
    this.setUser();
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
        escape: this.get('parent'),
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
    if(this.request){
      if(confirm('Cancel Payment?')){
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

  resendOTP: function() {
    var self = this;
    this.showOTPScreen({
      text: 'Sending OTP to',
      loading: true,
      number: true
    })
    $('#otp').val('');

    $.post({
      url: discreet.makeUrl() + 'payments/' + this.request.payment_id + '/otp_resend',
      headers: {
        Authorization: 'Basic ' + _btoa(this.get('key') + ':')
      },
      callback: function(response) {
        self.showOTPScreen({
          verify: true,
          text: 'An OTP has been sent to',
          number: true,
          otp: true
        });
        makeSecondfactorCallback(self.request, response.request)
      }
    });
  },

  bindEvents: function(){
    if(this.get('theme.close_button')){
      this.on('click', '#close', this.hide);
    }
    this.on('click', '#tab-title, #topbar .back', this.switchTab);
    this.on('click', '.payment-option', this.switchTab);
    this.on('submit', '#form', this.submit);
    this.on('keypress', '#otp', this.onOtpEnter);
    this.on('click', '#otp-action', this.switchTab);
    this.on('click', '#add-funds-action', this.addFunds);
    this.on('click', '#resend-action > a', this.resendOTP);
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
      // this.on('change', '#nocvv-check', noCvvToggle);
    }

    // if(enabledMethods.wallet.mobikwik){
    //   this.on('submit', '#powerwallet', this.onOtpSubmit);
    //   this.on('click', '#powercancel', this.hideErrorMessage);
    // }

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
      var parent = el.parentNode;

      var oldType = parent.getAttribute('cardtype');
      if(type === oldType){
        return;
      }

      parent.setAttribute('cardtype', type);
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
    var $body = $('#body');
    makeHidden('.screen.shown');
    $body.toggleClass('tab', screen);

    if (screen) {
      $('#tab-title').html(tab_titles[screen]);
      makeVisible('#topbar');
      makeVisible('#tab-' + screen);
    } else {
      makeHidden('#topbar');
      makeVisible('#form-common');
    }

    if (screen !== 'otp'){
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
    if (!this.tab && this.checkInvalid($('#form-common'))) {
      return;
    }
    if (this.sub_tab) {
      this.sub_tab = null;
      tab = 'wallet';
    }

    $('#form-common').addClass('not-first');

    this.setScreen(tab);
    this.tab = tab;
    if (tab) {
      // if (tab === 'card') {
      //   var user = this.user;
      //   user.setPhone(getPhone());
      //   if( typeof user.saved !== 'boolean') {
      //     return this.lookupUser();
      //   } else if (user.saved && !user.logged_in && !user.wants_skip) {
      //     return this.loginUser();
      //   } else {
      //     // preferences.tokens
      //   }
      // }
      getTab(tab).addClass('shown');
    }
  },

  loginUser: function(){
    this.user.login();
    invoke(secondfactorHandler, this, function(data){
      this.user.verify(
        data,
        bind(
          function(){
            this.switchTab('card');
          },
          this
        )
      )
    });
  },

  lookupUser: function(){
    this.showOTPScreen({
      text: '<strong>Looking for saved cards with Razorpay</strong>',
      loading: true
    })
    this.user.lookup(
      bind(
        function(){
          this.switchTab('card');
        },
        this
      )
    )
  },

  setUser: function(){
    var userOptions = preferences.user ? preferences.user : emo;
    this.user = new User(userOptions);
    this.user.key = this.get('key');
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

  checkInvalid: function($parent) {
    var invalids = $parent.find('.invalid');
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

  getFormData: function(){
    var tab = this.tab || '';
    var data = {};
    var activeTab;

    fillData($('#form-common'), data);

    if(tab){
      activeTab = getTab(tab);
      data.method = tab;
      fillData(activeTab, data);
    }

    if(tab === 'card'){
      data['card[number]'] = data['card[number]'].replace(/\ /g, '');

      if(!data['card[expiry]']){
        data['card[expiry]'] = '';
      }

      if(!data['card[cvv]']){
        data['card[cvv]'] = '';
      }

      var expiry = data['card[expiry]'].replace(/[^0-9\/]/g, '').split('/');
      data['card[expiry_month]'] = expiry[0];
      data['card[expiry_year]'] = expiry[1];
      delete data['card[expiry]'];
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

  addFunds: function(event) {
    this.request.data.key_id = this.get('key');
    this.request.overridePowerWallet = true;
    this.showOTPScreen({
      text: 'Loading...',
      loading: true
    });
    Razorpay.payment.authorize(this.request);
  },

  showOTPScreen: function(state){
    if (!this.sub_tab || !this.isOpen) {
      return;
    }
    $('#add-funds').removeClass('shown');
    $('#tab-otp').css('display', 'block');
    $('#tab-otp').toggleClass('loading', state.loading);
    $('#modal').toggleClass('sub', state.verify);
    $('#tab-otp').toggleClass('error', state.error);
    $('#otp').toggleClass('shown', state.otp);
    $('#resend-action').toggleClass('shown', state.otp);

    var wallet = state.wallet;
    if(wallet){
      var walletObj = freqWallets[wallet];
      tab_titles.otp = '<img src="'+walletObj.col+'" height="'+walletObj.h+'">';
      this.setScreen('otp');
      invoke('addClass', $('#footer'), 'otp', 300);
    }

    if(state.number){
      state.text += ' ' + getPhone();
    }

    gel('otp-prompt').innerHTML = state.text;
  },

  onOtpSubmit: function(e){
    preventDefault(e);
    this.showOTPScreen({
      loading: true,
      text: 'Verifying OTP...'
    })
    this.secondfactorCallback(gel('otp').value);
  },

  clearRequest: function(){
    var powerotp = gel('powerotp');
    if(powerotp){
      powerotp.value = '';
    }
    var request = this.request;
    if(request){
      if(request.ajax){
        request.ajax.abort();
      }
      request.cancel();
      this.request = null;
    }
    clearTimeout(this.requestTimeout);
    this.requestTimeout = null;
  },

  bind: function(func){
    return bind(func, this);
  },

  submit: function(e) {
    preventDefault(e);

    var activeTab = $('.tab-content.shown');
    if (activeTab[0] && this.checkInvalid(activeTab)){
      return;
    }

    if (this.sub_tab) {
      return this.onOtpSubmit(e);
    }
    this.smarty.refresh();

    var nocvv_el = gel('nocvv-check');
    var nocvv_dummy_values;

    if(!this.tab){
      return;
    }

    // if card tab exists
    if(nocvv_el){
      validateCardNumber(gel('card_number'));
      if(nocvv_el.checked && !nocvv_el.disabled){
        nocvv_dummy_values = true;
        $('.elem-expiry').removeClass('invalid');
        $('.elem-cvv').removeClass('invalid');
      }
    }

    if(this.checkInvalid($('#form-common'))){
      return;
    }

    var data = this.getPayload(nocvv_dummy_values);

    Razorpay.sendMessage({
      event: 'submit',
      data: data
    });

    var wallet = data.wallet;
    if (data.method === 'wallet') {
      var walletObj = freqWallets[wallet];

      if (!walletObj || walletObj.custom) {
        return;
      }
    }

    if(this.modal){
      this.modal.options.backdropclose = false;
    }

    var request = {
      data: data,
      fees: preferences.fee_bearer,
      options: this.get(),
      success: this.bind(successHandler)
    };

    if((wallet === 'mobikwik' || wallet === 'payumoney') && !request.fees){
      request.error = this.bind(otpErrorHandler);
      request.secondfactor = this.bind(secondfactorHandler);
      request.insufficientFundsHandler = this.bind(insufficientFundsHandler);

      this.sub_tab = wallet;
      this.showOTPScreen({
        loading: true,
        number: true,
        text: 'Checking for a ' + wallet + ' account associated with',
        wallet: wallet
      })
    } else {
      request.error = this.bind(errorHandler);
      showLoadingMessage('Please wait while your payment is processed...');
    }
    this.request = Razorpay.payment.authorize(request);
  },

  getPayload: function(nocvv_dummy_values){
    var data = this.getFormData();
    setEmiBank(data);

    if(nocvv_dummy_values){
      data['card[cvv]'] = '000';
      data['card[expiry_month]'] = '12';
      data['card[expiry_year]'] = '21';
    }
    // data.amount needed by external libraries relying on `onsubmit` postMessage
    each(
      ['amount', 'currency', 'signature', 'description', 'order_id'],
      function(i, field){
        var val = this.get(field);
        if(val){
          data[field] = this.get(field);
        }
      },
      this
    )

    // data.key_id needed by discreet.shouldAjax
    data.key_id = this.get('key');

    each(
      this.get('notes'),
      function(noteKey, noteVal){
        data['notes[' + noteKey + ']'] = noteVal;
      }
    )
    return data;
  },

  close: function(){
    if(this.isOpen){
      if(this.request){
        this.request.cancel();
        this.request = null;
      }
      this.isOpen = false;
      clearTimeout(fontTimeout);
      invokeEach(this.listeners);
      this.listeners = [];
      this.modal.destroy();
      this.smarty.off();
      this.card.unbind();
      $(this.el).remove();

      if(this.emi){
        this.emi.unbind();
      }

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
    this.data = this.getFormData();
    this.close();
  }
}
