/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var Hedwig = Razorpay.prototype.Hedwig;
  var Popup = Razorpay.prototype.Popup;
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
    parent: null
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

  discreet.XDCallback = function(message, data){
    if(data.source === 'frame'){
      if(discreet.onFrameMessage && message.origin && discreet.checkoutUrl.indexOf(message.origin) != -1){
        discreet.onFrameMessage.call(this.rzp, data);
      }
      return
    }

    // this == request
    // checking source url
    if(!(this.popup.window === message.source || /^https:\/\/[a-z]+\.razorpay\.com/.test(message.origin))){
      return;
    }
    
    if(data.source === 'popup'){
      if(!this.popup._loaded){
        this.popup._loaded = true;
        this.popup.loaded();
      }
      return;
    }

    // Close the popup in case of netbanking
    if(typeof this.popup !== 'undefined'){
      this.popup.close();
    }

    if (data.error && data.error.description){
      if(typeof this.error === 'function'){
        this.error(data);
      }
    } else {
      if(typeof this.success === 'function'){
        this.success(data);
      }
    }

    // remove postMessage listener
    discreet.removeMessageListener();
  };

  discreet.apiResponseHandler = {
    '1' : function(response){
      // this == request

      var payment_id = response.payment_id;
      var error = response.error;
      var request = response.request;
      var success = response.success;

      if(!payment_id || typeof error == 'object'){
        return discreet.error.call(this, response);
      }

      else if(success){
        return 
      }
      
      else if(typeof request == 'object'){
        if(request.url){
          return discreet.navigatePopup.call(this, request);
        }
      }
    }
  }

  discreet.error = function(response){
    // this == request
    if(this.popup && typeof this.popup.close == 'function'){
      this.popup.close();
    }
    if(typeof this.error == 'function'){
      this.error.call(null, response); // dont expose request as this
    }
  }
  discreet.success = function(response){
    // this == request
    if(this.popup && typeof this.popup.close == 'function'){
      this.popup.close();
    }
    if(typeof this.success == 'function'){
      this.success.call(null, response); // dont expose request as this
    }
  }

  discreet.getSuccessHandler = function(request){
    return function(response){
      if(response.version){
        var successCallback = discreet.apiResponseHandler[response.version];
        if(typeof successCallback == 'function'){
          return successCallback.call(request, response);
        }
      }    

      // else version 0
      if (response['http_status_code'] !== 200){
        discreet.error.call(request, response);
      }
      
      else if (response.callbackUrl){
        var nextRequest = {
          autosubmit: response.data,
          rzp: 1
        }
        nextRequest.autosubmit.callbackUrl = response.callbackUrl;
        discreet.navigatePopup.call(request, nextRequest);
      }
      
      else if (response.redirectUrl){
        var nextRequest = {
          location: response.redirectUrl,
          rzp: 1
        }
        discreet.navigatePopup.call(request, nextRequest);
      }
      
      else if (response.razorpay_payment_id) {
        response.payment_id = response.razorpay_payment_id;
        response.success = true;
        delete response.razorpay_payment_id;
        discreet.success.call(request, response);
      }
      
      else discreet.error.call(request, response);
    }
  }
  discreet.setupPopup = function(request){
    var rzp = request.rzp;
    if(!rzp.hedwig){
      rzp.hedwig = new Hedwig({
        ccHubLocation: rzp.options.protocol + '://' + rzp.options.hostname + '/crossCookies.php'
      });
    }
    
    discreet.addMessageListener(discreet.XDCallback, request);

    var popup = request.popup = new Popup(rzp.options.protocol + '://' + rzp.options.hostname + '/' + 'processing.php');

    if (typeof request.error == 'function'){
      popup.onClose(discreet.getPopupClose(request));  
    }
    
    popup._loaded = false;
    popup.loaded = function(){};
  }

  discreet.navigatePopup = function(nextRequest){
    // this == request
    var popup = this.popup;
    if(!popup){
      return this.error({
        error: {
          description: 'Unable to navigate to bank site'
        }
      })
    }

    var rzp = this.rzp;
    popup.loaded = function(){
      rzp.hedwig.sendMessage(nextRequest, '*', popup.window);
    }

    if(popup._loaded === true){
      popup.loaded();
    }
  }

  discreet.getPopupClose = function(request){
    return function(){
      request.error({
        error: {
          description: 'Payment cancelled'
        }
      })
    }
  }

  Razorpay.prototype.makeUrl = function(){
    return this.options.protocol + '://' + this.options.hostname + '/' + this.options.version;
  }

  /**
    method for payment data submission to razorpay api
    @param request  contains payment data and optionally callbacks to success, error and element to put iframe in
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

    request.data.key_id = this.options.key;
    request.rzp = this;

    discreet.setupPopup(request);

    return $.ajax({
      url: this.makeUrl() + this.options.jsonpUrl,
      dataType: 'jsonp',
      success: discreet.getSuccessHandler(request),
      timeout: 35000,
      error: request.error,
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

    if(typeof this.hedwig === 'undefined'){
      this.hedwig = new Hedwig({
        ccHubLocation: this.options.protocol + '://' + this.options.hostname + '/crossCookies.php'
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

    if(typeof this.validateCheckout == 'function'){
      this.validateCheckout(options, errors);
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

  discreet.getNetbankingList = function(rzp){
    $.ajax({
      url: rzp.makeUrl() + rzp.options.netbankingListUrl,
      data: {
        key_id: rzp.options.key
      },
      dataType: 'jsonp',
      success: function(response){
        rzp.options.netbankingList = response;
        
        if(typeof rzp.options.netbankingListCB == 'function'){
          var callback_param;
          if (response['http_status_code'] !== 200 && response.error){
            callback_param = {error: true};
          } else{
            callback_param = response;
          }
          rzp.options.netbankingListCB(callback_param);
        }
      },
      timeout: 30000,
      error: function(response){
        if(typeof rzp.options.netbankingListCB == 'function'){
          rzp.options.netbankingListCB({error: true});
        }
      }
    });
  }

  Razorpay.prototype.getNetbankingList = function(callback){
    if(typeof this.options.netbankingList === "undefined" ){
      this.options.netbankingListCB = callback;
    } else {
      callback(this.options.netbankingList);
    }
  }

  // @if NODE_ENV='test'
  discreet.getNetbankingList = function(){
    return;
  }
  window.discreet = discreet;
  // @endif
})();
