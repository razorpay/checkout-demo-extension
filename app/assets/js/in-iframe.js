/* global handleMessage */
/* jshint -W027 */

(function(){
  'use strict';
  var discreet = {
    smarty: null,
    modal: null,
    $el: null,
    rzp: null,

    shake: function(){
      if(/Android|iPhone/.test(navigator.userAgent))
        return;
      if(discreet.modal){
        var el = $('modal-inner');
        if(el[0]){
          el.removeClass('shake')[0].offsetWidth;
          el.addClass('shake');
        }
      }
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
    
    setMethods: function(payment_methods){
      var i;
      var methodOptions = discreet.rzp.options.method;

      if(typeof payment_methods.wallet == 'object'){
        if(typeof methodOptions.wallet == 'object'){
          for(i in payment_methods.wallet){
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

      if(!tabCount || discreet.rzp.options.amount > 100*3000){ // disable paytm for transactions worth > INR 3,000
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

      if(methodOptions.netbanking !== false && typeof methodOptions.netbanking != 'object'){
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

    setNumberValidity: function(){
      $(this.parentNode)[Razorpay.card.validateNumber(this.value, this.getAttribute('cardtype')) ? 'removeClass' : 'addClass']('invalid');
    },

    setCardFormatting: function(){
      var $el_number = $('card_number');
      var el_expiry = $('card_expiry')[0];
      var el_cvv = $('card_cvv')[0];
      var el_contact = $('contact')[0];
      
      Razorpay.card.setType = function(el, type){
        !type && (type = Razorpay.card.getType(el.value) || 'unknown');
        el.parentNode.setAttribute('cardtype', type);
        discreet.setNumberValidity.call(el);
        
        // if(type != 'maestro'){
          // $('nocvv-check')[0].checked = false;
          // discreet.toggle_nocvv();
        // }
      }

      Razorpay.card.filled = function(el){
        if(el == el_expiry)
          el_cvv.focus();
        else
          el_expiry.focus();
      }
      
      $el_number.on('blur', discreet.setNumberValidity);
      Razorpay.card.formatNumber($el_number[0]);
      Razorpay.card.formatExpiry(el_expiry);
      Razorpay.card.ensureNumeric(el_cvv);
      Razorpay.card.ensureNumeric(el_contact);

      // if we're in webkit
      // we check el_expiry, as IE does return unsupported styles from getComputedStyle
      if(el_cvv && window.getComputedStyle && typeof getComputedStyle(el_expiry)['-webkit-text-security'] == 'string'){
        el_cvv.type = 'tel';
      }
    },

    showModal: function() {
      discreet.renew();
      
      if(discreet.modal){
        return discreet.modal.show();
      }

      discreet.setMethods(window.payment_methods);
      $('loading').remove();
      discreet.sanitizeOptions(discreet.rzp.options);
      document.body.innerHTML += (doT.compile(templates.modal))(discreet.rzp.options);
      discreet.$el = $('container');
      discreet.smarty = new Smarty(discreet.$el);

      // init modal
      var modalOptions = discreet.rzp.options.modal;
      modalOptions.onhide = function(){
        Razorpay.sendMessage({event: 'dismiss'});
      };
      modalOptions.onhidden = function(){
        Razorpay.sendMessage({event: 'hidden'});
      };
      delete modalOptions.ondismiss;

      discreet.applyFont($('powered-link')[0]);
      discreet.modal = new Modal(discreet.$el.children('modal')[0], modalOptions);
      if($('nb-na')[0]) $('nb-elem').css('display', 'none');

      // event listeners
      // $('nocvv-check').on('change', discreet.toggle_nocvv)
      $('tabs').on('click', discreet.tab_change);
      $('form').on('submit', function(e){
        discreet.formSubmit(e);
        e.preventDefault();
      });
      var banks = $('netb-banks');
      if(banks[0]){
        banks = banks.children('netb-bank')
        for(var i=0; i<banks.length; i++){
          $(banks[i]).on('click', function(){
            var value = this.getAttribute('data-value');
            var select = $('bank-select')[0];
            select.value = value;
            discreet.smarty.input({target: select});
          })
        }
      }

      if(discreet.qpmap){
        var lis = $(tabs)[0].getElementsByTagName('li');
        for(var i=0; i<lis.length; i++){
          if(lis[i].getAttribute('data-target') == 'tab-' + discreet.qpmap.tab){
            discreet.tab_change({target: lis[i]});
            break;
          }
        }
        if(discreet.qpmap.error){
          discreet.errorHandler(qpmap)
        }
      }
      discreet.setCardFormatting();
    },

    tab_change: function(e){
      var target = e.target;
      
      if(target.nodeName == 'IMG') target = target.parentNode;
      
      if(target.nodeName != 'LI' || target.className.indexOf('active') >= 0)
        return;

      discreet.renew();

      var tabContent = $(target.getAttribute('data-target'));
      var activeTab = tabContent.parent().children('active')[0];
      activeTab && $(activeTab).removeClass('active');
      tabContent.addClass('active');

      activeTab = $(target.parentNode).children('active')[0];
      activeTab && $(activeTab).removeClass('active');
      $(target).addClass('active');
    },

    // toggle_nocvv: function(){
    //   var checked = this.checked;
    //   for(var i in {card_expiry: 0, card_cvv: 0}){
    //     var el = $(i).removeClass('invalid')[0];
    //     el.value = '';
    //     el.disabled = checked;
    //     el.required = !checked;
    //   }
    // },

    applyFont: function(anchor, retryCount){
      if(!retryCount) retryCount = 0;
      if(anchor.offsetWidth/anchor.offsetHeight > 5) discreet.$el.addClass('font-loaded');
      else if(retryCount < 25) setTimeout(function(){
        discreet.applyFont(anchor, ++retryCount);
      }, 120 + retryCount*50);
    },

    /* sets focus on invalid input and returns true, if any. */
    isInvalid: function(parent){
      var invalids = $(parent).find('invalid', 'p');
      if(invalids.length){
        discreet.shake();
        $(invalids[0]).find('input')[0].focus();
        for(var i=0; i<invalids.length; i++) $(invalids[i]).addClass('mature');
        return true;
      }
    },

    formSubmit: function(e) {
      discreet.smarty.refresh();

      if (discreet.isInvalid('form-common'))
        return;

      // var card_number = $('card_number')[0];
      // card_number && discreet.setNumberValidity.call(card_number);

      var activeTab = $('tabs').find('active')[0];
      if (activeTab && discreet.isInvalid(activeTab.getAttribute('data-target')))
        return;

      var data = discreet.getFormData();

      // Signature is set in case of hosted checkout
      if (discreet.rzp.options.signature !== '')
        data.signature = discreet.rzp.options.signature;

      Razorpay.sendMessage({
        event: 'submit',
        data: data
      });
      discreet.renew();
      $('submitbtn').attr('disabled', true);
      if(discreet.modal)
        discreet.modal.options.backdropClose = false;

      Razorpay.payment.authorize({
        data: data,
        options: discreet.rzp.options,
        error: discreet.errorHandler,
        success: discreet.successHandler
      })
    },

    getFormFields: function(container, returnObj){
      var allels = $(container)[0].getElementsByTagName('*');
      var len = allels.length;
      for(var i=0; i<len; i++){
        var el = allels[i];
        if(el.name && !el.disabled && el.value.length)
          returnObj[el.name] = el.value;
      }
    },

    getFormData: function() {
      var activeTab = $('tabs').find('active')[0];
      if(!activeTab) return;
      
      var data = {};
      discreet.getFormFields('form-common', data);
      
      var targetTab = activeTab.getAttribute('data-target');
      discreet.getFormFields(targetTab, data);

      if(targetTab == 'tab-card'){
        data['card[number]'] = data['card[number]'].replace(/\ /g, '');
        
        // if(!data['card[expiry]'])
        //   data['card[expiry]'] = '';

        // if(!data['card[cvv]'])
        //   data['card[cvv]'] = '';

        var expiry = data['card[expiry]'].replace(/[^0-9\/]/g, '').split('/');
        data['card[expiry_month]'] = expiry[0];
        data['card[expiry_year]'] = expiry[1];
        delete data['card[expiry]'];
      }
      return data;
    },

    // close on backdrop click and remove errors
    renew: function(){
      if (discreet.$el)
        $('error-container').css('display', 'none').removeClass('has-error').css('paddingTop', '');

      if(discreet.modal)
        discreet.modal.options.backdropClose = true;
    },

    hide: function(){
      if(discreet.modal){
        $('modal-inner').removeClass('shake');
        discreet.modal.hide();
      }
      discreet.modal = null;
    },

    successHandler: function(response){
      Razorpay.sendMessage({ event: 'success', data: response});
      discreet.hide();
    },

    errorHandler: function(response){
      if(!discreet.modal){
        return;
      }
      var message;
      discreet.shake();

      $('submitbtn')[0].removeAttribute('disabled');
      discreet.modal && (discreet.modal.options.backdropClose = true);

      if (response && response.error){
        message = response.error.description;

        if (response.error.field){
          var error_el = document.getElementsByName(response.error.field);
          if (error_el.length){
            $(error_el[0].parentNode).addClass('invalid');
            error_el[0].focus();
          }
        }
      }

      if (!message){
        message = 'There was an error in handling your request';
      }

      var error_message = $('error-message')[0];
      error_message.innerHTML = message;
      $('error-container').css('display', 'block').addClass('has-error').css('paddingTop', error_message.offsetHeight + 'px');
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
    },
    setQueryParams: function(search){
      var params = search.replace(/^\?/,'').split('&');
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
    },
    parseMessage: function(e){ // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
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
  }

  Razorpay.sendMessage = function(message){
    if(typeof window.CheckoutBridge == 'object'){
      discreet.notifyBridge(message);
    } else if(window != window.parent){
      message.source = 'frame';
      if(typeof message != 'string'){
        message = JSON.stringify(message);
      }
      window.parent.postMessage(message, '*');
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
        Razorpay.sendMessage({event: 'fault', data: e.message});
        if(window.Rollbar) Rollbar.error(e.message, message);
        return;
      }
      discreet.showModal();
    } else if(message.event == 'close'){
      discreet.hide();
    } else if(message.event == 'open' && discreet.rzp){
      discreet.showModal();
    }
    if(message.data && discreet.rzp){
      try{
        var decode = decodeURIComponent(message.data)
      } catch(e){}
    }
  }

  $(window).on('message', discreet.parseMessage);


// @if NODE_ENV='test'
  window.frameDiscreet = discreet;
// @endif

  // initial error (helps in case of redirection flow)
  var qpmap = discreet.qpmap = {};
  if(location.search){
    discreet.setQueryParams(location.search);
  }

  if(qpmap.platform === 'ios'){
    window.CheckoutBridge = {};
    var iOSMethod = function(method){
      return function(data){
        var iF = document.createElement('iframe');
        iF.setAttribute('src', 'razorpay://on'+method+'?'+data);
        document.documentElement.appendChild(iF);
        iF.parentNode.removeChild(iF);
        iF = null;
      }
    }
    var bridgeMethods = ['load','dismiss','submit','error','fault','complete'];
    bridgeMethods.forEach(function(prop){
      CheckoutBridge['on'+prop] = iOSMethod(prop)
    })
  }
  Razorpay.sendMessage({event: 'load'});
})();
