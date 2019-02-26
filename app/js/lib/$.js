var $ = function(el) {
  if (isString(el)) {
    return $(document.querySelector(el));
  }
  if (!(this instanceof $)) {
    return new $(el);
  }
  this[0] = el;
};

var _session_id;

$.prototype = {
  on: function(event, callback, capture, thisArg) {
    var el = this[0];
    if (!el) {
      return;
    }

    var ref;
    if (isString(callback)) {
      callback = thisArg[callback];
    }
    if (!isFunction(callback)) {
      return;
    }
    var shouldAddListener = window.addEventListener;
    if (shouldAddListener) {
      ref = function(e) {
        if (e.target.nodeType === 3) {
          e.target = e.target.parentNode; // textNode target
        }
        return callback.call(thisArg || this, e);
      };
    } else {
      ref = function(e) {
        if (!e) {
          e = window.event;
        }
        if (!e.target) {
          e.target = e.srcElement || document;
        }
        if (!e.preventDefault) {
          e.preventDefault = function() {
            this.returnValue = false;
          };
        }
        if (!e.stopPropagation) {
          e.stopPropagation = e.preventDefault;
        }
        if (!e.currentTarget) {
          e.currentTarget = el;
        }
        return callback.call(thisArg || el, e);
      };
    }
    each(event.split(' '), function(i, evt) {
      if (shouldAddListener) {
        el.addEventListener(evt, ref, !!capture);
      } else {
        el.attachEvent('on' + evt, ref);
      }
    });
    return bind(function() {
      this.off(event, ref, capture);
    }, this);
  },

  off: function(event, callback, capture) {
    if (window.removeEventListener) {
      this[0].removeEventListener(event, callback, !!capture);
    } else if (window.detachEvent) {
      this[0].detachEvent('on' + event, callback);
    }
  },

  prop: function(prop, val) {
    var el = this[0];
    if (arguments.length === 1) {
      return el && el[prop];
    }
    if (el) {
      if (el) {
        el[prop] = val;
      }
      return this;
    }
    return '';
  },

  attr: function(attr, val) {
    if (isNonNullObject(attr)) {
      each(
        attr,
        function(key, val) {
          this.attr(key, val);
        },
        this
      );
      return this;
    }
    var argLen = arguments.length;
    var el = this[0];

    if (argLen === 1) {
      return el && el.getAttribute(attr);
    }
    if (el) {
      if (val) {
        el.setAttribute(attr, val);
      } else {
        el.removeAttribute(attr);
      }
    }
    return this;
  },

  reflow: function() {
    this.prop('offsetHeight');
    return this;
  },

  remove: function() {
    try {
      var el = this[0];
      el.parentNode.removeChild(el);
    } catch (e) {}
    return this;
  },

  append: function(el) {
    this[0].appendChild(el);
  },

  hasClass: function(str) {
    return (' ' + this[0].className + ' ').indexOf(' ' + str + ' ') >= 0;
  },

  addClass: function(str) {
    var el = this[0];
    if (str && el) {
      if (!el.className) {
        el.className = str;
      } else if (!this.hasClass(str)) {
        el.className += ' ' + str;
      }
    }
    return this;
  },

  removeClass: function(str) {
    var el = this[0];
    if (el) {
      var className = (' ' + el.className + ' ')
        .replace(' ' + str + ' ', ' ')
        .replace(/^ | $/g, '');
      if (el.className !== className) {
        el.className = className;
      }
    }
    return this;
  },

  toggleClass: function(className, condition) {
    if (arguments.length === 1) {
      condition = !this.hasClass(className);
    }
    return this[(condition ? 'add' : 'remove') + 'Class'](className);
  },

  qs: function(selector) {
    var node = this[0];
    if (node) {
      return node.querySelector(selector);
    }
  },

  find: function(selector) {
    var node = this[0];
    if (node) {
      return node.querySelectorAll(selector);
    }
  },

  $: function(selector) {
    return $(this.qs(selector));
  },

  $0: function() {
    return $(this.firstElementChild);
  },

  css: function(prop, value) {
    var style = this.prop('style');
    if (style) {
      if (arguments.length === 1) {
        if (isNonNullObject(prop)) {
          each(
            prop,
            function(propName, value) {
              this.css(propName, value);
            },
            this
          );
        } else {
          return style[prop];
        }
      } else {
        try {
          style[prop] = value;
        } catch (e) {} // IE can not set invalid css rules without throwing up.
      }
    }
    return this;
  },

  bbox: function() {
    if (this[0]) {
      return this[0].getBoundingClientRect();
    }
    return emo;
  },

  offht: function() {
    return this.prop('offsetHeight');
  },

  height: function(height) {
    if (isNumber(height)) {
      height = height.toFixed(2) + 'px';
    }
    if (isString(height)) {
      return this.css('height', height);
    }
    if (this[0]) {
      return this.bbox().height;
    }
  },

  hide: function() {
    return this.css('display', 'none');
  },

  toggle: function(flag) {
    invoke(flag ? 'show' : 'hide', this);
  },

  show: function() {
    return this.css('display', 'block');
  },

  parent: function() {
    return $(this.prop('parentNode'));
  },

  val: function(value) {
    if (!arguments.length) {
      return this[0].value;
    }
    this[0].value = value;
    return this;
  },

  html: function(html) {
    if (arguments.length) {
      if (this[0]) {
        this[0].innerHTML = escapeHtml(html);
      }
      return this;
    }
    return this[0].innerHTML;
  },

  rawHtml: function(html) {
    if (arguments.length) {
      if (this[0]) {
        this[0].innerHTML = html;
      }
      return this;
    }
    return this[0].innerHTML;
  },

  focus: function() {
    if (this[0]) {
      try {
        this[0].focus();
      } catch (e) {}
    }
    return this;
  },

  blur: function() {
    if (this[0]) {
      try {
        this[0].blur();
      } catch (e) {}
    }
    return this;
  },

  scrollTo: function(y) {
    if (this[0]) {
      try {
        this[0].scrollTo(0, y);
      } catch (e) {}
    }
    return this;
  },
  click: function() {
    var $el = this[0];

    if (!$el) {
      return;
    }

    if (isFunction($el.click)) {
      return $el.click();
    }

    var eventObj = document.createEvent('MouseEvents');
    eventObj.initEvent('click', true, true);
    $el.dispatchEvent(eventObj);
  },
};

function smoothScrollTo(y) {
  smoothScrollBy(y - pageYOffset);
}

var scrollTimeout;
function smoothScrollBy(y) {
  if (!window.requestAnimationFrame) {
    return scrollBy(0, y);
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(function() {
    var y0 = pageYOffset;
    var target = Math.min(y0 + y, $(document.body).height() - innerHeight);
    y = target - y0;
    var scrollCount = 0;
    var oldTimestamp = performance.now();

    function step(newTimestamp) {
      scrollCount += (newTimestamp - oldTimestamp) / 300;
      if (scrollCount >= 1) {
        return scrollTo(0, target);
      }
      var sin = Math.sin((pi * scrollCount) / 2);
      scrollTo(0, y0 + Math.round(y * sin));
      oldTimestamp = newTimestamp;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, 100);
}

var escapeDiv = document.createElement('div');
function escapeHtml(str) {
  escapeDiv.innerHTML = '';
  escapeDiv.appendChild(document.createTextNode(str));
  return escapeDiv.innerHTML;
}
