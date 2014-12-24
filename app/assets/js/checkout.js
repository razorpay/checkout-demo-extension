/* jshint -W027 */
(function(){
  'use strict';
  var Checkout = function(options){
    var $ = window.RazorpayLibs.$;
    var Handlebars = window.RazorpayLibs.Handlebars;
    var RazorpayLibs = window.RazorpayLibs;

    var co = {
      /**
       * Variables used across multiple methods and specific to Checkout
       * should be listed here
       */
      $el: '',
      modal: '',
      rzp: '',

      // custom, scoped to checkout jquery
      $: function(param){
        return co.$el.find(param);
      },

      options: {
        prefill: {
          name: '',
          contact: '',
          email: ''
        },
        key: '',
        amount: '',
        currency: '',
        name: '', // of merchant
        description: '',
        image: '',
        udf: {}
      },

      init: function(options){
        co.rzp = new window.Razorpay();

        // TODO handle options through data-attr
        var key = $(co.rzpscript).data("key");
        if (key && key.length > 0) {
          var opts = $(co.rzpscript).data();
          options = co.parseScriptOptions(opts);
          co.methods.configure(opts);
          co.methods.addButton();
        }
        co.methods.configure(options);
        co.configureRzpInstance();
        // TODO else?
      },

      configureRzpInstance: function(){
        co.rzp.configure(co.options);
        co.rzp.client = {
          handleAjaxSuccess: co.methods.handleAjaxSuccess,
          handleAjaxError: co.methods.handleAjaxError,
          preHandler: co.methods.preHandler,
          postHandler: co.methods.postHandler
        };
      },

      rzpscript: document.currentScript || (function() {
        var scripts;
        scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
      })(),

      createLightBox: function(template){
        if (co.$el) {
          return co.modal.show();
        }

        co.$el = $((Handlebars.compile(template))(co.options));
        co.$el.smarty();
        co.modal = new RazorpayLibs.modal(co.$el);
        co.$('.rzp-input[name="card[number]"]').payment('formatCardNumber').on('blur', function() {
          var parent;
          parent = $(this.parentNode.parentNode);
          return parent[$.payment.validateCardNumber(this.value) ? 'removeClass' : 'addClass']('rzp-invalid');
        });

        co.$('.rzp-input[name="card[expiry]"]').payment('formatCardExpiry');
        co.$('.rzp-input[name="card[cvv]"]').payment('formatCardCVC').on('blur', function() {
          var parent;
          parent = $(this.parentNode.parentNode);
          return parent[$.payment.validateCardCVC(this.value) ? 'removeClass' : 'addClass']('rzp-invalid');
        });

        if (co.options.netbanking) {
          co.$el.find('.rzp-tabs li').click(function() {
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

        co.$('form').on('submit', function(e) {
          var form, invalid;
          e.preventDefault();
          form = $(e.currentTarget);
          invalid = form.find('.rzp-invalid');
          if (invalid.length) {
            invalid.addClass('rzp-mature').find('.rzp-input')[0].focus();
            co.shake();
            return;
          }
          co.submit(form);
          co.$('.rzp-submit').attr('disabled', true);
          co.modal.options.backdropClose = false;
        });
      },

      shake: function() {
        co.$('.rzp-modal').addClass('rzp-shake');

        setTimeout(function() {
          co.$('.rzp-modal').removeClass('rzp-shake');
        }, 150);
      },

      submit: function(form) {
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

        data['udf'] = co.options.udf;

        co.rzp.submit(form, data);
      },

      clearSubmission: function() {
        if (co.$el) {
          co.$('.rzp-error').html('');
        }
        co.modal.options.backdropClose = true;
      },

      /**
        default handler for success
        default handler does not care about error or success messages,
        it just submits everything via the form
        @param  {[type]} data [description]
        @return {[type]}    [description]
      */
      defaultPostHandler: function(data){
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
        var RazorPayForm = co.rzpscript.parentElement;
        $(inputs).appendTo(RazorPayForm);
        $(RazorPayForm).submit();
      },

      parseScriptOptions: function(options){
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
      },

      methods: {
        // Handles Checkout.js related options
        // and also calls Razorpay.validateOptions
        configure: function(options){
          if (typeof options["currency"] === "undefined") {
            options['currency'] = 'INR';
          }
          co.methods.validateOptions(options, true);
          co.options = $.extend({}, co.options, options);
          for (var i in co.options){
            if(typeof co.options[i] === undefined){
              continue;
            }
            if(i === "udf"){
              co.options.udf = $.extend({}, co.options.udf, options.udf);
            }
            else if(typeof co.options[i] !== "object" && typeof options[i] !== "undefined"){
              co.options[i] = options[i];
            }
          }
        },

        /**
         * Validates options
         * throwError = bool // throws an error if true, otherwise returns object with the state
         * options = object
         *
         * return object
         */
        validateOptions: function(options, throwError) {
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
          else if (!$.isFunction(options.handler)) {
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
          else if (Object.keys(options.udf).length > 15) {
            message = "You can only pass at most 13 fields in the udf object";
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
        },

        handleAjaxError: function() {
          co.$('.rzp-error').html('There was an error in handling your request');
        },

        handleAjaxSuccess: function(response) {
          var $el = co.$el;
          if (response.callbackUrl) {
            co.$('.rzp-modal').html('');
            co.$el = null;
          } else if (response.redirectUrl) {
            co.$el = null;
          } else if (response.status) {
            co.methods.preHandler();
            co.options.handler(response);
          } else {
            co.$('.rzp-error').html('There was an error in handling your request');
            co.clearSubmission();
          }

          // Passing element to rzp wherein to put 3DS iframe
          return $el;
        },

        hide: function() {
          co.clearSubmission();
          co.modal.hide();
        },

        preHandler: function() {
          co.methods.hide();
        },

        addButton: function() {
          var button;
          button = document.createElement("button");
          button.setAttribute("id", "rzp-button");
          $(button).click(function(e) {
            co.methods.open();
            e.preventDefault();
          }).html("Pay with Card").appendTo("body");
        },

        open: function() {
          co.createLightBox(RazorpayLibs.templates.modal);
        },

        postHandler: function(message){
          if(co.options.handler === undefined || typeof co.options.handler !== "function"){
            // This is automatic checkout
            co.defaultPostHandler(message);
          }
          else {
            co.options.handler(message);
          }
        }

      }
    };

    co.init(options);

    // @if NODE_ENV='production'
    return co.methods;
    // @endif

    // @if NODE_ENV='test'
    return co;
    // @endif
  };

  window.Checkout = Checkout;
})();
