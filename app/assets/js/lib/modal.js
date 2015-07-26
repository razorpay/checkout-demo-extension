(function(root) {
  'use strict';

  var $ = root.$;
  var timeout = null;

  var defaults = {
    shownClass: 'shown',
    modalClass: 'modal',
    backdropClass: 'backdrop',
    closeId: 'modal-close',
    containerId: 'container',
    show: true,
    escape: true,
    animation: true,
    backdropClose: true,
    onhide: null,
    onhidden: null
  };

  var clearTimeout = function(){
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = null;
  }

  var Modal = root.Modal = function(element, options) {
    this.options = $.defaults(options, defaults);
    this.container = $(this.options.containerId);
    this.modalElement = element;

    var duration, durationStyle;
    
    if(!this.options.animation || !this.transitionProperty){
      duration = 0;
    } else {
      if(typeof window.getComputedStyle == 'function'){
        durationStyle = window.getComputedStyle(this.container[0])[this.transitionProperty];
        duration = parseFloat(durationStyle) || 0;
      }
    }

    if (typeof durationStyle === 'string' && durationStyle[durationStyle.length - 2] !== 'm') {
      duration *= 1000;
    }

    this.animationDuration = duration;
    if(duration){
      $(this.modalElement).addClass('animate')
    }

    if (this.options.show) {
      this.show();
    }
  };

  Modal.prototype = {
    listeners: [],

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

    show: function() {
      if(this.isShown) return;
      this.isShown = true;

      this.bind_events();
      this.container.css('display', 'block');
      this.modalElement.style.display = 'inline-block';
      this.container[0].offsetWidth;
      this.modalElement.offsetWidth;
      this.container.addClass(this.options.shownClass);
      clearTimeout();
      timeout = setTimeout(this.shown, this.animationDuration);
      this.container[0].focus();
    },

    shown: function() {
      clearTimeout();
    },

    hide: function() {
      if(!this.isShown) return;
      this.isShown = false;

      if(this.animationDuration){
        $(this.modalElement).addClass('animate');
      }
      this.container.removeClass(this.options.shownClass);
      
      this.off();
      clearTimeout();
      var self = this;

      timeout = setTimeout(function(){
        self.hidden();
      }, this.animationDuration);

      if(typeof this.options.onhide === 'function') {
        this.options.onhide();
      }
    },

    hidden: function() {
      clearTimeout();
      this.container.css('display', 'none');
      this.modalElement.style.display = 'none';
      if(typeof this.options.onhidden === 'function') {
        this.options.onhidden();
      }
    },

    on: function(event, target, callback){
      var self = this;
      $(target).on(event, function(e){
        callback.call(self, e);
      });
    },

    off: function(){
      // for(var i = 0; i < this.listeners.length; i++){
      //   var l = this.listeners[i];
      //   l[0].off(l[1], l[2]);
      // }
      // if (window.removeEventListener){
      //   this.element[0].removeEventListener('blur', this.steal_focus, true);
      // }
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
      this.on('click', $(this.options.closeId)[0], this.hide);
      
      if(typeof window.pageYOffset == 'number') // doesn't exist <ie9. we're concerned about mobile here.
        this.on('resize', window, function(){
          var container = this.container[0];
          var el = document.activeElement;
          if(el){
            var rect = el.getBoundingClientRect();
            if(rect.bottom > innerHeight - 50){
              setTimeout(function(){
                scrollTo(0, pageYOffset - innerHeight + rect.bottom + 60)
              }, 400)
            }
          }
        })
      
      if (this.options.escape) {
        this.on('keyup', window, function(e) {
          if ((e.which || e.keyCode) === 27 && this.options.backdropClose) {
            this.hide();
          }
        })
      }
      if (this.options.backdropClose) {
        this.on('click', this.container.children('backdrop')[0], function(){
          this.options.backdropClose && this.hide();
        })
      }
    }
  };
})(window);
