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
        if(options !== undefined){
          rzp.public.configure(options);
        }
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

          var source = rzp.options.protocol + '://' + rzp.options.hostname;
          rzp.XD.receiveMessage(rzp.XDCallback, source);
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
          if (typeof options === "undefined") {
            throw new Error("No options specified");
          }
          if (typeof options["key"] === "undefined") {
            throw new Error("No merchant key specified");
          }
          rzp.public.validateOptions(options, true);
          rzp.options = $.extend({}, rzp.options, options);
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
          else if (["https", "http"].indexOf(options.protocol) < 0) {
            message = "Invalid Protocol specified";
            field = "protocol";
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
            return {error: {
              description: message,
              field: field
            }}
          }
        },

        // TODO
        validateData: function(){

        },

        client: {
          handleAjaxSuccess: '',
          handleAjaxError: ''
        }
      }
    }

    rzp.init(options);
    return rzp.public;
  };

  window.Razorpay = Razorpay;
})();
