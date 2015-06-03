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
    if(duration){
      this.modalElement.addClass('animate')
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
      this.clearTimeout();
    },

    hide: function() {
      if (!this.isShown) {
        return;
      }
      this.isShown = false;
      if(this.animationDuration){
        this.modalElement.addClass('animate');
      }
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
      
      // if (this.curtainMode){
        this.on('click', this.element.find(this.options.closeButton), this.hide);
        this.on('resize', $(window), function(){
          var self = this;
          var el = document.activeElement;
          if(el){
            var rect = el.getBoundingClientRect();
            if(rect.bottom > innerHeight - 50){
              setTimeout(function(){
                self.element.scrollTop(self.element.scrollTop() - innerHeight + rect.bottom + 60)
              }, 400)
            }
          }
        })
      // }
      
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
