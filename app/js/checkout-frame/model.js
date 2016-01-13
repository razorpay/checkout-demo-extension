
// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone/.test(ua);

// iphone/ipad restrict non user initiated focus on input fields
var shouldFocusNextField = !/iPhone|iPad/.test(ua);

// element to verfy whether font has been loaded
var fontAnchor = '#powered-link';
var fontTimeout;

// sanitizing innerHTML
function sanitizeContent(obj, fieldsArr){
  each(
    fieldsArr,
    function(i, key){
      obj[key] = obj[key].replace(/<[^>]*>?/g, "");
    }
  )
}

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

function sanitizeContact(contactPrefill){
  var contactFirstChar = contactPrefill[0];
  contactPrefill = contactPrefill.replace(/[^0-9]/g,'');
  if ( contactFirstChar === '+' ) {
    contactPrefill = '+' + contactPrefill;
  }
  return contactPrefill;
}

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

function validateCard(e){
  var el = e.target;
  $(el.parentNode)[Card.validateCardNumber(el.value, el.getAttribute('cardtype')) ? 'removeClass' : 'addClass']('invalid');
}

function formatCvvHelp(el_cvv, cvvlen){
  var cvv_help = $('.elem-cvv .help-text');
  cvv_help.html(cvv_help.html().replace(/3|4/, cvvlen));
  el_cvv.maxLength = cvvlen;
  el_cvv.pattern = '[0-9]{'+cvvlen+'}';
  $(el_cvv.parentNode)[el_cvv.value.length === cvvlen ? 'removeClass' : 'addClass']('invalid');
}

function CheckoutModal(){
  this.listeners = [];

  // var classes = [];

  // if(window.innerWidth < 450 || shouldFixFixed || (window.matchMedia && matchMedia('@media (max-device-height: 450px),(max-device-width: 450px)').matches)){
  //   classes.push('mobile');
  // }

  // if(!opts.image){
  //   classes.push('noimage');
  // }

  // if(shouldFixFixed){
  //   classes.push('ip')
  // }

  // $(container).addClass(classes.join(' '));
}

CheckoutModal.prototype = {
  getEl: function(){
    if(!this.el){
      var div = document.createElement('div');
      div.innerHTML = templates.modal(this.message);
      this.el = div.firstChild;
      this.el.appendChild(this.renderCss());
      this.applyFont(this.el.querySelector('#powered-link'));
      document.body.appendChild(this.el);
    }
    return this.el;
  },

  fillData: function(data){

    if(data.method){
      this.changeTab({target: $('#method-' + data.method + '-tab')[0]});
    }

    if(('card[expiry_month]' in data) && ('card[expiry_year]' in data)) {
      data['card[expiry]'] = data['card[expiry_month]'] + ' / ' + data['card[expiry_year]'];
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
        if(el) {
          var val = data[name];
          if(val){
            el.value = val;
          }
        }
      }
    )
  },

  render: function(message){
    this.message = message;
    formatMessage(message);
    sanitize(message);
    this.getEl();
    this.fillData(message.data);
    this.modal = new Modal(this.el, message.options.modal);
    this.smarty = new Smarty(this.el);
    this.setCardFormatting()
    this.bindEvents();
  },

  renderCss: function(){
    var div = this.el;
    var col = this.message.options.theme.color;
    var style = document.createElement('style');
    try{
      div.style.color = col;
      if(div.style.color){
        var rules = templates.theme(col);
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
        $(element).on(event, listener, useCapture, this)
      },
      this
    )
    this.listeners.push([selector, event, listener, useCapture]);
  },

  bindEvents: function(){
    this.on('click', '#modal-close', this.close);
    this.on('click', '#tabs', this.switchTab);
    this.on('submit', '#form', this.submit);
    this.on('blur', '#card_number', validateCard);

    if(this.message.options.method.netbanking){
      this.on('change', '#bank-select', this.switchBank);
      this.on('change', '#netb-banks', this.selectBankRadio, true);
      if(!window.addEventListener){
        this.on('click', '#netb-banks .bank-radio', this.selectBankRadio);
      }
    }

    this.on('click', '#backdrop', this.frontDrop);
    this.on('click', '#fd', function(e){
      var id = e.target.id;
      if(id === 'fd' || id === 'fd-hide') {
        frontDrop();
      }
    });
  },

  close: function(){
    // TODO this.cancelPayment
    Razorpay.payment.cancel();
    this.modal.hide();
  },

  submit: function(e){
    frameDiscreet.formSubmit();
    e.preventDefault();
  },

  setCardFormatting: function(){
    var $el_number = $('#card_number');
    var el_expiry = gel('card_expiry');
    var el_cvv = gel('card_cvv');
    var el_contact = gel('contact');
    var card = this.card = new Card();

    card.setType = function(e){
      var el = e.target;
      var type = card.getType(el.value) || 'unknown';
      var parent = el.parentNode;

      var oldType = parent.getAttribute('cardtype');
      if(type === oldType){
        return;
      }

      parent.setAttribute('cardtype', type);
      validateCard({target: el});
      
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
        if(el === el_expiry){
          el_cvv.focus();
        }
        else{
          el_expiry.focus();
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

  switchTab: function(e){
    var target = e.target;

    if( target.nodeName === 'IMG' ) {
      target = target.parentNode;
    }

    if( target.nodeName !== 'LI' || $(target).hasClass('active') ) {
      return;
    }

    // TODO frameDiscreet.renew();

    $('.tab-content.active').removeClass('active');
    $('#' + target.getAttribute('data-target')).addClass('active');

    $('#tabs > .active').removeClass('active');
    $(target).addClass('active');
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

  unrender: function(){
    clearTimeout(fontTimeout);

    each(this.listeners, function(listener){
      listener[0].off(listener[1], listener[2], listener[3]);
    })
    this.listeners = [];
    $(this.el).remove();
  }
}