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

  var lastRequestInstance = null
  
  var XDCallback = function(message){
    if (message.data.error && message.data.error.description){
      lastRequestInstance.error(message.data);
    } else {
      lastRequestInstance.success(message.data);
    }
    lastRequestInstance = null
  }

  XD.receiveMessage(XDCallback)

  var errorHandler = function(request){

  }
  var successHandler = function(request){
    return function(response){
      if (response.callbackUrl){
        var iframe = document.createElement('iframe');
        request.parent.html('').append(iframe);
        var template = doT.compile(Razorpay.templates.autosubmit)(response);
        iframe.contentWindow.document.write(template);
        request.parent.addClass('rzp-frame');
        return;
      }
      else if (response.redirectUrl){
        // TODO tests for this
        request.parent.addClass('rzp-frame').html('<iframe src=' + response.redirectUrl + '></iframe>');
        return;
      }
      else if (response.status) {
        if(typeof request.success == 'function')
          request.success()
      }
      else {
        if(typeof request.error == 'function')
          request.error()
      }
    }
  }

  Razorpay.prototype.submit = function(request){
    // TODO what's to be done for netbanking?
    // TODO better validation
    // data['card[number]'] = data['card[number]'].replace(/\ /g, '');
    // data['card[expiry_month]'] = expiry[0];
    // data['card[expiry_year]'] = expiry[1];

    // var source = options.protocol + '://' + options.hostname;

    lastRequestInstance = request
    
    return $.ajax({
      url: options.protocol + '://' + options.key + '@' + options.hostname + '/' + options.version + options.jsonpUrl,
      dataType: 'jsonp',
      success: successHandler(request),
      timeout: 35000,
      error: errorHandler(request),
      data: request.data
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
