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
    } else if(data.event == 'success'){
      successHandler();
    } else if(data.event == 'failure'){
      failureHandler(data.response);
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
      data.method = 'netbanking'
    }

    return data;
  };

  function showNetbankingList(rzp){
    rzp.getNetbankingList(function(data){
      if(typeof data.error !== 'undefined'){
        $('#tab-nb .elem').remove();
        $('.error').append('<li class="nb-na">Netbanking is not available right now. Please try later.</li>');
        return;
      }

      var optionsString = '<option selected="selected" value="">Select Bank</option>';
      for(var i in data){
        if(i === 'http_status_code'){
          continue;
        }
        optionsString += '<option value="'+i+'">' + data[i] + '</option>';
      }
      $('#tab-nb select').html(optionsString);
    });
  }

  function sanitizeDOM(obj){
    // directly appended tags
    var user_fields = ['name', 'description', 'amount', 'currency', 'display_amount'];
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
      onhidden: function(){
        postMessage({event: 'hidden'})
      }
    }
    if(options.oncancel){
      modalOptions.onhide = function(){
        postMessage({event: 'cancel'})
      }
    }

    modal = new Modal($el, modalOptions);

    renew();

    // discreet.modalRollbarClose(this);
    // discreet.showNetbankingList.call(this);

    $el.find('.input[name="card[number]"]').payment('formatCardNumber').on('blur', function() {
      var parent;
      parent = $(this.parentNode.parentNode);
      return parent[$.payment.validateCardNumber(this.value) ? 'removeClass' : 'addClass']('invalid');
    });

    $el.find('.input[name="card[expiry]"]').payment('formatCardExpiry');
    $el.find('.input[name="card[cvv]"]').payment('formatCardCVC').on('blur', function(){
      var parent;
      parent = $(this.parentNode.parentNode);
      return parent[$.payment.validateCardCVC(this.value) ? 'removeClass' : 'addClass']('invalid');
    });

    if (options.netbanking) {
      $el.find('.tabs li').click(function() {
        var inner = $(this).closest('.modal-inner');
        if (!inner.length) {
          return;
        }
        var form = inner.find('.form')
        var modalEl = inner.parent();
        var change_modal_height = true// !this.modal.curtainMode;
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

    $el.find('form').on('submit', function(e){
      formSubmit(e);
      return false // prevent default
    });
  };

  function formSubmit(e){
    var form = $(e.currentTarget);
    $el.smarty('refresh');
    form.find('.input[name="card[number]"], .input[name="card[cvv]"]').trigger('blur');
    
    var invalid = form.find('.form-common, .tab-content.active').find('.invalid');
    var modalEl = form.closest('.modal');
    if (invalid.length) {
      invalid.addClass('mature').find('.input').eq(0).focus();
      shake(modalEl);
      return;
    }
    var data = getFormData(form, options.netbanking);

    // Signature is set in case of hosted checkout
    if(options.signature !== ''){
      data.signature = options.signature;
    }

    postMessage({event: 'submit', data: data});
    // request = {
    //   data: data,
    //   failure: failureHandler,
    //   success: successHandler,
    //   prehandler: preHandler
    // };
    // submit(request);
    renew();
    $el.find('.submit').attr('disabled', true);
    modal.options.backdropClose = false;
  }

  // close on backdrop click and remove errors
  function renew(){
    if ($el) {
      $el.find('.error').html('');
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

  function preHandler(rzp){
  
  };

  function successHandler(){
    modal.options.onhide = null;
    modal.hide();
    modal = null;
  };

  function failureHandler(response){
    var modalEl = modal.modalElement;
    shake(modalEl[0]);

    modalEl.find('.submit').removeAttr('disabled');
    modal.options.backdropClose = true;

    if (response && response.error && response.error.field){
      var error_el = $el.find('input[name="'+response.error.field+'"]')
      if (error_el.length){
        error_el.closest('.elem').addClass('invalid');
      }
    }

    var defaultMessage = 'There was an error in handling your request';
    var message = response.error.description || defaultMessage;

    $el.find('.error').html(message);
  };
})();
