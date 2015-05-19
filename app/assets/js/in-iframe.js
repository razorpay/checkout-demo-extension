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
    nblist: null,

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
    getFormData: function(form, netbanking) {
      var data, expiry;
      data = {};
      form.find('[name]').each(function(index, el) {
        if (el.value) {
          return data[el.name] = el.value;
        }
      });

      if(!netbanking || form.find('.tabs .active').data('target') == 'tab-cc'){
        delete data.bank;
        data['card[number]'] = data['card[number]'].replace(/\ /g, '');
        expiry = data['card[expiry]'].replace(/\ /g, '').split('/');
        data['card[expiry_month]'] = expiry[0];
        data['card[expiry_year]'] = expiry[1];
        delete data['card[expiry]'];
        data.method = 'card';
      } else {
        delete data['card[name]'];
        delete data['card[number]'];
        delete data['card[cvv]'];
        delete data['card[expiry]'];
        data.method = 'netbanking';
      }

      return data;
    },
    
    showNetbankingList: function(nblist){
      if(!nblist && discreet.rzp){
        return discreet.rzp.getNetbankingList(discreet.showNetbankingList);
      }
      if(nblist.error){
        $('#tab-nb .elem').hide();
        $('.error').append('<li class="nb-na">Netbanking is not available right now. Please try later.</li>');
        return;
      }

      var optionsString = '<option selected="selected" value="">Select Bank</option>';
      for(var i in nblist){
        if(i === 'http_status_code'){
          continue;
        }
        optionsString += '<option value="'+i+'">' + nblist[i] + '</option>';
      }
      $('#tab-nb .select').removeClass('loading').find('select').html(optionsString).prop('disabled', false);
    },

    sanitizeDOM: function(obj){
      // directly appended tags
      var user_fields = ['name', 'description', 'amount', 'currency', 'display_amount'];
      for(var i = 0; i < user_fields.length; i++){
        obj[user_fields[i]] = obj[user_fields[i]].replace(/<[^>]*>?/g, "");
      }

      // if conditions
      obj.netbanking = !!obj.netbanking;

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

    showModal: function() {
      if(discreet.modal){
        return discreet.modal.show();
      }

      discreet.showNetbankingList();
      discreet.sanitizeOptions(discreet.options);
      discreet.$el = $((doT.compile(templates.modal))(discreet.options));
      discreet.$el.smarty();

      // init modal
      var modalOptions = {
        onhide: null,
        onhidden: function(){
          discreet.postMessage({event: 'hidden'});
        }
      }
      if(discreet.options.oncancel){
        modalOptions.onhide = function(){
          discreet.postMessage({event: 'cancel'});
        }
      }

      discreet.modal = new Modal(discreet.$el, modalOptions);

      discreet.renew();

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

      if (discreet.options.netbanking) {
        discreet.$el.find('.tabs li').click(function() {
          discreet.renew();
          var inner = $(this).closest('.modal-inner');
          if (!inner.length) {
            return;
          }
          var form = inner.find('.form');
          var modalEl = inner.parent();
          var change_modal_height = true;// !this.modal.curtainMode;
          if(change_modal_height){
            modalEl.height(inner.height());
            form.css('opacity', 0.5);
          }
          inner.find('#' + this.getAttribute('data-target')).addClass('active').siblings('.active').removeClass('active');
          $(this).addClass('active').siblings('.active').removeClass('active');

          $('.nb-na').toggle();

          if(change_modal_height){
            modalEl.height(inner.height());
            setTimeout(function(){
              form.css('opacity', 1);
              modalEl.height('');
            }, 250);
          }
        });
      }

      discreet.$el.find('form').on('submit', function(e) {
        discreet.formSubmit(e);
        return false; // prevent default
      });
    },

    formSubmit: function(e) {
      var form = $(e.currentTarget);
      discreet.$el.smarty('refresh');
      form.find('.input[name="card[number]"], .input[name="card[cvv]"]').trigger('blur');

      var invalid = form.find('.form-common, .tab-content.active').find('.invalid');
      var modalEl = form.closest('.modal');
      if (invalid.length) {
        invalid.addClass('mature').find('.input').eq(0).focus();
        shake(modalEl);
        return;
      }
      var data = discreet.getFormData(form, discreet.options.netbanking);

      // Signature is set in case of hosted checkout
      if(discreet.options.signature !== ''){
        data.signature = discreet.options.signature;
      }

      discreet.renew();
      discreet.$el.find('.submit').attr('disabled', true);
      discreet.modal.options.backdropClose = false;

      discreet.rzp.submit({
        data: data,
        error: errorHandler,
        success: successHandler
      })
      discreet.postMessage({
        event: 'submit',
        data: data
      });
    },

    // close on backdrop click and remove errors
    renew: function() {
      if (discreet.$el) {
        discreet.$el.find('.error').html('');
      }
      discreet.modal.options.backdropClose = true;
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
      var modalEl = discreet.modal.modalElement;
      discreet.shake(modalEl);

      modalEl.find('.submit').removeAttr('disabled');
      discreet.modal.options.backdropClose = true;

      if (response && response.error && response.error.field){
        var error_el = discreet.$el.find('input[name="'+response.error.field+'"]');
        if (error_el.length){
          error_el.closest('.elem').addClass('invalid');
        }
      }

      var defaultMessage = 'There was an error in handling your request';
      var message = response.error.description || defaultMessage;

      discreet.$el.find('.error').html(message);
    }
  }

  window.handleMessage = function(message){
    if(typeof message != 'object'){
      return;
    }
    if(message.nblist){
      discreet.nblist = message.nblist;
    }

    if(message.options && !discreet.options){ // open modal
      message.options.handler = null;
      try{
        discreet.rzp = new Razorpay(message.options);
      } catch(e){
        discreet.postMessage({event: 'error', data: e.message});
        return;
      }
      discreet.options = discreet.rzp.options;
      discreet.showModal();
    } else if(message.event == 'close'){
      discreet.close();
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
  
})();
