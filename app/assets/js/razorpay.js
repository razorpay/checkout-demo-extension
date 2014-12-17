(function() {
  var $, Handlebars, RazorPayScript, Razorpay;
  RazorPayScript = document.currentScript || (function() {
    var scripts;
    scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  Razorpay = window.Razorpay;
  $ = Razorpay.prototype.$;
  Handlebars = Razorpay.prototype.Handlebars;
  Razorpay.XDCallback = function(message) {
    var rzp;
    rzp = Razorpay.lastXDInstance;
    rzp.preHandler();
    if (message.data.error && message.data.error.description) {
      rzp.open();
      return rzp.handleAjaxResponse(message.data);
    } else {
      return rzp.options.handler(message.data);
    }
  };
  Razorpay.prototype.clearSubmission = function() {
    if (this.$el) {
      this.$el.find('.rzp-error').html('');
    }
    return this.modal.options.backdropClose = true;
  };
  Razorpay.prototype.createlightBox = function(template) {
    if (this.$el) {
      return this.modal.show();
    }
    this.$el = $((Handlebars.compile(template))(this.options));
    this.$el.smarty();
    this.modal = new Razorpay.modal(this.$el);
    this.$el.find('.rzp-input[name="card[number]"]').payment('formatCardNumber').on('blur', function() {
      var parent;
      parent = $(this.parentNode.parentNode);
      return parent[$.payment.validateCardNumber(this.value) ? 'removeClass' : 'addClass']('rzp-invalid');
    });
    this.$el.find('.rzp-input[name="card[expiry]"]').payment('formatCardExpiry');
    this.$el.find('.rzp-input[name="card[cvv]"]').payment('formatCardCVC').on('blur', function() {
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
    return this.$el.find('form').on('submit', (function(_this) {
      return function(e) {
        var form, invalid;
        e.preventDefault();
        form = $(e.currentTarget);
        invalid = form.find('.rzp-invalid');
        if (invalid.length) {
          invalid.addClass('rzp-mature').find('.rzp-input')[0].focus();
          return _this.shake();
        }
        if (_this.submit(form)) {
          _this.$el.find('.rzp-submit').attr('disabled', true);
          return _this.modal.options.backdropClose = false;
        } else {
          return _this.clearSubmission();
        }
      };
    })(this));
  };
  Razorpay.prototype.submit = function(form) {
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
    return $.ajax({
      url: this.options.protocol + '://' + this.options.key + '@' + this.options.hostname + '/' + this.options.version + this.options.jsonpUrl,
      dataType: 'jsonp',
      success: this.handleAjaxSuccess,
      timeout: 35000,
      error: this.handleAjaxError,
      data: data,
      form: form,
      Razorpay: this
    });
  };
  Razorpay.prototype.handleAjaxError = function() {
    return this.form.find('.rzp-error').html('There was an error in handling your request');
  };
  Razorpay.prototype.handleAjaxSuccess = function(response) {
    var $el, form, iframe, modal, template;
    form = this.form;
    $el = this.Razorpay.$el;
    if (response.callbackUrl) {
      this.Razorpay.$el = null;
      iframe = document.createElement('iframe');
      modal = $el.find('.rzp-modal').html('').append(iframe);
      template = Handlebars.compile(this.Razorpay.templates.autosubmit)(response);
      iframe.contentWindow.document.write(template);
      modal.addClass('rzp-frame');
      return Razorpay.lastXDInstance = this.Razorpay;
    } else if (response.redirectUrl) {
      this.Razorpay.$el = null;
      modal = $el.find('.rzp-modal').addClass('rzp-frame').html('<iframe src=' + response.redirectUrl + '></iframe>');
      return Razorpay.lastXDInstance = this.Razorpay;
    } else if (response.status) {
      this.preHandler();
      return this.options.handler(response);
    } else {
      this.$el.find('.rzp-error').html('There was an error in handling your request');
      return this.clearSubmission();
    }
  };
  Razorpay.prototype.shake = function() {
    this.$el.find('.rzp-modal').addClass('rzp-shake');
    return setTimeout((function(_this) {
      return function() {
        return _this.$el.find('.rzp-modal').removeClass('rzp-shake');
      };
    })(this), 150);
  };
  Razorpay.prototype.hide = function() {
    this.clearSubmission();
    return this.modal.hide();
  };
  Razorpay.prototype.options = {
    protocol: 'https',
    hostname: 'api.razorpay.com',
    version: 'v1',
    jsonpUrl: '/payments/create/jsonp',
    prefill: {
      name: '',
      contact: '',
      email: ''
    },
    udf: {}
  };

  /**
  	This function is called just before control is passed on
  	to the handler specified in options
   */
  Razorpay.prototype.preHandler = function() {
    return this.hide();
  };

  /**
  	default handler for success
  	default handler does not care about error or success messages,
  	it just submits everything via the form
  	@param	{[type]} data [description]
  	@return {[type]}		[description]
   */
  Razorpay.prototype.options.handler = function(data) {
    var RazorPayForm, i, inputs, j;
    inputs = "";
    for (i in data) {
      if (typeof data[i] === "object") {
        for (j in data[i]) {
          inputs += "<input type=\"hidden\" name=\"" + i + "[" + j + "]\" value=\"" + data[i][j] + "\">";
        }
      } else {
        inputs += "<input type=\"hidden\" name=\"" + i + "\" value=\"" + data[i] + "\">";
      }
    }
    RazorPayForm = RazorPayScript.parentElement;
    $(inputs).appendTo(RazorPayForm);
    return $(RazorPayForm).submit();
  };
  Razorpay.prototype.addButton = function() {
    var button, self;
    button = document.createElement("button");
    button.setAttribute("id", "rzp-button");
    self = this;
    $(button).click(function(e) {
      self.open();
      e.preventDefault();
    }).html("Pay with Card").appendTo("body");
  };
  Razorpay.prototype.validateOptions = function() {
    if (typeof this.options.amount === "undefined") {
      throw new Error("No amount specified");
    }
    if (this.options.amount < 0) {
      throw new Error("Invalid amount specified");
    }
    if (["https", "http"].indexOf(this.options.protocol) < 0) {
      throw new Error("Invalid Protocol specified");
    }
    if (!$.isFunction(this.options.handler)) {
      throw new Error("Handler must be a function");
    }
    if (typeof this.options.key === "undefined") {
      throw new Error("No merchant key specified");
    }
    if (Object.keys(this.options.udf).length > 15) {
      throw new Error("You can only pass at most 13 fields in the udf object");
    }
  };
  Razorpay.prototype.open = function(options) {
    this.options = $.extend({}, this.options, options);
    return this.createlightBox(this.templates.modal);
  };
  Razorpay.prototype.configure = function(options) {
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
    if (typeof options === "undefined") {
      throw new Error("No options specified");
    }
    if (typeof options["key"] === "undefined") {
      throw new Error("No merchant key specified");
    }
    return this.options = $.extend({}, this.options, options);
  };
  (function() {
    var key, rzp;
    key = $(RazorPayScript).data("key");
    if (key && key.length > 0) {
      rzp = new Razorpay($(RazorPayScript).data());
      return rzp.addButton();
    }
  })();
  return Razorpay.prototype.XD.receiveMessage(Razorpay.XDCallback);
})();
