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

function getPopupDimension(varVal, minVal, maxVal) {
  return Math.min(Math.max(Math.floor(varVal), minVal), maxVal);
}

/**
* The "Popup" constructor.
*/

var Popup = function(src, name) {
  var width = window.innerWidth || document.documentElement.clientWidth;
  var height = window.innerHeight || document.documentElement.clientHeight;

  var opts = {
    width: getPopupDimension(width * 0.7, 895, 1440),
    height: getPopupDimension(height * 0.8, 520, 1060),
    menubar: 'no',
    resizable: 'yes',
    location: 'no',
    scrollbars: 'yes'
  };

  // we try to place it at the center of the current window
  // note: this "centering" logic borrowed from the Facebook JavaScript SDK
  var screenX = null === window.screenX ? window.screenLeft : window.screenX;
  var screenY = null === window.screenY ? window.screenTop : window.screenY;
  var outerWidth = null === window.outerWidth
    ? document.documentElement.clientWidth
    : window.outerWidth;
  var outerHeight = null === window.outerHeight
    ? document.documentElement.clientHeight - 22
    : window.outerHeight;

  opts.left = parseInt(screenX + (outerWidth - opts.width) / 2, 10);
  opts.top = parseInt(screenY + (outerHeight - opts.height) / 2.5, 10);

  // turn the "opts" object into a window.open()-compatible String
  var optsStr = [];
  each(opts, function(key, val) {
    optsStr.push(key + '=' + val);
  });
  optsStr = optsStr.join(',');

  this.name = name;

  // unsupported browsers
  if (ua_popup_supported) {
    try {
      this.window = window.open(src, name || '', optsStr); // might be null in IE9 if protected mode is turned on
    } catch (e) {}
  }

  if (!this.window) {
    return null;
  }

  this.window.focus();
  this.listeners = [];
  this.interval = setInterval(bind(this.checkClose, this), 200);

  this.on('beforeunload', this.beforeunload);
  this.on('unload', this.close);
};

Popup.prototype = {
  on: function(event, func) {
    this.listeners.push($(window).on(event, func, false, this));
  },

  write: function(html) {
    var pdoc = this.window.document;
    pdoc.write(html);
    pdoc.close();
  },

  beforeunload: function(e) {
    e.returnValue = 'Your payment is incomplete.';
    return e.returnValue;
  },

  /**
* Closes the popup window.
*/

  close: function() {
    clearInterval(this.interval);
    invokeEach(this.listeners);
    this.listeners = [];

    try {
      this.window.close();
    } catch (e) {
      roll('tried popup.close', e, 'warn');
    }
  },

  /**
* Emits the "close" event.
*/

  checkClose: function(forceClosed) {
    try {
      if (forceClosed || this.window.closed !== false) {
        // UC browser makes it undefined instead of true
        invoke('onClose', this, null, 100);
        this.close();
        return true;
      }
    } catch (e) {
      // UC throws error on accessing window if other domain
      this.checkClose(true);
      roll('Failure checking popup close', null, 'warn');
    }
  }
};
