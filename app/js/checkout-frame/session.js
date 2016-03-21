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
  var cvv_help = $('.elem-cvv .help-text');
  cvv_help.html(cvv_help.html().replace(/3|4/, cvvlen));
  el_cvv.maxLength = cvvlen;
  el_cvv.pattern = '[0-9]{'+cvvlen+'}';
  $(el_cvv.parentNode)[el_cvv.value.length === cvvlen ? 'removeClass' : 'addClass']('invalid');
}

function getFormFields($container, returnObj) {
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

function getFormData(){
  var activeTab = $('.tab-content.shown');
  if(!activeTab[0]) { return }

  var data = {};
  getFormFields($('#form-common'), data);

  getFormFields(activeTab, data);

  if(activeTab.prop('id') === 'tab-card'){
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

function makeVisible(){
  this
    .css('display', 'block')
    .reflow()
    .addClass('shown');
}

function makeHidden(){
  if(this[0]){
    this.removeClass('shown');
    invoke('hide', this, null, 200);
  }
}

function showOverlay($with){
  makeVisible.call($('#overlay'));
  if($with){
    makeVisible.call($with);
  }
}

function hideOverlay($with){
  makeHidden.call($('#overlay'));
  if($with){
    makeHidden.call($with);
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
  var errEl = $('#error-message');
  if(!errEl.hasClass('shown')){
    errEl = $('#powerwallet');
  }
  hideOverlay(errEl);
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
function powerErrorHandler(response){
  this.clearRequest();
  this.requestTimeout = invoke(
    'showPowerScreen',
    this,
    {
      className: 'error',
      text: response.error.description,
      title: 'Error'
    },
    200
  )
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

// this === Session
function secondfactorHandler(done){
  this.secondfactorCallback = done;
  this.showPowerScreen({
    title: 'Sending OTP',
    text: 'Sending OTP to',
    number: true
  })
  this.requestTimeout = invoke(
    'showPowerScreen',
    this,
    {
      className: 'otp',
      title: 'Enter OTP',
      text: 'An OTP has been sent to',
      number: true
    },
    750
  )
}

function Session(options){
  this.get = Options(options).get;
  this.listeners = [];
}

Session.prototype = {
  // accessing this.data would not produce error
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
    var method = this.data.method || this.get('prefill.method');
    if(method){
      this.switchTab($('#method-' + method + '-tab'));
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
    this.fillData();
    this.setEMI();
    this.setModal();
    this.setSmarty();
    this.setCard();
    this.bindEvents();
    errorHandler.call(this, this.params);

    var key = this.get('key');
    if(key === 'rzp_live_kfAFSfgtztVo28' || key === 'rzp_test_s9cT6UE4Mit7zL'){
      $('#powered-link').css('visibility', 'hidden').css('pointerEvents', 'none');
    }
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

  bindEvents: function(){
    this.on('click', '#modal-close', this.hide);
    this.on('click', '#tabs li', this.switchTab);
    this.on('submit', '#form', this.submit);

    var enabledMethods = this.methods;

    if(enabledMethods.netbanking){
      this.on('change', '#bank-select', this.switchBank);
      this.on('change', '#netb-banks', this.selectBankRadio, true);
      if(!window.addEventListener){
        this.on('click', '#netb-banks .bank-radio', this.selectBankRadio);
      }
    }

    if(enabledMethods.card){
      this.on('blur', '#card_number', validateCardNumber);
      this.on('keyup', '#card_number', onSixDigits);
      this.on('change', '#nocvv-check', noCvvToggle);
    }

    if(enabledMethods.wallet.mobikwik){
      this.on('submit', '#powerwallet', this.onOtpSubmit);
      this.on('click', '#powercancel', this.hideErrorMessage);
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
    var $el_number = $('#card_number');
    var el_expiry = gel('card_expiry');
    var el_cvv = gel('card_cvv');
    var el_contact = gel('contact');

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
        if(!$(el.parentNode).hasClass('invalid')){
          (el === el_expiry ? el_cvv : el_expiry).focus();
        }
      }
    }

    card.formatCardNumber($el_number[0]);
    card.formatCardExpiry(el_expiry);
    card.ensureNumeric(el_cvv);
    card.ensurePhone(el_contact);

    var otpEl = gel('powerotp')
    if(otpEl){
      card.ensureNumeric(otpEl);
    }

    // check if we're in webkit
    // checking el_expiry here in place of el_cvv, as IE also returns browser unsupported attribute rules from getComputedStyle
    if ( el_cvv && window.getComputedStyle && typeof getComputedStyle(el_expiry)['-webkit-text-security'] === 'string' ) {
      el_cvv.type = 'tel';
    }
  },

  switchTab: function($el){
    if(!($el instanceof $)){
      $el = $($el.target);
    }

    var el = $el[0];
    if(!el){
      return;
    }

    var parent = $el.parent();

    var index;
    each(
      parent.find('li'),
      function(i, li){
        if(li === $el[0]){
          var activeTab = parent[0].querySelector('li.active');
          if(activeTab){
            $(activeTab).removeClass('active');
          }
          $(li).addClass('active');
          index = i;
        }
      }
    )
    var oldIndex = parseInt(parent.attr('active'), 10);

    if(oldIndex !== index){
      parent.attr('active', index);

      var dirs = ['ltr', 'rtl'];
      var isLeft = oldIndex < index;

      makeHidden.call($('.tab-content.shown').attr('animdir', dirs[1-isLeft]));
      makeVisible.call($('#' + $el.attr('data-target')).attr('animdir', dirs[isLeft | 0]));
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

  hide: function(){
    if(this.isOpen){
      $('#modal-inner').removeClass('shake');
      hideOverlayMessage();
      this.modal.hide();
    }
  },

  showPowerScreen: function(state){
    gel('power-title').innerHTML = state.title;

    var text = state.text;
    if(text){
      if(state.number){
        text += ' <strong>' + gel('contact').value + '</strong>'
      }
      gel('power-desc').innerHTML = text;
    }

    var className = state.className;
    if(className){
      gel('power-var').className = state.className;
    }

    var powerwallet = $('#powerwallet');
    if(!powerwallet.hasClass('shown')){
      showOverlay(powerwallet);
    }
  },

  onOtpSubmit: function(e){
    preventDefault(e);
    this.showPowerScreen({
      className: 'loading',
      title: 'Verifying OTP',
      text: 'Please wait...'
    })
    this.secondfactorCallback(gel('powerotp').value);
  },

  clearRequest: function(){
    var powerotp = gel('powerotp');
    if(powerotp){
      powerotp.value = '';
    }
    if(this.request){
      if(this.request.ajax){
        this.request.ajax.abort();
      }
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
    this.smarty.refresh();

    var nocvv_el = gel('nocvv-check');
    var nocvv_dummy_values;

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

    var activeTab = $('.tab-content.shown');
    if (activeTab[0] && this.checkInvalid(activeTab)){
      return;
    }

    var data = this.getPayload(nocvv_dummy_values);
    var message = this.message;

    Razorpay.sendMessage({
      event: 'submit',
      data: data
    });
    if(data.method === 'wallet' && freqWallets[data.wallet].custom){
      return;
    }

    if(this.modal){
      this.modal.options.backdropclose = false;
    }

    var request = {
      data: data,
      fees: preferences.fee_bearer,
      options: {
        image: this.get('image'),
        redirect: this.get('redirect')
      },
      success: this.bind(successHandler)
    };

    if(data.wallet === 'mobikwik' && !request.fees){
      request.error = this.bind(powerErrorHandler);
      request.secondfactor = this.bind(secondfactorHandler);
      this.showPowerScreen({
        className: 'loading',
        title: 'Verifying Account',
        number: true,
        text: 'Checking for a mobikwik account associated with'
      })
    } else {
      request.error = this.bind(errorHandler);
      showLoadingMessage('Please wait while your payment is processed...');
    }
    this.request = Razorpay.payment.authorize(request);
  },

  getPayload: function(nocvv_dummy_values){
    var data = getFormData();
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
    this.data = getFormData();
    this.close();
  }
}
