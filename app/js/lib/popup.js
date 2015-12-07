/**
* Simple wrapper component around `window.open()`.
* https://github.com/component/popup
*
* Usage:
*
*     var win = new Popup('http://google.com', { width: 100, height: 100 });
*     win.on('close', function () {
*       console.log('popup window was closed');
*     });
*/

/**
* Default Popup options.
*/

var _popCheckClose = function(popup) {
  return function () {
    popup._checkClose();
  }
};

var _popDefaults = {
  width: 800,
  height: 520,
  menubar: 'no',
  resizable: 'yes',
  location: 'no',
  scrollbars: 'yes'
};

/**
* The "Popup" constructor.
*/

var Popup = function(src, name) {

  var opts = _popDefaults;

  // we try to place it at the center of the current window
  // note: this "centering" logic borrowed from the Facebook JavaScript SDK
  var screenX = null === window.screenX ? window.screenLeft : window.screenX;
  var screenY = null === window.screenY ? window.screenTop : window.screenY;
  var outerWidth = null === window.outerWidth ? document.documentElement.clientWidth : window.outerWidth;
  var outerHeight = null === window.outerHeight ? (document.documentElement.clientHeight - 22) : window.outerHeight;

  opts.left = parseInt(screenX + ((outerWidth - opts.width) / 2), 10);
  opts.top = parseInt(screenY + ((outerHeight - opts.height) / 2.5), 10);

  // turn the "opts" object into a window.open()-compatible String
  var optsStr = [];
  each(opts, function(key, val){
    optsStr.push(key + '=' + val);
  })
  optsStr = optsStr.join(',');

  this.name = name;
  // finally, open and return the popup window
  this.window = window.open(src, (name || ''), optsStr); // might be null in IE9 if protected mode is turned on

  if(!this.window){
    return null;
  }

  this.window.focus();

  this.interval = setInterval(_popCheckClose(this), 500);

  $(window).on('unload', this.close, false, this);
}

Popup.prototype = {

  unload: function(){
    this.close();
  },

/**
* Closes the popup window.
*/

  close: function () {
    clearInterval(this.interval);
    $(window).off('unload', this.unload);
    $(window).off('beforeunload', this.beforeunload);
    try{
      this.window.close();
    }
    catch(e){
      roll('Failure closing popup window', null, 'warn');
    }
  },

/**
* Emits the "close" event.
*/

  _checkClose: function (forceClosed) {
    try {
      if (forceClosed || this.window.closed !== false ) { // UC browser makes it undefined instead of true
        if(typeof this.onClose === 'function'){
          setTimeout(this.onClose);
        }
        this.close();
      }
    }
    catch(e){ // UC throws error on accessing window if other domain
      this._checkClose(true);
      roll('Failure checking popup close', null, 'warn');
    }
  }
}