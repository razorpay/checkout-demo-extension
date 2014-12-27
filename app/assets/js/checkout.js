/* jshint -W027 */
(function(){
  'use strict';
  
  var $ = Razorpay.$;
  var doT = Razorpay.doT;
  var XD = Razorpay.XD;
  var modal = Razorpay.modal

  var rzpscript = document.currentScript || (function() {
    var scripts;
    scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })()

  var parseScriptOptions = function(options){
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
  }

  var shake = function(element) {
    element.addClass('rzp-shake');
    setTimeout(function() {
      element.removeClass('rzp-shake');
    }, 150);
  }

  var getFormData = function(form) {
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

    return data
  }

  Razorpay.prototype.open = function(){
    if(this.modal){
      return this.modal.show()
    }

    this.$el = $((doT.compile(Razorpay.templates.modal))(this.options));
    this.$el.smarty();
    this.modal = new modal(this.$el);
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
      var form, invalid;
      e.preventDefault();
      form = $(e.currentTarget);
      invalid = form.find('.rzp-invalid');
      var modal = form.closest('.rzp-modal')
      if (invalid.length) {
        invalid.addClass('rzp-mature').find('.rzp-input')[0].focus();
        shake(modal);
        return;
      }
      self.submit({
        data: getFormData(form),
        error: errorHandler(form),
        success: successHandler(self),
        parent: modal
      });
      self.$el.find('.rzp-submit').attr('disabled', true);
      self.modal.options.backdropClose = false;
    });
  }

  // close on backdrop click and remove errors
  Razorpay.prototype.renew = function(){
    if (this.$el) {
      this.$el.find('.rzp-error').html('');
    }
    this.modal.options.backdropClose = true;
  }

  Razorpay.prototype.hide = function(){
    this.renew();
    if(this.modal)
      this.modal.hide();
  }

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
    var RazorPayForm = rzpscript.parentElement;
    $(inputs).appendTo(RazorPayForm);
    $(RazorPayForm).submit();
  }

  /**
   * Validates options
   * throwError = bool // throws an error if true, otherwise returns object with the state
   * options = object
   *
   * return object
   */
  var validateOptions = function(options, throwError) {
    var field = "";
    var message = "";
    if (typeof options.amount === "undefined") {
      message = "No amount specified";
      field = "amount";
    }
    else if (options.amount < 0) {
      message = "Invalid amount specified";
      field = "amount";
    }
    else if (typeof options.handler !== 'undefined' && !$.isFunction(options.handler)) {
      message = "Handler must be a function";
      field = "handler";
    }
    else if (typeof options.key === "undefined") {
      message = "No merchant key specified";
      field = "key";
    }
    else if (options.key === "") {
      message = "Merchant key cannot be empty";
      field = "key";
    }
    else if (typeof options.udf === 'object' && Object.keys(options.udf).length > 15) {
      message = "You can only pass at most 15 fields in the udf object";
      field = "udf";
    }

    if(message !== "" && throwError === true){
      throw new Error("Field: " + field + "; Error:" + message);
    }
    if(message === ""){
      return {error: false};
    }
    else {
      return {
        error: {
          description: message,
          field: field
        }
      };
    }
  }

  var successHandler = function(rzp){
    return function(message){
      rzp.modal.hide()
      rzp.modal = null
      if(typeof rzp.options.handler == "function"){
        // This is automatic checkout
        rzp.options.handler(message);
      }
      else {
        rzp.defaultPostHandler(message);
      }
    }
  }

  var errorHandler = function(form){
    return function(){
      form.find('.rzp-error').html('There was an error in handling your request');
    }
  };

  // addButton: function() {
  //   var button;
  //   button = document.createElement("button");
  //   button.setAttribute("id", "rzp-button");
  //   // TODO append should not be in body;
  //   $(button).click(function(e) {
  //     co.methods.open();
  //     e.preventDefault();
  //   }).html("Pay with Card").appendTo("body");
  // }

})();
