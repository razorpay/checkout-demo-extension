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
  var isMaestro = $('#elem-card .cardtype').attr('cardtype') === 'maestro';
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
    makeEmiDropdown(emiObj, this);
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

  var err_field = error.field;
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
      if (err_field === 'contact' || err_field === 'email') {
        this.switchTab();
      }
      this.shake();
      return hideOverlayMessage();
    }
  }

  if (this.tab || message !== 'Payment cancelled') {
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

function askOTP(text){
  if (isNonNullObject(text)) {
    text = text.error && text.error.description;
  }
  $('#otp').val('');
  $('#form-otp').removeClass('loading').removeClass('action');
  $('#body').addClass('sub');
  if (!text) {
    var thisSession = getSession();
    if (thisSession.tab === 'card') {
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

function Session (options) {
  this.r = Razorpay(options);
  this.get = this.r.get;
  this.tab = this.screen = '';
  this.listeners = [];
  this.bits = [];
}

Session.prototype = {
  // so that accessing this.data would not produce error
  data: emo,
  params: emo,

  track: function(event, extra) {
    track(this.r, event, extra);
  },

  ajax: function(xhr){
    if (this.xhr) {
      this.xhr.abort();
    }
    if (xhr instanceof XMLHttpRequest) {
      this.xhr = xhr;
    }
  },

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
      this.body = $('#body');
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
    if (this.isOpen) {
      return;
    }
    this.saveAndClose();
    this.isOpen = true;

    this.getEl();
    this.fillData();
    this.setEMI();
    this.setModal();
    this.setFormatting();
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

  hideErrorMessage: function(){
    if(this.r._payment){
      if(confirmClose()){
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

  resendOTP: function() {
    this.showLoadError(strings.otpsend + getPhone());
    if (this.tab === 'wallet') {
      this.r.resendOTP(this.r.emitter('payment.otp.required'));
    } else {
      this.customer.createOTP(debounceAskOTP);
    }
  },

  secAction: function(){
    this.customer.wants_skip = true;
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
    if(this.get('theme.close_button')){
      this.on('click', '#modal-close', function(){
        if (this.get('modal.confirm_close') && !confirmClose()) {
          return;
        }
        this.hide();
      });
    }
    this.on('click', '#top-left', this.back);
    this.on('click', '#user', function(e){
      e.preventDefault();
      e.stopPropagation();
    })
    this.on('click', '.payment-option', function(e){
      this.switchTab(e.currentTarget.getAttribute('tab') || '');
    });
    this.on('keypress', '#contact', ensurePhone);
    this.on('submit', '#form', this.preSubmit);
    this.on('click', '#otp-action', this.back);
    this.on('click', '#otp-resend', this.resendOTP);
    this.on('click', '#otp-sec', this.secAction);
    this.on('click', '#add-funds-action', this.addFunds);
    this.on('click', '#choose-payment-method', function() { this.setScreen(''); });

    var enabledMethods = this.methods;
    if(enabledMethods.netbanking){
      this.on('change', '#bank-select', this.switchBank);
      this.on('change', '#netb-banks', this.selectBankRadio, true);
    }
    if(enabledMethods.card){
      this.on('blur', '#card_number', this.validateCard);
      this.on('keyup', '#card_number', onSixDigits);
      this.on('change', '#nocvv', noCvvToggle);

      // saved cards events
      this.on('click', '#show-add-card', this.toggleSavedCards);
      this.on('click', '#show-saved-cards', this.toggleSavedCards);
      this.on('change', '#saved-cards-container', this.setSavedCard, true);
    }

    this.on('click', '#backdrop', this.hideErrorMessage);
    this.on('click', '#overlay', this.hideErrorMessage);
    this.on('click', '#fd-hide', this.hideErrorMessage);
  },

  setFormatting: function(){
    var inputHandler = this.ihandler = new InputHandler(this.el, $$('.input'));
    var bits = this.bits;
    bits.push(inputHandler);

    if (this.methods.card) {
      var el_expiry = gel('card_expiry');
      var el_cvv = gel('card_cvv');

      // check if we're in webkit
      // checking el_expiry here in place of el_cvv, as IE also returns browser unsupported attribute rules from getComputedStyle
      if (el_cvv && window.getComputedStyle && typeof getComputedStyle(el_expiry)['-webkit-text-security'] === 'string') {
        el_cvv.type = 'tel';
      }

      var cardOptions = {
        onidentify: function(type) {
          var el = this.el;
          var cvvlen = type && type !== 'amex' ? 3 : 4;

          // card icon element
          el_cvv.maxLength = cvvlen;
          el_cvv.pattern = '[0-9]{'+cvvlen+'}';
          inputHandler.input({target: el_cvv});
          el.parentNode.querySelector('.cardtype').setAttribute('cardtype', type);
        },

        onfilled: function(){
          invoke('focus', el_expiry, null, 0);
        }
      }

      var expiryOptions = {
        onfilled: function(){
          inputHandler.input({target: el_expiry});
          if(!$(el_expiry.parentNode).hasClass('invalid')){
            invoke(
              'focus',
              $('.elem-name').hasClass('filled') ? el_cvv : gel('card_name'),
              null,
              0
            )
          }
        }
      }

      this.card = new CardFormatter(gel('card_number'), cardOptions);
      bits.push(this.card);
      bits.push(new ExpiryFormatter(el_expiry, expiryOptions));
    }

    var email = gel('email');
    bits.push(new ContactFormatter(gel('contact')), {
      onfilled: bind(email.focus, email)
    });
    bits.push(new OtpFormatter(gel('otp')));
  },

  validateCard: function(){
    toggleInvalid($(gel('card_number').parentNode), this.card.isValid());
  },

  setScreen: function(screen){
    if(screen === this.screen) {
      return;
    }
    this.screen = screen;
    $('#body').attr('screen', screen);
    makeHidden('.screen.' + shownClass);

    if (screen) {
      $('#tab-title').html(tab_titles[screen]);
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
    if (this.screen === 'otp' && this.tab !== 'card') {
      tab = this.tab;
    } else {
      tab = '';
    }
    this.switchTab(tab);
  },

  switchTab: function(tab){
    // initial screen
    if (!this.tab){
      if (this.checkInvalid('#form-common')) {
        return;
      }
    }
    if (tab) {
      var contact = getPhone();
      if (!contact) {
        return;
      }
      this.customer = getCustomer(contact);
      $('#user').html(contact);
    } else {
      this.payload = null;
      this.clearRequest();
    }

    this.body.attr('tab', tab);
    this.tab = tab;

    if (tab === 'card') {
      this.showCardTab();
    } else {
      this.setScreen(tab);
    }
  },

  showCardTab: function() {
    var self = this;
    var customer = self.customer;
    var remember = self.get('remember_customer');
    $('#form-card').toggleClass('save-enabled', remember);

    if (!remember) {
      return self.setScreen('card');
    }

    tab_titles.otp = tab_titles.card;
    $('#otp-sec').html('Skip saved cards');

    if (!customer.logged && !customer.wants_skip) {
      self.commenceOTP('saved cards', true);
      customer.checkStatus(function(){
        // customer status check also sends otp if customer exists
        if (customer.saved) {
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
    var input = e.target;
    if (!input) {
      return;
    }
    if(input.type !== 'radio') {
      return;
    }

    var $savedcard = $(input.parentNode);
    var $emiCheck = $('#emi-check-label');
    var cardtype = $savedcard.find('.cardtype')[0].getAttribute('cardtype');
    var nocvvCheck = gel('nocvv');
    var isMaestro = cardtype === 'maestro';
    var emiEnabled = $savedcard.attr('emi');
    var issuer = $savedcard.attr('bank') || '';

    input.checked = true;
    $('#form-card').removeClass('nocvv');
    nocvvCheck.checked = false;
    toggleNoCvv(isMaestro);

    unsetEmiBank();

    var elem_emi = $('#elem-emi');
    var emiBank = emi_options.banks[issuer];
    $emiCheck[emiBank ? 'removeClass' : 'addClass']('disabled');

    if (emiBank) {
      makeEmiDropdown(emiBank, this);
    }

    if(isMaestro){
      elem_emi.addClass('hidden');
    } else {
      invoke('removeClass', elem_emi, 'hidden', 200);
    }
  },

  setSavedCards: function(){
    var customer = this.customer;
    var tokens = customer && customer.tokens && customer.tokens.count;
    var cardTab = $('#form-card');
    if (tokens) {
      if ($$('.saved-card').length !== customer.tokens.items.length) {
        $('#saved-cards-container').html(templates.savedcards(customer.tokens));
      }
    }

    if (tokens) {
      this.setSavedCard({target: $('.saved-card [type=radio]')[0]});
    }

    this.savedCardScreen = tokens;
    this.toggleSavedCards(!!tokens);
    $('#form-card').toggleClass('has-cards', tokens);
  },

  toggleSavedCards: function(saveScreen){
    var tabCard = $('#form-card');
    var saveClass = 'saved-cards';
    if (typeof saveScreen !== 'boolean') {
      saveScreen = !tabCard.hasClass(saveClass);
    }

    $('#elem-emi').removeClass('hidden');
    unsetEmiBank();

    var $savedContainer = $('#saved-cards-container');

    if (saveScreen) {
      this.setSavedCard({target: $('.saved-card [type=radio]')[0]});
      invoke('addClass', $savedContainer, 'scroll', 300);
    } else {
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
    this.ihandler.input({target: select});
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
    var form = this.tab || 'common';
    if (form === 'card') {
      var whichCardTab = this.savedCardScreen ? 'saved-cards' : 'add-card';
      return '#' + whichCardTab + '-container';
    }
    return '#form-' + form;
  },

  getFormData: function(){
    var tab = this.tab;
    var data = {};

    fillData('#form-common', data);
    data['contact'] = data['contact'].replace(/\ /g, '');

    if (tab) {
      data.method = tab;
      fillData(this.getActiveForm(), data);

      if (this.screen === 'card') {
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
      this.savedCardScreen = undefined;
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
      text = strings.process;
    }

    if(this.screen === 'otp'){
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

    if (!this.tab && !this.order) {
      return;
    }

    if (screen === 'otp') {
      return this.onOtpSubmit();
    }

    this.ihandler.refresh();
    var data = this.payload = this.getPayload();
    if (this.order) {
      data.method = 'netbanking';
      data.bank = this.order.bank;
    } else if (screen) {
      if (screen === 'card') {
        var nocvv_el = $('#nocvv-check [type=checkbox]')[0];
        if (!this.savedCardScreen) {
          // handling add new card screen
          this.validateCard();

          // if maestro card is active
          if (nocvv_el.checked && !nocvv_el.disabled) {
            $('.elem-expiry').removeClass('invalid');
            $('.elem-cvv').removeClass('invalid');
            data['card[cvv]'] = '000';
            data['card[expiry_month]'] = '12';
            data['card[expiry_year]'] = '21';
          }
        } else {
          if ((!nocvv_el.checked || nocvv_el.disabled) && !data['card[cvv]']) {
            // no saved card was selected
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

    if((wallet === 'mobikwik' || wallet === 'payumoney') && !request.fees){
      request.powerwallet = true;
      $('#otp-sec').html('Resend OTP');
      tab_titles.otp = '<img src="'+walletObj.col+'" height="'+walletObj.h+'">';
      this.commenceOTP(wallet + ' account', true);
    } else {
      this.showLoadError();
    }

    this.r.createPayment(data, request)
      .on('payment.success', bind(successHandler, this))
      .on('payment.error', bind(errorHandler, this));

    if(request.powerwallet) {
      this.showLoadError(strings.otpsend + getPhone());
      this.r.on('payment.otp.required', debounceAskOTP);
      this.r.on('payment.wallet.topup', function() {
        $('#form-otp').removeClass('loading');
        $('#add-funds').addClass('show');
        setOtpText('Insufficient balance in your wallet');
      });
    } else {
      this.r.on('payment.cancel', bind(function() {
        this.showLoadError(discreet.cancelMsg, true);
      }, this))
    }
  },

  getPayload: function(){
    var data = this.getFormData();

    if(this.screen === 'card'){
      setEmiBank(data);

      var customer = this.customer;
      // set app_token if either new card or saved card (might be blank)
      if (customer.customer_id && (data.save || data.token)) {
        data.customer_id = customer.customer_id;
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
      this.card = this.ihandler =
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
