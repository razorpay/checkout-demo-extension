(function(root) {
  var $, defaults, modal, timeout;
  $ = root.$;
  timeout = null;

  defaults = {
    shownClass: 'rzp-shown',
    modalSelector: '.rzp-modal',
    curtainClass: 'rzp-curtain', //curtain (fullscreen) mode
    closeButton: '.rzp-modal-close',
    show: true,
    escape: true,
    animation: true,
    stopKeyPropagation: true,
    backdropClose: true,
    hiddenCallback: null,
    parent: null
  };

  modal = function(element, options) {
    var duration, durationStyle;
    this.options = $.extend(defaults, options);
    this.element = element;
    if (window.screen && (screen.width <= 480 || screen.height <= 480)){
      this.element.addClass(this.options.curtainClass)
      this.curtainMode = true
    }
    if (!this.element.attr('tabIndex')) {
      this.element.attr('tabIndex', '0');
    }
    if (!this.element.parent().length) {
      this.element.appendTo(document.body || this.options.parent);
    }
    if (this.options.animation && this.transitionProperty) {
      durationStyle = getComputedStyle(element[0])[this.transitionProperty];
      duration = this.options.animation && this.transitionProperty && parseFloat(durationStyle) || 0;
      if (duration && typeof durationStyle === 'string' && durationStyle[durationStyle.length - 2] !== 'm') {
        duration *= 1000;
      }
      this.animationDuration = duration;
    }
    if (this.options.show) {
      this.show();
    }
    return this;
  };

  modal.prototype = {
    listeners: [],

    on: function(event, target, callback) {
      var handler;
      handler = $.proxy(callback, this);
      target.on(event, handler);
      return this.listeners.push([target, event, handler]);
    },

    transitionProperty: (function() {
      var prop;
      if(Array.prototype.some){
        prop = '';
        ['transition', 'WebkitTransition', 'MozTransition', 'OTransition'].some(function(i) {
          if (typeof document.head.style[i] === 'string') {
            prop = i + 'Duration';
            return true;
          }
        });
      }
      return prop;
    })(),

    toggle: function() {
      return this[!this.isShown ? 'show' : 'hide']();
    },

    show: function() {
      $(document.body).css('overflow', 'hidden');
      this.isShown = true;
      this.setViewport();
      this.bind_events();
      this.element.show().get(0).focus();
      this.element.children(this.options.modalSelector).css('display', 'inline-block');
      this.element.prop('offsetWidth');
      this.element.children(this.options.modalSelector).prop('offsetWidth');
      this.element.addClass(this.options.shownClass);
      this.clearTimeout();
      return timeout = setTimeout($.proxy(this.shown, this), this.animationDuration);
    },

    setViewport: function(){
      if($('meta[name="viewport"]').length !== 0){
        this.originalViewport = $('meta[name="viewport"]');
        $('meta[name="viewport"]').remove();
      }

      if($('meta.rzp-viewport').length === 0){
        $('head').append('<meta name="viewport" class="rzp-viewport" content="width=device-width, initial-scale=1">')
      }
    },

    removeViewport: function(){
      $('head meta.rzp-viewport').remove();
      if(typeof this.originalViewport !== 'undefined'){
        $('head').append(this.originalViewport);
      }
    },

    shown: function() {
      return this.clearTimeout();
    },

    hide: function() {
      if (!this.isShown) {
        return;
      }
      this.isShown = false;
      this.removeViewport();
      this.element.removeClass(this.options.shownClass);
      this.listeners.forEach(function(l) {
        return l[0].off(l[1], l[2]);
      });
      this.listeners = [];
      this.clearTimeout();
      return timeout = setTimeout((function(_this) {
        return function() {
          return _this.hidden();
        };
      })(this), this.animationDuration);
    },

    clearTimeout: function() {
      if (timeout) {
        clearTimeout(timeout);
      }
      return timeout = null;
    },

    hidden: function() {
      $(document.body).css('overflow', '');
      this.clearTimeout();
      this.element.hide().children(this.options.modalSelector).hide();
      if (typeof this.options.hiddenCallback === 'function') {
        return this.options.hiddenCallback();
      }
    },

    steal_focus: function(e) {
      if (!e.relatedTarget) {
        return;
      }
      if (!$(this).find(e.relatedTarget).length) {
        return this.focus();
      }
    },

    bind_events: function() {
      if (window.addEventListener)
        this.element[0].addEventListener('blur', this.steal_focus, true);
      
      if (this.curtainMode){
        this.on('click', this.element.find(this.options.closeButton), this.hide)
      }
      
      if (this.options.stopKeyPropagation) {
        this.on('keyup keydown keypress', this.element, (function(_this) {
          return function(e) {
            return e.stopPropagation();
          };
        })(this));
      }
      if (this.options.escape) {
        this.on('keyup', this.element, (function(_this) {
          return function(e) {
            if (e.which === 27) {
              return _this.hide();
            }
          };
        })(this));
      }
      if (this.options.backdropClose) {
        return this.on('click', this.element, (function(_this) {
          return function(e) {
            if (e.target === _this.element[0] && _this.options.backdropClose) {
              return _this.hide();
            }
          };
        })(this));
      }
    }
  };

  return root.Modal = modal;
})(window.Razorpay);
