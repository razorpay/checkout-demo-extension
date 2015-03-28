/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.$;
  var doT = Razorpay.doT;
  var Modal = Razorpay.Modal;
  var discreet = window.discreet || {};

  // This is used by razorpay to check if it is in standalone mode or integrated with checkout mode
  Razorpay.prototype.checkout = true;

  discreet.shake = function(element) {
    element.addClass('rzp-shake');
    setTimeout(function() {
      element.removeClass('rzp-shake');
    }, 150);
  };

  discreet.getFormData = function(form, netbanking) {
    var data, expiry;
    data = {};
    form.find('[name]').each(function(index, el) {
      if (el.value) {
        return data[el.name] = el.value;
      }
    });

    if(netbanking){
      if(form.find('.rzp-tabs .rzp-active').data('target') == 'rzp-tab-cc'){
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
    }

    return data;
  };

  /**
   * This handles stopping of rollbar in case checkout is closed via backdrop click
   */
  discreet.modalRollbarClose = function(rzp){
    rzp.modal.on('click', rzp.modal.element, function(e){
      if (e.target === rzp.modal.element[0] && rzp.modal.options.backdropClose) {
        rzp.Rollbar.stop();
      }
    });
  };

  discreet.showNetbankingList = function(rzp){
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

  Razorpay.prototype.purifyDOMOptions = function(obj){
    // directly appended tags
    var user_fields = ['name', 'description', 'amount', 'currency'];
    for(var i = 0; i < user_fields.length; i++){
      obj[user_fields[i]] = Razorpay.DOMPurify.sanitize(obj[user_fields[i]]);
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
  Razorpay.prototype.sanitizeOptions = function(obj){ // warning: modifies original object
    if(obj){
      this.purifyDOMOptions(obj);
      if(obj.prefill){
        if(obj.prefill.contact){
          if(typeof obj.prefill.contact != 'string')
            obj.prefill.contact = obj.prefill.contact + ''
          obj.prefill.contact = obj.prefill.contact.replace(/[^0-9+]/g,'')
        }
      }
    }
  }

  Razorpay.prototype.open = function(){
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
      onhidden: this.options.onhidden
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

  discreet.formSubmit = function(e, self){
    var form, invalid;
    form = $(e.currentTarget);
    self.$el.smarty('refresh');
    form.find('.rzp-input[name="card[number]"], .rzp-input[name="card[cvv]"]').trigger('blur');
    invalid = form.find('.rzp-form-common, .rzp-tab-content.rzp-active').find('.rzp-invalid');
    var modal = form.closest('.rzp-modal');
    if (invalid.length) {
      invalid.addClass('rzp-mature').find('.rzp-input')[0].focus();
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
      prehandler: discreet.preHandler(self),
      parent: modal
    };
    self.submit(self.request);
    self.$el.find('.rzp-submit').attr('disabled', true);
    self.modal.options.backdropClose = false;
  }

  // close on backdrop click and remove errors
  Razorpay.prototype.renew = function(){
    if (this.$el) {
      this.$el.find('.rzp-error').html('');
    }
    this.modal.options.backdropClose = true;
  };

  Razorpay.prototype.hide = function(){
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
  Razorpay.prototype.defaultPostHandler = function(data){
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

  discreet.preHandler = function(rzp){
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
  discreet.successHandler = function(rzp){
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

  discreet.failureHandler = function(rzp){
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
          if (rzp.$el.find('input[name="'+response.error.field+'"]').length){
            rzp.$el.find('input[name="'+response.error.field+'"]').addClass('rzp-invalid');
          }
        }

      var defaultMessage = 'There was an error in handling your request';
      var message = response.error.description || defaultMessage;

      rzp.$el.find('.rzp-error').html('<li>' + message + '</li>');
    };
  };

  discreet.rzpscript = document.currentScript || (function() {
    var scripts;
    scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  discreet.rzpstyle = (function(){
    var linkTag = document.createElement('link');
    linkTag.rel = 'stylesheet';
    linkTag.href = discreet.rzpscript.src.replace(/\/[^\/]+$/,'/css/checkout.css');
    discreet.rzpscript.parentNode.appendChild(linkTag);
    return linkTag;
  })();


  discreet.parseScriptOptions = function(options){
    var category, dotPosition, i, ix, property;
    for (i in options) {
      ix = i.indexOf(".");
      if (ix > -1) {
        dotPosition = ix;
        category = i.substr(0, dotPosition);
        property = i.substr(dotPosition + 1);
        options[category] = options[category] || {};
        options[category][property] = options[i];
        delete options[i];
      }
    }
    return options;
  };

  discreet.addButton = function(rzp){
    var button = document.createElement("button");
    button.setAttribute("id", "rzp-button");
    $(button).click(function(e) {
      rzp.open();
      e.preventDefault();
    }).html("Pay Now").appendTo(discreet.rzpscript.parentNode);
  };

  var key = $(discreet.rzpscript).data('key');
  if (key && key.length > 0) {
    var opts = $(discreet.rzpscript).data();
    var options = discreet.parseScriptOptions(opts);
    discreet.addButton(new Razorpay(options));
  }

})();
