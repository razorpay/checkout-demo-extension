(function() {
  'use strict';

  var timeout, transitionProperty;

  var defaults = {
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


  if(Array.prototype.some){
    ['transition', 'WebkitTransition', 'MozTransition', 'OTransition'].some(function(i) {
      if (typeof document.documentElement.style[i] === 'string') {
        transitionProperty = i + 'Duration';
        return true;
      }
    });
  }

  var getDuration = function(modal){
    var duration, durationStyle;

    if(!modal.options.animation || !transitionProperty){
      duration = 0;
    }

    else {
      if(typeof window.getComputedStyle === 'function'){
        durationStyle = window.getComputedStyle(modal.container[0])[transitionProperty];
        duration = parseFloat(durationStyle) || 0;
      }
    }

    if (typeof durationStyle === 'string' && durationStyle[durationStyle.length - 2] !== 'm') {
      duration *= 1000;
    }

    return duration;
  }

  window.Modal = function(element, options) {
    this.options = $.defaults(options, defaults);
    this.container = $('container');
    this.modalElement = element;
    this.animationDuration = getDuration(this);

    if(this.animationDuration){
      $(this.modalElement).addClass('animate')
    }

    this.show();
    this.bind_events();
  };

  Modal.prototype = {
    listeners: [],

    show: function() {
      if(this.isShown) return;
      this.isShown = true;
      this.modalElement.offsetWidth;
      this.container.addClass('shown');
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
      this.container.removeClass('shown');
      
      clearTimeout();
      var self = this;

      timeout = setTimeout(function(){
        self.hidden();
      }, this.animationDuration);

      if(typeof this.options.onhide === 'function') {
        this.options.onhide();
      }
    },

    backdropHide: function(){
      this.options.backdropClose && this.hide();
    },

    hidden: function() {
      clearTimeout();
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

    steal_focus: function(e) {
      if (!e.relatedTarget) {
        return;
      }
      if (!$(this).find(e.relatedTarget).length) {
        return this.focus();
      }
    },

    bind_events: function(){
      if(typeof window.pageYOffset === 'number') // doesn't exist <ie9. we're concerned about mobile here.
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
          if ((e.which || e.keyCode) === 27) {
            this.hide();
          }
        })
      }
      if (this.options.backdropClose) {
        this.on('click', $('backdrop')[0], this.backdropHide)
      }
    }
  };
})();
