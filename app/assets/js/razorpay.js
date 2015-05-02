/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var discreet = Razorpay.prototype.discreet;

  // TODO add style link to insert
  var defaults = {
    protocol: 'https',
    hostname: 'api.razorpay.com',
    version: 'v1',
    jsonpUrl: '/payments/create/jsonp',
    netbankingListUrl: '/banks',
    key: '',
    handler: null,
    // checkout fields, not needed for razorpay alone
    currency: 'INR',
    display_currency: '',
    netbanking: true,
    prefill: {
      name: '',
      contact: '',
      email: ''
    },
    amount: '',
    display_amount: '',
    name: '', // of merchant
    description: '',
    image: '',
    notes: {},
    signature: '',
    oncancel: null,
    onhidden: null,
    parent: null,
    redirect: true
  };

  discreet.getMessageCallback = function(callback, context){
    return function(e){
      if(!e || !e.data || typeof callback != 'function'){
        return;
      }
      var data = e.data;
      if(typeof data == 'string'){
        try {
          data = JSON.parse(data);
        }
        catch(e){
          data = {
            error: {
              description: 'Unable to parse response'
            }
          }
        }
      }
      callback.call(context, e, data);
    }
  }

  discreet.listener = null;
  
  discreet.addMessageListener = function(callback, context) {
    discreet.listener = discreet.getMessageCallback(callback, context);
    if (window.addEventListener) {
      window.addEventListener('message', discreet.listener, false);
    } else if(window.attachEvent){
      window.attachEvent('onmessage', discreet.listener);
    }
  }

  discreet.removeMessageListener = function() {
    if (window.removeEventListener) {
      window.removeEventListener('message', discreet.listener, false);
    } else if(window.detachEvent){
      window.detachEvent('onmessage', discreet.listener);
    }
  }

  Razorpay.prototype.configure = function(overrides){
    this.validateOptions(overrides, true);
    this.options = this.options || {};

    for (var i in defaults){
      if(i === 'prefill'){
        continue;
      }
      else if(typeof overrides[i] === 'undefined' && typeof this.options[i] === 'undefined'){
        this.options[i] = defaults[i];
      }
      else {
        if(typeof defaults[i] == 'string' && typeof overrides[i] != 'string'){
          this.options[i] = String(overrides[i]);
        } else {
          this.options[i] = overrides[i];
        }
      }
    }

    this.options['prefill'] = {};
    for(var i in defaults['prefill']){
      if(typeof overrides['prefill'] === 'undefined' || typeof overrides['prefill'][i] === 'undefined'){
        this.options['prefill'][i] = defaults['prefill'][i];
      }
      else {
        this.options['prefill'][i] = overrides['prefill'][i];
      }
    }

    if(typeof discreet.initRazorpay == 'function'){
      discreet.initRazorpay.call(this);
    } else if(typeof discreet.initCheckout == 'function'){
      discreet.initCheckout.call(this);
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
    var errors = [];

    if (typeof options == 'undefined') {
      errors.push({
        message: 'no initialization options are passed',
        field: ''
      });
    }

    if (typeof options != 'object') {
      errors.push({
        message: 'passed initialization options are invalid',
        field: ''
      });
    }

    if (typeof options.key == 'undefined') {
      errors.push({
        message: 'No merchant key specified',
        field: 'key'
      });
    }

    if (options.key == "") {
      errors.push({
        message: 'Merchant key cannot be empty',
        field: 'key'
      });
    }

    var amount = parseInt(options.amount);
    options.amount = String(options.amount);
    if (!amount || typeof amount !== 'number' || amount < 0 || options.amount.indexOf('.') !== -1) {
      errors.push({
        message: 'Invalid amount specified',
        field: 'amount'
      });
    }

    if (typeof options.notes === 'object'){
      // Object.keys unsupported in old browsers
      var notesCount = 0;
      for(var note in options.notes){
        notesCount++;
      }
      if(notesCount > 15) {
        errors.push({
          message: 'You can only pass at most 15 fields in the notes object',
          field: 'notes'
        });
      }
    }

    if ((typeof options.handler != 'undefined') && (typeof options.handler != 'function')){
      errors.push({
        message: 'Handler must be a function',
        field: 'handler'
      });
    }

    if(typeof discreet.validateCheckout == 'function'){
      discreet.validateCheckout.call(this, options, errors);
    }

    if(!throwError){
      return errors;
    } else {
      if(errors.length > 0){
        var field = errors[0].field;
        var message = errors[0].message;
        throw new Error("Field: " + field + "; Error:" + message);
        return;
      }
    }
  };

  // TODO validate data
  Razorpay.prototype.validateData = function(data, throwError){
    var errors = [];

    var amount = parseInt(this.options.amount);
    if (!amount || typeof amount !== 'number' || amount < 0) {
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

    if(errors.length && throwError){
      throw new Error("Field: " + errors[0].field + "; Error:" + errors[0].message);
    } else {
      return errors;
    }
  };

  discreet.environment = (function(){
    var script = document.currentScript || {src: ''};
    var src = script.src;

    var list = {
      beta: 'betacheckout.razorpay.com',
      production: 'checkout.razorpay.com',
    }

    var env = 'dev';
    for(var i in list){
      if(src.indexOf(list[i]) !== -1){
        env = i;
      }
    }

    return env;
  })();

  discreet.makeUrl = function(rzp){
    return rzp.options.protocol + '://' + rzp.options.hostname + '/' + rzp.options.version;
  }

  Razorpay.prototype.getNetbankingList = function(callback){
    var rzp = this;
    return $.ajax({
      url: discreet.makeUrl(this) + this.options.netbankingListUrl,
      data: {key_id: this.options.key},
      timeout: 30000,
      dataType: 'jsonp',
      success: function(response){
        rzp.netbankingList = response;
        
        if(typeof callback == 'function'){
          var callback_param;
          if (response['http_status_code'] !== 200 && response.error){
            callback_param = {error: true};
          } else{
            callback_param = response;
          }
          callback(callback_param);
        }
      },
      error: function(response){
        if(typeof callback == 'function'){
          callback({error: true});
        }
      }
    });
  }

  // @if NODE_ENV='test'
  Razorpay.prototype.getNetbankingList = function(){
    return;
  }
  window.discreet = discreet;
  // @endif
})();
