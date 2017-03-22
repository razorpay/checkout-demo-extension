// dont shake in mobile devices. handled by css, this is just for fallback.
var shouldShakeOnError = !/Android|iPhone|iPad/.test(ua);

// .shown has display: none from iOS ad-blocker
// using दृश्य, which will never be seen by tim cook
var shownClass = 'drishy';

var strings = {
  otpsend: 'Sending OTP to ',
  process: 'Your payment is being processed'
}

var fontTimeout;

function confirmClose(){
  return confirm('Ongoing payment. Press OK to abort payment.');
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

function makeEmiDropdown(emiObj, session, isOption) {
  var h = '';
  if (emiObj.plans) {
    each(
      emiObj.plans,
      function(length, rate){
        h += (isOption ? '<option' : '<div class="option"') + ' value="'+length+'">'
          + length + ' month EMI @' + rate + '% (₹ '
          + Razorpay.emi.calculator(session.get('amount'), length, rate)/100
          + ' per month)</' + (isOption ? 'option>' : 'div>');
      }
    )
  }
  return h;
}

function unsetEmiBank() {
  $('#emi-plans-wrap .active').removeClass('active');
  $('#emi-check-label').removeClass('checked');
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

  var cardType = $('#elem-card .cardtype').attr('cardtype');
  var isMaestro = /^maestro/.test(cardType);
  var sixDigits = val.length > 5;
  $(el.parentNode).toggleClass('six', sixDigits);
  var emiObj;

  var nocvvCheck = gel('nocvv');

  if(sixDigits){
    if(isMaestro){
      if(nocvvCheck.disabled){
        toggleNoCvv(true);
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
      );

      toggleNoCvv(false);
    }
  } else {
    toggleNoCvv(false);
  }

  var emi_parent = $('#emi-check-label').toggleClass('disabled', !emiObj);

  if (emiObj) {
    $('#expiry-cvv').removeClass('hidden');
    if (!$('#emi-plans-wrap .option')[0]) {
      $('#emi-plans-wrap').html(makeEmiDropdown(emiObj, this));
    }
  } else {
    emi_parent.removeClass('checked');
    $(emi_parent.find('.active')[0]).removeClass('active');
  }
  noCvvToggle({target: nocvvCheck});

  var elem_emi = $('#elem-emi');
  var hiddenClass = 'hidden';

  if (isMaestro && sixDigits) {
    elem_emi.addClass(hiddenClass);
  } else if(elem_emi.hasClass(hiddenClass)) {
    invoke('removeClass', elem_emi, hiddenClass, 200);
  }
}

function noCvvToggle(e){
  var nocvvCheck = e.target;
  var shouldHideExpiryCVV = nocvvCheck.checked && !nocvvCheck.disabled;
  $('#form-card').toggleClass('nocvv', shouldHideExpiryCVV);
}

function toggleNoCvv(show){
  // Display or hide the nocvv checkbox
  $('#nocvv-check').toggleClass(shownClass, show);
  gel('nocvv').disabled = !show;
}

function makeVisible(subject){
  $(subject)
    .css('display', 'block')
    .reflow()
    .addClass(shownClass);
}

function makeHidden(subject){
  subject = $(subject);
  if(subject[0]){
    subject.removeClass(shownClass);
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
  var wasShown = emic.hasClass(shownClass);
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
  return $('#overlay').hasClass(shownClass);
}

// this === Session
function errorHandler(response){
  if (isString(response)) {
    try {
      response = JSON.parse(response);
    } catch(e){
      return;
    }
  }
  if(!response || !response.error){
    return;
  }
  var error = response.error;
  var message = error.description;
  this.clearRequest();

  this.track('error', response);
  Razorpay.sendMessage({event: 'paymenterror', data: {error: error}});

  if(this.modal){
    this.modal.options.backdropclose = this.get('modal.backdropclose');
  }

  if (this.get('retry') === false) {
    return this.modal.hide();
  }

  var err_field = error.field;
  if (err_field && !(this.screen === 'otp' && this.tab === 'wallet')) {
    if(!err_field.indexOf('expiry')) {
      err_field = 'card[expiry]';
    }
    var error_el = document.getElementsByName(err_field)[0];
    if (error_el && error_el.type !== 'hidden') {
      var help = $(error_el)
        .focus()
        .parent()
        .addClass('invalid')
        .find('help-text')[0];

      if(help){
        $(help).html(message);
      }
      if (err_field === 'contact' || err_field === 'email') {
        this.switchTab();
      }
      this.shake();
      return hideOverlayMessage();
    }
  }

  if (this.tab || message !== discreet.cancelMsg) {
    this.showLoadError(message || 'There was an error in handling your request', true);
  }
  $('#fd-hide').focus();
}

function getPhone() {
  return gel('contact').value;
}

function setOtpText(text){
  gel('otp-prompt').innerHTML = text;
}

function elfShowOTP(otp, sender) {
    window.handleOTP(otp);
}

function askOTP(text) {
  if (qpmap.platform === 'android') {
    if (window.OTPElf) {
      window.OTPElf.showOTP = elfShowOTP;
    } else {
      window.OTPElf = {
        showOTP: elfShowOTP
      }
    }
  }
  if (isNonNullObject(text)) {
    text = text.error && text.error.description;
  }
  $('#otp').val('');
  $('#form-otp').removeClass('loading').removeClass('action');
  $('#body').addClass('sub');
  if (!text) {
    var thisSession = getSession();
    if (thisSession.tab === 'card' || thisSession.tab === 'emi') {
      text = 'Enter OTP sent on ' + getPhone() + '<br>to ';
      if (thisSession.payload) {
        text += 'save your card'
      } else {
        text += 'access Saved Cards';
      }
    } else {
      text = 'An OTP has been sent on<br>' + getPhone();
    }
  }
  setOtpText(text);
}

function debounceAskOTP(msg){
  debounce(askOTP, 750)(msg);
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

function cancel_upi(session) {
  $('#error-message').addClass('cancel_upi');
  session.r.on('payment.error', function() {
    $('#error-message').removeClass('cancel_upi');
  })
}

function Session (options) {
  this.r = Razorpay(options);
  this.get = this.r.get;
  this.tab = this.screen = '';
  this.listeners = [];
  this.bits = [];

  var key = this.get('key')
  var INNER_CHEF_KEY_ID = 'rzp_live_xA0AumIJLxL8VX';
  var CHAIPOINT_KEY_ID = 'rzp_live_Zqmx92mExD1bHO';
  var MG_KEY_ID = 'rzp_live_vv7inDhmBFP0d0';
  var walletData = this.walletData
  var freechargeWallet, airtelMoneyWallet, mobikwikWallet;

  switch (key) {
    case INNER_CHEF_KEY_ID:
      freechargeWallet = walletData.freecharge;
      freechargeWallet.offer = 20;
      freechargeWallet.offerDesc = '20% Cashback on Freecharge';
      freechargeWallet.maxCBDesc = 'Cashback upto ₹75';
      freechargeWallet.offerValidDesc = 'Valid 2 times per user';

      airtelMoneyWallet = walletData.airtelmoney;
      airtelMoneyWallet.offer = 15;
      airtelMoneyWallet.offerDesc = '15% Cashback on Airtel Money';
      airtelMoneyWallet.maxCBDesc = 'Cashback upto ₹75';
      airtelMoneyWallet.offerValidDesc = 'Applicable one time per user';
      break;

    case MG_KEY_ID:
      freechargeWallet = walletData.mobikwik;
      freechargeWallet.offer = 10;
      freechargeWallet.offerDesc = '10% Cashback on Mobikwik';
      freechargeWallet.maxCBDesc = 'Cashback upto ₹150';
      freechargeWallet.offerValidDesc = 'Applicable one time per user';
      break;

    case CHAIPOINT_KEY_ID:
      airtelMoneyWallet = walletData.airtelmoney;
      airtelMoneyWallet.offer = 10;
      airtelMoneyWallet.offerDesc = '10% Cashback on Airtel Money';
      airtelMoneyWallet.maxCBDesc = 'Cashback upto ₹50';
      airtelMoneyWallet.offerValidDesc = 'Applicable one time per user';
      break;
  }
}

Session.prototype = {
  // so that accessing this.data would not produce error
  data: emo,
  params: emo,

  track: function(event, extra) {
    track(this.r, event, extra);
  },

  getClasses: function() {
    var classes = [];
    if(window.innerWidth < 450 || shouldFixFixed || (window.matchMedia && matchMedia('@media (max-device-height: 450px),(max-device-width: 450px)').matches)){
      this.isMobile = true;
      classes.push('mobile');
    }

    var getter = this.get;

    if (!this.r.isLiveMode()) {
      classes.push('test');
    }

    if (getter('theme.branding')) {
      classes.push('cob');
    }

    if (getter('theme.hide_topbar')) {
      classes.push('notopbar');
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

    if(shouldFixFixed){
      classes.push('ip')
    }

    if (/Android 4/.test(ua)) {
      classes.push('android4');
    }

    return classes.join(' ');
  },

  getEl: function() {
    if(!this.el){
      var r = this.r;
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
      div.innerHTML = templates.modal(this);
      this.el = div.firstChild;
      this.el.appendChild(this.renderCss());
      this.applyFont(this.el.querySelector('#powered-link'));
      document.body.appendChild(this.el);
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
      $(this.el).addClass(this.getClasses());
    }
    return this.el;
  },

  fillData: function() {
    var oldMethod = this.data.method;
    if (oldMethod) {
      this.wants_skip = true;
    }
    var tab = oldMethod || this.get('prefill.method');

    if (tab && !this.order) {
      this.switchTab(tab);
    }

    var prefilledWallet = this.get('prefill.wallet');
    if (prefilledWallet) {
      $('#wallet-radio-' + prefilledWallet).prop('checked', true);
    }

    if (this.hasOwnProperty('data')) {
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
    if (this.isOpen) {
      return;
    }
    this.saveAndClose();
    this.isOpen = true;

    this.getEl();
    this.fillData();
    this.setEMI();
    this.improvisePaymentOptions();
    this.setModal();
    this.setFormatting();
    this.bindEvents();
    errorHandler.call(this, this.params);
  },

  setEMI: function(){
    if(!this.emi && this.methods.emi){
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

  improvisePaymentOptions: function() {
    if (this.methods.count === 1) {
      $(this.el).addClass('one-method');
      $('.payment-option').addClass('submit-button button');
    }
  },

  renderCss: function(){
    var div = this.el;
    var style = document.createElement('style');
    style.type = 'text/css';
    try {
      var getter = this.get;
      div.style.color = getter('theme.color');
      if(!div.style.color){
        getter()['theme.color'] = '';
      }
      var rules = templates.theme(getter);
      if (style.styleSheet) {
        style.styleSheet.cssText = rules;
      } else {
        style.appendChild(document.createTextNode(rules));
      }
      div.style.color = '';
    } catch(e){
      roll('renderCss', e);
    }
    return style;
  },

  applyFont: function(anchor, retryCount) {
    if(!retryCount) {
      retryCount = 0;
    }
    if(anchor.offsetWidth/anchor.offsetHeight > 3) {
      $(this.el).addClass('font-loaded');
    }
    else if(retryCount < 25) {
      var self = this;
      fontTimeout = setTimeout(function(){
        self.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    }
  },

  hideErrorMessage: function() {
    if(this.r._payment) {
      if (this.payload && this.payload.method === 'upi') {
        return cancel_upi(this);
      }
      if(confirmClose()) {
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

  click: function(selector, delegateClass, listener, useCapture) {
    this.on('click', selector, delegateClass, listener, useCapture);
  },

  on: function(event, selector, delegateClass, listener, useCapture) {
    var listeners = this.listeners;
    if (!listener || listener === true) {
      each(
        $$(selector),
        function(i, element) {
          listeners.push(
            $(element).on(event, delegateClass, listener, this)
          );
        },
        this
      )
    } else {
      var self = this;
      var $parent = $(selector);
      return listeners.push($parent.on(event, function(e) {
        var target = e.target;
        while (target !== $parent[0]) {
          if ($(target).hasClass(delegateClass)) {
            e.delegateTarget = target;
            invoke(listener, self, e);
            break;
          }
          target = target.parentNode;
        }
      }, useCapture));
    }
  },

  resendOTP: function() {
    this.showLoadError(strings.otpsend + getPhone());
    if (this.tab === 'wallet') {
      this.r.resendOTP(this.r.emitter('payment.otp.required'));
    } else {
      this.customer.createOTP(debounceAskOTP);
    }
  },

  secAction: function(){
    this.track('skipped_save', {while_submitting: !!payload});
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
    $('#form-otp').removeClass('action').addClass('loading').css('display', 'block');
    this.r.topupWallet();
  },

  bindEvents: function(){
    this.on('focus', '#body', 'input', 'focus', true);
    this.on('blur', '#body', 'input', 'blur', true);
    this.on('input', '#body', 'input', function(e) {
      this.input(e.target);
    }, true);
    if(this.get('theme.close_button')){
      this.click('#modal-close', function(){
        if (this.get('modal.confirm_close') && !confirmClose()) {
          return;
        }
        this.hide();
      });
    }
    this.click('#top-left', this.back);
    this.click('.payment-option', function(e){
      this.switchTab(e.currentTarget.getAttribute('tab') || '');
    });
    this.on('submit', '#form', this.preSubmit);
    this.click('#otp-action', this.back);
    this.click('#otp-resend', this.resendOTP);
    this.click('#otp-sec', this.secAction);
    this.click('#add-funds-action', this.addFunds);
    this.click('#choose-payment-method', function() { this.setScreen(''); });

    var enabledMethods = this.methods;
    if (enabledMethods.card || enabledMethods.emi) {
      this.on('keyup', '#card_number', onSixDigits);
      this.on('change', '#nocvv', noCvvToggle);

      var saveTick = qs('#save');
      if (saveTick) {
        this.on('change', '#save', function(e){
          this.track('change_save', {active: e.target.checked});
        })
      }

      this.on('change', '#emi-bank', function(e) {
        $('#elem-emi select').html(makeEmiDropdown(emi_options.banks[e.target.value], this, true));
      })

      // saved cards events
      this.click('#show-add-card', this.toggleSavedCards);
      this.click('#show-saved-cards', this.toggleSavedCards);
      this.on('click', '#saved-cards-container', 'saved-card', this.setSavedCard);
    }
    this.on('click', '#top-right', function() {
      $('#top-right').addClass('focus');
      var self = this;
      var container_listener = $('#container').on('click', function(e) {
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
      }, true);
    })
    if (enabledMethods.netbanking) {
      this.on('change', '#bank-select', this.switchBank);
      this.on('change', '#netb-banks', this.selectBankRadio, true);
    }
    if (enabledMethods.wallet) {
      try {
        this.on('change', '#wallets', function(e) {
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
            if (value) {
              $('.offer-info.active').removeClass('active');
              $('#' + value + '-info').addClass('active');
            }
            $('#wallets').removeClass('invalid');
          }
        }, true);
      } catch(e) {}
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
      })
      this.click('#cancel_upi .back-btn', function() {
        $('#error-message').removeClass('cancel_upi');
      })
    }

    if (this.get('ecod')) {
      this.click('#ecod-resend', send_ecod_link);
    }

    var goto_payment = '#error-message .link';
    if (this.get('redirect')) {
      $(goto_payment).hide();
      var moreinfo = gel('moreinfo');
      if (moreinfo) {
        $('#moreinfo').hide();
      }
    } else {
      this.click(goto_payment, function() {
        if (this.payload && this.payload.method === 'upi') {
          return cancel_upi(this);
        }
        this.r.focus();
      })
    }
    this.click('#backdrop', this.hideErrorMessage);
    this.click('#overlay', this.hideErrorMessage);
    this.click('#fd-hide', this.hideErrorMessage);
  },

  focus: function(e) {
    $(e.target.parentNode).addClass('focused');
    if (ua_iPhone) {
      Razorpay.sendMessage({event: 'focus'});
    }
  },

  blur: function(e) {
    $(e.target.parentNode)
      .removeClass('focused')
      .addClass('mature');
    this.input(e.target);
    if (ua_iPhone) {
      Razorpay.sendMessage({event: 'blur'});
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
    var delegator = self.delegator = Razorpay.setFormatter(self.el);
    if (self.methods.card || self.methods.emi) {
      var el_card = gel('card_number');
      var el_expiry = gel('card_expiry');
      var el_cvv = gel('card_cvv');
      var el_name = gel('card_name');

      // check if we're in webkit
      // checking el_expiry here in place of el_cvv, as IE also returns browser unsupported attribute rules from getComputedStyle
      try {
        // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        if (el_cvv && typeof getComputedStyle(el_expiry)['-webkit-text-security'] === 'string') {
          el_cvv.type = 'tel';
        }
      } catch(e){}

      delegator.card = delegator.add('card', el_card)
        .on('network', function() {
          var type = this.type;
          // update cvv element
          var cvvlen = type !== 'amex' ? 3 : 4;
          el_cvv.maxLength = cvvlen;
          el_cvv.pattern = '^[0-9]{'+cvvlen+'}$';
          $(el_cvv)
            .toggleClass('amex', type === 'amex')
            .toggleClass('maestro', type === 'maestro');
          self.input(el_cvv);

          // card icon element
          this.el.parentNode.querySelector('.cardtype').setAttribute('cardtype', type);
        })
        .on('change', function() {
          var isValid = this.isValid();
          // set validity classes
          toggleInvalid($(this.el.parentNode), isValid);

          // adding maxLen change because some cards may have multiple kind of valid lengths
          if (isValid && this.el.value.length === this.caretPosition) {
            invoke('focus', el_expiry, null, 0);
          }
        })

      delegator.expiry = delegator.add('expiry', el_expiry)
        .on('change', function() {
          self.input(el_expiry);

          var isValid = this.isValid();
          toggleInvalid($(this.el.parentNode), isValid);

          if (isValid && this.el.value.length === this.caretPosition) {
            invoke('focus', el_name.value ? el_cvv : el_name);
          }
        })

      delegator.cvv = delegator.add('number', el_cvv)
        .on('change', function() {
          self.input(this.el);
        })
    }
    delegator.contact = delegator.add('phone', gel('contact'))
      .on('change', function() {
        self.input(this.el);
      })
    delegator.otp = delegator.add('number', gel('otp'))
      .on('change', function() {
        self.input(this.el);
      })
  },

  setScreen: function(screen){
    if(screen === this.screen) {
      return;
    }
    this.screen = screen;
    $('#body').attr('screen', screen);
    makeHidden('.screen.' + shownClass);

    if (screen) {
      var screenTitle = this.tab === 'emi' ? 'EMI' : tab_titles[screen];
      $('#tab-title').html(screenTitle);
      makeVisible('#topbar');
    } else {
      makeHidden('#topbar');
    }

    var screenEl = '#form-' + (screen || 'common');
    makeVisible(screenEl)
    invoke('focus', qs(screenEl + ' .invalid input'));
    this.body.toggleClass('sub', screen);
  },

  back: function(){
    var tab;
    if (this.get('ecod')) {
      $('#footer').hide();
      $('#wallets input:checked').prop('checked', false);
      $(this.el).addClass('notopbar');
      tab = 'wallet';
    } else if (this.screen === 'otp' && this.tab !== 'card') {
      tab = this.tab;
    } else {
      tab = '';
    }
    this.switchTab(tab);
  },

  switchTab: function(tab) {
    // initial screen
    if (!this.tab){
      if (this.checkInvalid('#pad-common')) {
        return;
      }
    }
    if (tab) {
      var contact = getPhone();
      if (!contact || this.get('method.' + tab) === false) {
        return;
      }
      this.customer = getCustomer(contact);
      if (this.customer.logged) {
        $('#top-right').addClass('logged');
      }
      $('#user').html(contact);
    } else {
      this.payload = null;
      this.clearRequest();
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
    }
  },

  showCardTab: function(tab) {
    var isEmiTab = tab === 'emi';
    $('#elem-emi select')[0].required = $('#emi-bank')[0].required = isEmiTab;

    if (!isEmiTab) {
      $('#emi-bank').parent().removeClass('invalid');
      $('#elem-emi .elem').removeClass('invalid');
    }

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
      customer.checkStatus(function(){
        // customer status check also sends otp if customer exists
        if (customer.saved && !customer.logged) {
          askOTP();
        } else {
          self.showCards();
        }
      });
    } else {
      self.showCards();
    }
  },

  showCards: function(){
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
        function(){
          parent.remove();
        }
      );
    }
  },

  setSavedCard: function (e) {
    var $savedCard = $(e.delegateTarget);
    if (this.tab === 'emi' && !isString($savedCard.attr('emi'))) {
      return;
    }
    $('#saved-cards-container .checked').removeClass('checked');
    $savedCard.addClass('checked');
    var cardtype = $savedCard.$('.cardtype').attr('cardtype');
  },

  setSavedCards: function(){
    var customer = this.customer;
    var tokens = customer && customer.tokens && customer.tokens.count;
    var cardTab = $('#form-card');
    if (tokens) {
      if ($$('.saved-card').length !== customer.tokens.items.length) {
        customer.tokens.amount = this.get('amount');
        try {
          customer.tokens.items.sort(function(a, b) {
            return b.card && !!b.card.emi;
          })
        } catch(e){}
        $('#saved-cards-container').html(templates.savedcards(customer.tokens));
      }
    }

    if (tokens) {
      this.setSavedCard({delegateTarget: qs('.saved-card')});
    }

    this.savedCardScreen = tokens;
    this.toggleSavedCards(!!tokens);
    $('#form-card').toggleClass('has-cards', tokens);
  },

  toggleSavedCards: function(saveScreen) {
    var tabCard = $('#form-card');
    var saveClass = 'saved-cards';
    if (typeof saveScreen !== 'boolean') {
      saveScreen = !tabCard.hasClass(saveClass);
    }

    $('#elem-emi').removeClass('hidden');
    unsetEmiBank();

    var $savedContainer = $('#saved-cards-container');

    if (saveScreen) {
      this.setSavedCard({delegateTarget: qs('.saved-card')});
      invoke('addClass', $savedContainer, 'scroll', 300);
    } else {
      try {
        if (document.activeElement) {
          document.activeElement.blur();
        }
      } catch(e){}
      invoke('onSixDigits', this, {target: gel('card_number')});
      $savedContainer.removeClass('scroll');
    }

    this.savedCardScreen = saveScreen;
    tabCard.toggleClass(saveClass, saveScreen);
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
    this.input(select);
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
    var form = this.tab || 'common';
    if (form === 'card' || form === 'emi') {
      var whichCardTab = this.savedCardScreen ? 'saved-cards' : 'add-card';
      return '#' + whichCardTab + '-container';
    }
    return '#form-' + form;
  },

  getFormData: function(){
    var tab = this.tab;
    var data = {};

    fillData('#pad-common', data);
    data['contact'] = data['contact'].replace(/\ /g, '');

    if (tab) {
      data.method = tab;
      fillData(this.getActiveForm(), data);

      if (this.screen === 'card') {
        if (this.savedCardScreen) {
          var $checkedCard = $('.saved-card.checked');
          data.token = $checkedCard.attr('token');
          data['card[cvv]'] = $checkedCard.$('.saved-cvv').val();
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
    }
    return data;
  },

  hide: function(){
    if(this.isOpen){
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
      if ((this.screen === 'upi' || this.get('ecod')) && text === discreet.cancelMsg) {
        return this.hideErrorMessage();
      }
      actionState = loadingState;
      loadingState = 'removeClass'
    } else {
      actionState = 'removeClass';
    }

    if(!text) {
      text = strings.process;
    }

    if(this.screen === 'otp') {
      this.body.removeClass('sub');
      setOtpText(text);
      $('#form-otp')[actionState]('action')[loadingState]('loading');
    } else {
      $('#fd-t').html(text);
      showOverlay(
        $('#error-message')[loadingState]('loading')
      );
    }
  },

  commenceOTP: function(text, partial){
    this.setScreen('otp');
    $('#add-funds').removeClass('show');

    invoke(function(){
      if (this.screen === 'otp' && (this.tab !== 'card' || !this.payload)) {
        $('#footer').addClass('otp');
      }
    }, this, null, 300);

    if (text) {
      if (partial) {
        text = 'Looking for ' + text + ' associated with ';
      }
      this.showLoadError(text + getPhone());
    }
  },

  onOtpSubmit: function(){
    if (this.checkInvalid('#form-otp')){
      return;
    }
    this.showLoadError('Verifying OTP');
    var otp = gel('otp').value.replace(/\D/g, '');

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
        if(this.customer.logged){
          this.setScreen('card');
          if (isRedirect) {
            this.submit();
          } else {
            this.r.emit('payment.resume');
          }
          this.showLoadError();
        } else {
          this.r.emit('payment.error', discreet.error(msg));
          askOTP(msg);
        }
      }
    } else {
      var self = this;
      callback = function(msg){
        if (self.customer.logged) {
          self.showCardTab();
        } else {
          askOTP(msg);
        }
      };
    }
    this.customer.submitOTP({
      otp: otp,
      email: gel('email').value
    }, bind(callback, this));
  },

  clearRequest: function(extra){
    var powerotp = gel('powerotp');
    if (powerotp) {
      powerotp.value = '';
    }
    if (this.r._payment) {
      hideOverlayMessage();
      this.r.emit('payment.cancel', extra);
    }
    abortAjax(this.ajax);

    clearTimeout(this.requestTimeout);
    this.requestTimeout = null;
  },

  preSubmit: function(e) {
    preventDefault(e);
    var screen = this.screen;

    if (!this.tab && !this.order) {
      return;
    }

    if (screen === 'otp') {
      return this.onOtpSubmit();
    }

    this.refresh();
    var data = this.payload = this.getPayload();
    if (this.order) {
      if (this.checkInvalid('#pad-common')) {
        return;
      }

      data.method = 'netbanking';
      data.bank = this.order.bank;
    } else if (screen) {
      if (screen === 'card') {
        var formattingDelegator = this.delegator;

        // Do not proceed with amex cards if amex is disabled for merchant
        // also without this, cardsaving is triggered before API returning unsupported card error
        if (!preferences.methods.amex && formattingDelegator.card.type === 'amex') {
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
      }

      if (this.checkInvalid()) {
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

    if ((wallet === 'mobikwik' || wallet === 'payumoney' || wallet === 'freecharge' || wallet ==='olamoney') && !request.fees) {
      request.powerwallet = true;
      $('#otp-sec').html('Resend OTP');
      tab_titles.otp = '<img src="'+walletObj.col+'" height="'+walletObj.h+'">';
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

    this.r.createPayment(data, request)
      .on('payment.success', bind(successHandler, this))
      .on('payment.error', bind(errorHandler, this));

    var sub_link = $('#error-message .link');
    if (request.powerwallet) {
      this.showLoadError(strings.otpsend + getPhone());
      this.r.on('payment.otp.required', debounceAskOTP);
      this.r.on('payment.wallet.topup', bind(function() {
        var insufficient_text = 'Insufficient balance in your wallet';
        if (this.get('ecod')) {
          this.back();
          this.clearRequest();
          defer(bind(function() {
            this.showLoadError(insufficient_text, true);
          }, this), 400);
        }
        if (this.payload && this.payload.wallet === 'payumoney' && this.r._payment) {
          if (!window.localStorage) {
            return this.r._payment.complete(discreet.error(insufficient_text));
          }
        }
        $('#form-otp').removeClass('loading');
        $('#add-funds').addClass('show');
        setOtpText(insufficient_text);
      }, this));
    } else if (data.method === 'upi') {
      sub_link.html('Cancel Payment')
      this.r.on('payment.upi.pending', bind('showLoadError', this,
        'Please accept collect request from <strong>razorpay@icici</strong> on your UPI app'
      ));
    } else {
      sub_link.html('Go to payment')
      this.r.on('payment.cancel', bind('showLoadError', this, discreet.cancelMsg, true));
    }
  },

  getPayload: function(){
    var data = this.getFormData();

    if(this.screen === 'card'){
      setEmiBank(data);

      var customer = this.customer;
      var recurring = this.get('recurring');

      // set app_token if either new card or saved card (might be blank)
      if (customer.customer_id) {
        data.customer_id = customer.customer_id;

        if (recurring !== null) {
          data.recurring = recurring ? 1 : 0;
        }
      }
    }

    // data.amount needed by external libraries relying on `onsubmit` postMessage
    data.amount = this.get('amount');
    return data;
  },

  close: function(){
    if(this.isOpen){
      abortAjax(this.ajax);
      this.clearRequest();
      this.isOpen = false;
      clearTimeout(fontTimeout);

      try {
        this.delegator.destroy();
        invokeEach(this.listeners);
      } catch(e) {}
      invokeOnEach('off', this.bits);
      this.listeners = [];
      this.bits = [];

      this.modal.destroy();
      $(this.el).remove();

      this.tab = this.screen = '';

      if(this.emi){
        this.emi.unbind();
      }

      this.tab = this.screen = '';
      this.modal =
      this.emi =
      this.el =
      this.card =
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

function commenceECOD(session) {
  var url = makeAuthUrl(session.r, 'invoices/' + session.get('invoice_id') + '/status');
  setTimeout(function() {
    session.ajax = recurseAjax(url, function(response) {
      if (response.error) {
        errorHandler.call(session, response);
      } else if (response.razorpay_payment_id) {
        successHandler.call(session, response);
      }
    }, function(response) {
      return response && response.status;
    })
  }, 6000)
}

function send_ecod_link() {
  // this == session
  this.showLoadError('Sending link to ' + getPhone());
  var r = this.r;
  $.post({
    url: makeAuthUrl(r, 'invoices/' + r.get('invoice_id') + '/notify/sms'),
    callback: debounce(hideOverlayMessage, 4000)
  })
}
