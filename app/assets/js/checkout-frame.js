/* global handleMessage */
/* jshint -W027 */
(function(){
  'use strict';

  var modal, $el, options, rzp, nblist;
  postMessage({event: 'load'});

  window.handleMessage = function(message){
    if(typeof message != 'object'){
      return;
    }
    if(message.nblist){
      nblist = message.nblist;
    }

    if(message.options && !options){ // open modal
      options = message.options;
      options.handler = $.noop;
      rzp = new Razorpay(options);
      open();
    } else if(message.event == 'close'){
      close();      
    } else if(message.event == 'open' && rzp){
      open();
    }
  }

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
    window.handleMessage(data);
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
    }, 200);
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

  function showNetbankingList(nblist){
    if(!nblist && rzp){
      return rzp.getNetbankingList(showNetbankingList)
    }
    if(nblist.error){
      $('#tab-nb .elem').remove();
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
    $('#tab-nb select').html(optionsString);
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

  function open() {
    if(modal){
      return modal.show();
    }

    showNetbankingList();
    sanitizeOptions(options);
    $el = $((doT.compile(templates.modal))(options));
    $el.smarty();

    // init modal
    var modalOptions = {
      onhide: null,
      onhidden: function(){
        postMessage({event: 'hidden'});
      }
    }
    if(options.oncancel){
      modalOptions.onhide = function(){
        postMessage({event: 'cancel'});
      }
    }

    modal = new Modal($el, modalOptions);

    renew();

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
        renew();
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

    $el.find('form').on('submit', function(e) {
      formSubmit(e);
      return false // prevent default
    });
  };

  function formSubmit(e) {
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

    renew();
    $el.find('.submit').attr('disabled', true);
    modal.options.backdropClose = false;

    rzp.submit({
      data: data,
      error: errorHandler,
      success: successHandler
    })
    postMessage({
      event: 'submit',
      data: data
    });
  }

  // close on backdrop click and remove errors
  function renew() {
    if ($el) {
      $el.find('.error').html('');
    }
    modal.options.backdropClose = true;
  };

  function hide(){
    if(modal){
      modal.hide();
    }
    modal = null;
  };

  function successHandler(response){
    postMessage({ event: 'success', data: response});
    hide();
  };

  function errorHandler(response){
    if(!modal){
      return;
    }
    var modalEl = modal.modalElement;
    shake(modalEl);

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

    postMessage({ event: 'error', data: response});
  };

})();
