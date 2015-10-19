(function(root) {
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

  var $ = root.$;

  /**
  * Default Popup options.
  */

  var defaults = {
      width: 800
    , height: 520
    , menubar: 'no'
    , resizable: 'yes'
    , location: 'no'
    , scrollbars: 'no'
    , centered: true
  };

  /**
  * The "Popup" constructor.
  */

  function Popup (src, opts) {
    if (!(this instanceof Popup)) {
      return new Popup(src, opts);
    }

    // ensure an opts object exists
    opts = opts || {};

    // set the defaults if not provided
    for (var i in defaults) {
      if (!(i in opts)) {
        opts[i] = defaults[i];
      }
    }

    // we try to place it at the center of the current window
    // note: this "centering" logic borrowed from the Facebook JavaScript SDK
    if (opts.centered) {
      var screenX = null == window.screenX ? window.screenLeft : window.screenX;
      var screenY = null == window.screenY ? window.screenTop : window.screenY;
      var outerWidth = null == window.outerWidth ? document.documentElement.clientWidth : window.outerWidth;
      var outerHeight = null == window.outerHeight ? (document.documentElement.clientHeight - 22) : window.outerHeight;

      if (null == opts.left)
        opts.left = parseInt(screenX + ((outerWidth - opts.width) / 2), 10);
      if (null == opts.top)
        opts.top = parseInt(screenY + ((outerHeight - opts.height) / 2.5), 10);
      delete opts.centered;
    }

    // turn the "opts" object into a window.open()-compatible String
    var optsStr = [];
    for (var key in opts) {
      optsStr.push(key + '=' + opts[key]);
    }
    optsStr = optsStr.join(',');

    this.opts = opts;
    this.optsStr = optsStr;

    // finally, open and return the popup window
    this.window = window.open(src, '', optsStr); // might be null in IE9 if protected mode is turned on
    if(this.window){
      this.focus();
    }

    // this.$el = $(this.window.document.body);

    this.interval = setInterval(checkClose(this), 500);

    $(window).on('unload', this.unload);
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
      if (this.window && this.window.closed) {
        clearInterval(this.interval);
        this.close();
        if(typeof this.closeCB === 'function'){
          this.closeCB();
        }
      }
    }
  }

  function checkClose (popup) {
    return function () {
      popup._checkClose();
    }
  }

  root.Popup = Popup;
})(Razorpay);
