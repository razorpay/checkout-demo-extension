/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';
  var modal, $el, options;


  postMessage({event: 'load'});

  window.onmessage = function(e){ // not concerned about adding/removeing listeners, iframe is razorpay's fiefdom
    if(!e || !e.data)
      return;

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

    if(data.options && !options){ // open modal
      options = data.options;
      open();
    }
  }

  function postMessage(message){
    message.source = 'frame';
    if(typeof message != 'string'){
      message = JSON.stringify(message);
    }
    window.parent.postMessage(message, '*')
  }

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
      sanitizeDOM(obj);
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
    if(modal){
      return modal.show();
    }
    sanitizeOptions(options);
    $el = $((doT.compile(templates.modal))(options));
    $el.smarty();

    // init modal
    var modalOptions = {
      onhide: null,
      onhidden: null
    }
    if(options.oncancel){
      modalOptions.onhide = function(){
        postMessage({event: 'cancel'})
      }
    }
    if(options.onhidden){
      modalOptions.onhidden = function(){
        postMessage({event: 'hidden'})
      } 
    }
    modal = new Modal($el, modalOptions);

    renew();

    // discreet.modalRollbarClose(this);
    // discreet.showNetbankingList.call(this);

    $el.find('.rzp-input[name="card[number]"]').payment('formatCardNumber').on('blur', function() {
      var parent;
      parent = $(this.parentNode.parentNode);
      return parent[$.payment.validateCardNumber(this.value) ? 'removeClass' : 'addClass']('rzp-invalid');
    });

    $el.find('.rzp-input[name="card[expiry]"]').payment('formatCardExpiry');
    $el.find('.rzp-input[name="card[cvv]"]').payment('formatCardCVC').on('blur', function(){
      var parent;
      parent = $(this.parentNode.parentNode);
      return parent[$.payment.validateCardCVC(this.value) ? 'removeClass' : 'addClass']('rzp-invalid');
    });

    if (options.netbanking) {
      $el.find('.rzp-tabs li').click(function() {
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

    $el.find('form').on('submit', function(e){
      formSubmit(e);
      return false // prevent default
    });
  };

  function formSubmit(e){
    var form, invalid;
    form = $(e.currentTarget);
    $el.smarty('refresh');
    form.find('.rzp-input[name="card[number]"], .rzp-input[name="card[cvv]"]').trigger('blur');
    invalid = form.find('.rzp-form-common, .rzp-tab-content.rzp-active').find('.rzp-invalid');
    var modal = form.closest('.rzp-modal');
    if (invalid.length) {
      invalid.addClass('rzp-mature').find('.rzp-input').eq(0).focus();
      shake(modal);
      return;
    }
    var data = getFormData(form, options.netbanking);

    // Signature is set in case of hosted checkout
    if(options.signature !== ''){
      data.signature = options.signature;
    }

    request = {
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
    if ($el) {
      $el.find('.rzp-error').html('');
    }
    modal.options.backdropClose = true;
  };

  function hide(){
    // if(this.Rollbar.state === true){
    //   this.Rollbar.stop();
    // }

    renew();
    if(modal){
      modal.hide();
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
