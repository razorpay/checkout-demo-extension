/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.$;
  var doT = Razorpay.doT;
  var Modal = Razorpay.Modal;
  var discreet = window.discreet || {};

  discreet.shake = function(element) {
    element.addClass('rzp-shake');
    setTimeout(function() {
      element.removeClass('rzp-shake');
    }, 150);
  };

  discreet.getFormData = function(form) {
    var data, expiry;
    data = {};
    form.find('[name]').each(function(index, el) {
      if (el.value) {
        return data[el.name] = el.value;
      }
    });

    if (!form.find('select[name=bank]').length) {
      data['card[number]'] = data['card[number]'].replace(/\ /g, '');
      expiry = data['card[expiry]'].replace(/\ /g, '').split('/');
      data['card[expiry_month]'] = expiry[0];
      data['card[expiry_year]'] = expiry[1];
      delete data['card[expiry]'];
    }

    return data;
  };

  Razorpay.prototype.open = function(){
    if(this.modal){
      return this.modal.show();
    }

    this.$el = $((doT.compile(Razorpay.templates.modal))(this.options));
    this.$el.smarty();
    this.modal = new Modal(this.$el);
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
        modal = inner.parent();
        modal.height(inner.height());
        inner.css('opacity', 0.5);
        inner.find('#' + this.getAttribute('data-target')).addClass('active').siblings('.active').removeClass('active');
        $(this).addClass('active').siblings('.active').removeClass('active');
        modal.height(inner.height());
        return setTimeout(function() {
          return inner.css('opacity', 1);
        }, 150);
      });
    }

    var self = this;
    this.$el.find('form').on('submit', function(e){
      e.preventDefault();
      var form, invalid;
      form = $(e.currentTarget);
      invalid = form.find('.rzp-invalid');
      var modal = form.closest('.rzp-modal');
      if (invalid.length) {
        invalid.addClass('rzp-mature').find('.rzp-input')[0].focus();
        discreet.shake(modal);
        return;
      }
      self.submit({
        data: discreet.getFormData(form),
        failure: discreet.failureHandler(self),
        success: discreet.successHandler(self),
        prehandler: discreet.preHandler(self),
        parent: modal
      });
      self.$el.find('.rzp-submit').attr('disabled', true);
      self.modal.options.backdropClose = false;
    });
  };

  // close on backdrop click and remove errors
  Razorpay.prototype.renew = function(){
    if (this.$el) {
      this.$el.find('.rzp-error').html('');
    }
    this.modal.options.backdropClose = true;
  };

  Razorpay.prototype.hide = function(){
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
      rzp.modalRef = rzp.modal.element.children('.rzp-modal').addClass('rzp-frame').children('.rzp-modal-inner').remove();
    };
  };
  discreet.successHandler = function(rzp){
    return function(message){
      if(rzp.modal){
        rzp.modal.hide();
      }
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
    // TODO append should not be in body;
    $(button).click(function(e) {
      rzp.open();
      e.preventDefault();
    }).html("Pay with Card").appendTo(discreet.rzpscript.parentNode);
  };

  var key = $(discreet.rzpscript).data('key');
  if (key && key.length > 0) {
    var opts = $(discreet.rzpscript).data();
    var options = discreet.parseScriptOptions(opts);
    discreet.addButton(new Razorpay(options));
  }

})();
