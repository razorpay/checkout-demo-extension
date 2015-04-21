/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  if(window.parent && typeof window.parent.postMessage == 'function'){
    debugger
    parent.postMessage('{"source": "frame", "loaded": 1}', '*')
  }
  $(window).on('message', function(e){
    debugger
    if(!e || !e.data)
      return;

    debugger
    var data;
    if(typeof e.data == 'string'){
      try{
        data = JSON.parse(e.data)
      } catch(e){
        return;
      }
    } else {
      data = e.data;
    }
    debugger
  })


  function shake(element){
    element.addClass('shake');
    setTimeout(function() {
      element.removeClass('shake');
    }, 150);
  };

  function getFormData(form, netbanking) {
    var data, expiry;
    data = {};
    form.find('[name]').each(function(index, el) {
      if (el.value) {
        return data[el.name] = el.value;
      }
    });

    if(!netbanking || form.find('.rzp-tabs .rzp-active').data('target') == 'rzp-tab-cc'){
      delete data.bank;
      data['card[number]'] = data['card[number]'].replace(/\ /g, '');
      expiry = data['card[expiry]'].replace(/\ /g, '').split('/');
      data['card[expiry_month]'] = expiry[0];
      data['card[expiry_year]'] = expiry[1];
      delete data['card[expiry]'];
    } else {
      delete data['card[name]'];
      delete data['card[number]'];
      delete data['card[cvv]'];
      delete data['card[expiry]'];
      data.method = 'netbanking'
    }

    return data;
  };

  function showNetbankingList(rzp){
    rzp.getNetbankingList(function(data){
      if(typeof data.error !== 'undefined'){
        $('#rzp-tab-nb .rzp-elem').remove();
        $('.rzp-error').append('<li class="rzp-nb-na">Netbanking is not available right now. Please try later.</li>');
        return;
      }

      var optionsString = '<option selected="selected" value="">Select Bank</option>';
      for(var i in data){
        if(i === 'http_status_code'){
          continue;
        }
        optionsString += '<option value="'+i+'">' + data[i] + '</option>';
      }
      $('#rzp-tab-nb select').html(optionsString);
    });
  }

  function sanitizeDOM(obj){
    // directly appended tags
    var user_fields = ['name', 'description', 'amount', 'currency'];
    for(var i = 0; i < user_fields.length; i++){
      obj[user_fields[i]] = obj[user_fields[i]].replace(/<[^>]*>?/g, "");
    }

    // if conditions
    obj.netbanking = !!obj.netbanking

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
  }

  function sanitizeOptions(obj){ // warning: modifies original object
    if(obj){
      this.sanitizeDOM(obj);
      if(obj.prefill){
        if(obj.prefill.contact){
          if(typeof obj.prefill.contact != 'string')
            obj.prefill.contact = obj.prefill.contact + ''
          obj.prefill.contact = obj.prefill.contact.replace(/[^0-9+]/g,'')
        }
      }
    }
  }

  function open(){
    if(this.Rollbar.state === false){
      this.Rollbar.start();
    }

    if(this.modal){
      // Reattaching listener for rollbar
      discreet.modalRollbarClose(this);

      this.modal.show();
      return;
    }

    this.sanitizeOptions(this.options);
    this.$el = $((doT.compile(Razorpay.templates.modal))(this.options));
    this.$el.smarty();

    // init modal
    var hiddenCallback = null;
    this.modal = new Modal(this.$el, {
      onhide: this.options.oncancel, // typeof check is inside modal.js
      onhidden: this.options.onhidden,
      parent: this.options.parent
    });

    this.renew();

    discreet.modalRollbarClose(this);
    discreet.showNetbankingList(this);

    this.$el.find('.rzp-input[name="card[number]"]').payment('formatCardNumber').on('blur', function() {
      var parent;
      parent = $(this.parentNode.parentNode);
      return parent[$.payment.validateCardNumber(this.value) ? 'removeClass' : 'addClass']('rzp-invalid');
    });

    this.$el.find('.rzp-input[name="card[expiry]"]').payment('formatCardExpiry');
    this.$el.find('.rzp-input[name="card[cvv]"]').payment('formatCardCVC').on('blur', function(){
      var parent;
      parent = $(this.parentNode.parentNode);
      return parent[$.payment.validateCardCVC(this.value) ? 'removeClass' : 'addClass']('rzp-invalid');
    });

    if (this.options.netbanking) {
      this.$el.find('.rzp-tabs li').click(function() {
        var inner, modal;
        inner = $(this).closest('.rzp-modal-inner');
        if (!inner.length) {
          return;
        }
        var form = inner.find('.rzp-form')
        modal = inner.parent();
        var change_modal_height = true// !this.modal.curtainMode;
        if(change_modal_height){
          modal.height(inner.height());
          form.css('opacity', 0.5);
        }
        inner.find('#' + this.getAttribute('data-target')).addClass('rzp-active').siblings('.rzp-active').removeClass('rzp-active');
        $(this).addClass('rzp-active').siblings('.rzp-active').removeClass('rzp-active');

        $('.rzp-nb-na').toggle();

        if(change_modal_height){
          modal.height(inner.height());
          setTimeout(function(){
            form.css('opacity', 1);
            modal.height('');
          }, 250);
        }
      });
    }

    var self = this;
    this.$el.find('form').on('submit', function(e){
      discreet.formSubmit(e, self);
      return false // prevent default
    });
  };

  function formSubmit(e, self){
    var form, invalid;
    form = $(e.currentTarget);
    self.$el.smarty('refresh');
    form.find('.rzp-input[name="card[number]"], .rzp-input[name="card[cvv]"]').trigger('blur');
    invalid = form.find('.rzp-form-common, .rzp-tab-content.rzp-active').find('.rzp-invalid');
    var modal = form.closest('.rzp-modal');
    if (invalid.length) {
      invalid.addClass('rzp-mature').find('.rzp-input').eq(0).focus();
      discreet.shake(modal);
      return;
    }
    var data = discreet.getFormData(form, self.options.netbanking)

    // Signature is set in case of hosted checkout
    if(self.options.signature !== ''){
      data.signature = self.options.signature;
    }

    self.request = {
      data: data,
      failure: discreet.failureHandler(self),
      success: discreet.successHandler(self),
      prehandler: discreet.preHandler(self)
    };
    self.submit(self.request);
    self.$el.find('.rzp-submit').attr('disabled', true);
    self.modal.options.backdropClose = false;
  }

  // close on backdrop click and remove errors
  function renew(){
    if (this.$el) {
      this.$el.find('.rzp-error').html('');
    }
    this.modal.options.backdropClose = true;
  };

  function hide(){
    if(this.Rollbar.state === true){
      this.Rollbar.stop();
    }

    this.renew();
    if(this.modal){
      this.modal.hide();
    }
  };

  /**
    default handler for success
    default handler does not care about error or success messages,
    it just submits everything via the form
    @param  {[type]} data [description]
    @return {[type]}    [description]
  */
  function defaultPostHandler(data){
    var inputs = "";
    for (var i in data) {
      if (typeof data[i] === "object") {
        for (var j in data[i]) {
          inputs += "<input type=\"hidden\" name=\"" + i + "[" + j + "]\" value=\"" + data[i][j] + "\">";
        }
      } else {
        inputs += "<input type=\"hidden\" name=\"" + i + "\" value=\"" + data[i] + "\">";
      }
    }
    var RazorPayForm = discreet.rzpscript.parentElement;
    $(inputs).appendTo(RazorPayForm);
    $(RazorPayForm).submit();
  };

  function preHandler(rzp){
    return function(){
      /**
      if(rzp.request.data.method !== 'netbanking'){
      */
      if(typeof(window.RZP_FORCE_IFRAME) !== "undefined"){
        var modal_parent = rzp.modal.element.children('.rzp-modal').addClass('rzp-frame')
        rzp.modalRef = modal_parent.children('.rzp-modal-inner')[0]
        if(!rzp.modalRef)
          return
        modal_parent[0].removeChild(rzp.modalRef)
      }
    };
  };
  function successHandler(rzp){
    return function(message){
      rzp.modal.options.onhide = null
      rzp.hide();
      rzp.modal = null;
      if(typeof rzp.options.handler === "function"){
        rzp.options.handler(message);
      }
      else {
        // This is automatic checkout
        rzp.defaultPostHandler(message);
      }
    };
  };

  function failureHandler(rzp){
    return function(response){
      var modal = rzp.$el.find('.rzp-modal');
      discreet.shake(modal);
      if(rzp.modalRef){
        modal.html('').removeClass('rzp-frame').append(rzp.modalRef);
        modal.height('');
      }

      rzp.modalRef = null;
      rzp.$el.find('.rzp-submit').removeAttr('disabled');
      rzp.modal.options.backdropClose = true;

      if (response && response.error && response.error.field){
        var error_el = rzp.$el.find('input[name="'+response.error.field+'"]')
        if (error_el.length){
          error_el.closest('.rzp-elem').addClass('rzp-invalid');
        }
      }

      var defaultMessage = 'There was an error in handling your request';
      var message = response.error.description || defaultMessage;

      rzp.$el.find('.rzp-error').html('<li>' + message + '</li>');
    };
  };
})();
