(function() {

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
    return (modal.options.animation && transitionProperty) ? 250 : 0;
  }

  var Modal = window.Modal = function(element, options) {
    each(defaults, function(key, val){
      if(!(key in options)){
        options[key] = val;
      }
    })
    this.options = options;
    this.container = $('#container');
    this.modalElement = element;
    this.animationDuration = getDuration(this);

    if(this.animationDuration){
      $(this.modalElement).addClass('animate')
    }

    this.listeners = [];
    this.show();
    this.bind();
  };

  Modal.prototype = {
    show: function() {
      if(this.isShown) { return }
      this.isShown = true;
      $(this.modalElement).reflow();
      this.container.addClass('shown');
      clearTimeout();
      timeout = setTimeout(this.shown, this.animationDuration);
      this.container.focus();
    },

    shown: function() {
      clearTimeout();
    },

    hide: function() {
      if(!this.isShown) { return }
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
      if(this.options.backdropClose) {
        this.hide();
      }
    },

    hidden: function() {
      clearTimeout();
      if(typeof this.options.onhidden === 'function') {
        this.options.onhidden();
      }
    },

    on: function(event, target, callback){
      var $target = $(target)
      var attachedListener = $target.on(event, callback, false, this);
      this.listeners.push([$target, event, attachedListener]);
    },

    steal_focus: function(e) {
      if (!e.relatedTarget) {
        return;
      }
      if (!$(this).find(e.relatedTarget).length) {
        return this.focus();
      }
    },

    bind: function(){
      if(typeof window.pageYOffset === 'number') { // doesn't exist <ie9. we're concerned about mobile here.
        this.on('resize', window, function(){
          var el = document.activeElement;
          if(el){
            var rect = el.getBoundingClientRect();
            if(rect.bottom > innerHeight - 70){
              setTimeout(function(){
                scrollTo(0, pageYOffset - innerHeight + rect.bottom + 60)
              }, 500)
            }
          }
        })
      }
      if (this.options.escape) {
        this.on('keyup', window, function(e) {
          if ((e.which || e.keyCode) === 27) {
            if(gel('emi-container')){
              return toggleErrorMessage();
            }
            this.hide();
          }
        })
      }
      if (this.options.backdropClose) {
        this.on('click', gel('backdrop'), this.backdropHide)
      }
    },

    destroy: function(){
      each(
        this.listeners,
        function(i, L){
          L[0].off( L[1], L[2] );
        }
      )
    }
  };
})();
