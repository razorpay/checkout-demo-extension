Razorpay.prototype.configure = function(overrides){
  this._overrides = overrides;
  this.options = _base.configure(overrides);
  this.modal = {options: {}};
};

Razorpay.configure = function(overrides) {
  Razorpay.defaults = _base.configure(overrides);
}

var _base = {

  set: function(baseval, override) {

    if ( typeof baseval === 'object' ) {
      if( !baseval ){
        return baseval;
      }
      var options = {};
      for( var i in baseval ) {
        var newval;
        try { newval = override[i] } catch(e){}
        options[i] = _base.set( baseval[i], newval );
      }
    }

    else if ( typeof baseval === typeof override ) {
      return override;
    }

    else if ( typeof baseval === 'string' && typeof override != 'undefined' ) {
      return String(override);
    }

    else {
      return baseval;
    }

    return options;
  },

  setCustom: function(options, overrides){
    for( var n in overrides ){
      var note = overrides[n];
      if ( typeof note === 'string' ) {
        options[n] = note;
      }
    }
  },

  configure: function(overrides){
    if( !overrides || typeof overrides !== 'object' ) {
      return window.console && console.error('Invalid options');
    }

    var options = _base.set( Razorpay.defaults, overrides );

    try { _base.setCustom(options.notes, overrides.notes) } catch(e){}
    try { _base.setCustom(options.method.wallet, overrides.method.wallet) } catch(e){}

    _base.validateOptions( options );

    return options;

  },

  validateOptions: function(options){
    var errorMessage;

    if (!options.key) {
      errorMessage = 'key';
    }

    var notesCount = 0;
    for(var note in options.notes){
      notesCount++;
    }
    if(notesCount > 15) { errorMessage = 'notes (At most 15 notes are allowed)' }

    /**
     * There are some options which are checkout specific only
     */
    if(typeof discreet.validateCheckout === 'function'){
      errorMessage = discreet.validateCheckout(options);
    }

    if( errorMessage ){ throw new Error('Invalid option: ' + errorMessage) }
  }
}

discreet.makeUrl = function(options){
  return options.protocol + '://' + options.hostname + '/' + options.version;
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
};
