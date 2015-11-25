function base_set(baseval, override) {
  if ( typeof baseval === 'object' ) {
    if( !baseval ){
      return typeof override === 'boolean' ? override : baseval;
    }

    if( !override || typeof override !== 'object' ){
      override = {};
    }
    return map( baseval, function(val, i){
      return base_set( val, override[i] );
    })
  }

  if ( typeof baseval === 'string' && typeof override !== 'undefined' ) {
    return String(override);
  }

  if ( typeof baseval === typeof override ) {
    return override;
  }

  return baseval;
}

function base_validateOptions(options) {
  var errorMessage;

  if (!options.key) {
    errorMessage = 'key';
  }

  var notesCount = 0;
  each(options.notes, function() {
    notesCount++;
  })
  if(notesCount > 15) { errorMessage = 'notes (At most 15 notes are allowed)' }

  /**
   * There are some options which are checkout specific only
   */
  if( typeof discreet.validateCheckout === 'function' ) {
    errorMessage = discreet.validateCheckout(options);
  }

  if( errorMessage ){ throw new Error('Invalid option: ' + errorMessage) }
}

function base_configure(overrides){
  if( !overrides || typeof overrides !== 'object' ) {
    throw new Error('Invalid options');
  }

  var options = base_set( Razorpay.defaults, overrides );

  each(overrides.notes, function(key, val){
    if ( typeof val === 'string' ) {
      options.notes[key] = val;
    }
  })
  try {
    if( typeof overrides.method.wallet === 'boolean' ) {
      options.method.wallet = overrides.method.wallet;
    }
  } catch(e){}

  base_validateOptions( options );

  if(typeof overrides.key === 'string' && overrides.key.indexOf('rzp_live_')){
    _uid = null;
  }

  if(!discreet.isFrame){
    var trackingPayload = $.clone(overrides);
    trackingPayload.meta = {
      ua: ua,
      cb: !!window.CheckoutBridge,
      context: location.href,
      co: !!discreet.isCheckout
    }
    track('init', trackingPayload);
  }

  discreet.setCommunicator(options);
  return options;
}

Razorpay.prototype.configure = function(overrides){
  this.options = base_configure(overrides);
  this.modal = {options: {}};
};

Razorpay.configure = function(overrides) {
  Razorpay.defaults = base_configure(overrides);
}

var discreet = {
  setCommunicator: noop,
  makeUrl: function(options, noVersion){
    return options.protocol + '://' + options.hostname + '/' + (noVersion ? '' : options.version);
  },

  nextRequestRedirect: function(data){
    if(window !== window.parent && typeof Razorpay.sendMessage === 'function'){
      return Razorpay.sendMessage({event: 'redirect', data: data});
    }
    if(data.method === 'get'){
      location.href = data.url;
    } else if (data.method === 'post' && typeof data.content === 'object'){
      var postForm = document.createElement('form');
      var html = '';

      each( data.content, function(name, value) {
        html += '<input type="hidden" name="' + name + '" value="' + value + '">'
      })
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
}
