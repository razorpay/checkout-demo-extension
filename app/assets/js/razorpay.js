/* global RazorpayLibs */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.$;
  var doT = Razorpay.doT;
  var XD = Razorpay.XD;

  var options = {
    protocol: 'https',
    hostname: 'api.razorpay.com',
    version: 'v1',
    jsonpUrl: '/payments/create/jsonp',
    currency: 'INR',
    prefill: {
      name: '',
      contact: '',
      email: ''
    },
    key: '',
    amount: '',
    name: '', // of merchant
    description: '',
    image: '',
    udf: {}
  };

  var lastRazorpayInstance = null
  var XDCallback = function(message){
    lastRazorpayInstance.hide();

    if (message.data.error && message.data.error.description) {
      lastRazorpayInstance.open();
      // TODO Left as it is in refactor. Method not defined
      return// lastRazorpayInstance.handleAjaxResponse(message.data);
    } else {
      var handler = lastRazorpayInstance.options.handler;
      if(typeof handler == 'function')
        handler(message.data);
    }
  }
  XD.receiveMessage(XDCallback)

  var ajaxErrorHandler = function(){

  }
  var ajaxSuccessHandler = function(response){
    // Add client part
    // var $el = rzp.methods.client.handleAjaxSuccess(response);
    var modal;

    if (response.callbackUrl) {
      var iframe = document.createElement('iframe');
      modal = $('.rzp-modal').html('').append(iframe);
      var template = doT.compile(Razorpay.templates.autosubmit)(response);
      iframe.contentWindow.document.write(template);
      modal.addClass('rzp-frame');
      return;
    }
    else if (response.redirectUrl) {
      // TODO tests for this
      modal = $('.rzp-modal').addClass('rzp-frame').html('<iframe src=' + response.redirectUrl + '></iframe>');
      return;
    }
    else if (response.status) {
      // Nothing to do here. Checkout does stuff
    }
    else {
      // Again, nothing for us to do here. Checkout magic.
    }
  }

  Razorpay.prototype.submit = function(data){
    // TODO what's to be done for netbanking?
    // TODO better validation
    // data['card[number]'] = data['card[number]'].replace(/\ /g, '');
    // data['card[expiry_month]'] = expiry[0];
    // data['card[expiry_year]'] = expiry[1];

    // var source = options.protocol + '://' + options.hostname;

    lastRazorpayInstance = this
    
    return $.ajax({
      url: options.protocol + '://' + options.key + '@' + options.hostname + '/' + options.version + options.jsonpUrl,
      dataType: 'jsonp',
      success: ajaxSuccessHandler,
      timeout: 35000,
      error: ajaxErrorHandler,
      data: data
    });
  }

  Razorpay.prototype.configure = function(overrides){
    if (typeof overrides === "undefined") {
      throw new Error("No options specified");
    }
    if (typeof overrides["key"] === "undefined") {
      throw new Error("No merchant key specified");
    }

    this.options = options
    for (var i in overrides){
      if(typeof overrides[i] === undefined){
        continue;
      }
      if(i === 'udf' && typeof overrides['udf'] == 'object'){
        this.options.udf = overrides.udf
      }
      else if(typeof overrides[i] !== "object"){
        this.options[i] = overrides[i];
      }
    }
  }

  Razorpay.prototype.validate = function(){
    return true
  }

})();
