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
    netbankingListUrl: '/banks',
    key: '',
    handler: '',
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
    notes: {},
    signature: ''
  };

  var lastRequestInstance = null;

  discreet.XDCallback = function(message){
    /**
     * Popup sends an XDM message to tell that it has loaded
     * Ignore that
     */
    if(message.data.source === 'popup'){
      lastRequestInstance.popup._loaded = true;
      lastRequestInstance.popup.loaded();
      return;
    }

    if(!lastRequestInstance){
      return;
    }
    // Close the popup in case of netbanking
    if(typeof lastRequestInstance.popup !== 'undefined'){
      lastRequestInstance.popup.close();
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

  /**
   * Handles success callback of ajax request
   * This is where different actions are taken for CC/3DS/NB
   */
  discreet.success = function(req){
    var request = req || {};
    if(!(request.parent instanceof $)){
      // TODO remove docu.body
      request.parent = $('body');
    }

    return function(response){
      if (response['http_status_code'] !== 200 && response.error){
        if(typeof request.popup !== 'undefined'){
          request.popup.close();
        }
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
        // request.parent.html('<iframe src=' + response.redirectUrl + '></iframe>');

        // Popup for netbanking
        discreet.redirectPopup(request, response.redirectUrl);
        return;
      }
      else if (response.razorpay_payment_id) {
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

  discreet.setupPopup = function(rzp, request){
    var popup = request.popup = new Razorpay.Popup('');
    popup.location(rzp.options.protocol + '://' + rzp.options.hostname + '/' + 'processing.html');
    popup.onClose(discreet.popupClose);
    popup._loaded = false;
    popup.loaded = function(){};
  }

  discreet.redirectPopup = function(request, location){
    var popup = request.popup;

    popup.loaded = function(){
      XD.postMessage({
        rzp: true,
        location: location
      }, '*', popup.window);
    }

    if(popup._loaded === true){
      popup.loaded();
    }
  }

  discreet.popupClose = function(){
    lastRequestInstance.failure({
      error: {
        description: 'Payment cancelled'
      }
    });
  }

  Razorpay.prototype.makeUrl = function(){
    return this.options.protocol + '://' + this.options.hostname + '/' + this.options.version;
  }

  /**
    method for payment data submission to razorpay api
    @param request  contains payment data and optionally callbacks to success, failure and element to put iframe in
  */
  Razorpay.prototype.submit = function(request){

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

    if(request.data.method === 'netbanking'){
      discreet.setupPopup(this, request);
    }

    // setting up XD
    lastRequestInstance = request;
    XD.receiveMessage(); // remove previous listener
    var source = this.options.protocol + '://' + this.options.hostname;
    XD.receiveMessage(discreet.XDCallback, source);

    request.data.key_id = this.options.key;

    return $.ajax({
      url: this.makeUrl() + this.options.jsonpUrl,
      dataType: 'jsonp',
      success: discreet.success(request),
      timeout: 35000,
      error: request.failure,
      data: request.data
    });
  };

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
        this.options[i] = overrides[i];
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

    var rbPayload = $.extend(true, {}, this.options);
    delete rbPayload.notes;
    delete rbPayload.prefill;

    if(typeof Rollbar !== 'undefined' && Razorpay.rollbarDisable !== true){
      Rollbar.configure({
        payload: {
          config: rbPayload
        }
      });
    }

    discreet.getNetbankingList(this);
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

    if (typeof options === 'undefined') {
      errors.push({
        message: "No options defined",
        field: "options"
      });
    }

    if (typeof options.key === 'undefined') {
      errors.push({
        message: "No merchant key specified",
        field: "key"
      });
    }

    if (options.key === "") {
      errors.push({
        message: "Merchant key cannot be empty",
        field: "key"
      });
    }

    var amount = parseInt(options.amount);
    options.amount = String(options.amount);
    if (!amount || typeof amount !== 'number' || amount < 0 || options.amount.indexOf('.') !== -1) {
      errors.push({
        message: "Invalid amount specified",
        field: "amount"
      });
    }

    if (typeof options.notes === 'object'){
      // Object.keys unsupported in old browsers
      var notesCount = 0
      for(var note in options.notes){
        notesCount++
      }
      if(notesCount > 15) {
        errors.push({
          message: "You can only pass at most 15 fields in the notes object",
          field: "notes"
        });
      }
    }

    if (typeof options.handler !== 'undefined' && !$.isFunction(options.handler)) {
      errors.push({
        message: "Handler must be a function",
        field: "handler"
      });
    }

    if(typeof throwError === 'undefined'){
      return errors;
    }
    else if(throwError === true){
      if(errors.length > 0){
        var field = errors[0].field;
        var message = errors[0].message;
        throw new Error("Field: " + field + "; Error:" + message);
      }
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

  discreet.rzpscript = document.currentScript || (function() {
    var scripts;
    scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  discreet.loader = function(id){
    var src = discreet.rzpscript.src.replace(/\/[^\/]+$/,'/images/loader-logo.png');
    return doT.compile(Razorpay.templates.loader)({
      src: src,
      id: id || ''
    });
  }

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

  Razorpay.prototype.Rollbar = {
    state: false,

    configure: function(){
      if(discreet.environment !== 'dev'){
        Rollbar.configure({
          payload: {
            environment: discreet.environment
          }
        });
      }
    },

    _check: function(){
      if(typeof Rollbar !== 'undefined' && discreet.environment !== 'dev' && Razorpay.rollbarDisable !== true){
        return true;
      }
      else {
        return false;
      }
    },

    start: function(){
      if(this._check() === false){
        return;
      }
      this.state = true;
      Rollbar.configure({enabled: true});
    },

    stop: function(){
      if(this._check() === false){
        return;
      }
      this.state = false;
      Rollbar.configure({enabled: false})
    }
  }

  discreet.getNetbankingList = function(rzp){
    $.ajax({
      url: rzp.makeUrl() + rzp.options.netbankingListUrl,
      data: {
        key_id: rzp.options.key
      },
      dataType: 'jsonp',
      success: function(response){
        if (response['http_status_code'] !== 200 && response.error){
          callback({error: true});
        }

        rzp.options.netbankingList = response;

        if(typeof rzp.options.netbankingListCB !== 'undefined'){
          rzp.options.netbankingListCB(response);
        }
      },
      timeout: 30000,
      error: function(response){
        callback({error: true});
      }
    });
  }

  Razorpay.prototype.getNetbankingList = function(callback){
    if(typeof this.options.netbankingList === "undefined" ){
      this.options.netbankingListCB = callback;
      return;
    }

    callback(this.options.netbankingList);
  }

  // @if NODE_ENV='test'
  discreet.getNetbankingList = function(){
    return;
  }
  window.discreet = discreet;
  // @endif
})();
