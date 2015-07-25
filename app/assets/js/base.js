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
    callback_url: '',
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
      email: '',
      card: {
        number: '',
        expiry_month: '',
        expiry_year: ''
      }
    },
    modal: {
      ondismiss: $.noop,
      onhidden: $.noop,
      escape: true,
      animation: true,
      backdropClose: true
    },
    signature: '',
    display_amount: '',
    name: '', // of merchant
    image: ''
  };
  /**
   * Cross Domain Post Message
   * Generic functions
   */
  discreet.xdm = {
    _getMessageCallback:  function(callback, context){
      return function(e){
        if(e.originalEvent)
          e = e.originalEvent;
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
      var winref = $(window).on('message', discreet.xdm._listener);
      if(typeof winref == 'function') discreet.xdm._listener = winref; // if listener is returned by minimal-$
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
    this.modal = {options: {}};

    if(typeof discreet.initHedwig == 'function'){
      discreet.initHedwig.call(this);
    }
    if(typeof discreet.initCheckout == 'function'){
      discreet.initCheckout.call(this);
    }
  };

  discreet.configure = function(overrides){
    if(typeof overrides != 'object'){
      throw new Error("invalid options passed");
    }
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
        } else if (i == 'prefill') {
          options.prefill = JSON.parse(JSON.stringify(defaults.prefill));
          var op = overrides.prefill;
          if(typeof op == 'object'){
            for(var j in defaults.prefill){
              if(typeof op[j] == 'object'){
                for(var k in op[j]){
                  if(k in defaults.prefill[j])
                    options.prefill[j][k] = '' + op[j][k];
                }
              } else if(j in op) {
                options.prefill[j] = '' + op[j];
              }
            }
          }
        } else if (i == 'method') {
          options.method = JSON.parse(JSON.stringify(defaults.method));
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
    discreet.validateOptions(options, true);
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

  discreet.nextRequestRedirect = function(data){
    if(window !== window.parent && typeof Razorpay.sendMessage == 'function'){
      return Razorpay.sendMessage({event: 'redirect', data: data});
    }
    if(data.method == 'get'){
      location.href = data.url;
    } else if (data.method === 'post' && typeof data.content == 'object'){
      var postForm = document.createElement('form');
      var html = '';

      for(var i in data.content){
        html += '<input type="hidden" name="' + i + '" value="' + data.content[i] + '">'
      }
      postForm.method='post';
      postForm.innerHTML = html;
      postForm.action = data.url;
      document.body.appendChild(postForm);
      postForm.submit();
    } else {
      var errorData = {
        error: {
          description: 'Server Error'
        }
      };
      discreet.error.call(this, errorData);
    }
  }
})();
