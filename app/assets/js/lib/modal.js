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
      var query;
      // device-width doesn't work well in android app/cordova
      // browser is good though
      if(window.CheckoutBridge){
        query = '(max-height: 450px),(max-width: 450px)';
      } else {
        query = '(max-device-height: 450px),(max-device-width: 450px)';
      }
      var match = matchMedia(query);
      if(match && match.matches){
        this.curtainMode = true;
        this.element.addClass('curtain');
      }
    }
    if(!this.curtainMode && window.screen){
      var dpr = (typeof window.devicePixelRatio == 'number') ? window.devicePixelRatio : 1;
      var dim = Math.min(screen.width, screen.height)/dpr;
      if(dim < 450){
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

    if(!this.options.animation || !this.transitionProperty){
      duration = 0;
    } else {
      if(typeof window.getComputedStyle == 'function'){
        durationStyle = window.getComputedStyle(this.element[0])[this.transitionProperty];
        duration = parseFloat(durationStyle) || 0;
      }
    }

    if (typeof durationStyle === 'string' && durationStyle[durationStyle.length - 2] !== 'm') {
      duration *= 1000;
    }

    this.animationDuration = duration;

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
      this.element.focus();
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
      if (window.removeEventListener){
        this.element[0].removeEventListener('blur', this.steal_focus, true);
      }
      this.clearTimeout();
      if (typeof this.options.onhide === 'function') {
        this.options.onhide();
      }
      var self = this;
      timeout = setTimeout(function(){
        self.hidden();
      }, this.animationDuration);
    },

    clearTimeout: function() {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = null;
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
          e.stopPropagation();
        });
      }
      if (this.options.escape) {
        this.on('keyup', this.element, function(e) {
          if (e.which === 27 && this.options.backdropClose) {
            this.hide();
          }
        })
      }
      if (this.options.backdropClose) {
        this.on('click', this.element, function(e) {
          if (e.target === this.element[0] && this.options.backdropClose) {
            this.hide();
          }
        })
      }
    }
  };

  root.Modal = modal;
})(window);
