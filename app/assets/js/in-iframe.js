/* global handleMessage */
/* jshint -W027 */

(function(){
  'use strict';
  var discreet = {
    modal: null,
    $el: null,
    rzp: null,

    postMessage: function(message){
      if(window.CheckoutBridge){
        discreet.notifyBridge(message);
      } else if(window != window.parent){
        message.source = 'frame';
        if(typeof message != 'string'){
          message = JSON.stringify(message);
        }
        window.parent.postMessage(message, '*');
      }
    },

    shake: function(element){
      element.addClass('shake');
      setTimeout(function() {
        element.removeClass('shake');
      }, 200);
    },

    notifyBridge: function(message){
      var method, data;
      if(window.CheckoutBridge && message && message.event){
        method = 'on' + message.event;
        if(typeof window.CheckoutBridge[method] == 'function'){
          data = message.data;
          if(typeof data != 'string'){
            if(!data){
              return window.CheckoutBridge[method]();
            }
            data = JSON.stringify(data);
          }
          window.CheckoutBridge[method](data);
        }
      }
    },
    getFormData: function(form) {
      var data, expiry;
      data = {};
      form.find('.form-common [name], .tab-content.active [name]').each(function(index, el) {
        if (el.name && el.value) {
          return data[el.name] = el.value;
        }
      });
      var target_tab = form.find('.tab-content.active').attr('id');
      if(target_tab == 'tab-card'){
        if(target_tab == 'tab-card'){
          data['card[number]'] = data['card[number]'].replace(/\ /g, '');
          expiry = data['card[expiry]'].replace(/\ /g, '').split('/');
          data['card[expiry_month]'] = expiry[0];
          data['card[expiry_year]'] = expiry[1];
          delete data['card[expiry]'];
        }
      }
      return data;
    },
    
    setMethods: function(payment_methods){
      if(payment_methods.version){
        delete payment_methods.version;
      }
      var methodOptions = discreet.rzp.options.method;

      if(typeof methodOptions.wallet != false && typeof payment_methods.wallet == 'object'){
        if(typeof methodOptions.wallet == 'object'){
          for(var i in payment_methods.wallet){
            if(methodOptions.wallet[i] != false && payment_methods.wallet[i] != false){
              methodOptions.wallet[i] = payment_methods.wallet[i];
            }
          }
        } else {
          methodOptions.wallet = payment_methods.wallet;
        }
      }
      var tabCount = 0;
      if(typeof methodOptions.wallet == 'object'){
        for(i in methodOptions.wallet){
          if(methodOptions.wallet[i]){
            tabCount++;
            break;
          }
        }
      }
      if(!tabCount){
        methodOptions.wallet = false;
      }
      if(!payment_methods.error){
        for(i in payment_methods){
          if(methodOptions[i] != false && payment_methods[i] != false){
            methodOptions[i] = payment_methods[i];
          }
        }
      } else {
        methodOptions.card = false;
        methodOptions.netbanking = {error: {description: payment_methods.error.description || "Payments not available right now."}};
      }

      if(methodOptions.netbanking != false && typeof methodOptions.netbanking != 'object'){
        methodOptions.netbanking = {error: {description: "Netbanking not available right now."}}
      }
      if(methodOptions.card){
        tabCount++;
      }
      if(methodOptions.netbanking){
        tabCount++;
      }
    },

    sanitizeDOM: function(obj){
      // directly appended tags
      var user_fields = ['name', 'description', 'amount', 'currency', 'display_amount'];
      for(var i = 0; i < user_fields.length; i++){
        obj[user_fields[i]] = obj[user_fields[i]].replace(/<[^>]*>?/g, "");
      }

      // attributes
      if(typeof obj.image == 'string'){
        obj.image = obj.image.replace(/"/g,'');
      }

      // prefills
      if(typeof obj.prefill == 'object'){
        for(var i in obj.prefill){
          if(typeof obj.prefill[i] == 'string'){
            obj.prefill[i] = obj.prefill[i].replace(/"/g,'');
          }
        }
      }

      // notes
      if(typeof obj.notes == 'object'){
        for(var i in obj.notes){
          if(typeof obj.notes[i] == 'string'){
            obj.notes[i] = obj.notes[i].replace(/"/g,'');
          }
        }
      }
    },

    sanitizeOptions: function(obj){ // warning: modifies original object
      if(obj){
        discreet.sanitizeDOM(obj);
        if(obj.prefill){
          if(obj.prefill.contact){
            if(typeof obj.prefill.contact != 'string'){
              obj.prefill.contact = obj.prefill.contact + '';
            }
            obj.prefill.contact = obj.prefill.contact.replace(/[^0-9+]/g,'');
          }
        }
      }
    },

    setCardFormatting: function(){
      var el_number = discreet.$el.find('.input[name="card[number]"]');
      var el_expiry = discreet.$el.find('.input[name="card[expiry]"]');
      var el_cvv = discreet.$el.find('.input[name="card[cvv]"]');
      Razorpay.card.formatNumber(el_number[0]);
      Razorpay.card.formatExpiry(el_expiry[0]);
      el_number.on('blur', function(){
        var valid = Razorpay.card.validateNumber(this.value);
        $(this.parentNode)[valid ? 'removeClass' : 'addClass']('invalid');
      });
    },

    showModal: function() {
      discreet.renew();
      if(discreet.modal){
        return discreet.modal.show();
      }
      if(window.payment_methods){
        discreet.setMethods(window.payment_methods);
      } else {
        return discreet.rzp.payment.getMethods(function(payment_methods){
          if('error' in payment_methods){
            discreet.errorHandler(payment_methods);
          } else {
            window.payment_methods = payment_methods;
            discreet.showModal();
          }
        });
      }
      $('loading').remove();
      discreet.sanitizeOptions(discreet.rzp.options);
      document.body.innerHTML = (doT.compile(templates.modal))(discreet.rzp.options);
      discreet.$el = document.body.firstChild;
      new Razorpay.prototype.Smarty(discreet.$el);

      if(qpmap && qpmap.platform == 'android' && window.navigator && navigator.userAgent){
        if(navigator.userAgent.indexOf('Android 2')){
          discreet.$el.addClass('shown');
        }
      }

      // init modal
      var modalOptions = {
        onhide: function(){
          discreet.postMessage({event: 'dismiss'});
        },
        onhidden: function(){
          discreet.postMessage({event: 'hidden'});
        }
      }

      discreet.modal = new Modal(discreet.$el, modalOptions);
      // discreet.applyFont(discreet.$el.find('.powered-by a')[0]);
      discreet.setCardFormatting();

      if(discreet.$el.find('.nb-na').length){
        discreet.$el.find('#tab-netbanking .elem').hide();
      }

        discreet.$el.find('.tabs li').click(function() {
          discreet.renew();
          var inner = $(this).closest('.modal-inner');
          if (!inner.length) {
            return;
          }
          var form = inner.find('.form');
          var modalEl = inner.parent();
          var change_modal_height = !discreet.modal.curtainMode;
          
          if(change_modal_height){
            modalEl[0].style.height = inner[0].offsetHeight + 'px';
            modalEl.addClass('animate');
          }

          inner.find('#' + this.getAttribute('data-target')).addClass('active').siblings('.active').removeClass('active');
          $(this).addClass('active').siblings('.active').removeClass('active');

          if(change_modal_height){
            modalEl[0].style.height = inner[0].offsetHeight + 'px';
            setTimeout(function(){
              modalEl.removeClass('animate').height('');
            }, 300);
          }
        });

      discreet.$el.find('form').on('submit', function(e) {
        discreet.formSubmit(e);
        return false; // prevent default
      });

      if(discreet.qpmap){
        if(discreet.qpmap.tab){
          $('.tabs li[data-target=tab-'+discreet.qpmap.tab+']').click()
        }
        if(discreet.qpmap.error){
          discreet.errorHandler(qpmap)
        }
      }
    },

    applyFont: function(anchor, retryCount){
      if(!retryCount) retryCount = 0;
      if(anchor.offsetWidth/anchor.offsetHeight > 5) discreet.$el.addClass('font-loaded');
      else if(retryCount < 25) setTimeout(function(){
        discreet.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    },

    formSubmit: function(e) {
      var form = $(e.currentTarget);
      discreet.$el.smarty('refresh');
      form.find('.input[name="card[number]"], .input[name="card[cvv]"]').trigger('blur');

      var invalid = form.find('.form-common, .tab-content.active').find('.invalid');
      var modalEl = form.closest('.modal');
      if (invalid.length) {
        invalid.addClass('mature').find('.input').eq(0).focus();
        discreet.shake(modalEl);
        return;
      }
      var data = discreet.getFormData(form);

      // Signature is set in case of hosted checkout
      if(discreet.rzp.options.signature !== ''){
        data.signature = discreet.rzp.options.signature;
      }

      discreet.renew();
      discreet.$el.find('.submit').attr('disabled', true);
      discreet.modal && (discreet.modal.options.backdropClose = false);

      Razorpay.payment.authorize({
        data: data,
        options: discreet.rzp.options,
        error: discreet.errorHandler,
        success: discreet.successHandler
      })
      discreet.postMessage({
        event: 'submit',
        data: {
          method: data.method
        }
      });
    },

    // close on backdrop click and remove errors
    renew: function() {
      if (discreet.$el) {
        var errorForm = discreet.$el.find('.has-error');
        if(errorForm.length){
          errorForm.removeClass('has-error').css('paddingTop', '');
        }
      }
      if(discreet.modal){
        discreet.modal.options.backdropClose = true;
      }
    },

    hide: function(){
      if(discreet.modal){
        discreet.modal.hide();
      }
      discreet.modal = null;
    },

    successHandler: function(response){
      discreet.postMessage({ event: 'success', data: response});
      discreet.hide();
    },

    errorHandler: function(response){
      if(!discreet.modal){
        return;
      }
      var message;
      var modalEl = discreet.modal.modalElement;
      discreet.shake(modalEl);

      modalEl.find('.submit').removeAttr('disabled');
      discreet.modal && (discreet.modal.options.backdropClose = true);

      if (response && response.error){
        message = response.error.description;

        if (response.error.field){
          var error_el = discreet.$el.find('input[name="'+response.error.field+'"]');
          if (error_el.length){
            error_el.closest('.elem').addClass('invalid').eq(0).focus();
          }
        }
      }

      if (!message){
        message = 'There was an error in handling your request';
      }

      var error_ht = modalEl.find('.error').html(message).prop('offsetHeight');
      modalEl.find('.error-container').addClass('has-error').css('paddingTop', error_ht);
    },

    configureRollbar: function(message){
      if(window.Rollbar){
        Rollbar.configure({
          payload: {
            person: {
              id: message.options.key
            },
            context: message.context
          }
        });
      }
    }
  }

  window.handleMessage = function(message){
    if(typeof message != 'object'){
      return;
    }

    if(message.options && !discreet.rzp){ // open modal
      try{
        discreet.rzp = new Razorpay(message.options);
        discreet.configureRollbar(message);
      } catch(e){
        discreet.postMessage({event: 'fault', data: e.message});
        Rollbar.error(e.message, message);
        return;
      }
      // setTimeout(function(){
      discreet.showModal();
    // },100)
    } else if(message.event == 'close'){
      discreet.hide();
    } else if(message.event == 'open' && discreet.rzp){
      discreet.showModal();
    }
  }

  discreet.parseMessage = function(e){ // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
    if(!e || !e.data)
      return;
    var data;
    if(typeof e.data == 'string'){
      try{
        data = JSON.parse(e.data);
      } catch(e){
        return;
      }
    } else {
      data = e.data;
    }
    window.handleMessage(data);
  }

  if (window.addEventListener) {
    window.addEventListener('message', discreet.parseMessage)
  } else if(window.attachEvent) { // IE8 or earlier
    window.attachEvent('onmessage', discreet.parseMessage);
  }

  discreet.postMessage({event: 'load'});

// @if NODE_ENV='test'
  window.frameDiscreet = discreet;
// @endif

  // initial error (helps in case of redirection flow)
  if(location.search){
    var qpmap = discreet.qpmap = {};
    var params = location.search.replace(/^\?/,'').split('&');
    for(var i=0; i < params.length; i++){
      var split = params[i].split('=', 2);
      if(split[0].indexOf('.') != -1){
        var dotsplit = split[0].split('.', 2);
        if(!qpmap[dotsplit[0]]){
          qpmap[dotsplit[0]] = {};
        }
        qpmap[dotsplit[0]][dotsplit[1]] = decodeURIComponent(split[1]);
      } else {
        qpmap[split[0]] = decodeURIComponent(split[1]);
      }
    }
  }

})();
