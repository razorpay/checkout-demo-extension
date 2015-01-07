/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.$;
  var doT = Razorpay.doT;
  var XD = Razorpay.XD;
  var discreet = {};

  // TODO add style link to insert
  var defaults = {
    protocol: 'https',
    hostname: 'api.razorpay.com',
    version: 'v1',
    jsonpUrl: '/payments/create/jsonp',
    key: '',
    handler: function(){},
    // checkout fields, not needed for razorpay alone
    currency: 'INR',
    netbanking: true,
    prefill: {
      name: '',
      contact: '',
      email: ''
    },
    amount: '',
    name: '', // of merchant
    description: '',
    image: '',
    notes: {}
  };

  var lastRequestInstance = null;

  discreet.XDCallback = function(message){
    if(!lastRequestInstance){
      return;
    }

    if (message.data.error && message.data.error.description){
      if(typeof lastRequestInstance.failure === 'function'){
        lastRequestInstance.failure(message.data);
      }
    } else {
      if(typeof lastRequestInstance.success === 'function'){
        lastRequestInstance.success(message.data);
      }
    }

    lastRequestInstance = null;

    // remove postMessage listener
    XD.receiveMessage();
  };

  discreet.success = function(req){
    var request = req || {};
    if(!(request.parent instanceof $)){
      // TODO remove docu.body
      request.parent = $('body');
    }

    return function(response){
      if (response['http_status_code'] !== 200 && response.error){
        if(typeof request.failure === 'function'){
          request.failure(response);
        }
      }
      else if (response.callbackUrl){
        if(typeof request.prehandler === 'function'){
          request.prehandler();
        }
        var iframe = document.createElement('iframe');
        request.parent.html('').append(iframe);
        var template = doT.compile(Razorpay.templates.autosubmit)(response);
        iframe.contentWindow.document.write(template);
        return;
      }
      else if (response.redirectUrl){
        if(typeof request.prehandler === 'function'){
          request.prehandler();
        }

        // TODO tests for this
        request.parent.html('<iframe src=' + response.redirectUrl + '></iframe>');
        return;
      }
      else if (response.status) {
        if(typeof request.success === 'function'){
          request.success(response);
        }
      }
      else {
        if(typeof request.failure === 'function'){
          request.failure(response);
        }
      }
    };
  };

  /**
    method for payment data submission to razorpay api
    @param request  contains payment data and optionally callbacks to success, failure and element to put iframe in
  */
  Razorpay.prototype.submit = function(request){

    // window.p = window.open('', "", "width=600, height=400, scrollbars=yes");
    // TODO what's to be done for netbanking?
    // TODO better validation
    // data['card[number]'] = data['card[number]'].replace(/\ /g, '');
    // data['card[expiry_month]'] = expiry[0];
    // data['card[expiry_year]'] = expiry[1];
    if(typeof request.data !== 'object'){
      return false;
    }

    var errors = this.validateData(request.data);
    if(errors && errors.length){
      return false;
    }

    // setting up XD
    lastRequestInstance = request;
    XD.receiveMessage(); // remove previous listener
    var source = this.options.protocol + '://' + this.options.hostname;
    XD.receiveMessage(discreet.XDCallback, source);

    return $.ajax({
      url: this.options.protocol + '://' + this.options.key + '@' + this.options.hostname + '/' + this.options.version + this.options.jsonpUrl,
      dataType: 'jsonp',
      success: discreet.success(request),
      timeout: 35000,
      failure: request.failure,
      data: request.data
    });
  };

  Razorpay.prototype.configure = function(overrides){
    this.validateOptions(overrides, true);
    this.options = this.options || {};

    for (var i in defaults){
      if(typeof overrides[i] === 'undefined' && typeof this.options[i] === 'undefined'){
        this.options[i] = defaults[i];
      } else{
        this.options[i] = overrides[i];
      }
    }
  };

  /**
   * Validates options TODO
   * throwError = bool // throws an error if true, otherwise returns object with the state
   * options = object
   *
   * return object
  */
  Razorpay.prototype.validateOptions = function(options, throwError){
    if (typeof options === 'undefined') {
      throw new Error('No options specified');
    }
    if (typeof options.key === 'undefined') {
      throw new Error('No merchant key specified');
    }
  };

  // TODO validate data
  Razorpay.prototype.validateData = function(data, throwError){
    var errors = [];

    if (!this.options.amount || typeof this.options.amount !== 'number' || this.options.amount < 0) {
      errors.push({
        message: "Invalid amount specified",
        field: "amount"
      });
    }

    if (typeof this.options.key === "undefined") {
      errors.push({
        message: "No merchant key specified",
        field: "key"
      });
    }

    if (this.options.key === "") {
      errors.push({
        message: "Merchant key cannot be empty",
        field: "key"
      });
    }

    // if (typeof options.notes === 'object' && Object.keys(options.notes).length > 15) {
    //   message = "You can only pass at most 15 fields in the notes object";
    //   field = "notes";
    // }

    // if(message !== "" && throwError === true){
    //   throw new Error("Field: " + field + "; Error:" + message);
    // }
    // if(message === ""){
    //   return {error: false};
    // }
    // else {
    //   return {
    //     error: {
    //       description: message,
    //       field: field
    //     }
    //   };
    // }
  };

  // TODO replace this with validateData and validateOptions
  Razorpay.prototype.validate = function(options, throwError){
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
    else if (typeof options.handler !== 'undefined' && !$.isFunction(options.handler)) {
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
    else if (typeof options.notes === 'object' && Object.keys(options.notes).length > 15) {
      message = "You can only pass at most 15 fields in the notes object";
      field = "notes";
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
  };
  // @if NODE_ENV='test'
  window.discreet = discreet;
  // @endif
})();
