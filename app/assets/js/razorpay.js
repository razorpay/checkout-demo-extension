/* global RazorpayLibs */
/* jshint -W027 */
(function(){
  'use strict';
  var Razorpay = function(options){
    var $ = RazorpayLibs.$;
    var doT = RazorpayLibs.doT;

    var rzp = {
      options: {
        protocol: 'https',
        hostname: 'api.razorpay.com',
        version: 'v1',
        jsonpUrl: '/payments/create/jsonp',
        key: ''
      },

      XD: RazorpayLibs.XD,

      init: function(options){
        if(options !== undefined){
          rzp.methods.configure(options);
        }
      },

      XDCallback: function(message){
        rzp.methods.client.preHandler();

        if (message.data.error && message.data.error.description) {
          rzp.open();
          // TODO Left as it is in refactor. Method not defined
          return rzp.handleAjaxResponse(message.data);
        } else {
          rzp.methods.client.postHandler(message.data);
        }
      },

      handleAjaxError: function() {
        rzp.methods.client.handleAjaxError();
      },

      handleAjaxSuccess: function(response) {
        // Add client part
        var $el = rzp.methods.client.handleAjaxSuccess(response);

        var modal;

        if (response.callbackUrl) {
          var iframe = document.createElement('iframe');
          modal = $el.find('.rzp-modal').html('').append(iframe);
          var template = doT.compile(RazorpayLibs.templates.autosubmit)(response);
          iframe.contentWindow.document.write(template);
          modal.addClass('rzp-frame');
          return;
        }
        else if (response.redirectUrl) {
          // TODO tests for this
          modal = $el.find('.rzp-modal').addClass('rzp-frame').html('<iframe src=' + response.redirectUrl + '></iframe>');
          return;
        }
        else if (response.status) {
          // Nothing to do here. Checkout does stuff
        }
        else {
          // Again, nothing for us to do here. Checkout magic.
        }
      },

      methods: {
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
    };

    rzp.init(options);

    // @if NODE_ENV='production'
    return rzp.methods;
    // @endif

    // @if NODE_ENV='test'
    rzp.$ = $;
    rzp.doT = doT;
    for(var i in rzp.methods){
      if(typeof rzp[i] !== 'undefined'){
        throw new Error("Method " + i + " already defined");
      }
      rzp[i] = rzp.methods[i];
    }
    return rzp;
    // @endif
  };

  window.Razorpay = Razorpay;
})();
