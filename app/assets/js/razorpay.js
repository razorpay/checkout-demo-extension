(function(){
  var Razorpay = function(options){
    var RazorpayLibs = window.RazorpayLibs;
    var $ = window.RazorpayLibs.$;
    var Handlebars = window.RazorpayLibs.Handlebars;

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

      XD: window.RazorpayLibs.XD,

      init: function(options){
        rzp.public.configure(options);
        var source = rzp.options.protocol + '://' + rzp.options.hostname;
        rzp.XD.receiveMessage(rzp.XDCallback, source);
      },

      XDCallback: function(message){
        rzp.public.client.preHandler();

        if (message.data.error && message.data.error.description) {
          rzp.open();
          // TODO Left as it is in refactor. Method not defined
          return rzp.handleAjaxResponse(message.data);
        } else {
          rzp.public.client.postHandler(message.data);
        }
      },

      handleAjaxError: function() {
        rzp.public.client.handleAjaxError();
      },

      handleAjaxSuccess: function(response) {
        // Add client part
        var $el = rzp.public.client.handleAjaxSuccess(response);

        if (response.callbackUrl) {
          var iframe = document.createElement('iframe');
          var modal = $el.find('.rzp-modal').html('').append(iframe);
          var template = Handlebars.compile(RazorpayLibs.templates.autosubmit)(response);
          iframe.contentWindow.document.write(template);
          modal.addClass('rzp-frame');
          return;
        } else if (response.redirectUrl) {
          var modal = $el.find('.rzp-modal').addClass('rzp-frame').html('<iframe src=' + response.redirectUrl + '></iframe>');
          return;
        } else if (response.status) {
          // Nothing to do here. Checkout does stuff
        } else {
          // Again, nothing for us to do here. Checkout magic.
        }
      },

      public: {
        submit: function(form, data){
          // TODO what's to be done for netbanking?
          // TODO better validation
          // data['card[number]'] = data['card[number]'].replace(/\ /g, '');
          // data['card[expiry_month]'] = expiry[0];
          // data['card[expiry_year]'] = expiry[1];

          return $.ajax({
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

        client: {
          handleAjaxSuccess: '',
          handleAjaxError: ''
        }
      }
    }

    rzp.init(options);
    // TODO change to rzp.public
    return rzp.public;
  };

  window.Razorpay = Razorpay;
})();
