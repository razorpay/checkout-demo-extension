import { each, scrollIntoView } from 'lib/utils';
import { setContents } from 'utils/DOM';
import { isNonNullObject } from 'utils/object';

var $ = function (el) {
  if (_.isString(el)) {
    return $(document.querySelector(el));
  }
  if (!(this instanceof $)) {
    return new $(el);
  }
  this[0] = el;
};

$.prototype = {
  on: function (event, callback, capture, thisArg) {
    let el = this[0];
    if (!el) {
      return;
    }

    let ref;
    if (_.isString(callback)) {
      callback = thisArg[callback];
    }
    if (!_.isFunction(callback)) {
      return;
    }
    ref = function (e) {
      if (e.target.nodeType === 3) {
        e.target = e.target.parentNode; // textNode target
      }
      return callback.call(thisArg || this, e);
    };

    each(event.split(' '), function (i, evt) {
      el.addEventListener(evt, ref, !!capture);
    });

    return function () {
      this.off(event, ref, capture);
    }.bind(this);
  },

  off: function (event, callback, capture) {
    this[0].removeEventListener(event, callback, !!capture);
  },

  prop: function (prop, val) {
    let el = this[0];
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

  attr: function (attr, val) {
    if (isNonNullObject(attr)) {
      each(
        attr,
        function (key, val) {
          this.attr(key, val);
        },
        this
      );
      return this;
    }
    let argLen = arguments.length;
    let el = this[0];

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

  reflow: function () {
    this.prop('offsetHeight');
    return this;
  },

  remove: function () {
    try {
      let el = this[0];
      el.parentNode.removeChild(el);
    } catch (e) {}
    return this;
  },

  append: function (el) {
    this[0].appendChild(el);
  },

  hasClass: function (str) {
    return this[0]?.classList?.contains(str);
  },

  addClass: function (str) {
    let el = this[0];
    if (str && el) {
      str.split(' ').forEach(function (newClass) {
        el.classList.add(newClass);
      });
    }
    return this;
  },

  removeClass: function (str) {
    this[0]?.classList.remove(str);
    return this;
  },

  // this has to continue without classList.toggle cuz IE11
  toggleClass: function (className, condition) {
    if (arguments.length === 1) {
      condition = !this.hasClass(className);
    }
    return this[(condition ? 'add' : 'remove') + 'Class'](className);
  },

  qs: function (selector) {
    let node = this[0];
    if (node) {
      return node.querySelector(selector);
    }
  },

  find: function (selector) {
    let node = this[0];
    if (node) {
      return node.querySelectorAll(selector);
    }
  },

  $: function (selector) {
    return $(this.qs(selector));
  },

  $0: function () {
    return $(this.firstElementChild);
  },

  css: function (prop, value) {
    let style = this.prop('style');
    if (style) {
      if (arguments.length === 1) {
        if (isNonNullObject(prop)) {
          each(
            prop,
            function (propName, value) {
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

  bbox: function () {
    if (this[0]) {
      return this[0].getBoundingClientRect();
    }
    return {};
  },

  offht: function () {
    return this.prop('offsetHeight');
  },

  height: function (height) {
    if (_.isNumber(height)) {
      height = height.toFixed(2) + 'px';
    }
    if (_.isString(height)) {
      return this.css('height', height);
    }
    if (this[0]) {
      return this.bbox().height;
    }
  },

  hide: function () {
    return this.css('display', 'none');
  },

  toggle: function (flag) {
    flag ? this.show() : this.hide();
  },

  show: function () {
    return this.css('display', 'block');
  },

  parent: function () {
    return $(this.prop('parentNode'));
  },

  val: function (value) {
    if (!arguments.length) {
      return this[0].value;
    }
    this[0].value = value;
    return this;
  },

  rawHtml: function (html) {
    if (arguments.length) {
      if (this[0]) {
        setContents(this[0], html);
      }
      return this;
    }
    return this[0].innerHTML;
  },

  focus: function () {
    if (this[0]) {
      try {
        this[0].focus();
      } catch (e) {}
    }
    return this;
  },

  blur: function () {
    if (this[0]) {
      try {
        this[0].blur();
      } catch (e) {}
    }
    return this;
  },

  scrollTo: function (y) {
    if (this[0]) {
      try {
        this[0].scrollTo(0, y);
      } catch (e) {}
    }
    return this;
  },

  scrollIntoView: function () {
    if (this[0]) {
      let el = this[0];
      scrollIntoView(el);
    }

    return this;
  },

  click: function () {
    let $el = this[0];

    if (!$el) {
      return;
    }

    if (_.isFunction($el.click)) {
      return $el.click();
    }

    let eventObj = document.createEvent('MouseEvents');
    eventObj.initEvent('click', true, true);
    $el.dispatchEvent(eventObj);
  },
};

export default $;
