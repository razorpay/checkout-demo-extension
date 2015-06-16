/* global handleMessage */
/* jshint -W027 */

/**
 * This exposes jquery for in iframe usage
 */
window.$ = Razorpay.prototype.$;
(function(){
  'use strict';

  var discreet = {
    modal: null,
    $el: null,
    options: null,
    rzp: null,
    methods: {},

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
    getMethods: function(instanceMethods){
      if(!discreet.rzp){
        return
      }
      var key = discreet.rzp.options.key;
      if(!instanceMethods){
        var availMethods = discreet.methods[key];
        if(!availMethods.methods) {
          return discreet.rzp.getMethods(discreet.getMethods);
        } else {
          instanceMethods = availMethods.methods;
        }
      }

      if(instanceMethods.error){
        discreet.$el.find('.methods-container').removeClass('loading loaded').addClass('loading-error');
        if(instanceMethods.error.description){
          discreet.$el.find('.api-error').html(instanceMethods.error.description).show();
          discreet.$el.find('.default-error').hide();
        } else {
          discreet.$el.find('.api-error').hide();
          discreet.$el.find('.default-error').show();
        }
        return;
      }

      if(/test/.test(key))
        instanceMethods.card = true;

      discreet.methods[key] = instanceMethods;
      discreet.showTabs(instanceMethods);
      discreet.setActiveTab(instanceMethods);
      discreet.$el.find('.methods-container').removeClass('loading loading-error').addClass('loaded');
      discreet.$el.find('.submit').removeClass('loading').removeAttr('disabled');

      var nblist = instanceMethods.netbanking;

      if(typeof nblist == 'object'){
        var optionsString = '';
        for(var i in nblist){
          if(i === 'http_status_code'){
            continue;
          }
          optionsString += '<option value="'+i+'">' + nblist[i] + '</option>';
        }
        discreet.$el.find('#tab-netbanking .select').find('select').append(optionsString);
      }
    },

    sanitizeDOM: function(obj){
      // directly appended tags
      var user_fields = ['name', 'description', 'amount', 'currency', 'display_amount'];
      for(var i = 0; i < user_fields.length; i++){
        obj[user_fields[i]] = obj[user_fields[i]].replace(/<[^>]*>?/g, "");
      }

      // if conditions
      obj.method.netbanking = !!obj.method.netbanking;
      obj.method.card = !!obj.method.card;

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

    showTabs: function(instanceMethods){
      var methodOptions = typeof instanceMethods == 'object' && instanceMethods || discreet.options.method;
      var tabsCount = 0;
      for(var i in methodOptions){
        if(i == 'version' || i == 'http_status_code'){
          continue;
        }
        if(methodOptions[i] != false){
          tabsCount++;
        }
      }
      if(tabsCount > 1){
        discreet.$el.find('.tabs').attr('count', tabsCount);
      }
    },

    setActiveTab: function(instanceMethods){
      var activeTab = 'card';
      if(!instanceMethods.card){
        if(instanceMethods.netbanking){
          activeTab = 'netbanking'
        }
      }

      discreet.$el.find('li[data-target="tab-'+activeTab+'"]').addClass('active').siblings('.active').removeClass('active');
      discreet.$el.find('.tab-content.active').removeClass('active');
      discreet.$el.find('#tab-' + activeTab).addClass('active');
    },

    showModal: function() {
      $('#loading').remove();
      discreet.renew();
      if(discreet.modal){
        return discreet.modal.show();
      }

      discreet.sanitizeOptions(discreet.options);
      discreet.$el = $((doT.compile(templates.modal))(discreet.options));
      discreet.$el.smarty();

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
      discreet.showTabs();
      discreet.getMethods();

      discreet.$el.find('.input[name="card[number]"]').payment('formatCardNumber').on('blur', function() {
        var parent;
        parent = $(this.parentNode.parentNode);
        return parent[$.payment.validateCardNumber(this.value) ? 'removeClass' : 'addClass']('invalid');
      });

      discreet.$el.find('.input[name="card[expiry]"]').payment('formatCardExpiry');
      discreet.$el.find('.input[name="card[cvv]"]').payment('formatCardCVC').on('blur', function(){
        var parent;
        parent = $(this.parentNode.parentNode);
        return parent[$.payment.validateCardCVC(this.value) ? 'removeClass' : 'addClass']('invalid');
      });

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

      $('.method-retry').on('click', function(){
        discreet.$el.find('methods-container').removeClass('loading-error').addClass('loading');
        discreet.getMethods();
      })

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
      if(discreet.options.signature !== ''){
        data.signature = discreet.options.signature;
      }

      discreet.renew();
      discreet.$el.find('.submit').attr('disabled', true).addClass('loading');
      discreet.modal.options.backdropClose = false;

      discreet.rzp.submit({
        data: data,
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
      discreet.options = null;
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

      modalEl.find('.submit').removeAttr('disabled').removeClass('loading');
      discreet.modal.options.backdropClose = true;

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

    if(message.options && !discreet.options){ // open modal
      try{
        discreet.rzp = new Razorpay(message.options);
        discreet.configureRollbar(message);
      } catch(e){
        discreet.postMessage({event: 'error', data: e.message});
        Rollbar.error(e.message, message);
        return;
      }
      discreet.options = discreet.rzp.options;
      var key = discreet.options.key;
      if(!discreet.methods[key]){
        var instanceMethods = discreet.methods[key] = {}
      }
      if(message.methods){
        instanceMethods.methods = message.methods;
      } else if(message.methodAjax){
        instanceMethods.ajax = message.methodAjax
      }
      discreet.showModal()
    } else if(message.event == 'close'){
      discreet.hide();
    } else if(message.event == 'open' && discreet.rzp){
      discreet.showModal();
    }
  }

  window.onmessage = function(e){ // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
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
