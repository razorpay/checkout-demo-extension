// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone/.test(ua);

// iphone/ipad restrict non user initiated focus on input fields
var shouldFocusNextField = !/iPhone|iPad/.test(ua);

var fontTimeout;

// sanitizes innerHTML, by removing angle brackets
function sanitizeContent(obj, fieldsArr){
  each(
    fieldsArr,
    function(i, key){
      if(typeof obj[key] === 'string'){
        obj[key] = obj[key].replace(/<[^>]*>?/g, "");
      }
    }
  )
}

// higher level sanitize function
function sanitize(message){ // warning: modifies message;
  var options = message.options;
  var data = message.data;
  // sanitize options affecting innerHTML
  sanitizeContent(
    options,
    ['name', 'description', 'amount', 'currency', 'display_amount']
  )


  sanitizeValue(
    options,
    ['image', 'prefill', 'notes']
  )

  data.contact = sanitizeContact(data.contact || options.prefill.contact);
}

// sanitizes attribute values by removing double quote character.
function sanitizeValue(obj, key){
  if(key instanceof Array){
    return each(
      key,
      function(i, field){
        sanitizeValue(obj, field);
      }
    )
  }
  var attr = obj[key];

  if(typeof attr === 'string'){
    obj[key] = attr.replace(/"/g,'');
  }
  else if(typeof attr === 'object'){
    each(
      attr,
      function(attrKey, attrObj){
        sanitizeValue(attrObj, attrKey);
      }
    )
  }
}

// enforces numerical value with optional plus at start
function sanitizeContact(contactPrefill){
  var contactFirstChar = contactPrefill[0];
  contactPrefill = contactPrefill.replace(/[^0-9]/g,'');
  if ( contactFirstChar === '+' ) {
    contactPrefill = '+' + contactPrefill;
  }
  return contactPrefill;
}

// add missing keys with empty object values to message object
function formatMessage(message){
  each(
    ['data', 'params'],
    function(i, key){
      var val = message[key];
      if(typeof val === 'string'){
        try{
          message[key] = JSON.parse(val);
        } catch(e){
          // TODO roll()
        }
      }
      if(typeof val !== 'object'){
        message[key] = {};
      }
    }
  )
}

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

function getFormFields(containerID, returnObj) {
  each(
    $('#' + containerID).find('input[name],select[name]'),
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

function getFormData() {
  var activeTab = $('#tabs > .active')[0];
  if(!activeTab) { return }

  var data = {};
  getFormFields('form-common', data);

  var targetTab = activeTab.getAttribute('data-target');
  getFormFields(targetTab, data);

  if(targetTab === 'tab-card'){
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

function setEmiBank(data){
  if(data.method === 'emi'){
    var num = data['card[number]'];
    data.bank = 'HDFC';
  }
}

function hideEmi(){
  var emic = $('#emi-container');
  if(emic[0]){
    emic.removeClass('shown');
    invoke(emic.hide, emic, null, 300)
    gel('fd-in').style.display = '';
  }
}

function frontDrop(message, className){
  gel('fd-t').innerHTML = message || '';
  gel('fd').className = className || '';
  hideEmi();
}

function showErrorMessage(message){
  frontDrop(message, 'shown')
}

function showLoadingMessage(message){
  frontDrop(message, 'shown loading');
}

function setDefaultError(){
  var msg = discreet.defaultError();
  msg.id = _uid;
  setCookie('onComplete', stringify(msg));
}

function processModalMethods(session){
  var modal = session.message.options.modal;

  modal.onhide = function(){
    Razorpay.sendMessage({event: 'dismiss'});
    if(isCriOS){
      setDefaultError();
      window.close();
    }
  };
  modal.onhidden = function(){
    session.saveAndClose();
    Razorpay.sendMessage({event: 'hidden'});
  }
  delete modal.ondismiss;
}

function CheckoutModal(){
  this.listeners = [];
}

CheckoutModal.prototype = {

  getClasses: function(){
    var classes = [];
    if(window.innerWidth < 450 || shouldFixFixed || (window.matchMedia && matchMedia('@media (max-device-height: 450px),(max-device-width: 450px)').matches)){
      classes.push('mobile');
    }

    if(!this.message.options.image){
      classes.push('noimage');
    }

    if(shouldFixFixed){
      classes.push('ip')
    }
    return classes;
  },

  getEl: function(){
    if(!this.el){
      var div = document.createElement('div');
      div.innerHTML = templates.modal(this.message);
      this.el = div.firstChild;
      this.el.appendChild(this.renderCss());
      this.applyFont(this.el.querySelector('#powered-link'));
      document.body.appendChild(this.el);
      $(this.el).addClass(this.getClasses());
    }
    return this.el;
  },

  fillData: function(data){

    if(data.method){
      this.switchTab($('#method-' + data.method + '-tab'));
    }

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
  },

  render: function(message){
    if(this.isOpen){
      this.saveAndClose();
    }
    else {
      this.isOpen = true;
    }

    if(!message.data && this.message){
      message.data = this.message.data;
    }
    this.message = message;
    formatMessage(message);
    sanitize(message);
    this.getEl();
    this.fillData(message.data);

    processModalMethods(this);
    if(!this.modal) { this.modal = new window.Modal(this.el, message.options.modal) }

    if(!this.smarty) { this.smarty = new window.Smarty(this.el) }
    this.setCardFormatting()
    this.bindEvents();

    this.emiView = new emiView(message);
  },

  renderCss: function(){
    var div = this.el;
    var theme = this.message.options.theme;
    var style = document.createElement('style');
    style.type = 'text/css';
    try{
      div.style.color = theme.color;
      if(div.style.color){
        var rules = templates.theme(theme);
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
    if(!this.rzp){
      frontDrop();
    }
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
        var $el = $(element);
        listener = $el.on(event, listener, useCapture, this)
        this.listeners.push([$el, event, listener, useCapture]);
      },
      this
    )
  },

  bindEvents: function(){
    this.on('click', '#modal-close', this.hide);
    this.on('click', '#tabs li', this.switchTab);
    this.on('submit', '#form', this.submit);

    var options = this.message.options;
    var enableMethods = options.method;

    if(enableMethods.netbanking){
      this.on('change', '#bank-select', this.switchBank);
      this.on('change', '#netb-banks', this.selectBankRadio, true);
      if(!window.addEventListener){
        this.on('click', '#netb-banks .bank-radio', this.selectBankRadio);
      }
    }

    if(enableMethods.card){
      this.on('blur', '#card_number', validateCardNumber);
    }

    this.on('click', '#backdrop', this.hideErrorMessage);

    this.on('click', '#fd', function(e){
      var id = e.target.id;
      if(id === 'fd' || id === 'fd-hide') {
        this.hideErrorMessage();
      }
    });

    if(isCriOS){
      this.on('unload', window, options.modal.onhide);
    }
    // $('nocvv-check').on('change', frameDiscreet.toggle_nocvv)
  },

  setCardFormatting: function(){
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
      // if(type !== 'maestro'){
        // $('nocvv-check')[0].checked = false;
        // frameDiscreet.toggle_nocvv();
      // }
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
    else if(!$el[0] || $el.hasClass('active')){
      return;
    }

    $('.tab-content.active').removeClass('active');
    $('#' + $el.attr('data-target')).addClass('active');

    $('#tabs > .active').removeClass('active');
    $el.addClass('active');
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

  checkInvalid: function(parentID) {
    var invalids = $('#' + parentID).find('.invalid');
    if(invalids[0]){
      this.shake();
      $(invalids[0]).find('.input')[0].focus();

      each( invalids, function(i, field){
        $(field).addClass('mature');
      })
      return true;
    }
  },

  hide: function(){
    if(this.isOpen){
      $('#modal-inner').removeClass('shake');
      frontDrop();
      this.modal.hide();
    }
  },

  successHandler: function(response){
    if(!this.rzp){
      return;
    }
    track.call(this.rzp, 'success', response);
    this.rzp = null;
    // prevent dismiss event
    this.modal.options.onhide = noop;

    Razorpay.sendMessage({ event: 'success', data: response });
    if(isCriOS) {
      response.id = _uid;
      setCookie('onComplete', stringify(response));
    }
    this.hide();
  },

  errorHandler: function(response){
    if(!this.rzp || !response){
      return;
    }
    this.rzp = window.onComplete = null;
    var message;
    this.shake();
    this.modal.options.backdropClose = this.message.options.modal.backdropClose;

    if (response.error){
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
          this.hideErrorMessage();
          return;
        }
      }
    }

    showErrorMessage(message || 'There was an error in handling your request');
    $('#fd-hide').focus();
  },

  submit: function(e) {
    preventDefault(e);
    this.smarty.refresh();
    validateCardNumber(gel('card_number'));

    if (this.checkInvalid('form-common')) {
      return;
    }

    var activeTab = $('#tabs > .active')[0];
    if ( activeTab && this.checkInvalid(activeTab.getAttribute('data-target')) ) {
      return;
    }
    var data = getFormData();
    setEmiBank(data);
    var options = this.message.options;

    Razorpay.sendMessage({
      event: 'submit',
      data: data
    });

    if(this.modal){
      this.modal.options.backdropClose = false;
    }

    showLoadingMessage('Please wait while your payment is processed...');

    // TODO
    this.rzp = Razorpay(this.message.options);

    // onComplete defined in razorpay-submit.js, safe to expose now
    window.onComplete = bind(discreet.onComplete, this.rzp);

    this.rzp.authorizePayment({
      data: data,
      error: bind(this.errorHandler, this),
      success: bind(this.successHandler, this)
    });
  },

  close: function(){
    if(this.isOpen){
      if(this.rzp){
        this.rzp.cancelPayment();
        this.rzp = null;
      }
      this.isOpen = false;
      clearTimeout(fontTimeout);
      each(
        this.listeners,
        function(i, listener){
          listener[0].off(listener[1], listener[2], listener[3]);
        }
      )
      this.listeners = [];
      this.modal.destroy();
      this.smarty.off();
      this.card.unbind();
      this.emiView.unbind();
      $(this.el).remove();

      this.modal =
      this.smarty =
      this.card =
      this.emiView =
      this.el =
      window.onComplete = null;
    }
  },

  saveAndClose: function(){
    if(this.message){
      this.message.data = getFormData();
    }
    this.close();
  }
}