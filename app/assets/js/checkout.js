(function(){
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
      },

      init: function(options){
        co.public.configure(options);
        // TODO handle options through data-attr
        var key = $(co.rzpscript).data("key");
        if (key && key.length > 0) {
          var options = $(co.rzpscript).data();
          co.public.configure(options);
          co.public.addButton();
        }
        // TODO else?
      },

      createRzpInstance: function(){
        co.rzp = new window.Razorpay(co.options);
        co.rzp.client = {
          handleAjaxSuccess: co.public.handleAjaxSuccess,
          handleAjaxError: co.public.handleAjaxError,
          preHandler: co.public.preHandler,
          postHandler: co.public.postHandler
        }
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

        co.createRzpInstance();
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
          if (co.submit(form)) {
            co.$('.rzp-submit').attr('disabled', true);
            co.modal.options.backdropClose = false;
            return;
          } else {
            co.clearSubmission();
            return;
          }
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
        var RazorPayForm = co.rzpscript.parentElement;
        $(inputs).appendTo(RazorPayForm);
        $(RazorPayForm).submit();
      },

      public: {
        configure: function(options){
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
          if (typeof options["currency"] === "undefined") {
            options['currency'] == 'INR';
          }
          co.options = $.extend({}, co.options, options);
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
            co.public.preHandler();
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
          co.public.hide();
        },

        addButton: function() {
          var button;
          button = document.createElement("button");
          button.setAttribute("id", "rzp-button");
          $(button).click(function(e) {
            co.public.open();
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
    }

    co.init(options);
    return co.public;
  };

  /** TODO s
   * calls to Razorpay.validate?
   */

  window.Checkout = Checkout;
})();
