var discreet = {};

var _base_set = function(baseval, override) {
  if ( typeof baseval === 'object' ) {
    if( !baseval ){
      return typeof override === 'boolean' ? override : baseval;
    }

    if( !override || typeof override !== 'object' ){
      override = {};
    }
    return map( baseval, function(val, i){
      return _base_set( val, override[i] );
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

var _base_validateOptions = function(options) {
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

var _base_configure = function(overrides){
  if( !overrides || typeof overrides !== 'object' ) {
    throw new Error('Invalid options');
  }

  var options = _base_set( Razorpay.defaults, overrides );

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

  _base_validateOptions( options );

  return options;
}

Razorpay.prototype.configure = function(overrides){
  this._overrides = overrides;
  this.options = _base_configure(overrides);
  this.modal = {options: {}};
};

Razorpay.configure = function(overrides) {
  Razorpay.defaults = _base_configure(overrides);
  if ( typeof discreet.setCommunicator === 'function' ) {
    discreet.setCommunicator();
  }
}

discreet.makeUrl = function(options, noVersion){
  return options.protocol + '://' + options.hostname + '/' + (noVersion ? '' : options.version);
}

discreet.nextRequestRedirect = function(data){
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
};
