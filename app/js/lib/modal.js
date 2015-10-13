(function() {
  'use strict';

  var $ = Razorpay.$;
  var timeout = null;

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

  window.Modal = function(element, options) {
    this.options = $.defaults(options, defaults);
    this.container = $('container');
    this.modalElement = element;

    if(!this.options.animation || !this.transitionProperty){
      var duration = 0;
    } else {
      if(typeof window.getComputedStyle == 'function'){
        var durationStyle = window.getComputedStyle(this.container[0])[this.transitionProperty];
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

    this.show();
    this.bind_events();
  };

  Modal.prototype = {
    listeners: [],

    transitionProperty: (function() {
      var prop;
      if(Array.prototype.some){
        prop = '';
        ['transition', 'WebkitTransition', 'MozTransition', 'OTransition'].some(function(i) {
          if (typeof document.documentElement.style[i] === 'string') {
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

      var closeBtn = $('modal-close');
      if (this.options.backdropClose) {
        this.on('click', closeBtn[0], this.backdropHide);
        this.on('click', this.container.children('backdrop')[0], this.backdropHide)
      } else {
        closeBtn.remove();
      }
    }
  };
})();
