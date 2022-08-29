import * as _El from 'utils/DOM';
import * as ObjectUtils from 'utils/object';
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

export default function Popup(src, name) {
  let width = window.innerWidth || document.documentElement.clientWidth;
  let height = window.innerHeight || document.documentElement.clientHeight;

  let opts = {
    width: getPopupDimension(width * 0.7, 895, 1440),
    height: getPopupDimension(height * 0.8, 520, 1060),
    menubar: 'no',
    resizable: 'yes',
    location: 'no',
    scrollbars: 'yes',
  };

  // we try to place it at the center of the current window
  // note: this "centering" logic borrowed from the Facebook JavaScript SDK
  let screenX = null === window.screenX ? window.screenLeft : window.screenX;
  let screenY = null === window.screenY ? window.screenTop : window.screenY;
  let outerWidth =
    null === window.outerWidth
      ? document.documentElement.clientWidth
      : window.outerWidth;
  let outerHeight =
    null === window.outerHeight
      ? document.documentElement.clientHeight - 22
      : window.outerHeight;

  opts.left = parseInt(screenX + (outerWidth - opts.width) / 2, 10);
  opts.top = parseInt(screenY + (outerHeight - opts.height) / 2.5, 10);

  // turn the "opts" object into a window.open()-compatible String
  let optsStr = [];
  ObjectUtils.loop(opts, function (val, key) {
    optsStr.push(key + '=' + val);
  });
  optsStr = optsStr.join(',');

  this.name = name;

  try {
    this.window = window.open(src, name || '', optsStr); // might be null in IE9 if protected mode is turned on
  } catch (e) {}

  if (!this.window) {
    return null;
  }

  this.window.focus();
  this.listeners = [];
  this.interval = setInterval(this.checkClose.bind(this), 200);

  this.on('beforeunload', this.beforeunload);
  this.on('unload', this.close);
}

Popup.prototype = {
  on: function (event, func) {
    this.listeners.push(global |> _El.on(event, func));
  },

  beforeunload: function (e) {
    e.returnValue = 'Your payment is incomplete.';
    return e.returnValue;
  },

  /**
   * Closes the popup window.
   */

  close: function () {
    clearInterval(this.interval);
    if (Array.isArray(this.listeners)) {
      this.listeners.forEach((l) => l());
    }
    this.listeners = [];
    if (this.window) {
      this.window.close();
    }
  },

  /**
   * Emits the "close" event.
   */
  checkClose: function (forceClosed, timesInvoked = 0) {
    if (timesInvoked > 20) {
      return;
    }

    try {
      if (forceClosed || this.window.closed !== false) {
        // UC browser makes it undefined instead of true
        setTimeout(() => {
          if (this && typeof this.onClose === 'function') {
            this.onClose();
          }
        }, 100);
        this.close();
        return true;
      }
    } catch (e) {
      // UC throws error on accessing window if other domain
      this.checkClose(true, timesInvoked + 1);
    }
  },
};
