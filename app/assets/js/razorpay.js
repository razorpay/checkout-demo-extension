(function(){
  var Razorpay = function(options){
    var $ = window.RazorpayLibs.$;
    var Handlebars = window.RazorpayLibs.Handlebars;

    var rzp = {
      options: {
        protocol: 'http',
        hostname: 'api.razorpay.dev',
        version: 'v1',
        jsonpUrl: '/payments/create/jsonp',
        key: ''
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
            data: data
          });
        },

        configure: function(options){
          if (typeof options === "undefined") {
            throw new Error("No options specified");
          }
          if (typeof options["key"] === "undefined") {
            throw new Error("No merchant key specified");
          }
          for (var i in rzp.options){
            if(typeof rzp.options[i] === undefined){
              continue;
            }
            if(i === "udf"){
              rzp.options.udf = $.extend({}, rzp.options.udf, options);
            }
            else if(typeof rzp.options[i] !== "object" && typeof options[i] !== "undefined"){
              rzp.options[i] = options[i];
            }
          }
        },

        // TODO
        validateData: function(){

        },

        client: {
          handleAjaxSuccess: '',
          handleAjaxError: '',
          preHandler: '', // TODO Need to handle completely manual case where these would be client functions
          postHandler: ''
        }
      }
    }

    rzp.init(options);

    // @if NODE_ENV='production'
    return rzp.public
    // @endif

    // @if NODE_ENV='test'
    return rzp
    // @endif
  };

  window.Razorpay = Razorpay;
})();
