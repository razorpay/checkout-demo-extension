(function() {

  var timeout, transitionProperty;

  var defaults = {
    escape: true,
    animation: true,
    backdropclose: true,
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
    return (modal.options.animation && transitionProperty) ? 300 : 0;
  }

  var Modal = window.Modal = function(element, options) {
    each(defaults, function(key, val){
      if(!(key in options)){
        options[key] = val;
      }
    })
    this.options = options;
    this.container = $(element);
    this.animationDuration = getDuration(this);

    this.listeners = [];
    this.show();
    this.bind();
  };

  Modal.prototype = {
    show: function() {
      if(this.isShown) { return }
      this.isShown = true;
      this.container.reflow().addClass('shown');
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

      this.container.removeClass('shown');
      
      clearTimeout();
      var self = this;

      timeout = setTimeout(function(){
        self.hidden();
      }, this.animationDuration);

      invoke(this.options.onhide);
    },

    backdropHide: function(){
      if(this.options.backdropclose) {
        this.hide();
      }
    },

    hidden: function() {
      clearTimeout();
      invoke(this.options.onhidden);
    },

    on: function(event, target, callback){
      this.listeners.push(
        $(target).on(event, callback, false, this)
      );
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
            if(!hideEmi() && !overlayVisible()){
              this.hide();
            }
          }
        })
      }
      if (this.options.backdropclose) {
        this.on('click', gel('backdrop'), this.backdropHide)
      }
    },

    destroy: function(){
      invokeEach(this.listeners);
      this.listeners = [];
    }
  };
})();
