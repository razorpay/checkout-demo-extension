(function(){
  var Razorpay = function(options){
    var $ = window.RazorpayLibs.$;

    var rzp = {
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
        rzp.configure(options);
        rzp.XD.receiveMessage(rzp.XDCallback);
      },

      rzpscript: document.currentScript || (function() {
        var scripts;
        scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
      })(),

      XDCallback: function(){
        var rzp;
        rzp = Razorpay.lastXDInstance;
        rzp.preHandler();

        if (message.data.error && message.data.error.description) {
          rzp.open();
          return rzp.handleAjaxResponse(message.data);
        } else {
          return rzp.options.handler(message.data);
        }
      },

      handleAjaxError: function() {
        // TODO Call client handleAjaxError handler
      },

      // TODO Needs complete rewrite
      handleAjaxSuccess: function(response) {
        if (response.callbackUrl) {
          iframe = document.createElement('iframe');

          // TODO Instead of this, fire event for client to catch.
          // Let him decide what to do when 3DS iframe is open
          // modal = $el.find('.rzp-modal').html('').append(iframe);

          // TODO Create a modal for ifram
          template = Handlebars.compile(this.Razorpay.templates.autosubmit)(response);
          iframe.contentWindow.document.write(template);
          modal.addClass('rzp-frame');

          // TODO Not sure what should come here
          // rzp.lastXDInstance = this.Razorpay;
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
      },

      public: {
        submit: function(data){
          // TODO what's to be done for netbanking?
          data['card[number]'] = data['card[number]'].replace(/\ /g, '');
          expiry = data['card[expiry]'].replace(/\ /g, '').split('/');
          data['card[expiry_month]'] = expiry[0];
          data['card[expiry_year]'] = expiry[1];

          $.ajax({
            url: rzp.options.protocol + '://' + rzp.options.key + '@' + rzp.options.hostname + '/' + rzp.options.version + rzp.options.jsonpUrl,
            dataType: 'jsonp',
            success: rzp.handleAjaxSuccess,
            timeout: 35000,
            error: rzp.handleAjaxError,
            data: data,
            form: form,
            Razorpay: rzp
          });
        },

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
          rzp.options = $.extend({}, rzp.options, options);
        },

        validateOptions: function() {
          if (typeof rzp.options.amount === "undefined") {
            throw new Error("No amount specified");
          }
          if (rzp.options.amount < 0) {
            throw new Error("Invalid amount specified");
          }
          if (["https", "http"].indexOf(rzp.options.protocol) < 0) {
            throw new Error("Invalid Protocol specified");
          }
          if (!$.isFunction(rzp.options.handler)) {
            throw new Error("Handler must be a function");
          }
          if (typeof rzp.options.key === "undefined") {
            throw new Error("No merchant key specified");
          }
          if (Object.keys(rzp.options.udf).length > 15) {
            throw new Error("You can only pass at most 13 fields in the udf object");
          }
        },
      }
    }

    rzp.init(options);
    // TODO change to rzp.public
    return rzp;
  };

  window.Razorpay = Razorpay;
})();
