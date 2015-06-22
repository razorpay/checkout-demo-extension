/* global Razorpay */
/* jshint -W027 */
(function(){
  'use strict';

  var $ = Razorpay.prototype.$;
  var discreet = Razorpay.prototype.discreet;

  // TODO add style link to insert
  discreet.defaults = {
    protocol: 'https',
    hostname: 'api.razorpay.com',
    version: 'v1',
    jsonpUrl: '/payments/create/jsonp',
    methodsUrl: '/methods',
    key: '',
    amount: '',
    currency: 'INR',
    handler: $.noop,
    notes: {},
    redirect: false,
    description: '',

    // automatic checkout only
    buttontext: 'Pay Now',

    // checkout fields, not needed for razorpay alone
    display_currency: '',

    method: {
      netbanking: null,
      card: null,
      wallet: {}
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
    signature: '',
    display_amount: '',
    name: '', // of merchant
    image: '',
    parent: null,
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
      $(window).on('message', discreet.xdm._listener);
    },

    removeMessageListener: function() {
      $(window).off('message', discreet.xdm._listener);
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
    this.options = discreet.configure(overrides);

    if(typeof discreet.initHedwig == 'function'){
      discreet.initHedwig.call(this);
    }
    if(typeof discreet.initCheckout == 'function'){
      discreet.initCheckout.call(this);
    }
  };

  discreet.configure = function(overrides){
    discreet.validateOptions(overrides, true);

    var options = {};
    var defaults = discreet.defaults;
    for (var i in defaults){
      if(defaults[i] !== null && typeof defaults[i] == 'object'){
        if(i == 'notes'){
          options.notes = {};
          if(typeof overrides.notes == 'object'){
            for (var j in overrides.notes){
              if(typeof overrides.notes[j] == 'string'){
                options.notes[j] = overrides.notes[j];
              }
            }
          }
        } else if (i == 'method') {
          options.method = $.extend({}, defaults.method);
          if(typeof overrides.method == 'object'){
            if(typeof overrides.method.wallet == 'object'){
              for(var j in overrides.method.wallet){
                if(typeof overrides.method.wallet[j] == 'boolean')
                  options.method.wallet[j] = overrides.method.wallet[j];
              }
            }
            if(typeof overrides.method.card == 'boolean')
              options.method.card = overrides.method.card;
            if(typeof overrides.method.netbanking == 'boolean')
              options.method.netbanking = overrides.method.netbanking;
          }
        } else {
          var subObject = defaults[i];
          options[i] = options[i] || {};
          for(var j in subObject){
            discreet.setOption(j, options[i], overrides[i], subObject);
          }
        }
      }
      else discreet.setOption(i, options, overrides, defaults);
    }
    return options;
  }

  /**
   * Validates options TODO
   * throwError = bool // throws an error if true, otherwise returns object with the state
   * options = object
   *
   * return object
  */
  discreet.validateOptions = function(options, throwError){
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

      /**
       * There are some options which are checkout specific only
       */
      if(typeof discreet.validateCheckout == 'function'){
        discreet.validateCheckout(options, errors);
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

  discreet.makeUrl = function(options){
    return options.protocol + '://' + options.hostname + '/' + options.version;
  }
})();
