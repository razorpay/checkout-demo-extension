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
    width: 800
  , height: 520
  , menubar: 'no'
  , resizable: 'yes'
  , location: 'no'
  , scrollbars: 'no'
};

/**
* The "Popup" constructor.
*/

var Popup = function(src) {

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

  // finally, open and return the popup window
  this.window = window.open(src, '', optsStr); // might be null in IE9 if protected mode is turned on

  if(this.window){
    this.focus();
  }

  // this.$el = $(this.window.document.body);

  this.interval = setInterval(_popCheckClose(this), 500);

  var that = this;
  $(window).on('unload', function(){
    that.close();
  });
  $(window).on('beforeunload', this.beforeunload);
}

Popup.prototype = {
  beforeunload: function(){
    return "Transaction isn't complete yet.";
  },

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
    this.window.close();
  },

/**
* Focuses the popup window (brings to front).
*/

  focus: function () {
    this.window.focus();
  },

  onClose: function(cb){
    this.closeCB = cb;
  },

/**
* Emits the "close" event.
*/

  _checkClose: function () {
    if ( this.window.closed !== false ) { // UC browser makes it undefined instead of true
      clearInterval(this.interval);
      this.close();
      if(typeof this.closeCB === 'function'){
        this.closeCB();
      }
    }
  }
}