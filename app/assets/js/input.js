(function($) {
  var Smarty, prefix;
  prefix = 'rzp-';

  Smarty = function(form, options) {
    this.element = form;
    this.ttel = $(form[0].querySelector(this.selector('tooltip')));
    this.options = options || {};
    this.listeners = [];
    this.common_events();
    this.refresh();
    return this;
  };

  $.fn.smarty = function(options) {
    return this.each(function() {
      var data, el;
      el = $(this);
      data = el.data('smarty');
      if (typeof options === 'string') {
        if (data) {
          return data[options]();
        }
      } else if (data) {
        return data.refresh();
      } else {
        options = $.extend($.fn.smarty.defaults, typeof options === 'object' && options);
        data = new Smarty(el, options);
        el.data('smarty', data);
        return data;
      }
    });
  };

  return Smarty.prototype = {
    "class": function(str) {
      return str.split(' ').map(function(s) {
        return prefix + s;
      }).join(' ');
    },

    selector: function(str) {
      return str.split(' ').map(function(s) {
        return '.' + prefix + s;
      }).join(' ');
    },

    parent: function(el) {
      return el.parentNode.parentNode;
    },

    common_events: function() {
      this.on('focus', this.focus, true);
      this.on('blur', this.blur, true);
      this.on('input', this.input, true);
      this.on('change', this.input, true);
      this.on('keypress', this.keypress);
      return this.on('mousedown', this.selector('tooltip'), (function(_this) {
        return function(e) {
          return $(e.currentTarget).hide();
        };
      })(this));
    },

    on: function() {
      var event, handler, lastarg, proxy, target;
      event = arguments[0];
      lastarg = arguments[arguments.length - 1];
      target = typeof arguments[1] === 'string' ? arguments[1] : this.selector('input');
      if (lastarg === true) {
        handler = arguments[arguments.length - 2];
        proxy = $.proxy(function(e) {
          if (typeof e.target.value === 'string') {
            return handler.apply(this, arguments);
          }
        }, this);
        this.element[0].addEventListener(event, proxy, true);
        return this.listeners.push([event, proxy, true]);
      } else {
        proxy = $.proxy(lastarg, this);
        this.element.on(event, target, proxy);
        return this.listeners.push([event, target, proxy]);
      }
    },

    bye: function() {
      return this.listeners.forEach((function(_this) {
        return function(l) {
          if (l[2] === true) {
            return _this.element[0].removeEventListener(l[0], l[1], true);
          } else {
            return _this.element.off(l[0], l[1], l[2]);
          }
        };
      })(this));
    },

    focus: function(e) {
      var el;
      el = e.target;
      if (!(/(INPUT|SELECT)/.test(el.nodeName))) {
        return;
      }
      if (el.rzp_placeholder) {
        el.value = '';
        el.rzp_placeholder = false;
      }
      $(this.parent(el)).addClass(this["class"]('focused'));
      return this.tooltip(el);
    },

    tooltip: function(el) {
      var classname, modal_rect, parent, parent_rect, positioned, show, shown, state, tt_left, tt_top;
      positioned = this.ttel.data('pos');
      parent = this.parent(el);
      state = this.parent(el).className;
      show = /mature/.test(state) && /invalid/.test(state);
      classname = this["class"]('shown');
      shown = this.ttel.hasClass(classname);
      if (show) {
        this.ttel.html(this.helptext(el));
        if (!positioned) {
          if (this.ttel.is(':hidden')) {
            this.ttel.show();
          }
          parent_rect = parent.getBoundingClientRect();
          modal_rect = this.element.children(this.selector('modal'))[0].getBoundingClientRect();
          tt_top = parent_rect.bottom - modal_rect.top - 5;
          tt_left = parent_rect.left - modal_rect.left + 10;
          this.ttel.css({
            top: tt_top,
            left: tt_left
          }).data('pos', true);
        }
      }
      if (show && !shown) {
        return this.ttel.addClass(classname);
      } else if (!show) {
        return this.ttel.removeClass(classname);
      }
    },

    blur: function(e) {
      var el, parent;
      el = e.target;
      if (!(/(INPUT|SELECT)/.test(el.nodeName))) {
        return;
      }
      if (!el.value && !el.placeholder && typeof el.getAttribute('placeholder') !== 'string') {
        el.rzp_placeholder = true;
        el.value = el.getAttribute('placeholder');
      }
      parent = $(this.parent(el));
      parent.removeClass(this["class"]('focused'));
      if (!parent.hasClass(this["class"]('mature'))) {
        parent.addClass(this["class"]('mature'));
      }
      return this.ttel.removeClass(this["class"]('shown')).data('pos', false);
    },

    input: function(e) {
      var el, isMature, parent, pattern, required, valid, value;
      el = e.target;
      parent = $(this.parent(el));
      value = el.value;
      if (el.validity) {
        valid = el.validity.valid;
      } else {
        valid = true;
        required = typeof el.getAttribute('required' === 'string');
        pattern = el.getAttribute('pattern');
        if (required && !value) {
          valid = false;
        }
        if (valid && pattern) {
          valid = new RegExp(pattern).test(value);
        }
      }
      isMature = parent.hasClass(this["class"]('mature'));
      if (valid && !isMature) {
        parent.addClass(this["class"]('mature'));
        isMature = true;
      }
      if (valid && parent.hasClass(this["class"]('invalid'))) {
        parent.removeClass(this["class"]('invalid'));
      } else if (!valid) {
        parent.addClass(this["class"]('invalid'));
      }
      return this.tooltip(el);
    },

    keypress: function(e) {
      var chars, key;
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      chars = e.target.getAttribute('data-chars');
      if (!(chars && e.which)) {
        return;
      }
      if (e.which === 8) {
        return;
      }
      key = String.fromCharCode(e.which);
      if (!(new RegExp(chars).test(key))) {
        return false;
      }
    },

    refresh: function() {
      return this.element.find(this.selector('input')).each((function(_this) {
        return function(index, el) {
          var parent;
          parent = $(_this.parent(el));
          return _this.update(parent, el);
        };
      })(this));
    },

    initiate: function(parent, el, type) {
      parent.data('smarty', true);
      if (document.activeElement === el) {
        return parent.addClass(this["class"]('focused'));
      }
    },

    update: function(parent, el) {
      var type;
      type = el.getAttribute('type');
      if (!parent.data('smarty')) {
        this.initiate(parent, el, type);
      }
      parent.removeClass(this["class"]('filled mature invalid'));
      if (el.value) {
        parent.addClass(this["class"]('filled mature'));
      }
      return this.input({
        target: el
      });
    },

    helptext: function(el) {
      var name, node, value;
      name = el.name;
      if (!name) {
        return '';
      }
      node = el.nodeName.toLowerCase();
      value = el.value;
      if (node === 'select') {
        return 'Please select an item in the list.';
      } else if (!value) {
        return 'Please fill out this field.';
      } else if (name === 'contact') {
        return 'Please enter a valid 10-12 digit phone number.';
      } else if (name === 'email') {
        if (value.length > 254) {
          return 'Entered email is too long.';
        } else {
          return 'Please enter a valid email address, like you@example.com';
        }
      } else if (name === 'card[name]') {
        if (value.length > 100) {
          return 'Entered name is too long.';
        } else {
          return 'Please enter a valid name without numbers or special characters.';
        }
      } else if (name === 'card[number]') {
        return 'Please enter valid card number.';
      } else if (name === 'card[expiry]') {
        return 'Please enter valid expiry date, like 01 / 22';
      } else if (name === 'card[cvv]') {
        return 'Please enter 3 or 4 digit CVV number.';
      } else {
        return 'Please enter valid input.';
      }
    }
  };
})(Razorpay.prototype.$);
