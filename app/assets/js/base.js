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
    methodsUrl: '/methods',
    key: '',
    handler: $.noop,

    // automatic checkout only
    buttontext: 'Pay Now',

    // checkout fields, not needed for razorpay alone
    currency: 'INR',
    display_currency: '',

    method: {
      netbanking: null,
      card: null,
      wallet: {
        paytm: false
      }
    },
    prefill: {
      name: '',
      contact: '',
      email: ''
    },
    modal: {
      ondismiss: $.noop,
      onhidden: $.noop
    },
    amount: '',
    display_amount: '',
    name: '', // of merchant
    description: '',
    image: '',
    notes: {},
    signature: '',
    parent: null,
    redirect: false
  };
  /**
   * Cross Domain Post Message
   * Generic functions
   */
  discreet.xdm = {
    _getMessageCallback:  function(callback, context){
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
    },

    _listener: null,

    addMessageListener: function(callback, context) {
      if(discreet.xdm._listener){
        discreet.xdm.removeMessageListener();
      }
      discreet.xdm._listener = discreet.xdm._getMessageCallback(callback, context);
      if (window.addEventListener) {
        window.addEventListener('message', discreet.xdm._listener, false);
      } else if(window.attachEvent){
        window.attachEvent('onmessage', discreet.xdm._listener);
      }
    },

    removeMessageListener: function() {
      if (window.removeEventListener) {
        window.removeEventListener('message', discreet.xdm._listener, false);
      } else if(window.detachEvent){
        window.detachEvent('onmessage', discreet.xdm._listener);
      }
      discreet.xdm._listener = null;
    }
  }

  discreet.setOption = function(key, options, overrides, defaults){
    var defaultValue = defaults[key];
    if(typeof overrides != 'object'){
      if(!(key in options)){
        options[key] = defaultValue;
      }
      return;
    }

    var overrideValue = overrides[key];
    if(typeof defaultValue == 'string' && typeof overrideValue != 'undefined' && typeof overrideValue != 'string'){
      overrideValue = String(overrideValue);
    }

    if(typeof overrideValue == typeof defaultValue){
      options[key] = overrideValue;
    } else if(!(key in options)){
      options[key] = defaultValue;
    }
  }

  Razorpay.prototype.configure = function(overrides){
    this.validateOptions(overrides, true);
    this.options = this.options || {};

    for (var i in defaults){
      if(defaults[i] !== null && typeof defaults[i] == 'object'){
        if(i == 'notes'){
          this.options.notes = {};
          if(typeof overrides.notes == 'object'){
            for (var j in overrides.notes){
              if(typeof overrides.notes[j] == 'string'){
                this.options.notes[j] = overrides.notes[j];
              }
            }
          }
        } else if (i == 'method') {
          this.options.method = $.extend({}, defaults.method);
          if(typeof overrides.method == 'object'){
            for(var j in defaults.method){
              if(typeof overrides.method[j] == 'boolean'){
                this.options.method[j] = overrides.method[j]
              }
            }
          }
        } else {
          var subObject = defaults[i];
          this.options[i] = this.options[i] || {};
          for(var j in subObject){
            discreet.setOption(j, this.options[i], overrides[i], subObject);
          }
        }
      }
      else discreet.setOption(i, this.options, overrides, defaults);
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

    else if (typeof options != 'object') {
      errors.push({
        message: 'passed initialization options are invalid',
        field: ''
      });
    }

    if(!errors.length){
      if (typeof options.key == 'undefined') {
        errors.push({
          message: 'No merchant key specified',
          field: 'key'
        });
      }

      if (options.key === "") {
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

      if (typeof options.name === 'undefined'){
        errors.push({
          message: 'Merchant name cannot be empty',
          field: 'name'
        })
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

      if (options.handler && typeof options.handler != 'function'){
        errors.push({
          message: 'Handler must be a function',
          field: 'handler'
        });
      }

      /**
       * There are some options which are checkout specific only
       */
      if(typeof discreet.validateCheckout == 'function'){
        discreet.validateCheckout.call(this, options, errors);
      }
    }

    if(!throwError){
      return errors;
    } else {
      if(errors.length > 0){
        var field = errors[0].field;
        var message = errors[0].message;
        var errorMessage = '{"field":"' + field + '","error":"' + message + '"}';
        throw new Error(errorMessage);
        return;
      }
    }
  };

  // TODO validate data
  /**
   * Validation of data during the time of submitting data
   * to our server through the ajax request
   */
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

  discreet.makeUrl = function(rzp){
    return rzp.options.protocol + '://' + rzp.options.hostname + '/' + rzp.options.version;
  }
})();
