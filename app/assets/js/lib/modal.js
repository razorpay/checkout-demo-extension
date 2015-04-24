(function(root) {
  var $, defaults, modal, timeout;
  $ = root.$;
  timeout = null;

  defaults = {
    shownClass: 'shown',
    modalSelector: '.modal',
    closeButton: '.modal-close',
    show: true,
    escape: true,
    animation: true,
    stopKeyPropagation: true,
    backdropClose: true,
    onhide: null,
    onhidden: null,
    parent: null
  };

  modal = function(element, options) {
    var duration, durationStyle;
    this.options = $.extend(defaults, options);
    this.element = element;
    this.modalElement = element.children(this.options.modalSelector);
    if (window.matchMedia){
      var match = matchMedia('(max-device-height: 450px),(max-device-width: 450px)');
      if(match && match.matches){
        this.curtainMode = true;
        this.element.addClass('curtain');
      }
    }
    if(!this.curtainMode && window.screen){
      if(screen.width < 450 || screen.height < 450){
        this.curtainMode = true;
        this.element.addClass('curtain');
      }
    }
    if (!this.element.attr('tabIndex')) {
      this.element.attr('tabIndex', '0');
    }
    if (!this.element.parent().length) {
      var parent = this.options.parent;
      if(!(parent && $(parent).length)){
        parent = document.body;
      }
      this.element.appendTo(parent);
    }
    if (this.options.animation && this.transitionProperty) {
      if(!this.transitionProperty){
        durationStyle = 0;
      } else {
        durationStyle = getComputedStyle(element[0])[this.transitionProperty] || 250;
      }

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
      // $(document.body).css('overflow', 'hidden');
      this.isShown = true;
      this.bind_events();
      this.element[0].style.display = 'block';
      this.modalElement.css('display', 'inline-block');
      this.element.prop('offsetWidth');
      this.modalElement.prop('offsetWidth');
      this.element.addClass(this.options.shownClass);
      this.clearTimeout();
      return timeout = setTimeout($.proxy(this.shown, this), this.animationDuration);
    },

    shown: function() {
      return this.clearTimeout();
    },

    hide: function() {
      if (!this.isShown) {
        return;
      }
      this.isShown = false;
      this.element.removeClass(this.options.shownClass);
      for(var i = 0; i < this.listeners.length; i++){
        var l = this.listeners[i];
        l[0].off(l[1], l[2]);
      }
      this.listeners = [];
      this.clearTimeout();
      if (typeof this.options.onhide === 'function') {
        this.options.onhide();
      }
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
      // $(document.body).css('overflow', '');
      this.clearTimeout();
      this.element.hide()
      this.modalElement.hide();
      if (typeof this.options.onhidden === 'function') {
        this.options.onhidden();
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

    bind_events: function(){
      if (window.addEventListener){
        this.element[0].addEventListener('blur', this.steal_focus, true);
      }
      
      if (this.curtainMode){
        this.on('click', this.element.find(this.options.closeButton), this.hide);
        this.on('resize', $(window), function(){
          // scrollTo(0,0);
          // this.element.height(innerHeight);
          var el = document.activeElement;
          if(el){
            var rect = el.getBoundingClientRect();
            if(rect.bottom > innerHeight - 52){
              var self = this;
              setTimeout(function(){
                self.modalElement.scrollTop(self.modalElement.scrollTop() - innerHeight + rect.bottom + 100)
              }, 400)
            }
          }
        })
      }
      
      if (this.options.stopKeyPropagation) {
        this.on('keyup keydown keypress', this.element, function(e) {
          return e.stopPropagation();
        });
      }
      if (this.options.escape) {
        this.on('keyup', this.element, function(e) {
          if (e.which === 27 && this.options.backdropClose) {
            return this.hide();
          }
        })
      }
      if (this.options.backdropClose) {
        this.on('click', this.element, function(e) {
          if (e.target === this.element[0] && this.options.backdropClose) {
            return this.hide();
          }
        })
      }
    }
  };

  return root.Modal = modal;
})(window);
